import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;
import {
  getPersonaById,
  saveTimelineDraft,
  commitTimelineChanges,
  dismissTimelineGap,
} from "@/lib/db";
import { fetchKnowledgeBase } from "@/lib/gdrive";
import {
  sortPhases,
  getByPath,
  setByPath,
  type TimelinePhase,
} from "@/lib/timeline-diff";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT = `You are generating a communication timeline for a persona in a rebrand campaign.

Using the persona details and knowledge base documents provided, generate a timeline across 5 phases: before_launch, launch, summer, end_of_summer, back_to_school.

IMPORTANT: For every event, date, and mindset quote you generate, you must cite where it came from. Use these citation types:
- sourced: directly found in a specific document (provide doc title and tab if a sheet)
- inferred: synthesized from multiple documents or reasoned from context
- gap: information needed but not found in any document

For each phase return:
{
  "phase": string,
  "date_range": {
    "start": string or null,
    "end": string or null,
    "relative": string (e.g. "6 weeks before launch" — always include even if specific dates exist),
    "citation": { "type": "sourced"|"inferred"|"gap", "source": string or null, "note": string or null }
  },
  "mindset": {
    "text": string (first person, present tense, 1-2 sentences),
    "citation": { "type": "sourced"|"inferred", "source": string or null }
  },
  "events": [
    {
      "id": string (unique, snake_case),
      "title": string,
      "description": string,
      "type": "email"|"in_person"|"social"|"doc"|"platform",
      "control": "in"|"out",
      "date": {
        "specific": string or null,
        "relative": string,
        "citation": { "type": "sourced"|"inferred"|"gap", "source": string or null, "note": string or null }
      },
      "kb_reference": {
        "title": string or null,
        "doc_id": string or null,
        "citation_type": "sourced"|"inferred"|null
      }
    }
  ],
  "gaps": [
    {
      "id": string,
      "title": string (Gap: [what is missing]),
      "description": string (why this matters for this persona and what needs to be created),
      "impact": string (what happens to this persona if this gap is not filled)
    }
  ]
}

Return a JSON array of 5 phase objects. Valid JSON only, no markdown.`;

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

    let kb = "";
    try {
      kb = await Promise.race([
        fetchKnowledgeBase(),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("KB timeout")), 20000)),
      ]);
    } catch { /* proceed without KB */ }

    const userContent = `${PROMPT}\n\n<persona>\n${formatPersona(persona)}\n</persona>\n\n<knowledge_base>\n${kb}\n</knowledge_base>`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 5000,
      messages: [{ role: "user", content: userContent }],
    });

    const text = (message.content[0] as { text: string }).text;
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("[timeline] no JSON array in response:", text.slice(0, 300));
      return NextResponse.json({ error: "Failed to parse timeline from Claude" }, { status: 500 });
    }

    await saveTimelineDraft(personaId, match[0]);

    return NextResponse.json({
      timeline_draft: match[0],
      timeline_draft_created_at: new Date().toISOString(),
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
