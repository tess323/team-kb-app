import { NextRequest, NextResponse } from "next/server";
import { getPersonaById, updatePersonaDocId, type PersonaRow } from "@/lib/db";
import { createPersonaDoc } from "@/lib/gdrive";

export async function POST(req: NextRequest) {
  const { personaId } = await req.json();
  const id = Number(personaId);

  const persona = await getPersonaById(id);
  if (!persona || !persona.name) {
    return NextResponse.json({ error: "Persona not found" }, { status: 404 });
  }

  const content = formatPersonaAsDoc(persona);

  let result: { docId: string; docUrl: string };
  try {
    result = await createPersonaDoc(`${persona.name} — Persona`, content);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/export] createPersonaDoc failed:", message);
    return NextResponse.json({ error: "Failed to create Google Doc", detail: message }, { status: 500 });
  }

  await updatePersonaDocId(id, result.docId);

  return NextResponse.json({ docId: result.docId, docUrl: result.docUrl });
}

function bullets(items: string[] | null): string[] {
  return items?.map((i) => `  • ${i}`) ?? [];
}

function formatPersonaAsDoc(p: PersonaRow): string {
  const lines: string[] = [
    p.name ?? "",
    p.role ?? "",
    [p.grade_band, p.relationship, p.motivation, p.current_course]
      .filter(Boolean)
      .join("  |  "),
    "",
  ];

  if (p.quote) lines.push(`"${p.quote}"`, "");
  if (p.background) lines.push("BACKGROUND", p.background, "");
  if (p.goals?.length) lines.push("GOALS", ...bullets(p.goals), "");
  if (p.pain_points?.length) lines.push("PAIN POINTS", ...bullets(p.pain_points), "");
  if (p.needs?.length) lines.push("NEEDS", ...bullets(p.needs), "");
  if (p.excited_about) lines.push("EXCITED ABOUT", p.excited_about, "");
  if (p.nervous_about) lines.push("NERVOUS ABOUT", p.nervous_about, "");
  if (p.success_looks_like) lines.push("SUCCESS LOOKS LIKE", p.success_looks_like, "");
  if (p.failure_looks_like) lines.push("FAILURE LOOKS LIKE", p.failure_looks_like, "");
  if (p.aim_feeling) lines.push("HOW WE WANT THEM TO FEEL", p.aim_feeling, "");
  if (p.ai_relationship) lines.push("AI RELATIONSHIP", p.ai_relationship, "");
  if (p.rebrand_risk) lines.push("REBRAND RISK", p.rebrand_risk, "");

  if (p.comms_in_control?.length || p.comms_out_of_control?.length) {
    lines.push("COMMUNICATION CHANNELS", "");
    if (p.comms_in_control?.length) {
      lines.push("Within our control:", ...bullets(p.comms_in_control), "");
    }
    if (p.comms_out_of_control?.length) {
      lines.push("Outside our control:", ...bullets(p.comms_out_of_control), "");
    }
  }

  return lines.join("\n");
}
