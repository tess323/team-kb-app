"use client";

import { useState } from "react";
import Link from "next/link";
import { personas, type Persona } from "@/src/data/personas";

const GRADE_BANDS = ["K–5", "6–8", "9–12"] as const;
const RELATIONSHIP_STATUSES = ["Legacy", "Active", "Preparing", "Prospective", "Churned"] as const;

const gradeBandColors: Record<Persona["gradeBand"], string> = {
  "K–5":  "bg-sky-100 text-sky-800",
  "6–8":  "bg-violet-100 text-violet-800",
  "9–12": "bg-indigo-100 text-indigo-800",
};

const statusColors: Record<Persona["relationshipStatus"], string> = {
  Legacy:     "bg-amber-100 text-amber-800",
  Active:     "bg-green-100 text-green-800",
  Preparing:  "bg-orange-100 text-orange-800",
  Prospective:"bg-blue-100 text-blue-800",
  Churned:    "bg-red-100 text-red-800",
};

const motivationColors: Record<Persona["motivationSpectrum"], string> = {
  "Early adopter": "bg-emerald-100 text-emerald-800",
  "Voluntold":     "bg-rose-100 text-rose-800",
  "Middle":        "bg-gray-100 text-gray-700",
};

const avatarColors = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-rose-500",
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
        <h1 className="text-3xl font-bold text-gray-900">Teacher Personas</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {filtered.length} of {personas.length} personas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Grade Band
          </label>
          <div className="flex gap-2">
            <FilterButton active={gradeBand === "all"} onClick={() => setGradeBand("all")}>
              All
            </FilterButton>
            {GRADE_BANDS.map((g) => (
              <FilterButton key={g} active={gradeBand === g} onClick={() => setGradeBand(g)}>
                {g}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Relationship Status
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterButton active={status === "all"} onClick={() => setStatus("all")}>
              All
            </FilterButton>
            {RELATIONSHIP_STATUSES.map((s) => (
              <FilterButton key={s} active={status === s} onClick={() => setStatus(s)}>
                {s}
              </FilterButton>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-gray-400 italic text-sm">No personas match the selected filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <Link key={p.id} href={`/personas/${p.id}`} className="group block">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 h-full shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 ${avatarColors[i % avatarColors.length]}`}
                  >
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-indigo-700 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{p.role}</p>
                  </div>
                </div>

                {/* Tag pills */}
                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${gradeBandColors[p.gradeBand]}`}>
                    {p.gradeBand}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[p.relationshipStatus]}`}>
                    {p.relationshipStatus}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${motivationColors[p.motivationSpectrum]}`}>
                    {p.motivationSpectrum}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
