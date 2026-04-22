import { NextRequest, NextResponse } from "next/server";
import { getPersonaById, syncPersonaContent } from "@/lib/db";
import { fetchPersonaDoc } from "@/lib/gdrive";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = await getPersonaById(Number(id));
  if (!record) {
    return NextResponse.json({ persona_id: Number(id), google_doc_id: null, synced_content: null, last_synced: null });
  }
  return NextResponse.json(record);
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const personaId = Number(id);

  const record = await getPersonaById(personaId);
  if (!record?.google_doc_id) {
    return NextResponse.json({ error: "No Google Doc linked to this persona" }, { status: 400 });
  }

  let content: string;
  try {
    content = await fetchPersonaDoc(record.google_doc_id);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to fetch Google Doc", detail: message }, { status: 500 });
  }

  await syncPersonaContent(personaId, content);

  return NextResponse.json({ ok: true, last_synced: new Date().toISOString(), content });
}
