import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchKnowledgeBase } from "@/lib/gdrive";
import { saveConversation } from "@/lib/db";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Message = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages: Message[] = body?.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
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
    max_tokens: 8096,
    system: systemPrompt,
    messages,
  });

  const userMessage = messages[messages.length - 1].content;
  let assistantResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            assistantResponse += chunk.delta.text;
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        saveConversation(userMessage, assistantResponse).catch((err) =>
          console.error("[/api/ask] failed to save conversation:", err)
        );
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
