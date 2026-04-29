import { fetchKnowledgeBase } from "@/lib/gdrive";

export async function GET() {
  try {
    const kb = await fetchKnowledgeBase();
    return new Response(kb, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (err) {
    return new Response("", { status: 500, headers: { "Content-Type": "text/plain" } });
  }
}
