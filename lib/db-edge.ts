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

export async function getKBCache(): Promise<{ content: string; updated_at: string } | null> {
  const db = client();
  try {
    const result = await db.execute("SELECT content, updated_at FROM kb_cache WHERE id = 'main'");
    if (!result.rows[0]) return null;
    return {
      content: result.rows[0].content as string,
      updated_at: result.rows[0].updated_at as string,
    };
  } catch {
    return null;
  }
}

export async function saveKBCache(content: string): Promise<void> {
  const db = client();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS kb_cache (
      id         TEXT PRIMARY KEY,
      content    TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await db.execute({
    sql: `INSERT INTO kb_cache (id, content, updated_at) VALUES ('main', ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET content = excluded.content, updated_at = excluded.updated_at`,
    args: [content],
  });
}
