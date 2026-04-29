import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fetchKnowledgeBase } from "@/lib/gdrive";
import { saveConversation, getPersonaById } from "@/lib/db";
import { personas } from "@/src/data/personas";
import type { PersonaTimelineData } from "@/lib/timeline-types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Message = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messages: Message[] = body?.messages;
  const personaId: string | undefined = body?.personaId;
  const systemContext: string | undefined = body?.systemContext;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  let context = "";
  try {
    context = await fetchKnowledgeBase();
  } catch (err) {
    console.error("[/api/ask] KB fetch failed:", err instanceof Error ? err.message : err);
  }

  let personaContext = "";

  if (personaId) {
    // Explicit persona ID — skip name inference, build richer context from DB.
    const record = await getPersonaById(Number(personaId));
    if (record) {
      const painPoints = record.pain_points?.join("; ") ?? "";
      let timelineSummary = "";
      if (record.timeline_data) {
        try {
          const td: PersonaTimelineData = JSON.parse(record.timeline_data);
          if (Array.isArray(td.touchpoints) && td.touchpoints.length > 0) {
            timelineSummary =
              "\nTimeline touchpoints:\n" +
              td.touchpoints.map((t) => `  - ${t.title} (${t.variant})`).join("\n");
          }
        } catch { /* unparseable timeline — skip */ }
      }
      const lines = [
        `Name: ${record.name ?? "unknown"}`,
        `Role: ${record.role ?? "unknown"}`,
        painPoints ? `Pain points: ${painPoints}` : null,
        timelineSummary || null,
        record.synced_content ? `\n${record.synced_content}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      personaContext = `\n\n<persona_docs>\n<persona name="${record.name}">\n${lines}\n</persona>\n</persona_docs>`;
    }
  } else {
    // Existing behaviour: infer persona from the last user message text.
    const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
    const mentionedPersonas = personas.filter((p) =>
      lastUserMessage.includes(p.name.toLowerCase()) ||
      lastUserMessage.includes(p.name.split(" ")[0].toLowerCase())
    );
    if (mentionedPersonas.length > 0) {
      const docSnippets = await Promise.all(
        mentionedPersonas.map(async (p) => {
          const record = await getPersonaById(p.id);
          if (!record?.google_doc_id || !record.synced_content) return null;
          return `<persona name="${p.name}">\n${record.synced_content}\n</persona>`;
        })
      );
      const valid = docSnippets.filter(Boolean);
      if (valid.length > 0) {
        personaContext = `\n\n<persona_docs>\n${valid.join("\n\n")}\n</persona_docs>`;
      }
    }
  }

  const extraContext = systemContext
    ? `\n\n<additional_context>\n${systemContext}\n</additional_context>`
    : "";

  // When neither new field is supplied this collapses to the original expression.
  const systemPrompt = context
    ? `You are a helpful assistant with access to the team knowledge base. Use the following documents to answer questions accurately.\n\n<knowledge_base>\n${context}\n</knowledge_base>${personaContext}${extraContext}`
    : personaId || systemContext
    ? `You are a helpful assistant.${personaContext}${extraContext}`
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
