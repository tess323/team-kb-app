"use client";

import { useState, FormEvent } from "react";
import ReactMarkdown from "react-markdown";

const SUGGESTED = [
  "What does Janelle need before launch?",
  "When should we brief regional partners?",
  "What are the biggest communication gaps?",
  "How does DeShawn feel about the rebrand?",
];

export default function AskCard() {
  const [input, setInput] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setQuestion(trimmed);
    setSubmitted(true);
    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: trimmed }] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Request failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setAnswer((prev) => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void submit(input);
  }

  function reset() {
    setSubmitted(false);
    setAnswer("");
    setQuestion("");
    setInput("");
    setError("");
  }

  return (
    <div className="bg-white border border-parchment-dark rounded-lg p-5 flex flex-col">
      <p
        className="text-[10px] font-semibold text-ink/40 mb-4 tracking-widest"
        style={{ fontVariant: "small-caps" }}
      >
        Ask the knowledge base
      </p>

      {!submitted ? (
        <>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the rebrand…"
              className="flex-1 bg-cream border border-parchment-dark rounded px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-hunter/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-hunter text-cream px-4 py-2 rounded text-sm font-medium hover:bg-hunter-mid disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              Ask
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                  void submit(q);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-parchment border border-parchment-dark text-parchment-text hover:border-hunter/40 hover:text-hunter transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-ink">{question}</p>

          {loading && !answer && (
            <p className="text-sm text-ink/40 italic">Searching knowledge base…</p>
          )}

          {answer && (
            <div
              className="pl-3 text-sm text-ink leading-relaxed"
              style={{ borderLeft: "2px solid #2D4739" }}
            >
              <div
                className="prose prose-sm max-w-none"
                style={{ "--tw-prose-body": "#1A1205" } as React.CSSProperties}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  }}
                >
                  {answer}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-rose">{error}</p>}

          {!loading && (
            <button
              onClick={reset}
              className="text-[12px] text-hunter hover:text-hunter-mid underline underline-offset-2 self-start transition-colors"
            >
              Ask another question →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
