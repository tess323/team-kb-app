import { NextRequest, NextResponse } from "next/server";
import { fetchKnowledgeBase } from "@/lib/gdrive";
import { askWithContext } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = body?.question;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }

    const context = await fetchKnowledgeBase();
    const answer = await askWithContext(question.trim(), context);

    return NextResponse.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/ask]", err);
    return NextResponse.json(
      { error: "Failed to process question", detail: message },
      { status: 500 }
    );
  }
}
