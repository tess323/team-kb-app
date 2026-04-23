// ── Types ─────────────────────────────────────────────────────────────────────

export type Citation = {
  type: "sourced" | "inferred" | "gap";
  source: string | null;
  note?: string | null;
};

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  type: "email" | "in_person" | "social" | "doc" | "platform";
  control: "in" | "out";
  date: {
    specific: string | null;
    relative: string;
    citation: Citation;
  };
  kb_reference: {
    title: string | null;
    doc_id: string | null;
    citation_type: "sourced" | "inferred" | null;
  };
};

export type TimelineGap = {
  id: string;
  title: string;
  description: string;
  impact: string;
};

export type TimelinePhase = {
  phase: string;
  date_range: {
    start: string | null;
    end: string | null;
    relative: string;
    citation: Citation;
  };
  mindset: {
    text: string;
    citation: Citation;
  };
  events: TimelineEvent[];
  gaps: TimelineGap[];
};

export type DiffItem = {
  path: string;       // full path: "phases[0].mindset.text"
  field: string;      // short label: "mindset.text"
  phase: string;      // "before_launch"
  liveValue: unknown;
  draftValue: unknown;
  changed: true;
};

// ── Path utilities ────────────────────────────────────────────────────────────

export function getByPath(root: unknown, path: string): unknown {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur: unknown = root;
  for (const part of parts) {
    if (cur == null) return undefined;
    const idx = Number(part);
    cur = !isNaN(idx) && Array.isArray(cur)
      ? cur[idx]
      : (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function setByPath(root: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".").filter(Boolean);
  let cur: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const idx = Number(part);
    cur = !isNaN(idx) && Array.isArray(cur)
      ? (cur as unknown[])[idx]
      : (cur as Record<string, unknown>)[part];
  }
  const last = parts[parts.length - 1];
  const lastIdx = Number(last);
  if (!isNaN(lastIdx) && Array.isArray(cur)) {
    (cur as unknown[])[lastIdx] = value;
  } else {
    (cur as Record<string, unknown>)[last] = value;
  }
}

// ── Canonical phase order ─────────────────────────────────────────────────────

const PHASE_ORDER = [
  "before_launch",
  "launch",
  "summer",
  "end_of_summer",
  "back_to_school",
] as const;

export function sortPhases(phases: TimelinePhase[]): TimelinePhase[] {
  return [...phases].sort(
    (a, b) => PHASE_ORDER.indexOf(a.phase as never) - PHASE_ORDER.indexOf(b.phase as never)
  );
}

// ── Diff ──────────────────────────────────────────────────────────────────────

export function compareTimelines(
  live: TimelinePhase[],
  draft: TimelinePhase[]
): DiffItem[] {
  const diffs: DiffItem[] = [];
  const sortedLive = sortPhases(live);
  const sortedDraft = sortPhases(draft);

  for (let pi = 0; pi < sortedDraft.length; pi++) {
    const dp = sortedDraft[pi];
    const lp = sortedLive.find((p) => p.phase === dp.phase);
    const prefix = `phases[${pi}]`;

    function add(subPath: string, lv: unknown, dv: unknown) {
      if (JSON.stringify(lv) !== JSON.stringify(dv)) {
        diffs.push({
          path: `${prefix}.${subPath}`,
          field: subPath,
          phase: dp.phase,
          liveValue: lv,
          draftValue: dv,
          changed: true,
        });
      }
    }

    // Phase-level fields
    add("date_range.start",    lp?.date_range?.start    ?? null, dp.date_range?.start    ?? null);
    add("date_range.end",      lp?.date_range?.end      ?? null, dp.date_range?.end      ?? null);
    add("date_range.relative", lp?.date_range?.relative ?? null, dp.date_range?.relative ?? null);
    add("mindset.text",        lp?.mindset?.text        ?? null, dp.mindset?.text        ?? null);

    // Events (matched by position)
    const evCount = Math.max(lp?.events?.length ?? 0, dp.events?.length ?? 0);
    for (let ei = 0; ei < evCount; ei++) {
      const le = lp?.events?.[ei];
      const de = dp.events?.[ei];
      const ep = `events[${ei}]`;
      add(`${ep}.title`,              le?.title              ?? null, de?.title              ?? null);
      add(`${ep}.description`,        le?.description        ?? null, de?.description        ?? null);
      add(`${ep}.date.specific`,      le?.date?.specific     ?? null, de?.date?.specific     ?? null);
      add(`${ep}.date.relative`,      le?.date?.relative     ?? null, de?.date?.relative     ?? null);
      add(`${ep}.kb_reference.title`, le?.kb_reference?.title ?? null, de?.kb_reference?.title ?? null);
    }

    // Gaps (matched by position)
    const gCount = Math.max(lp?.gaps?.length ?? 0, dp.gaps?.length ?? 0);
    for (let gi = 0; gi < gCount; gi++) {
      const lg = lp?.gaps?.[gi];
      const dg = dp.gaps?.[gi];
      const gp = `gaps[${gi}]`;
      add(`${gp}.title`,       lg?.title       ?? null, dg?.title       ?? null);
      add(`${gp}.description`, lg?.description ?? null, dg?.description ?? null);
      add(`${gp}.impact`,      lg?.impact      ?? null, dg?.impact      ?? null);
    }
  }

  return diffs;
}
