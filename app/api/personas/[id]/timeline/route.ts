import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchKnowledgeBase } from "@/lib/gdrive";

export const maxDuration = 300;
import {
  getPersonaById,
  saveTimelineDraft,
  commitTimelineChanges,
  dismissTimelineGap,
} from "@/lib/db";
import {
  sortPhases,
  getByPath,
  setByPath,
  type TimelinePhase,
} from "@/lib/timeline-diff";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT = `Generate a communication timeline for a persona in a rebrand campaign across 5 phases: before_launch, launch, summer, end_of_summer, back_to_school.

Cite every event, date, and mindset using one of:
- "sourced": from a specific document
- "inferred": reasoned from context
- "gap": needed but unavailable

STRICT LIMITS to keep output concise:
- Max 3 events per phase
- Max 2 gaps per phase
- titles: under 8 words
- descriptions: under 20 words
- mindset text: 1 sentence only
- relative dates: under 6 words
- source strings: document name only, no extra detail

Return a JSON array of exactly 5 objects with this shape:
{
  "phase": string,
  "date_range": {
    "start": string|null, "end": string|null,
    "relative": string,
    "citation": { "type": "sourced"|"inferred"|"gap", "source": string|null, "note": string|null }
  },
  "mindset": {
    "text": string,
    "citation": { "type": "sourced"|"inferred", "source": string|null }
  },
  "events": [
    {
      "id": string,
      "title": string,
      "description": string,
      "type": "email"|"in_person"|"social"|"doc"|"platform",
      "control": "in"|"out",
      "date": { "specific": string|null, "relative": string, "citation": { "type": "sourced"|"inferred"|"gap", "source": string|null, "note": string|null } },
      "kb_reference": { "title": string|null, "doc_id": string|null, "citation_type": "sourced"|"inferred"|null }
    }
  ],
  "gaps": [
    { "id": string, "title": string, "description": string, "impact": string }
  ]
}

Valid JSON only, no markdown.`;

function formatPersona(p: Awaited<ReturnType<typeof getPersonaById>>): string {
  if (!p) return "";
  return [
    `Name: ${p.name}`,
    `Role: ${p.role}`,
    `Grade band: ${p.grade_band}`,
    `Relationship: ${p.relationship}`,
    `Motivation: ${p.motivation}`,
    `Current course: ${p.current_course}`,
    `Background: ${p.background}`,
    `Quote: ${p.quote}`,
    `Excited about: ${p.excited_about}`,
    `Nervous about: ${p.nervous_about}`,
    `Success looks like: ${p.success_looks_like}`,
    `Failure looks like: ${p.failure_looks_like}`,
    `Aim feeling: ${p.aim_feeling}`,
    `AI relationship: ${p.ai_relationship}`,
    `Rebrand risk: ${p.rebrand_risk}`,
    `Goals: ${p.goals?.join("; ")}`,
    `Pain points: ${p.pain_points?.join("; ")}`,
    `Needs: ${p.needs?.join("; ")}`,
    `Comms in control: ${p.comms_in_control?.join("; ")}`,
    `Comms out of control: ${p.comms_out_of_control?.join("; ")}`,
  ]
    .filter((l) => !l.endsWith("undefined") && !l.endsWith("null"))
    .join("\n");
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const persona = await getPersonaById(Number(id));
  return NextResponse.json({
    timeline_data: persona?.timeline_data ?? null,
    timeline_draft: persona?.timeline_draft ?? null,
    timeline_draft_created_at: persona?.timeline_draft_created_at ?? null,
    timeline_committed_at: persona?.timeline_committed_at ?? null,
    timeline_gaps: persona?.timeline_gaps ?? [],
  });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const personaId = Number(id);
  const body = await req.json();

  // ── dismiss-gap ─────────────────────────────────────────────────────────────
  if (body.action === "dismiss-gap") {
    await dismissTimelineGap(personaId, body.gapId);
    return NextResponse.json({ ok: true });
  }

  // ── generate ─────────────────────────────────────────────────────────────────
  if (body.action === "generate") {
    const persona = await getPersonaById(personaId);
    if (!persona) return NextResponse.json({ error: "Persona not found" }, { status: 404 });

    const encoder = new TextEncoder();
    const stream = new TransformStream<Uint8Array, Uint8Array>();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        // Heartbeat so Vercel sees an active stream while we fetch KB + call Claude
        await writer.write(encoder.encode(" "));

        let kb = "";
        try {
          kb = await Promise.race([
            fetchKnowledgeBase(),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error("KB timeout")), 25000)
            ),
          ]);
          // Truncate to keep input tokens reasonable
          if (kb.length > 40000) kb = kb.slice(0, 40000) + "\n\n[KB truncated]";
        } catch {
          // proceed without KB
        }

        await writer.write(encoder.encode(" "));

        const userContent = `${PROMPT}\n\n<persona>\n${formatPersona(persona)}\n</persona>${kb ? `\n\n<knowledge_base>\n${kb}\n</knowledge_base>` : ""}`;

        let fullText = "";
        const claudeStream = client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 8096,
          messages: [{ role: "user", content: userContent }],
        });

        for await (const chunk of claudeStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullText += chunk.delta.text;
            await writer.write(encoder.encode(" "));
          }
        }

        const match = fullText.match(/\[[\s\S]*\]/);
        if (!match) {
          console.error("[timeline] no JSON array in response:", fullText.slice(0, 300));
          await writer.write(
            encoder.encode(JSON.stringify({ error: "Failed to parse timeline from Claude" }))
          );
        } else {
          await saveTimelineDraft(personaId, match[0]);
          await writer.write(
            encoder.encode(
              JSON.stringify({
                timeline_draft: match[0],
                timeline_draft_created_at: new Date().toISOString(),
              })
            )
          );
        }
      } catch (err) {
        console.error("[timeline] generate error:", err);
        try {
          await writer.write(encoder.encode(JSON.stringify({ error: String(err) })));
        } catch { /* ignore */ }
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // ── commit-changes ────────────────────────────────────────────────────────────
  if (body.action === "commit-changes") {
    const acceptedPaths: string[] = body.acceptedPaths ?? [];
    const persona = await getPersonaById(personaId);
    if (!persona) return NextResponse.json({ error: "Persona not found" }, { status: 404 });

    if (!persona.timeline_draft) {
      return NextResponse.json({ error: "No draft to commit" }, { status: 400 });
    }

    let liveParsed: TimelinePhase[] = [];
    let draftParsed: TimelinePhase[] = [];
    try {
      liveParsed = persona.timeline_data ? JSON.parse(persona.timeline_data) : [];
      draftParsed = JSON.parse(persona.timeline_draft);
    } catch {
      return NextResponse.json({ error: "Failed to parse timeline JSON" }, { status: 500 });
    }

    const sortedLive = sortPhases(liveParsed);
    const sortedDraft = sortPhases(draftParsed);

    const liveWrapper = { phases: sortedLive as unknown };
    const draftWrapper = { phases: sortedDraft as unknown };

    for (const path of acceptedPaths) {
      const draftVal = getByPath(draftWrapper, path);
      setByPath(liveWrapper, path, draftVal);
    }

    const updatedLive = JSON.stringify(liveWrapper.phases);
    await commitTimelineChanges(personaId, updatedLive);

    return NextResponse.json({
      ok: true,
      timeline_data: updatedLive,
      timeline_committed_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
