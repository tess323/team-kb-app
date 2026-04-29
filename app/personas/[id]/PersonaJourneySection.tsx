"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import JourneyMap from "./JourneyMap";
import ChatDrawer from "@/components/ChatDrawer";
import type { PersonaTimelineData, TimelineTouchpoint } from "@/lib/timeline-types";

const EMPTY_TIMELINE: PersonaTimelineData = {
  touchpoints: [],
  emotionalArc: [],
  gaps: [],
  wins: [],
  lastSynced: "Never",
};

function parseTimeline(raw: string | null): PersonaTimelineData {
  if (!raw) return EMPTY_TIMELINE;
  try {
    const parsed = JSON.parse(raw) as PersonaTimelineData;
    if (parsed && Array.isArray(parsed.touchpoints)) return parsed;
  } catch { /* ignore */ }
  return EMPTY_TIMELINE;
}

interface PersonaJourneySectionProps {
  timelineRaw: string | null;
  personaId: string;
}

type SyncEvent = { type: string; error?: string; fetched?: boolean; chars?: number };

export default function PersonaJourneySection({
  timelineRaw,
  personaId,
}: PersonaJourneySectionProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [activeTouchpoint, setActiveTouchpoint] = useState<TimelineTouchpoint | null>(null);

  const timeline = parseTimeline(timelineRaw);

  async function handleSyncRequest() {
    setIsSyncing(true);
    setSyncError("");
    try {
      // Step 1: refresh KB cache via serverless route (no time limit).
      setSyncStatus("Fetching knowledge base…");
      const kbRes = await fetch("/api/kb-refresh", { method: "POST" });
      const kbData = await kbRes.json() as { ok: boolean; chars?: number; error?: string };
      if (!kbData.ok) {
        setSyncStatus(`KB unavailable (${kbData.error ?? "unknown"}) — generating from persona…`);
      } else {
        setSyncStatus(`KB ready (${kbData.chars?.toLocaleString()} chars) — generating…`);
      }

      // Step 2: stream timeline generation from Edge function (reads KB from Turso cache).
      const res = await fetch(`/api/personas/${personaId}/sync-timeline`, { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      let completed = false;
      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const event = JSON.parse(line) as SyncEvent;
            if (event.type === "done") {
              completed = true;
              setSyncStatus("");
              router.refresh();
              break outer;
            }
            if (event.type === "error") {
              throw new Error(event.error ?? "Sync failed");
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
      if (!completed) throw new Error("Sync timed out — the request took too long. Try again.");
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setIsSyncing(false);
      setSyncStatus("");
    }
  }

  function handleTouchpointClick(touchpoint: TimelineTouchpoint) {
    setActiveTouchpoint(touchpoint);
    setChatDrawerOpen(true);
  }

  return (
    <>
      {syncStatus && (
        <p className="text-xs text-ink/50 mb-2">{syncStatus}</p>
      )}
      {syncError && (
        <p className="text-rose text-xs mb-2">{syncError}</p>
      )}
      <JourneyMap
        timeline={timeline}
        personaId={personaId}
        isSyncing={isSyncing}
        onSyncRequest={handleSyncRequest}
        onTouchpointClick={handleTouchpointClick}
      />
      <ChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => {
          setChatDrawerOpen(false);
          setActiveTouchpoint(null);
        }}
        initialQuestion={activeTouchpoint?.chatPrompt ?? ""}
        personaId={personaId}
        touchpointTitle={activeTouchpoint?.title ?? ""}
      />
    </>
  );
}
