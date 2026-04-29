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

export default function PersonaJourneySection({
  timelineRaw,
  personaId,
}: PersonaJourneySectionProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [activeTouchpoint, setActiveTouchpoint] = useState<TimelineTouchpoint | null>(null);

  const timeline = parseTimeline(timelineRaw);

  async function handleSyncRequest() {
    setIsSyncing(true);
    setSyncError("");
    try {
      const res = await fetch(`/api/personas/${personaId}/sync-timeline`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Sync failed");
      }
      router.refresh();
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  }

  function handleTouchpointClick(touchpoint: TimelineTouchpoint) {
    setActiveTouchpoint(touchpoint);
    setChatDrawerOpen(true);
  }

  return (
    <>
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
