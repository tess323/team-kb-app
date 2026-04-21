"use client";

import { useState, useEffect } from "react";

type FaqItem = {
  question: string;
  count: number;
  answer: string;
  relatedQuestions: string[];
};

export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/faq");
      if (!res.ok) throw new Error("Failed to generate FAQ");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Frequently Asked Questions</h1>
          <p className="text-sm text-ink/50 mt-1">Auto-generated from conversation history</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-sm font-medium px-4 py-2 rounded-md border border-parchment-dark bg-parchment text-ink/70 hover:border-hunter hover:text-hunter disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Generating…" : "Refresh"}
        </button>
      </div>

      {loading && (
        <div className="bg-parchment border border-parchment-dark rounded-md p-8 text-center">
          <p className="text-sm text-ink/50 italic">Generating FAQ from conversation history…</p>
        </div>
      )}

      {error && <p className="text-rose text-sm">{error}</p>}

      {!loading && items.length === 0 && !error && (
        <div className="bg-parchment border border-parchment-dark rounded-md p-8 text-center">
          <p className="text-sm text-ink/50 italic">No conversations yet. Ask some questions first.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-parchment border border-parchment-dark rounded-md p-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-sm font-semibold text-ink leading-snug flex-1">{item.question}</h2>
                <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-hunter-muted text-hunter">
                  ×{item.count}
                </span>
              </div>
              <p className="text-sm text-ink/80 leading-relaxed mt-3">{item.answer}</p>

              {item.relatedQuestions?.length > 0 && (
                <div className="mt-3 border-t border-parchment-dark pt-3">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="text-xs font-medium text-ink/50 hover:text-hunter transition-colors"
                  >
                    {expanded === i ? "Hide" : "Show"} {item.relatedQuestions.length} related question{item.relatedQuestions.length !== 1 ? "s" : ""}
                  </button>
                  {expanded === i && (
                    <ul className="mt-2 space-y-1">
                      {item.relatedQuestions.map((q, j) => (
                        <li key={j} className="text-xs text-ink/60 leading-relaxed pl-3 border-l-2 border-parchment-dark">
                          {q}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
