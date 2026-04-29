"use client";

import type {
  PersonaTimelineData,
  TimelineTouchpoint,
  EmotionalState,
} from "@/lib/timeline-types";

// ── Phase metadata ─────────────────────────────────────────────────────────────

const PHASES = [
  {
    key: "pre-launch" as const,
    label: "Pre-launch",
    dates: "Apr 20–May 16",
    headerBg: "bg-slate-muted",
    headerBorder: "border-b-2 border-slate-light",
    textCls: "text-slate",
  },
  {
    key: "launch" as const,
    label: "Launch",
    dates: "May 17",
    headerBg: "bg-hunter-muted",
    headerBorder: "border-b-2 border-hunter-light",
    textCls: "text-hunter",
  },
  {
    key: "day-two" as const,
    label: "Day 2",
    dates: "May 18",
    headerBg: "bg-cream",
    headerBorder: "border-b-2 border-cream-dark",
    textCls: "text-cream-text",
  },
  {
    key: "post-launch" as const,
    label: "Post-launch",
    dates: "May 19–31",
    headerBg: "bg-ochre-muted",
    headerBorder: "border-b-2 border-ochre-light",
    textCls: "text-ochre",
  },
  {
    key: "summer" as const,
    label: "Summer",
    dates: "June+",
    headerBg: "bg-parchment",
    headerBorder: "border-b-2 border-parchment-dark",
    textCls: "text-parchment-text",
  },
  {
    key: "back-to-school" as const,
    label: "Back to school",
    dates: "Aug–Sep",
    headerBg: "bg-rose-muted",
    headerBorder: "border-b-2 border-rose-light",
    textCls: "text-rose",
  },
] as const;

// ── Channel rows (gap-channel touchpoints are not mapped to a row) ─────────────

const CHANNELS = [
  { key: "email" as const, label: "Email" },
  { key: "social" as const, label: "Social" },
  { key: "in-product" as const, label: "In-product" },
  { key: "in-person" as const, label: "In-person" },
] as const;

// ── Cell variant styles ────────────────────────────────────────────────────────

const VARIANT_CELL: Record<string, string> = {
  risk: "bg-rose-muted border border-rose-light hover:border-rose hover:shadow-sm",
  win: "bg-hunter-muted border border-hunter-light hover:border-hunter hover:shadow-sm",
  neutral: "bg-white border border-slate-light hover:border-slate hover:shadow-sm",
  gap: "bg-slate-muted border border-dashed border-slate-light hover:border-slate",
  miss: "bg-ochre-muted border border-dashed border-ochre-light hover:border-ochre",
};

const VARIANT_TITLE_CLS: Record<string, string> = {
  risk: "text-rose",
  win: "text-hunter",
  neutral: "text-ink",
  gap: "text-slate italic",
  miss: "text-ochre italic",
};

// ── Emotional arc dot colours ──────────────────────────────────────────────────

const ARC_DOT: Record<EmotionalState, string> = {
  positive: "bg-hunter-mid ring-2 ring-hunter-light",
  neutral: "bg-slate-mid ring-2 ring-slate-light",
  warning: "bg-ochre-mid ring-2 ring-ochre-light",
  negative: "bg-rose-mid ring-2 ring-rose-light",
};

// ── Legend items ───────────────────────────────────────────────────────────────

const LEGEND_ITEMS = [
  { label: "Risk", cls: "bg-rose-muted border border-rose-light" },
  { label: "Works", cls: "bg-hunter-muted border border-hunter-light" },
  { label: "Neutral", cls: "bg-white border border-slate-light" },
  { label: "Gap in plan", cls: "bg-slate-muted border border-dashed border-slate-light" },
  { label: "Missing", cls: "bg-ochre-muted border border-dashed border-ochre-light" },
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={spinning ? "animate-spin" : ""}
      aria-hidden
    >
      <path
        d="M10.5 4.5A4.5 4.5 0 1 0 9 9.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M10.5 1.5v3h-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className="shrink-0 text-ink/25"
      aria-hidden
    >
      <path
        d="M1 1.5A.5.5 0 0 1 1.5 1h7a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H4L1 9V1.5Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── TouchpointCell ─────────────────────────────────────────────────────────────

function TouchpointCell({
  touchpoint,
  onClick,
}: {
  touchpoint: TimelineTouchpoint;
  onClick: (t: TimelineTouchpoint) => void;
}) {
  const cellCls = VARIANT_CELL[touchpoint.variant] ?? VARIANT_CELL.neutral;
  const titleCls = VARIANT_TITLE_CLS[touchpoint.variant] ?? "text-ink";

  return (
    <button
      onClick={() => onClick(touchpoint)}
      className={`relative w-full text-left rounded-lg p-3 min-h-[76px] cursor-pointer transition-all ${cellCls}`}
    >
      <p className="text-[10px] text-ink/35 mb-1 leading-none tabular-nums">{touchpoint.date}</p>
      <p className={`text-[11px] font-semibold leading-tight mb-1 ${titleCls}`}>
        {touchpoint.title}
      </p>
      <p className="text-[10px] text-ink/45 leading-tight line-clamp-2 pr-3">
        {touchpoint.subtitle}
      </p>
      <span className="absolute bottom-2 right-2">
        <ChatBubbleIcon />
      </span>
    </button>
  );
}

function EmptyCell() {
  return <div className="min-h-[76px] rounded-lg bg-slate-50/40" />;
}

// ── Row label ──────────────────────────────────────────────────────────────────

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start pt-2.5 pr-3" style={{ width: 80, minWidth: 80 }}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
        {children}
      </span>
    </div>
  );
}

// ── JourneyMap ─────────────────────────────────────────────────────────────────

export interface JourneyMapProps {
  timeline: PersonaTimelineData;
  personaId: string;
  isSyncing: boolean;
  onSyncRequest: () => void;
  onTouchpointClick: (touchpoint: TimelineTouchpoint) => void;
}

export default function JourneyMap({
  timeline,
  personaId: _personaId,
  isSyncing,
  onSyncRequest,
  onTouchpointClick,
}: JourneyMapProps) {
  // phase:channel → touchpoint lookup (gap-channel excluded from rows)
  const grid = new Map<string, TimelineTouchpoint>();
  for (const t of timeline.touchpoints) {
    if (t.channel !== "gap") {
      grid.set(`${t.phase}:${t.channel}`, t);
    }
  }

  const gridTemplate = "80px repeat(6, minmax(0, 1fr))";

  return (
    <div className="bg-white border border-slate-light rounded-2xl shadow-sm mt-8 mb-8 overflow-hidden">

      {/* Phase-colour gradient accent strip */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            "linear-gradient(to right, #384457 0%, #2D4739 20%, #3D6B52 40%, #C8860A 60%, #E09A20 80%, #C4394A 100%)",
        }}
      />

      {/* ── 1. Header bar ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Persona view
          </p>
          <p className="text-base font-semibold text-ink leading-tight">Comms journey</p>
        </div>
        <div className="flex items-center gap-3 pt-1">
          {timeline.lastSynced && (
            <span className="text-[11px] text-slate-400">
              Synced {relativeTime(timeline.lastSynced)}
            </span>
          )}
          <button
            onClick={onSyncRequest}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-hunter/30 text-hunter hover:bg-hunter-muted transition-colors disabled:opacity-40"
          >
            <RefreshIcon spinning={isSyncing} />
            {isSyncing ? "Syncing…" : "Sync from KB"}
          </button>
        </div>
      </div>

      {/* ── Matrix (scrollable) ─────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-2">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 840 }}>

            {/* ── 2. Phase column headers ───────────────────────────────────── */}
            <div
              className="grid gap-x-2 mb-3"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div style={{ width: 80 }} />
              {PHASES.map((ph) => (
                <div
                  key={ph.key}
                  className={`rounded-lg px-2.5 py-2 ${ph.headerBg} ${ph.headerBorder}`}
                >
                  <p className={`text-2xs font-bold uppercase tracking-wide leading-tight ${ph.textCls}`}>
                    {ph.label}
                  </p>
                  <p className="text-[10px] text-ink/40 mt-0.5">{ph.dates}</p>
                </div>
              ))}
            </div>

            {/* ── 3. Channel rows ───────────────────────────────────────────── */}
            <div className="space-y-2 mb-3">
              {CHANNELS.map((ch) => (
                <div
                  key={ch.key}
                  className="grid gap-x-2 items-start"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  <RowLabel>{ch.label}</RowLabel>
                  {PHASES.map((ph) => {
                    const touchpoint = grid.get(`${ph.key}:${ch.key}`);
                    return (
                      <div key={ph.key}>
                        {touchpoint ? (
                          <TouchpointCell
                            touchpoint={touchpoint}
                            onClick={onTouchpointClick}
                          />
                        ) : (
                          <EmptyCell />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* ── 4. Emotional arc row ──────────────────────────────────────── */}
            <div
              className="grid gap-x-2 items-start mt-4 pt-3 border-t border-slate-100"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <RowLabel>Emotional arc</RowLabel>
              {PHASES.map((ph) => {
                const entry = timeline.emotionalArc.find((e) => e.phase === ph.key);
                if (!entry) return <div key={ph.key} className="min-h-[48px]" />;
                const dotCls = ARC_DOT[entry.state as EmotionalState] ?? "bg-slate-400 ring-2 ring-slate-200";
                return (
                  <div key={ph.key} className="flex flex-col items-center gap-1.5 py-2">
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${dotCls}`} />
                    <span className="text-[10px] text-slate-500 text-center leading-tight">
                      {entry.label}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* ── 5. Gaps + Wins ──────────────────────────────────────────────────── */}
      <div className="px-6 pt-4 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-rose-muted border border-rose-light rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose mb-3">
            Gaps in plan
          </p>
          {timeline.gaps.length > 0 ? (
            <ul className="space-y-2.5">
              {timeline.gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
                  <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-rose shrink-0" />
                  {gap}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/40 italic">No gaps identified.</p>
          )}
        </div>

        <div className="bg-hunter-muted border border-hunter-light rounded-xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-hunter mb-3">
            Works for this persona
          </p>
          {timeline.wins.length > 0 ? (
            <ul className="space-y-2.5">
              {timeline.wins.map((win, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
                  <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-hunter shrink-0" />
                  {win}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/40 italic">No wins identified yet.</p>
          )}
        </div>
      </div>

      {/* ── 6. Legend ───────────────────────────────────────────────────────── */}
      <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">
          Legend
        </span>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={`w-3.5 h-3 rounded shrink-0 ${item.cls}`} />
            <span className="text-[11px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
