"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error || "Request failed");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setLoading(false);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-ink">Ask the knowledge base</h1>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setError(""); }}
            className="text-sm text-ink/50 hover:text-hunter transition-colors"
          >
            New conversation
          </button>
        )}
      </div>

      <section className="bg-parchment border border-parchment-dark rounded-md flex flex-col" style={{ minHeight: "480px" }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !loading && (
            <p className="text-sm text-ink/40 italic">Ask anything about the rebrand knowledge base…</p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "user" ? (
                <div className="max-w-[75%] bg-hunter text-cream rounded-md px-4 py-2.5 text-sm leading-relaxed">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[85%] bg-cream border border-parchment-dark rounded-md px-4 py-3 text-sm text-ink leading-relaxed relative group">
                  <button
                    onClick={() => handleCopy(m.content, i)}
                    className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded border border-parchment-dark bg-parchment text-ink/50 opacity-0 group-hover:opacity-100 hover:text-hunter hover:border-hunter transition-all"
                  >
                    {copiedIndex === i ? "Copied!" : "Copy"}
                  </button>
                  <ReactMarkdown
                    components={{
                      p:          ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong:     ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
                      em:         ({ children }) => <em className="italic">{children}</em>,
                      h1:         ({ children }) => <h1 className="text-xl font-semibold text-ink mt-3 mb-1">{children}</h1>,
                      h2:         ({ children }) => <h2 className="text-lg font-semibold text-ink mt-3 mb-1">{children}</h2>,
                      h3:         ({ children }) => <h3 className="text-base font-semibold text-ink mt-2 mb-1">{children}</h3>,
                      ul:         ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-0.5">{children}</ul>,
                      ol:         ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5">{children}</ol>,
                      li:         ({ children }) => <li className="leading-relaxed">{children}</li>,
                      code:       ({ children }) => <code className="bg-parchment px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-parchment-dark pl-3 text-ink/70 italic my-2">{children}</blockquote>,
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-cream border border-parchment-dark rounded-md px-4 py-3 text-sm text-ink/40 italic">
                Searching knowledge base…
              </div>
            </div>
          )}
          {error && <p className="text-rose text-sm">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-parchment-dark p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              className="flex-1 bg-cream border border-parchment-dark rounded-md px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-hunter resize-none"
              rows={2}
              placeholder="Ask a follow-up…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit(e as unknown as FormEvent);
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-hunter text-cream px-5 py-2 rounded-md text-sm font-medium hover:bg-hunter-mid disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-end"
            >
              Send
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
