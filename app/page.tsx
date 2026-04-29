import Link from "next/link";
import { getAllPersonas } from "@/lib/db";
import AskCard from "./AskCard";
import type { PersonaRow } from "@/lib/db";

// ── Campaign phases ───────────────────────────────────────────────────────────

const PHASES = [
  {
    key: "before_launch",
    label: "Before launch",
    dates: "Apr 20–May 16",
    dot: "#534AB7",
    end: new Date("2026-05-16T23:59:59"),
    start: new Date("2026-04-20"),
  },
  {
    key: "launch",
    label: "Launch",
    dates: "May 17",
    dot: "#0F6E56",
    end: new Date("2026-05-17T23:59:59"),
    start: new Date("2026-05-17"),
  },
  {
    key: "summer",
    label: "Summer",
    dates: "Jun–Jul",
    dot: "#854F0B",
    end: new Date("2026-07-31T23:59:59"),
    start: new Date("2026-06-01"),
  },
  {
    key: "end_of_summer",
    label: "End of summer",
    dates: "Aug",
    dot: "#D85A30",
    end: new Date("2026-08-31T23:59:59"),
    start: new Date("2026-08-01"),
  },
  {
    key: "back_to_school",
    label: "Back to school",
    dates: "Aug–Sep",
    dot: "#185FA5",
    end: new Date("2026-09-30T23:59:59"),
    start: new Date("2026-09-01"),
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatSynced(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-semibold text-ink/40 mb-4 tracking-widest"
      style={{ fontVariant: "small-caps" }}
    >
      {children}
    </p>
  );
}

function CampaignPhasesCard({ completedCount }: { completedCount: number }) {
  const now = new Date();
  const progress = Math.round((completedCount / PHASES.length) * 100);

  return (
    <div className="bg-white border border-parchment-dark rounded-lg p-5 flex flex-col">
      <SectionLabel>Campaign phases</SectionLabel>

      <div className="space-y-2.5 flex-1">
        {PHASES.map((phase) => {
          const isPast = phase.end < now;
          const isCurrent = phase.start <= now && phase.end >= now;
          const isFuture = phase.start > now;
          const opacity = isFuture ? "opacity-50" : "opacity-100";

          return (
            <Link
              key={phase.key}
              href="/timeline"
              className={`flex items-center gap-2.5 group rounded px-1 py-1 -mx-1 hover:bg-parchment transition-colors ${opacity}`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: phase.dot }}
              />
              <span className="text-[13px] text-ink flex-1 group-hover:text-hunter transition-colors">
                {phase.label}
              </span>
              <span className={`text-[11px] ${isCurrent ? "text-hunter font-medium" : "text-ink/40"}`}>
                {isCurrent ? "Now · " : ""}{phase.dates}
              </span>
              {isPast && (
                <span className="text-[10px] text-ink/30">✓</span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-parchment-dark">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-ink/40">{completedCount} of {PHASES.length} phases complete</span>
        </div>
        <div className="h-1 w-full bg-parchment rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.max(progress, completedCount === 0 ? 4 : 0)}%`, backgroundColor: "#2D4739" }}
          />
        </div>
      </div>
    </div>
  );
}

const MAX_SHOWN = 11;

function PersonaAvatar({ name }: { name: string }) {
  return (
    <div
      className="flex items-center justify-center rounded shrink-0 text-white"
      style={{ width: 32, height: 32, backgroundColor: "#2D4739", fontSize: 11, fontWeight: 600 }}
    >
      {initials(name)}
    </div>
  );
}

function PersonaCard({ persona }: { persona: PersonaRow }) {
  return (
    <Link
      href={`/personas/${persona.persona_id}`}
      className="bg-white border border-parchment-dark rounded-lg p-3 flex flex-col gap-1.5 hover:shadow-md transition-shadow cursor-pointer"
      style={{ borderRadius: 8 }}
    >
      <div className="flex items-center gap-2">
        <PersonaAvatar name={persona.name ?? "?"} />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink leading-tight truncate">{persona.name}</p>
          <p className="text-[11px] text-ink/45 leading-tight truncate">{persona.role}</p>
        </div>
      </div>
      {persona.motivation && (
        <span className="self-start text-[10px] px-2 py-0.5 rounded-full bg-parchment border border-parchment-dark text-parchment-text leading-tight">
          {persona.motivation}
        </span>
      )}
    </Link>
  );
}

function OverflowCard({ count }: { count: number }) {
  return (
    <Link
      href="/personas"
      className="bg-parchment border border-parchment-dark rounded-lg p-3 flex items-center justify-center hover:shadow-md transition-shadow"
      style={{ borderRadius: 8, minHeight: 80 }}
    >
      <span className="text-[13px] text-ink/50 font-medium">+{count} more</span>
    </Link>
  );
}

function PersonasCard({ personas }: { personas: PersonaRow[] }) {
  const shown = personas.slice(0, MAX_SHOWN);
  const overflow = personas.length - MAX_SHOWN;

  return (
    <div className="bg-white border border-parchment-dark rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>Personas</SectionLabel>
        <Link
          href="/personas"
          className="text-[11px] text-ink/40 hover:text-hunter transition-colors -mt-4"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {shown.map((p) => (
          <PersonaCard key={p.persona_id} persona={p} />
        ))}
        {overflow > 0 && <OverflowCard count={overflow} />}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function Home() {
  const personas = await getAllPersonas();

  const now = new Date();
  const completedCount = PHASES.filter((p) => p.end < now).length;

  const lastSynced = personas
    .map((p) => p.last_synced)
    .filter((s): s is string => Boolean(s))
    .sort()
    .at(-1);

  return (
    <main className="bg-parchment min-h-screen" style={{ padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1
              className="text-ink leading-tight"
              style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400 }}
            >
              CS Academy Rebrand
            </h1>
            <p className="text-[13px] text-ink/50 mt-1">
              {personas.length} personas · {PHASES.length} campaign phases · Knowledge base connected
            </p>
          </div>
          {lastSynced && (
            <p className="text-[11px] text-ink/35 pb-0.5">
              Last synced: {formatSynced(lastSynced)}
            </p>
          )}
        </div>

        {/* Zone 1: Ask + Campaign phases */}
        <div
          className="mb-4"
          style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}
        >
          <AskCard />
          <CampaignPhasesCard completedCount={completedCount} />
        </div>

        {/* Zone 2: Personas */}
        <PersonasCard personas={personas} />

      </div>
    </main>
  );
}
