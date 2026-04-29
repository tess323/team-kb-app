"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

export interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion: string;
  personaId: string;
  touchpointTitle: string;
}

export default function ChatDrawer({
  isOpen,
  onClose,
  initialQuestion,
  personaId,
  touchpointTitle,
}: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // On open: reset state and fire the initial question.
  // On close: reset state so re-opening with a new touchpoint starts fresh.
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInput("");
      setError("");
      return;
    }
    if (initialQuestion.trim()) {
      void sendMessage([], initialQuestion);
    }
    // Intentionally omitting initialQuestion / personaId / touchpointTitle —
    // we only want to fire when the drawer transitions to open, not on every
    // prop change while it's already open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Core streaming send ────────────────────────────────────────────────────

  async function sendMessage(currentMessages: Message[], content: string) {
    const userMessage: Message = { role: "user", content };
    const next = [...currentMessages, userMessage];
    setMessages(next);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          personaId,
          systemContext: `The user is asking about the touchpoint: ${touchpointTitle}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Request failed");
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

  // ── Follow-up submit ───────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || loading) return;
    setInput("");
    await sendMessage(messages, content);
  }

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full sm:w-[420px] bg-parchment border-l border-parchment-dark flex flex-col shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-parchment-dark shrink-0">
          <p className="text-sm font-medium text-ink truncate min-w-0">
            Ask about:{" "}
            <span className="text-hunter">{touchpointTitle}</span>
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-ink/40 hover:text-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="14" y1="2" x2="2" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Message history */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <p className="text-sm text-ink/40 italic">Asking…</p>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "user" ? (
                <div className="max-w-[80%] bg-hunter text-cream rounded-md px-4 py-2.5 text-sm leading-relaxed">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[92%] bg-cream border border-parchment-dark rounded-md px-4 py-3 text-sm text-ink leading-relaxed prose prose-sm max-w-none relative group">
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
                Fetching knowledge base…
              </div>
            </div>
          )}

          {error && <p className="text-rose text-sm">{error}</p>}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-parchment-dark p-4 shrink-0">
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
                  handleSubmit(e as unknown as FormEvent);
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
          <p className="mt-2 text-[10px] text-ink/30 text-center">
            Powered by the CodeAI KB
          </p>
        </div>
      </div>
    </>
  );
}
