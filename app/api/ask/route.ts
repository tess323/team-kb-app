import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchKnowledgeBase } from "@/lib/gdrive";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const question: string = body?.question;

  if (!question || typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  let context: string;
  try {
    context = await fetchKnowledgeBase();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/ask] KB fetch failed:", message);
    return NextResponse.json({ error: "Failed to fetch knowledge base", detail: message }, { status: 500 });
  }

  const systemPrompt = context
    ? `You are a helpful assistant with access to the team knowledge base. Use the following documents to answer questions accurately.\n\n<knowledge_base>\n${context}\n</knowledge_base>`
    : "You are a helpful assistant.";

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: question.trim() }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
      } catch (err) {
        console.error("[/api/ask] stream error:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
