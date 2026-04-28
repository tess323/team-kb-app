import { NextRequest, NextResponse } from "next/server";
import { getAllPersonas, upsertPersonaByName } from "@/lib/db";

export async function GET() {
  const personas = await getAllPersonas();
  return NextResponse.json(personas);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const id = await upsertPersonaByName(body);
  return NextResponse.json({ persona_id: id });
}
