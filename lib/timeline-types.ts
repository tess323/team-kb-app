// Types describing the shape stored in the personas.timeline_data JSON column.
// The column is TEXT (string | null) in PersonaRow — these types document the
// expected structure once serialised/deserialised. No DB schema change needed.

export type TouchpointVariant = "risk" | "win" | "neutral" | "gap" | "miss";
export type TouchpointChannel = "email" | "social" | "in-product" | "in-person" | "gap";
export type TouchpointPhase =
  | "pre-launch"
  | "launch"
  | "day-two"
  | "post-launch"
  | "summer"
  | "back-to-school";
export type EmotionalState = "positive" | "neutral" | "warning" | "negative";

export interface TimelineTouchpoint {
  id: string;
  date: string;
  phase: TouchpointPhase;
  channel: TouchpointChannel;
  variant: TouchpointVariant;
  title: string;
  subtitle: string;
  /** Pre-filled question surfaced when the user clicks this touchpoint in /ask. */
  chatPrompt: string;
  /** Which KB doc this touchpoint was derived from. */
  sourceDocLabel?: string;
}

export interface EmotionalArcEntry {
  phase: string;
  state: EmotionalState;
  label: string;
}

/** Shape of the personas.timeline_data JSON column for the journey-map feature. */
export interface PersonaTimelineData {
  touchpoints: TimelineTouchpoint[];
  emotionalArc: EmotionalArcEntry[];
  /** Plain-language gap summaries. */
  gaps: string[];
  /** Plain-language what-works summaries. */
  wins: string[];
  /** ISO date string of the last sync. */
  lastSynced: string;
}
