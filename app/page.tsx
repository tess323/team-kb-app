"use client";

import { useState, useEffect, FormEvent } from "react";

interface Record {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  // Q&A state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState("");

  // Records state
  const [records, setRecords] = useState<Record[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    setRecordsLoading(true);
    setRecordsError("");
    try {
      const res = await fetch("/api/records");
      if (!res.ok) throw new Error("Failed to load records");
      setRecords(await res.json());
    } catch {
      setRecordsError("Could not load records.");
    } finally {
      setRecordsLoading(false);
    }
  }

  async function handleAsk(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setAskLoading(true);
    setAnswer("");
    setAskError("");
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
      setAskError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAskLoading(false);
    }
  }

  function startEdit(record: Record) {
    setEditingId(record.id);
    setFormTitle(record.title);
    setFormContent(record.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormTitle("");
    setFormContent("");
  }

  async function handleSubmitRecord(e: FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;
    setRecordsError("");
    try {
      const isEditing = editingId !== null;
      const res = await fetch("/api/records", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditing
            ? { id: editingId, title: formTitle, content: formContent }
            : { title: formTitle, content: formContent }
        ),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Request failed");
      }
      cancelEdit();
      await loadRecords();
    } catch (err: unknown) {
      setRecordsError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this record?")) return;
    setRecordsError("");
    try {
      const res = await fetch(`/api/records?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      await loadRecords();
    } catch (err: unknown) {
      setRecordsError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 space-y-12">
      <h1 className="text-3xl font-bold text-gray-900">Team Knowledge Base</h1>

      {/* Q&A Section */}
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
            disabled={askLoading || !question.trim()}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {askLoading ? "Thinking…" : "Ask Claude"}
          </button>
        </form>
        {askError && <p className="text-red-600 text-sm">{askError}</p>}
        {answer && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-sm text-gray-800 whitespace-pre-wrap">
            {answer}
          </div>
        )}
      </section>

      {/* Records Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Records</h2>

        {/* Create / Edit form */}
        <form onSubmit={handleSubmitRecord} className="space-y-3">
          <h3 className="text-sm font-medium text-gray-600">
            {editingId !== null ? "Edit Record" : "New Record"}
          </h3>
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            rows={4}
            placeholder="Content"
            value={formContent}
            onChange={(e) => setFormContent(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!formTitle.trim() || !formContent.trim()}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {editingId !== null ? "Save Changes" : "Create Record"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-5 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {recordsError && <p className="text-red-600 text-sm">{recordsError}</p>}

        {/* Records list */}
        {recordsLoading ? (
          <p className="text-sm text-gray-500">Loading records…</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No records yet.</p>
        ) : (
          <ul className="space-y-3">
            {records.map((r) => (
              <li
                key={r.id}
                className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{r.title}</p>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{r.content}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Updated {new Date(r.updated_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(r)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
