"use client";

import { useState, FormEvent } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleAsk(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setError("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      setLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-ink mb-8">Rebrand User Experience</h1>

      <section className="bg-parchment border border-parchment-dark rounded-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-ink">Ask a Question</h2>
        <form onSubmit={handleAsk} className="space-y-3">
          <textarea
            className="w-full bg-cream border border-parchment-dark rounded-md px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-hunter resize-none"
            rows={3}
            placeholder="Ask anything about the team knowledge base…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="bg-hunter text-cream px-5 py-2 rounded-md text-sm font-medium hover:bg-hunter-mid disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Fetching knowledge base…" : "Ask Claude"}
          </button>
        </form>
        {error && <p className="text-rose text-sm">{error}</p>}
        {answer && (
          <div className="bg-cream border border-parchment-dark rounded-md p-4 text-sm text-ink leading-relaxed prose prose-sm max-w-none relative">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-md border border-parchment-dark bg-parchment text-ink/60 hover:text-hunter hover:border-hunter transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <ReactMarkdown
              components={{
                p:      ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
                em:     ({ children }) => <em className="italic">{children}</em>,
                h1:     ({ children }) => <h1 className="text-xl font-semibold text-ink mt-4 mb-2">{children}</h1>,
                h2:     ({ children }) => <h2 className="text-lg font-semibold text-ink mt-4 mb-2">{children}</h2>,
                h3:     ({ children }) => <h3 className="text-base font-semibold text-ink mt-3 mb-1">{children}</h3>,
                ul:     ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                ol:     ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                li:     ({ children }) => <li className="leading-relaxed">{children}</li>,
                code:   ({ children }) => <code className="bg-parchment px-1 py-0.5 rounded text-xs font-mono text-ink">{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-parchment-dark pl-3 text-ink/70 italic my-3">{children}</blockquote>,
              }}
            >
              {answer}
            </ReactMarkdown>
          </div>
        )}
      </section>
    </main>
  );
}
