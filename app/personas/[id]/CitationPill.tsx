"use client";

import type { Citation } from "@/lib/timeline-diff";
import type { KBPanelCtx } from "./KBSidePanel";

export default function CitationPill({
  citation,
  context,
  onOpen,
}: {
  citation: Citation;
  context?: string;
  onOpen?: (ctx: KBPanelCtx) => void;
}) {
  if (citation.type === "sourced") {
    const label = citation.source ?? "source";
    return (
      <button
        onClick={() => onOpen?.({ title: label, citation, context })}
        className="inline-flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded-full font-medium bg-hunter-muted text-hunter hover:bg-hunter/20 transition-colors"
      >
        <DocIcon />
        {label}
      </button>
    );
  }

  if (citation.type === "inferred") {
    return (
      <span className="inline-flex items-center text-2xs px-1.5 py-0.5 rounded-full font-medium border border-dashed border-ochre/50 text-ochre bg-ochre-muted">
        inferred
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-2xs px-1.5 py-0.5 rounded-full font-medium bg-rose-muted text-rose">
      gap
    </span>
  );
}

function DocIcon() {
  return (
    <svg width={9} height={9} viewBox="0 0 14 14" fill="none" className="shrink-0">
      <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="4.5" y1="4.5" x2="9.5" y2="4.5" stroke="currentColor" strokeWidth="1" />
      <line x1="4.5" y1="6.5" x2="9.5" y2="6.5" stroke="currentColor" strokeWidth="1" />
      <line x1="4.5" y1="8.5" x2="7.5" y2="8.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
