"use client";

import { useState, useEffect, useMemo } from "react";
import {
  sortPhases,
  compareTimelines,
  setByPath,
  type TimelinePhase,
  type TimelineEvent,
  type DiffItem,
  type Citation,
} from "@/lib/timeline-diff";
import CitationPill from "./CitationPill";
import KBSidePanel, { type KBPanelCtx } from "./KBSidePanel";

// ── Constants ──────────────────────────────────────────────────────────────────

const PHASE_META: Record<string, { label: string; color: string }> = {
  before_launch:  { label: "Before Launch",  color: "#534AB7" },
  launch:         { label: "Launch",          color: "#0F6E56" },
  summer:         { label: "Summer",          color: "#854F0B" },
  end_of_summer:  { label: "End of Summer",   color: "#D85A30" },
  back_to_school: { label: "Back to School",  color: "#185FA5" },
};

type EventType = "email" | "in_person" | "social" | "doc" | "platform";

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

// ── Icons ──────────────────────────────────────────────────────────────────────

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

// ── DateDisplay ────────────────────────────────────────────────────────────────

function DateDisplay({
  date,
  setKbPanel,
  context,
}: {
  date: TimelineEvent["date"];
  setKbPanel: (ctx: KBPanelCtx) => void;
  context: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
      {date.specific ? (
        <span className="text-2xs font-medium text-ink/70">{date.specific}</span>
      ) : date.citation?.type === "gap" ? (
        <span className="text-2xs italic text-ink/40">Date unknown</span>
      ) : null}
      <span className="text-2xs text-ink/40">{date.relative}</span>
      {date.citation && (
        <CitationPill citation={date.citation} context={`${context} (date)`} onOpen={setKbPanel} />
      )}
    </div>
  );
}

// ── DiffField ──────────────────────────────────────────────────────────────────

function DiffField({
  path,
  value,
  diffs,
  decisions,
  onDecide,
  className = "",
}: {
  path: string;
  value: string | null;
  diffs: DiffItem[];
  decisions: Record<string, "accepted" | "rejected">;
  onDecide: (path: string, d: "accepted" | "rejected") => void;
  className?: string;
}) {
  const diff = diffs.find((d) => d.path === path);
  if (!diff) return <span className={className}>{value ?? ""}</span>;

  const decision = decisions[path];
  const liveVal = (diff.liveValue ?? "") as string;

  if (decision === "accepted") {
    return (
      <span className={`${className} text-hunter`}>
        {value ?? ""}
        <button
          onClick={() => onDecide(path, "accepted")}
          className="ml-2 text-2xs font-medium text-hunter/60 hover:text-hunter underline"
        >
          Undo
        </button>
      </span>
    );
  }

  if (decision === "rejected") {
    return (
      <span className={`${className} text-ink/50`}>
        {liveVal || <em className="text-ink/30">empty</em>}
        <button
          onClick={() => onDecide(path, "rejected")}
          className="ml-2 text-2xs font-medium text-rose/60 hover:text-rose underline"
        >
          Undo
        </button>
      </span>
    );
  }

  return (
    <span className={className}>
      {liveVal && (
        <span className="block line-through opacity-30 text-xs mb-0.5">{liveVal}</span>
      )}
      <span>{value ?? ""}</span>
      <span className="inline-flex gap-1 ml-2">
        <button
          onClick={() => onDecide(path, "accepted")}
          className="text-2xs px-1.5 py-0.5 bg-hunter-muted text-hunter rounded font-medium hover:bg-hunter/20 transition-colors"
        >
          ✓
        </button>
        <button
          onClick={() => onDecide(path, "rejected")}
          className="text-2xs px-1.5 py-0.5 bg-rose-muted text-rose rounded font-medium hover:bg-rose/20 transition-colors"
        >
          ✗
        </button>
      </span>
    </span>
  );
}

// ── PhaseDetail ────────────────────────────────────────────────────────────────

function PhaseDetail({
  phaseIndex,
  phase,
  livePhase,
  meta,
  dismissedGaps,
  onDismiss,
  setKbPanel,
  diffs,
  decisions,
  onDecide,
  isEditMode,
  onFieldChange,
}: {
  phaseIndex: number;
  phase: TimelinePhase;
  livePhase: TimelinePhase | undefined;
  meta: { label: string; color: string };
  dismissedGaps: string[];
  onDismiss: (id: string) => void;
  setKbPanel: (ctx: KBPanelCtx) => void;
  diffs: DiffItem[];
  decisions: Record<string, "accepted" | "rejected">;
  onDecide: (path: string, d: "accepted" | "rejected") => void;
  isEditMode: boolean;
  onFieldChange: (path: string, value: string) => void;
}) {
  const prefix = `phases[${phaseIndex}]`;
  const isReview = diffs.length > 0;

  function EditableField({
    path,
    value,
    multiline,
    className,
  }: {
    path: string;
    value: string | null;
    multiline?: boolean;
    className?: string;
  }) {
    const base = `border border-parchment-dark rounded px-2 py-1 bg-white focus:outline-none focus:border-hunter/50 w-full ${className ?? ""}`;
    if (multiline) {
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onFieldChange(path, e.target.value)}
          className={`${base} resize-y`}
          rows={2}
        />
      );
    }
    return (
      <input
        value={value ?? ""}
        onChange={(e) => onFieldChange(path, e.target.value)}
        className={base}
      />
    );
  }

  // Safe mindset text accessor (handles old string format in live data)
  const mindsetText =
    typeof phase.mindset === "string"
      ? (phase.mindset as string)
      : phase.mindset?.text ?? "";
  const mindsetCitation =
    typeof phase.mindset === "string" ? null : phase.mindset?.citation ?? null;

  // Gap categorization when in review mode
  const liveGapIds = new Set(livePhase?.gaps?.map((g) => g.id) ?? []);
  const draftGapIds = new Set(phase.gaps?.map((g) => g.id) ?? []);
  const resolvedGaps = isReview
    ? (livePhase?.gaps ?? []).filter((g) => !draftGapIds.has(g.id) && !dismissedGaps.includes(g.id))
    : [];
  const activeGaps = (phase.gaps ?? []).filter((g) => !dismissedGaps.includes(g.id));

  return (
    <div className="mt-3 rounded-md bg-cream border border-cream-dark p-5">
      {/* Mindset */}
      <div className="flex gap-3 mb-5">
        <div className="w-1 shrink-0 rounded-full self-stretch" style={{ backgroundColor: meta.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-2xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: meta.color }}>
            {meta.label}
          </p>

          {/* Date range */}
          {phase.date_range && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {phase.date_range.start && (
                <span className="text-2xs text-ink/60">
                  {phase.date_range.start}
                  {phase.date_range.end ? ` – ${phase.date_range.end}` : ""}
                </span>
              )}
              <span className="text-2xs text-ink/40 italic">{phase.date_range.relative}</span>
              {phase.date_range.citation && (
                <CitationPill
                  citation={phase.date_range.citation}
                  context={`${meta.label} dates`}
                  onOpen={setKbPanel}
                />
              )}
            </div>
          )}

          {/* Mindset quote */}
          <div className="flex flex-wrap items-start gap-2">
            {isEditMode ? (
              <EditableField
                path={`${prefix}.mindset.text`}
                value={mindsetText}
                multiline
                className="text-sm italic text-ink/70"
              />
            ) : (
              <p className="text-sm italic text-ink/70 leading-relaxed flex-1">
                {isReview ? (
                  <DiffField
                    path={`${prefix}.mindset.text`}
                    value={mindsetText}
                    diffs={diffs}
                    decisions={decisions}
                    onDecide={onDecide}
                    className="italic"
                  />
                ) : (
                  mindsetText
                )}
              </p>
            )}
            {mindsetCitation && !isReview && !isEditMode && (
              <CitationPill citation={mindsetCitation} context="mindset" onOpen={setKbPanel} />
            )}
          </div>
        </div>
      </div>

      {/* Events */}
      {(phase.events ?? []).length > 0 && (
        <div className="space-y-2 mb-4">
          {(phase.events ?? []).map((ev, ei) => {
            const ep = `${prefix}.events[${ei}]`;
            const kbRef = ev.kb_reference;
            const kbCitation: Citation | null =
              kbRef?.title && kbRef.citation_type
                ? { type: kbRef.citation_type, source: kbRef.title, note: null }
                : null;

            return (
              <div key={ev.id} className="flex gap-3 p-3 bg-white rounded border border-parchment-dark">
                <span className="mt-0.5 text-ink/40 shrink-0">
                  <Icon type={ev.type as EventType} size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex flex-wrap items-start gap-1.5 mb-1">
                    <span className="text-sm font-medium text-ink flex-1">
                      {isEditMode ? (
                        <EditableField path={`${ep}.title`} value={ev.title} className="text-sm font-medium" />
                      ) : isReview ? (
                        <DiffField
                          path={`${ep}.title`}
                          value={ev.title}
                          diffs={diffs}
                          decisions={decisions}
                          onDecide={onDecide}
                          className="font-medium"
                        />
                      ) : (
                        ev.title
                      )}
                    </span>
                    <span
                      className={`text-2xs px-1.5 py-0.5 rounded-full font-medium ${
                        ev.control === "in"
                          ? "bg-hunter-muted text-hunter"
                          : "bg-rose-muted text-rose"
                      }`}
                    >
                      {ev.control === "in" ? "In our control" : "Out of our control"}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 text-2xs px-1.5 py-0.5 rounded-full font-medium ${TYPE_CLS[ev.type as EventType] ?? ""}`}>
                      <Icon type={ev.type as EventType} size={9} />
                      {TYPE_LABEL[ev.type as EventType] ?? ev.type}
                    </span>
                    {kbRef?.title && kbCitation && (
                      <CitationPill
                        citation={kbCitation}
                        context={ev.title}
                        onOpen={setKbPanel}
                      />
                    )}
                  </div>

                  {/* Date */}
                  {ev.date && (
                    <DateDisplay date={ev.date} setKbPanel={setKbPanel} context={ev.title} />
                  )}

                  {/* Description */}
                  <div className="text-xs text-ink/60 leading-relaxed mt-1.5">
                    {isEditMode ? (
                      <EditableField path={`${ep}.description`} value={ev.description} multiline className="text-xs" />
                    ) : isReview ? (
                      <DiffField
                        path={`${ep}.description`}
                        value={ev.description}
                        diffs={diffs}
                        decisions={decisions}
                        onDecide={onDecide}
                      />
                    ) : (
                      ev.description
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gaps */}
      {(activeGaps.length > 0 || resolvedGaps.length > 0) && (
        <div>
          <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide mb-2">
            Content Gaps
          </p>
          <div className="space-y-2">
            {/* Gaps that may now be resolved (in live but not draft) */}
            {resolvedGaps.map((gap) => (
              <div
                key={gap.id}
                className="flex gap-3 p-3 bg-hunter-muted rounded border border-hunter-light opacity-60"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-2xs font-semibold text-hunter mb-0.5 uppercase tracking-wide">
                    Gap may be resolved
                  </p>
                  <p className="text-sm font-medium text-ink line-through mb-0.5">{gap.title}</p>
                  <p className="text-xs text-ink/60 leading-relaxed line-through">{gap.description}</p>
                </div>
              </div>
            ))}

            {/* Active gaps */}
            {activeGaps.map((gap) => {
              const isNew = isReview && !liveGapIds.has(gap.id);
              const gi = (phase.gaps ?? []).findIndex((g) => g.id === gap.id);
              const gp = `${prefix}.gaps[${gi}]`;

              return (
                <div
                  key={gap.id}
                  className={`flex gap-3 p-3 rounded border ${
                    isNew
                      ? "bg-ochre-muted border-ochre-light"
                      : "bg-rose-muted border-rose-light"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {isNew && (
                      <p className="text-2xs font-semibold text-ochre mb-0.5 uppercase tracking-wide">
                        New gap identified
                      </p>
                    )}
                    <div className="text-sm font-medium text-ink mb-0.5">
                      {isEditMode && gi >= 0 ? (
                        <EditableField path={`${gp}.title`} value={gap.title} className="text-sm font-medium" />
                      ) : isReview && gi >= 0 ? (
                        <DiffField
                          path={`${gp}.title`}
                          value={gap.title}
                          diffs={diffs}
                          decisions={decisions}
                          onDecide={onDecide}
                          className="font-medium"
                        />
                      ) : (
                        gap.title
                      )}
                    </div>
                    <div className="text-xs text-ink/60 leading-relaxed">
                      {isEditMode && gi >= 0 ? (
                        <EditableField path={`${gp}.description`} value={gap.description} multiline className="text-xs" />
                      ) : isReview && gi >= 0 ? (
                        <DiffField
                          path={`${gp}.description`}
                          value={gap.description}
                          diffs={diffs}
                          decisions={decisions}
                          onDecide={onDecide}
                        />
                      ) : (
                        gap.description
                      )}
                    </div>
                    {gap.impact && (
                      <p className="text-xs text-ink/50 italic mt-1 leading-relaxed">
                        Impact: {gap.impact}
                      </p>
                    )}
                  </div>
                  {!isNew && (
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TimelineSection({ personaId }: { personaId: number }) {
  const [liveTimeline, setLiveTimeline] = useState<TimelinePhase[] | null>(null);
  const [draftTimeline, setDraftTimeline] = useState<TimelinePhase[] | null>(null);
  const [draftCreatedAt, setDraftCreatedAt] = useState<string | null>(null);
  const [dismissedGaps, setDismissedGaps] = useState<string[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kbPanel, setKbPanel] = useState<KBPanelCtx | null>(null);
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "rejected">>({});
  const [committing, setCommitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTimeline, setEditedTimeline] = useState<TimelinePhase[] | null>(null);
  const [saving, setSaving] = useState(false);

  const phaseKey = `timeline-phase-${personaId}`;
  const reviewKey = `timeline-review-${personaId}`;

  // ── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const savedPhase = localStorage.getItem(phaseKey);

    fetch(`/api/personas/${personaId}/timeline`)
      .then((r) => r.json())
      .then((data) => {
        let live: TimelinePhase[] | null = null;
        let draft: TimelinePhase[] | null = null;

        if (data.timeline_data) {
          try { const p = JSON.parse(data.timeline_data); if (Array.isArray(p)) live = p; } catch { /* ignore */ }
        }
        if (data.timeline_draft) {
          try { const p = JSON.parse(data.timeline_draft); if (Array.isArray(p)) draft = p; } catch { /* ignore */ }
        }

        setLiveTimeline(live);
        setDraftTimeline(draft);
        setDraftCreatedAt(data.timeline_draft_created_at ?? null);
        setDismissedGaps(data.timeline_gaps ?? []);

        const display = draft ?? live;
        if (display) {
          const sorted = sortPhases(display);
          const restore = savedPhase ?? sorted[0]?.phase ?? null;
          setSelectedPhase(restore);
        }

        // Restore saved decisions if draft timestamp matches
        if (draft && data.timeline_draft_created_at) {
          try {
            const saved = localStorage.getItem(reviewKey);
            if (saved) {
              const { draftTimestamp, decisions: savedDecisions } = JSON.parse(saved);
              if (draftTimestamp === data.timeline_draft_created_at) {
                setDecisions(savedDecisions);
              }
            }
          } catch { /* ignore */ }
        }
      })
      .catch(() => { /* silently fail */ })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personaId]);

  useEffect(() => {
    if (selectedPhase) localStorage.setItem(phaseKey, selectedPhase);
  }, [selectedPhase, phaseKey]);

  useEffect(() => {
    if (!draftCreatedAt) return;
    localStorage.setItem(reviewKey, JSON.stringify({ draftTimestamp: draftCreatedAt, decisions }));
  }, [decisions, draftCreatedAt, reviewKey]);

  // ── Derived state ───────────────────────────────────────────────────────────

  const isReviewMode = !!draftTimeline;
  const sortedLive = useMemo(() => (liveTimeline ? sortPhases(liveTimeline) : []), [liveTimeline]);
  const sortedDraft = useMemo(() => (draftTimeline ? sortPhases(draftTimeline) : []), [draftTimeline]);
  const sortedEdited = useMemo(() => (editedTimeline ? sortPhases(editedTimeline) : []), [editedTimeline]);
  const displayTimeline = isReviewMode ? sortedDraft : isEditMode ? sortedEdited : sortedLive;

  const diffs: DiffItem[] = useMemo(
    () => (draftTimeline ? compareTimelines(liveTimeline ?? [], draftTimeline) : []),
    [liveTimeline, draftTimeline]
  );

  const reviewedCount = diffs.filter((d) => !!decisions[d.path]).length;
  const acceptedPaths = diffs.filter((d) => decisions[d.path] === "accepted").map((d) => d.path);

  // ── Actions ─────────────────────────────────────────────────────────────────

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/personas/${personaId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Generation failed (${res.status}): ${text.slice(0, 200)}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      let draft: TimelinePhase[] | null = null;
      try { draft = JSON.parse(data.timeline_draft); } catch { /* ignore */ }

      setDraftTimeline(draft);
      setDraftCreatedAt(data.timeline_draft_created_at ?? null);
      setDecisions({});
      localStorage.removeItem(reviewKey);

      if (draft) {
        const sorted = sortPhases(draft);
        setSelectedPhase((prev) => prev ?? sorted[0]?.phase ?? null);
      }
    } catch (e) {
      console.error("[timeline]", e);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCommit() {
    setCommitting(true);
    try {
      const res = await fetch(`/api/personas/${personaId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "commit-changes", acceptedPaths }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Commit failed");

      let live: TimelinePhase[] | null = null;
      try { const p = JSON.parse(data.timeline_data); if (Array.isArray(p)) live = p; } catch { /* ignore */ }

      setLiveTimeline(live);
      setDraftTimeline(null);
      setDraftCreatedAt(null);
      setDecisions({});
      localStorage.removeItem(reviewKey);
    } catch (e) {
      console.error("[timeline commit]", e);
    } finally {
      setCommitting(false);
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

  function handleDecide(path: string, decision: "accepted" | "rejected") {
    setDecisions((prev) => {
      if (prev[path] === decision) {
        const { [path]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [path]: decision };
    });
  }

  function handleAcceptAll() {
    const all: Record<string, "accepted" | "rejected"> = {};
    for (const d of diffs) all[d.path] = "accepted";
    setDecisions(all);
  }

  function handleRejectAll() {
    const all: Record<string, "accepted" | "rejected"> = {};
    for (const d of diffs) all[d.path] = "rejected";
    setDecisions(all);
  }

  function togglePhase(phase: string) {
    setSelectedPhase((prev) => (prev === phase ? null : phase));
  }

  function handleStartEdit() {
    if (!liveTimeline) return;
    setEditedTimeline(sortPhases(JSON.parse(JSON.stringify(liveTimeline))));
    setIsEditMode(true);
  }

  function handleCancelEdit() {
    setEditedTimeline(null);
    setIsEditMode(false);
  }

  function handleFieldChange(path: string, value: string) {
    setEditedTimeline((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev)) as TimelinePhase[];
      const wrapper = { phases: copy as unknown };
      setByPath(wrapper as Record<string, unknown>, path, value);
      return wrapper.phases as TimelinePhase[];
    });
  }

  async function handleSave() {
    if (!editedTimeline) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/personas/${personaId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-edits",
          timeline_data: JSON.stringify(editedTimeline),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setLiveTimeline(editedTimeline);
      setEditedTimeline(null);
      setIsEditMode(false);
    } catch (e) {
      console.error("[timeline save]", e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  const currentPhaseIndex = displayTimeline.findIndex((p) => p.phase === selectedPhase);
  const currentPhase = currentPhaseIndex >= 0 ? displayTimeline[currentPhaseIndex] : null;

  return (
    <div className="bg-parchment border border-parchment-dark rounded-md p-6 mb-4">

      {/* Draft notification bar */}
      {isReviewMode && (
        <div className="flex items-center justify-between gap-3 mb-4 px-4 py-2.5 bg-ochre-muted border border-ochre-light rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ochre">Draft ready</span>
            <span className="text-xs text-ink/60">
              {diffs.length} field{diffs.length !== 1 ? "s" : ""} changed · {reviewedCount} of {diffs.length} reviewed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRejectAll}
              className="text-2xs px-2.5 py-1 rounded font-medium text-ink/60 hover:text-ink transition-colors"
            >
              Reject all
            </button>
            <button
              onClick={handleAcceptAll}
              className="text-2xs px-2.5 py-1 rounded font-medium bg-hunter-muted text-hunter hover:bg-hunter/20 transition-colors"
            >
              Accept all
            </button>
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide">
          Communication Timeline
          {isReviewMode && <span className="ml-2 normal-case font-normal text-ochre">· reviewing draft</span>}
          {isEditMode && <span className="ml-2 normal-case font-normal text-hunter">· editing</span>}
        </p>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-parchment-dark text-ink/60 hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-hunter text-cream hover:bg-hunter/90 transition-colors disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </>
          ) : (
            <>
              {isReviewMode && (
                <button
                  onClick={handleCommit}
                  disabled={committing}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-hunter text-cream hover:bg-hunter/90 transition-colors disabled:opacity-40"
                >
                  {committing
                    ? "Committing…"
                    : acceptedPaths.length > 0
                    ? `Commit ${acceptedPaths.length} accepted`
                    : "Commit (no changes)"}
                </button>
              )}
              {!isReviewMode && sortedLive.length > 0 && (
                <button
                  onClick={handleStartEdit}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-parchment-dark text-ink/60 hover:text-ink transition-colors"
                >
                  Edit
                </button>
              )}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-hunter/30 text-hunter hover:bg-hunter-muted transition-colors disabled:opacity-40"
              >
                {generating
                  ? "Reviewing…"
                  : sortedLive.length > 0
                  ? "Regenerate"
                  : "Generate timeline"}
              </button>
            </>
          )}
        </div>
      </div>

      {displayTimeline.length > 0 ? (
        <>
          {/* Phase card row */}
          <div className="grid grid-cols-5 gap-2">
            {displayTimeline.map((ph) => {
              const meta = PHASE_META[ph.phase] ?? { label: ph.phase, color: "#888" };
              const isSelected = selectedPhase === ph.phase;
              const uniqueTypes = [
                ...new Set((ph.events ?? []).map((e) => e.type)),
              ] as EventType[];
              const activeGapCount = (ph.gaps ?? []).filter(
                (g) => !dismissedGaps.includes(g.id)
              ).length;
              const phaseChanges = isReviewMode
                ? diffs.filter(
                    (d) => d.phase === ph.phase && !decisions[d.path]
                  ).length
                : 0;

              const mindsetPreview =
                typeof ph.mindset === "string"
                  ? (ph.mindset as string)
                  : ph.mindset?.text ?? "";

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
                    {mindsetPreview}
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
                  <div className="flex flex-wrap gap-1">
                    {activeGapCount > 0 && (
                      <span className="inline-flex text-2xs font-medium px-1.5 py-0.5 rounded-full bg-rose-muted text-rose">
                        {activeGapCount} gap{activeGapCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {phaseChanges > 0 && (
                      <span className="inline-flex text-2xs font-medium px-1.5 py-0.5 rounded-full bg-ochre-muted text-ochre">
                        {phaseChanges} change{phaseChanges > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          {currentPhase && (
            <PhaseDetail
              phaseIndex={currentPhaseIndex}
              phase={currentPhase}
              livePhase={sortedLive.find((p) => p.phase === currentPhase.phase)}
              meta={PHASE_META[currentPhase.phase] ?? { label: currentPhase.phase, color: "#888" }}
              dismissedGaps={dismissedGaps}
              onDismiss={handleDismiss}
              setKbPanel={setKbPanel}
              diffs={diffs}
              decisions={decisions}
              onDecide={handleDecide}
              isEditMode={isEditMode}
              onFieldChange={handleFieldChange}
            />
          )}
        </>
      ) : (
        <p className="text-sm text-ink/40 italic">
          Generate a communication timeline to see how to reach this persona across each phase of the rebrand.
        </p>
      )}

      {kbPanel && <KBSidePanel ctx={kbPanel} onClose={() => setKbPanel(null)} />}
    </div>
  );
}
