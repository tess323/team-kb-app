import { NextResponse } from "next/server";
import { fetchKnowledgeBase } from "@/lib/gdrive";

export async function GET() {
  try {
    const kb = await fetchKnowledgeBase();
    return NextResponse.json({ ok: true, length: kb.length, preview: kb.slice(0, 200) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json({ ok: false, error: message, stack }, { status: 500 });
  }
}
