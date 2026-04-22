"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { PersonaRow } from "@/lib/db";

const avatarBgs = [
  "bg-hunter", "bg-ochre", "bg-rose", "bg-slate",
  "bg-hunter-mid", "bg-ochre-mid",
];

function gradeBandColor(band: string | null): string {
  if (!band) return "bg-parchment text-parchment-text";
  if (band.includes("K") || band === "K-5" || band === "K–5") return "bg-hunter-muted text-hunter";
  if (band.includes("6")) return "bg-ochre-muted text-ochre";
  if (band.includes("9")) return "bg-slate-muted text-slate";
  return "bg-parchment text-parchment-text";
}

function relationshipColor(rel: string | null): string {
  if (!rel) return "bg-parchment text-parchment-text";
  const r = rel.toLowerCase();
  if (r.includes("legacy")) return "bg-parchment text-parchment-text";
  if (r.includes("active")) return "bg-hunter-muted text-hunter";
  if (r.includes("prospective")) return "bg-slate-muted text-slate";
  if (r.includes("churned")) return "bg-rose-muted text-rose";
  return "bg-cream-dark text-cream-text";
}

function motivationColor(mot: string | null): string {
  if (!mot) return "bg-parchment text-parchment-text";
  const m = mot.toLowerCase();
  if (m.includes("early") || m.includes("deep")) return "bg-hunter-muted text-hunter";
  if (m.includes("voluntold")) return "bg-rose-muted text-rose";
  if (m.includes("mission")) return "bg-ochre-muted text-ochre";
  return "bg-cream-dark text-cream-text";
}

export default function PersonasGallery({ personas }: { personas: PersonaRow[] }) {
  const [gradeBand, setGradeBand] = useState("all");
  const [relationship, setRelationship] = useState("all");

  const gradeBands = useMemo(
    () => Array.from(new Set(personas.map((p) => p.grade_band).filter(Boolean))).sort(),
    [personas]
  );
  const relationships = useMemo(
    () => Array.from(new Set(personas.map((p) => p.relationship).filter(Boolean))).sort(),
    [personas]
  );

  const filtered = personas.filter((p) => {
    if (gradeBand !== "all" && p.grade_band !== gradeBand) return false;
    if (relationship !== "all" && p.relationship !== relationship) return false;
    return true;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-8">
        <FilterGroup label="Grade Band">
          <FilterChip active={gradeBand === "all"} onClick={() => setGradeBand("all")}>All</FilterChip>
          {gradeBands.map((g) => (
            <FilterChip key={g!} active={gradeBand === g} onClick={() => setGradeBand(g!)}>
              {g}
            </FilterChip>
          ))}
        </FilterGroup>
        <FilterGroup label="Relationship">
          <FilterChip active={relationship === "all"} onClick={() => setRelationship("all")}>All</FilterChip>
          {relationships.map((r) => (
            <FilterChip key={r!} active={relationship === r} onClick={() => setRelationship(r!)}>
              {r}
            </FilterChip>
          ))}
        </FilterGroup>
      </div>

      <p className="text-sm text-ink/50 mb-4">
        {filtered.length} of {personas.length} personas
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink/40 italic">No personas match the selected filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => {
            const initials = (p.name ?? "?")
              .split(" ")
              .filter((_, idx, a) => idx === 0 || idx === a.length - 1)
              .map((w) => w[0])
              .join("")
              .toUpperCase();
            return (
              <Link key={p.persona_id} href={`/personas/${p.persona_id}`} className="group block">
                <div className="bg-parchment border border-parchment-dark rounded-md p-5 h-full hover:border-hunter transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-md flex items-center justify-center text-cream font-semibold text-sm shrink-0 ${avatarBgs[i % avatarBgs.length]}`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans font-semibold tracking-tight text-sm text-ink leading-tight group-hover:text-hunter transition-colors truncate">
                        {p.name}
                      </p>
                      {p.role && <p className="text-xs text-ink/50 mt-0.5 truncate">{p.role}</p>}
                    </div>
                  </div>
                  {p.quote && (
                    <p className="text-xs text-ink/50 italic mb-3 line-clamp-2">"{p.quote}"</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {p.grade_band && <Pill cls={gradeBandColor(p.grade_band)}>{p.grade_band}</Pill>}
                    {p.relationship && <Pill cls={relationshipColor(p.relationship)}>{p.relationship}</Pill>}
                    {p.motivation && <Pill cls={motivationColor(p.motivation)}>{p.motivation}</Pill>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-2xs font-semibold text-ink/50 uppercase tracking-wide">{label}</label>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
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
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{children}</span>
  );
}
