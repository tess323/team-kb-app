"use client";

import { useState } from "react";

type Props = {
  personaId: number;
  initialDocId: string | null;
  initialDocUrl: string | null;
  initialLastSynced: string | null;
};

export default function PersonaDocActions({
  personaId,
  initialDocId,
  initialDocUrl,
  initialLastSynced,
}: Props) {
  const [docId, setDocId] = useState(initialDocId);
  const docUrl = docId ? `https://docs.google.com/document/d/${docId}/edit` : initialDocUrl;
  const [lastSynced, setLastSynced] = useState(initialLastSynced);
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Export failed");
      setDocId(data.docId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch(`/api/personas/${personaId}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sync failed");
      setLastSynced(data.last_synced);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-2">
        {docUrl && (
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-hunter/30 text-hunter hover:bg-hunter-muted transition-colors"
          >
            View doc ↗
          </a>
        )}
        {docId && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-parchment-dark text-ink/60 hover:text-ink hover:border-ink/30 transition-colors disabled:opacity-40"
          >
            {syncing ? "Syncing…" : "Sync from doc"}
          </button>
        )}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-hunter text-cream hover:bg-hunter/90 transition-colors disabled:opacity-40"
        >
          {exporting ? "Exporting…" : docId ? "Re-export to doc" : "Export to Google Doc"}
        </button>
      </div>
      {lastSynced && (
        <p className="text-xs text-ink/40">
          Last synced {new Date(lastSynced).toLocaleString()}
        </p>
      )}
      {error && <p className="text-xs text-rose">{error}</p>}
    </div>
  );
}
