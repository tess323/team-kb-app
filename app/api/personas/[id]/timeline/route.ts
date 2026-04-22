import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getPersonaById, savePersonaTimeline, dismissTimelineGap } from "@/lib/db";
import { fetchKnowledgeBase } from "@/lib/gdrive";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT = `You are generating a communication timeline for a persona in a rebrand campaign. Using the persona details and knowledge base provided, generate a timeline across 5 phases: Before Launch, Launch, Summer, End of Summer, Back to School.

For each phase return:
- phase: string (one of: before_launch, launch, summer, end_of_summer, back_to_school)
- mindset: string (what is on their mind during this phase — first person, present tense, 1-2 sentences, reads like an internal thought)
- events: array of:
  - id: unique string
  - title: string
  - description: string (2-3 sentences)
  - type: one of: email, in_person, social, doc, platform
  - control: 'in' or 'out' (whether this is a channel we control)
  - kb_link: string or null (title of relevant KB document if one exists)
- gaps: array of:
  - id: unique string
  - title: string (Gap: [what is missing])
  - description: string (why this matters for this persona and what needs to be created)

Return valid JSON only. No markdown, no explanation.`;

function formatPersona(p: Awaited<ReturnType<typeof getPersonaById>>): string {
  if (!p) return "";
  const lines = [
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
  ];
  return lines.filter((l) => !l.endsWith("undefined") && !l.endsWith("null")).join("\n");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const persona = await getPersonaById(Number(id));
  return NextResponse.json({
    timeline_data: persona?.timeline_data ?? null,
    timeline_gaps: persona?.timeline_gaps ?? [],
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const personaId = Number(id);
  const body = await req.json();

  if (body.action === "dismiss-gap") {
    await dismissTimelineGap(personaId, body.gapId);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "generate") {
    const persona = await getPersonaById(personaId);
    if (!persona) return NextResponse.json({ error: "Persona not found" }, { status: 404 });

    let kb = "";
    try { kb = await fetchKnowledgeBase(); } catch { /* proceed without KB */ }

    const userContent = `${PROMPT}\n\n<persona>\n${formatPersona(persona)}\n</persona>\n\n<knowledge_base>\n${kb}\n</knowledge_base>`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8096,
      messages: [{ role: "user", content: userContent }],
    });

    const text = (message.content[0] as { text: string }).text;
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("[timeline] no JSON array in response:", text.slice(0, 300));
      return NextResponse.json({ error: "Failed to parse timeline from Claude" }, { status: 500 });
    }

    await savePersonaTimeline(personaId, match[0]);
    return NextResponse.json({ timeline_data: match[0] });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
