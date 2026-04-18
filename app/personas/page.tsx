"use client";

import { useState } from "react";
import Link from "next/link";
import { personas, type Persona } from "@/src/data/personas";

const GRADE_BANDS = ["K–5", "6–8", "9–12"] as const;
const RELATIONSHIP_STATUSES = ["Legacy", "Active", "Preparing", "Prospective", "Churned"] as const;

const gradeBandColors: Record<Persona["gradeBand"], string> = {
  "K–5":  "bg-hunter-muted text-hunter",
  "6–8":  "bg-ochre-muted text-ochre",
  "9–12": "bg-slate-muted text-slate",
};

const statusColors: Record<Persona["relationshipStatus"], string> = {
  Legacy:      "bg-parchment text-parchment-text",
  Active:      "bg-hunter-muted text-hunter",
  Preparing:   "bg-ochre-muted text-ochre",
  Prospective: "bg-slate-muted text-slate",
  Churned:     "bg-rose-muted text-rose",
};

const motivationColors: Record<Persona["motivationSpectrum"], string> = {
  "Early adopter": "bg-hunter-muted text-hunter",
  "Voluntold":     "bg-rose-muted text-rose",
  "Middle":        "bg-cream-dark text-cream-text",
};

const avatarBgs = [
  "bg-hunter", "bg-ochre", "bg-rose", "bg-slate",
  "bg-hunter-mid", "bg-ochre-mid",
];

export default function PersonasPage() {
  const [gradeBand, setGradeBand] = useState<string>("all");
  const [status, setStatus]       = useState<string>("all");

  const filtered = personas.filter((p) => {
    if (gradeBand !== "all" && p.gradeBand !== gradeBand) return false;
    if (status !== "all" && p.relationshipStatus !== status) return false;
    return true;
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">Teacher Personas</h1>
        <p className="text-sm text-ink/50 mt-1">
          {filtered.length} of {personas.length} personas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex flex-col gap-1.5">
          <label className="text-2xs font-semibold text-ink/50 uppercase tracking-wide">
            Grade Band
          </label>
          <div className="flex gap-2">
            <FilterChip active={gradeBand === "all"} onClick={() => setGradeBand("all")}>All</FilterChip>
            {GRADE_BANDS.map((g) => (
              <FilterChip key={g} active={gradeBand === g} onClick={() => setGradeBand(g)}>{g}</FilterChip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-2xs font-semibold text-ink/50 uppercase tracking-wide">
            Relationship Status
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={status === "all"} onClick={() => setStatus("all")}>All</FilterChip>
            {RELATIONSHIP_STATUSES.map((s) => (
              <FilterChip key={s} active={status === s} onClick={() => setStatus(s)}>{s}</FilterChip>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-ink/40 italic">No personas match the selected filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <Link key={p.id} href={`/personas/${p.id}`} className="group block">
              <div className="bg-parchment border border-parchment-dark rounded-md p-5 h-full hover:border-hunter transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center text-cream font-semibold text-sm shrink-0 ${avatarBgs[i % avatarBgs.length]}`}>
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-sans font-semibold tracking-tight text-sm text-ink leading-tight group-hover:text-hunter transition-colors truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-ink/50 mt-0.5 truncate">{p.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Pill cls={gradeBandColors[p.gradeBand]}>{p.gradeBand}</Pill>
                  <Pill cls={statusColors[p.relationshipStatus]}>{p.relationshipStatus}</Pill>
                  <Pill cls={motivationColors[p.motivationSpectrum]}>{p.motivationSpectrum}</Pill>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? "bg-hunter text-cream"
          : "bg-parchment border border-parchment-dark text-ink/70 hover:border-hunter hover:text-hunter"
      }`}
    >
      {children}
    </button>
  );
}

function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {children}
    </span>
  );
}
