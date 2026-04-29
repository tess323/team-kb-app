// Edge-compatible DB client for routes running on Vercel Edge Runtime.
// Uses @libsql/client/web (no Node.js built-ins) and connects to Turso only —
// file:/tmp is not available in Edge.
import { createClient } from "@libsql/client/web";
import type { PersonaRow } from "@/lib/db";

function client() {
  return createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

function parseRow(row: Record<string, unknown>): PersonaRow {
  const parseJson = (v: unknown): string[] | null => {
    if (!v) return null;
    try { return JSON.parse(v as string); } catch { return null; }
  };
  return {
    ...(row as unknown as PersonaRow),
    goals: parseJson(row.goals),
    pain_points: parseJson(row.pain_points),
    needs: parseJson(row.needs),
    comms_in_control: parseJson(row.comms_in_control),
    comms_out_of_control: parseJson(row.comms_out_of_control),
    timeline_gaps: parseJson(row.timeline_gaps),
  };
}

export async function getPersonaById(personaId: number): Promise<PersonaRow | null> {
  const db = client();
  const result = await db.execute({
    sql: "SELECT * FROM personas WHERE persona_id = ?",
    args: [personaId],
  });
  return result.rows[0] ? parseRow(result.rows[0] as never) : null;
}

export async function savePersonaTimeline(personaId: number, timelineData: string): Promise<void> {
  const db = client();
  await db.execute({
    sql: "UPDATE personas SET timeline_data = ? WHERE persona_id = ?",
    args: [timelineData, personaId],
  });
}
