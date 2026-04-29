import { fetchKnowledgeBase } from "@/lib/gdrive";
import { saveKBCache } from "@/lib/db-edge";

export async function POST() {
  try {
    const kb = await fetchKnowledgeBase();
    await saveKBCache(kb);
    return Response.json({ ok: true, chars: kb.length, updated_at: new Date().toISOString() });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "KB refresh failed" },
      { status: 500 }
    );
  }
}
