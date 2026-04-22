import { NextRequest, NextResponse } from "next/server";
import { personas } from "@/src/data/personas";
import { createPersonaDoc } from "@/lib/gdrive";
import { updatePersonaDocId } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { personaId } = await req.json();
  const id = Number(personaId);

  const persona = personas.find((p) => p.id === id);
  if (!persona) {
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

function formatPersonaAsDoc(persona: (typeof personas)[number]): string {
  const lines: string[] = [
    `${persona.name}`,
    `${persona.role}`,
    `Grade band: ${persona.gradeBand}  |  Relationship: ${persona.relationshipStatus}  |  Motivation: ${persona.motivationSpectrum} (${persona.motivationScore}/100)`,
    "",
    "BACKGROUND",
    persona.background,
    "",
    "WHAT THIS SHOULD FEEL LIKE",
    persona.feelLike,
    "",
    "EXCITED ABOUT",
    persona.excited,
    "",
    "NERVOUS ABOUT",
    persona.nervous,
    "",
    "SUCCESS LOOKS LIKE",
    persona.successLooks,
    "",
    "FAILURE LOOKS LIKE",
    persona.failureLooks,
    "",
    "COMMUNICATION CHANNELS",
    "Within our control:",
    ...persona.channelsWithinControl.map((c) => `  • ${c}`),
    "Outside our control:",
    ...persona.channelsOutsideControl.map((c) => `  • ${c}`),
    "",
    "JOURNEY",
    "",
    "Pre-launch:",
    ...persona.journey.preLaunch.moments.map((m) => `  • ${m}`),
    "",
    "Launch:",
    ...persona.journey.launch.moments.map((m) => `  • ${m}`),
    "",
    "Summer:",
    ...persona.journey.summer.moments.map((m) => `  • ${m}`),
    "",
    "Back to school:",
    ...persona.journey.backToSchool.moments.map((m) => `  • ${m}`),
  ];
  return lines.join("\n");
}
