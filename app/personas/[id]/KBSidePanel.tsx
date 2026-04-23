"use client";

import { useState, useEffect } from "react";
import type { Citation } from "@/lib/timeline-diff";

export type KBPanelCtx = {
  title: string;
  citation?: Citation;
  context?: string;
};

export default function KBSidePanel({
  ctx,
  onClose,
}: {
  ctx: KBPanelCtx;
  onClose: () => void;
}) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const { title, citation, context } = ctx;

  useEffect(() => {
    setSummary("");
    setLoading(true);

    fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Summarize the key points from the knowledge base document titled "${title}". Keep it to 4–6 concise bullet points.`,
          },
        ],
      }),
    })
      .then(async (res) => {
        if (!res.body) {
          setLoading(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setSummary((prev) => prev + decoder.decode(value));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [title]);

  const searchUrl = `https://drive.google.com/drive/search?q=${encodeURIComponent(title)}`;

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[400px] bg-cream z-50 flex flex-col shadow-2xl">
        <div className="flex items-start justify-between p-5 border-b border-cream-dark shrink-0">
          <div className="min-w-0 pr-3">
            <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide mb-1">
              KB Document
            </p>
            <h3 className="text-sm font-semibold text-ink leading-snug">{title}</h3>
            {context && (
              <p className="text-2xs text-ink/50 mt-1.5">Used to generate: {context}</p>
            )}
            {citation?.type === "sourced" && citation.note && (
              <p className="text-xs italic text-ink/60 mt-2 leading-relaxed">"{citation.note}"</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 mt-0.5 text-ink/40 hover:text-ink transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && !summary ? (
            <p className="text-sm text-ink/40 italic">Loading summary…</p>
          ) : (
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{summary}</p>
          )}
        </div>

        <div className="p-5 border-t border-cream-dark shrink-0">
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 w-full text-xs font-medium px-3 py-2 rounded-md border border-hunter/30 text-hunter hover:bg-hunter-muted transition-colors"
          >
            Open in Google Drive ↗
          </a>
        </div>
      </div>
    </>
  );
}
