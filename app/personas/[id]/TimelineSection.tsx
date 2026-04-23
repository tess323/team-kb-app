"use client";

import { useState, useEffect } from "react";
import KBSidePanel from "./KBSidePanel";

// ── Types ─────────────────────────────────────────────────────────────────────

type EventType = "email" | "in_person" | "social" | "doc" | "platform";

type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  control: "in" | "out";
  kb_link: string | null;
};

type TimelineGap = {
  id: string;
  title: string;
  description: string;
};

type TimelinePhase = {
  phase: string;
  mindset: string;
  events: TimelineEvent[];
  gaps: TimelineGap[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const PHASE_META: Record<string, { label: string; color: string }> = {
  before_launch:  { label: "Before Launch",   color: "#534AB7" },
  launch:         { label: "Launch",           color: "#0F6E56" },
  summer:         { label: "Summer",           color: "#854F0B" },
  end_of_summer:  { label: "End of Summer",    color: "#D85A30" },
  back_to_school: { label: "Back to School",   color: "#185FA5" },
};

const TYPE_LABEL: Record<EventType, string> = {
  email:     "Email",
  in_person: "In Person",
  social:    "Social",
  doc:       "Doc",
  platform:  "Platform",
};

const TYPE_CLS: Record<EventType, string> = {
  email:     "bg-slate-muted text-slate",
  in_person: "bg-hunter-muted text-hunter",
  social:    "bg-ochre-muted text-ochre",
  doc:       "bg-parchment text-parchment-text",
  platform:  "bg-cream-dark text-cream-text",
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function Icon({ type, size = 14 }: { type: EventType; size?: number }) {
  const s = { width: size, height: size };
  switch (type) {
    case "email":
      return (
        <svg {...s} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <rect x="1" y="3" width="12" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1.5 4.5 7 8l5.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "in_person":
      return (
        <svg {...s} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1.5 13c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "social":
      return (
        <svg {...s} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <circle cx="7" cy="7" r="1.4" fill="currentColor" />
          <circle cx="2" cy="3.5" r="1.4" fill="currentColor" />
          <circle cx="12" cy="3.5" r="1.4" fill="currentColor" />
          <circle cx="2" cy="10.5" r="1.4" fill="currentColor" />
          <circle cx="12" cy="10.5" r="1.4" fill="currentColor" />
          <line x1="3.3" y1="4.2" x2="5.8" y2="6.2" stroke="currentColor" strokeWidth="0.9" />
          <line x1="10.7" y1="4.2" x2="8.2" y2="6.2" stroke="currentColor" strokeWidth="0.9" />
          <line x1="3.3" y1="9.8" x2="5.8" y2="7.8" stroke="currentColor" strokeWidth="0.9" />
          <line x1="10.7" y1="9.8" x2="8.2" y2="7.8" stroke="currentColor" strokeWidth="0.9" />
        </svg>
      );
    case "doc":
      return (
        <svg {...s} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="4.5" y1="4.5" x2="9.5" y2="4.5" stroke="currentColor" strokeWidth="1" />
          <line x1="4.5" y1="6.5" x2="9.5" y2="6.5" stroke="currentColor" strokeWidth="1" />
          <line x1="4.5" y1="8.5" x2="7.5" y2="8.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case "platform":
      return (
        <svg {...s} viewBox="0 0 14 14" fill="none" className="shrink-0">
          <rect x="1" y="1.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <line x1="5" y1="12.5" x2="9" y2="12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="7" y1="9.5" x2="7" y2="12.5" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
  }
}

// ── Phase detail panel ────────────────────────────────────────────────────────

function PhaseDetail({
  phase,
  meta,
  dismissedGaps,
  onDismiss,
  onKBLink,
}: {
  phase: TimelinePhase;
  meta: { label: string; color: string };
  dismissedGaps: string[];
  onDismiss: (id: string) => void;
  onKBLink: (title: string) => void;
}) {
  const activeGaps = phase.gaps.filter((g) => !dismissedGaps.includes(g.id));

  return (
    <div className="mt-3 rounded-md bg-cream border border-cream-dark p-5">
      {/* Mindset */}
      <div className="flex gap-3 mb-5">
        <div className="w-1 shrink-0 rounded-full self-stretch" style={{ backgroundColor: meta.color }} />
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wide mb-1" style={{ color: meta.color }}>
            {meta.label}
          </p>
          <p className="text-sm italic text-ink/70 leading-relaxed">{phase.mindset}</p>
        </div>
      </div>

      {/* Events */}
      {phase.events.length > 0 && (
        <div className="space-y-2 mb-4">
          {phase.events.map((ev) => (
            <div key={ev.id} className="flex gap-3 p-3 bg-white rounded border border-parchment-dark">
              <span className="mt-0.5 text-ink/40 shrink-0">
                <Icon type={ev.type} size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <span className="text-sm font-medium text-ink">{ev.title}</span>
                  <span
                    className={`text-2xs px-1.5 py-0.5 rounded-full font-medium ${
                      ev.control === "in"
                        ? "bg-hunter-muted text-hunter"
                        : "bg-rose-muted text-rose"
                    }`}
                  >
                    {ev.control === "in" ? "In our control" : "Out of our control"}
                  </span>
                  {ev.kb_link && (
                    <button
                      onClick={() => onKBLink(ev.kb_link!)}
                      className="inline-flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded-full font-medium bg-slate-muted text-slate hover:bg-slate/20 transition-colors"
                    >
                      <Icon type="doc" size={9} />
                      {ev.kb_link}
                    </button>
                  )}
                </div>
                <p className="text-xs text-ink/60 leading-relaxed">{ev.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gaps */}
      {activeGaps.length > 0 && (
        <div>
          <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide mb-2">
            Content Gaps
          </p>
          <div className="space-y-2">
            {activeGaps.map((gap) => (
              <div
                key={gap.id}
                className="flex gap-3 p-3 bg-rose-muted rounded border border-rose-light"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink mb-0.5">{gap.title}</p>
                  <p className="text-xs text-ink/60 leading-relaxed">{gap.description}</p>
                </div>
                <button
                  onClick={() => onDismiss(gap.id)}
                  title="Dismiss"
                  className="shrink-0 mt-0.5 text-ink/30 hover:text-ink transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TimelineSection({ personaId }: { personaId: number }) {
  const [timeline, setTimeline] = useState<TimelinePhase[] | null>(null);
  const [dismissedGaps, setDismissedGaps] = useState<string[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kbDoc, setKbDoc] = useState<string | null>(null);

  const storageKey = `timeline-phase-${personaId}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    fetch(`/api/personas/${personaId}/timeline`)
      .then((r) => r.json())
      .then((data) => {
        if (data.timeline_data) {
          try {
            const phases = JSON.parse(data.timeline_data);
            setTimeline(phases);
            const restore = saved ?? phases[0]?.phase ?? null;
            setSelectedPhase(restore);
          } catch { /* ignore */ }
        }
        setDismissedGaps(data.timeline_gaps ?? []);
      })
      .catch(() => { /* silently fail */ })
      .finally(() => setLoading(false));
  }, [personaId, storageKey]);

  useEffect(() => {
    if (selectedPhase) localStorage.setItem(storageKey, selectedPhase);
  }, [selectedPhase, storageKey]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/personas/${personaId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      const phases: TimelinePhase[] = JSON.parse(data.timeline_data);
      setTimeline(phases);
      setSelectedPhase((prev) => prev ?? phases[0]?.phase ?? null);
    } catch (e) {
      console.error("[timeline]", e);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDismiss(gapId: string) {
    setDismissedGaps((prev) => [...prev, gapId]);
    await fetch(`/api/personas/${personaId}/timeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss-gap", gapId }),
    });
  }

  function togglePhase(phase: string) {
    setSelectedPhase((prev) => (prev === phase ? null : phase));
  }

  if (loading) return null;

  const currentPhase = timeline?.find((p) => p.phase === selectedPhase);

  return (
    <div className="bg-parchment border border-parchment-dark rounded-md p-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide">
          Communication Timeline
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-hunter text-cream hover:bg-hunter/90 transition-colors disabled:opacity-40"
        >
          {generating ? "Generating…" : timeline ? "Regenerate" : "Generate timeline"}
        </button>
      </div>

      {timeline ? (
        <>
          {/* Phase card row */}
          <div className="grid grid-cols-5 gap-2">
            {timeline.map((ph) => {
              const meta = PHASE_META[ph.phase] ?? { label: ph.phase, color: "#888" };
              const isSelected = selectedPhase === ph.phase;
              const uniqueTypes = [...new Set(ph.events.map((e) => e.type))] as EventType[];
              const activeGapCount = ph.gaps.filter((g) => !dismissedGaps.includes(g.id)).length;

              return (
                <button
                  key={ph.phase}
                  onClick={() => togglePhase(ph.phase)}
                  style={{ borderLeftColor: meta.color }}
                  className={`text-left rounded border-l-2 transition-all p-3 ${
                    isSelected
                      ? "bg-cream border-t border-r border-b border-cream-dark shadow-sm"
                      : "bg-white border-t border-r border-b border-parchment-dark hover:border-ink/15"
                  }`}
                >
                  <p
                    className="text-2xs font-semibold uppercase tracking-wide mb-1.5 leading-tight"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </p>
                  <p className="text-xs italic text-ink/55 leading-snug line-clamp-2 mb-2">
                    {ph.mindset}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {uniqueTypes.map((t) => (
                      <span
                        key={t}
                        className={`inline-flex items-center gap-0.5 text-2xs px-1.5 py-0.5 rounded-full font-medium ${TYPE_CLS[t]}`}
                      >
                        <Icon type={t} size={9} />
                        {TYPE_LABEL[t]}
                      </span>
                    ))}
                  </div>
                  {activeGapCount > 0 && (
                    <span className="inline-flex text-2xs font-medium px-1.5 py-0.5 rounded-full bg-rose-muted text-rose">
                      {activeGapCount} gap{activeGapCount > 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          {currentPhase && (
            <PhaseDetail
              phase={currentPhase}
              meta={PHASE_META[currentPhase.phase] ?? { label: currentPhase.phase, color: "#888" }}
              dismissedGaps={dismissedGaps}
              onDismiss={handleDismiss}
              onKBLink={setKbDoc}
            />
          )}
        </>
      ) : (
        <p className="text-sm text-ink/40 italic">
          Generate a communication timeline to see how to reach this persona across each phase of the rebrand.
        </p>
      )}

      {kbDoc && <KBSidePanel title={kbDoc} onClose={() => setKbDoc(null)} />}
    </div>
  );
}
