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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Team Knowledge Base</h1>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Ask a Question</h2>
        <form onSubmit={handleAsk} className="space-y-3">
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            rows={3}
            placeholder="Ask anything about the team knowledge base…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Thinking…" : "Ask Claude"}
          </button>
        </form>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {answer && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-800 whitespace-pre-wrap">
            {answer}
          </div>
        )}
      </section>
    </main>
  );
}
