import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getPersonaById, savePersonaTimeline, getKBCache } from "@/lib/db-edge";
import type { PersonaTimelineData } from "@/lib/timeline-types";

export const runtime = "edge";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are a communications strategist analysing how a product rebrand will land with a specific learner persona. You produce structured JSON data describing the communication journey.`;

const PROMPT = `Generate a communications journey map for this persona covering a product rebrand (Code.org rebranding as "codeAI") across 6 campaign phases.

Phases (use these exact keys):
- pre-launch    → Apr 20 – May 16 (build-up, no public announcement yet)
- launch        → May 17 (announcement day)
- day-two       → May 18 (day after launch)
- post-launch   → May 19 – May 31 (follow-up period)
- summer        → June–July (summer programme and conferences)
- back-to-school → Aug–Sep (return to class, fall enrollment)

For each touchpoint choose:
- channel: "email" | "social" | "in-product" | "in-person" | "gap"
  - "in-person" = conferences, events, workshops, in-school visits
  - "gap" = a communication need that is currently unmet in the plan
- variant: "win" (works well for this persona), "risk" (a concern), "neutral" (routine), "gap" (gap in the plan), "miss" (something this persona will likely miss)

In-person touchpoints should reflect real conference and event opportunities from the knowledge base (e.g. CSTA, ISTE, district PD days, back-to-school nights). Include at least one in-person touchpoint per phase where a real event or interaction opportunity exists.

Return a JSON object with EXACTLY this structure — valid JSON only, no markdown, no extra keys:
{
  "touchpoints": [
    {
      "id": "tp-01",
      "date": "May 17",
      "phase": "launch",
      "channel": "email",
      "variant": "win",
      "title": "Short title under 8 words",
      "subtitle": "One-sentence description under 20 words.",
      "chatPrompt": "A question the comms team could ask AI about this touchpoint",
      "sourceDocLabel": "Name of source document or omit field"
    }
  ],
  "emotionalArc": [
    { "phase": "pre-launch",     "state": "neutral",  "label": "Unaware / business as usual" },
    { "phase": "launch",         "state": "warning",  "label": "Surprised, processing the news" },
    { "phase": "day-two",        "state": "neutral",  "label": "Processing the change" },
    { "phase": "post-launch",    "state": "positive", "label": "Reassured by follow-up comms" },
    { "phase": "summer",         "state": "positive", "label": "Engaged with new brand" },
    { "phase": "back-to-school", "state": "neutral",  "label": "Returning with new context" }
  ],
  "gaps": ["Plain-language gap description"],
  "wins": ["Plain-language win description"]
}

Strict rules:
- Aim for 2–4 touchpoints per phase; include a gap-channel touchpoint only where a real gap exists
- emotionalArc must have exactly 6 entries, one per phase key listed above
- phase values: pre-launch | launch | day-two | post-launch | summer | back-to-school (no other values)
- channel values: email | social | in-product | in-person | gap (no other values)
- variant values: win | risk | neutral | gap | miss (no other values)
- state values: positive | neutral | warning | negative (no other values)
- gaps: 3–6 strings
- wins: 2–4 strings
- Valid JSON only — no markdown fences`;

function formatPersona(p: NonNullable<Awaited<ReturnType<typeof getPersonaById>>>): string {
  return [
    `Name: ${p.name}`,
    `Role: ${p.role}`,
    `Grade band: ${p.grade_band}`,
    `Relationship: ${p.relationship}`,
    `Motivation: ${p.motivation}`,
    `Current course: ${p.current_course}`,
    `Background: ${p.background}`,
    `Quote: ${p.quote}`,
    `Goals: ${p.goals?.join("; ")}`,
    `Pain points: ${p.pain_points?.join("; ")}`,
    `Needs: ${p.needs?.join("; ")}`,
    `Excited about: ${p.excited_about}`,
    `Nervous about: ${p.nervous_about}`,
    `Success looks like: ${p.success_looks_like}`,
    `Failure looks like: ${p.failure_looks_like}`,
    `How we want them to feel: ${p.aim_feeling}`,
    `AI relationship: ${p.ai_relationship}`,
    `Rebrand risk: ${p.rebrand_risk}`,
  ]
    .filter((l) => !l.endsWith("undefined") && !l.endsWith("null"))
    .join("\n");
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const personaId = Number(id);

  const persona = await getPersonaById(personaId);
  if (!persona) {
    return new Response(
      JSON.stringify({ type: "error", error: "Persona not found" }) + "\n",
      { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const syncedDoc = persona.synced_content
    ? `\n\n<persona_doc>\n${persona.synced_content.slice(0, 10000)}\n</persona_doc>`
    : "";

  const userContent = [
    PROMPT,
    `\n\n<persona>\n${formatPersona(persona)}\n</persona>`,
    syncedDoc,
  ].join("");

  const encoder = new TextEncoder();

  const body = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) =>
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));

      try {
        // Send first byte immediately — prevents the Vercel gateway from
        // issuing a 504 while Claude is generating the response.
        send({ type: "start" });

        // Read KB from Turso cache (populated by /api/kb-refresh before this call).
        const cached = await getKBCache();
        const kb = cached?.content ?? "";
        const kbError = cached ? undefined : "No KB cache — run a KB refresh first";
        send({ type: "kb", fetched: kb.length > 0, chars: kb.length, error: kbError });

        const message = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          system: SYSTEM,
          messages: [{ role: "user", content: userContent + (kb ? `\n\n<knowledge_base>\n${kb}\n</knowledge_base>` : "") }],
        });

        const fullText = (message.content[0] as { text: string }).text;

        const match = fullText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON found in Claude response");

        const parsed = JSON.parse(match[0]) as PersonaTimelineData;
        parsed.lastSynced = new Date().toISOString();

        await savePersonaTimeline(personaId, JSON.stringify(parsed));
        send({ type: "done", lastSynced: parsed.lastSynced });
      } catch (err) {
        send({
          type: "error",
          error: err instanceof Error ? err.message : "Sync failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
