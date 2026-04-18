"use client";

import { useState, FormEvent } from "react";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setAnswer(data.answer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
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
            {loading ? "Thinking…" : "Ask Claude"}
          </button>
        </form>
        {error && <p className="text-rose text-sm">{error}</p>}
        {answer && (
          <div className="bg-cream border border-parchment-dark rounded-md p-4 text-sm text-ink leading-relaxed whitespace-pre-wrap">
            {answer}
          </div>
        )}
      </section>
    </main>
  );
}
