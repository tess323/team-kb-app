import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAllConversations } from "@/lib/db";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  const conversations = await getAllConversations();

  if (conversations.length === 0) {
    return NextResponse.json([]);
  }

  const conversationText = conversations
    .map((c, i) => `Q${i + 1}: ${c.user_message}\nA${i + 1}: ${c.assistant_response}`)
    .join("\n\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `You are analyzing a list of questions users have asked. Group similar questions together, identify the most common themes, and for each group write: a clear representative question, a count of how many times this theme was asked, and a brief answer based on the assistant responses. Return JSON in this format: [{"question": string, "count": number, "answer": string, "relatedQuestions": string[]}]`,
    messages: [
      {
        role: "user",
        content: `Here are the questions and answers from user conversations:\n\n${conversationText}\n\nReturn only the JSON array, no preamble or markdown fences.`,
      },
    ],
  });

  const raw = (message.content[0] as { type: "text"; text: string }).text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  const faq = JSON.parse(raw);
  return NextResponse.json(faq);
}
