import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { resolve } from "path";

const db = createClient({ url: "file:/tmp/conversations.db" });

const PERSONA_NEW_COLUMNS = [
  "name TEXT",
  "role TEXT",
  "grade_band TEXT",
  "relationship TEXT",
  "motivation TEXT",
  "current_course TEXT",
  "goals TEXT",
  "pain_points TEXT",
  "ai_relationship TEXT",
  "rebrand_risk TEXT",
  "needs TEXT",
  "quote TEXT",
  "background TEXT",
  "excited_about TEXT",
  "nervous_about TEXT",
  "success_looks_like TEXT",
  "failure_looks_like TEXT",
  "aim_feeling TEXT",
  "comms_in_control TEXT",
  "comms_out_of_control TEXT",
  "content TEXT",
  "timeline_data TEXT",
  "timeline_gaps TEXT",
  "timeline_draft TEXT",
  "timeline_draft_created_at TEXT",
  "timeline_committed_at TEXT",
];

async function setup() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS conversations (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      user_message       TEXT NOT NULL,
      assistant_response TEXT NOT NULL,
      created_at         TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS personas (
      persona_id     INTEGER PRIMARY KEY,
      google_doc_id  TEXT,
      synced_content TEXT,
      last_synced    TEXT
    )
  `);
  for (const col of PERSONA_NEW_COLUMNS) {
    try {
      await db.execute(`ALTER TABLE personas ADD COLUMN ${col}`);
    } catch {
      // column already exists
    }
  }
  await seedPersonas();
}

async function seedPersonas() {
  const { rows } = await db.execute(
    "SELECT COUNT(*) as count FROM personas WHERE name IS NOT NULL"
  );
  if ((rows[0].count as number) > 0) return;

  const seedPath = resolve(process.cwd(), "data/personas-seed.json");
  let seed: Record<string, unknown>[];
  try {
    seed = JSON.parse(readFileSync(seedPath, "utf-8"));
  } catch {
    return;
  }

  const serial = (v: unknown) => (Array.isArray(v) ? JSON.stringify(v) : null);

  for (const p of seed) {
    await db.execute({
      sql: `INSERT INTO personas (name, role, grade_band, relationship, motivation, current_course,
        goals, pain_points, ai_relationship, rebrand_risk, needs, quote, background, excited_about,
        nervous_about, success_looks_like, failure_looks_like, aim_feeling,
        comms_in_control, comms_out_of_control, content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.name as string, p.role as string, p.grade_band as string,
        p.relationship as string, p.motivation as string, p.current_course as string,
        serial(p.goals), serial(p.pain_points), p.ai_relationship as string,
        p.rebrand_risk as string, serial(p.needs), p.quote as string,
        p.background as string, p.excited_about as string, p.nervous_about as string,
        p.success_looks_like as string, p.failure_looks_like as string,
        p.aim_feeling as string, serial(p.comms_in_control),
        serial(p.comms_out_of_control), null,
      ],
    });
  }
}

const ready = setup();

// ── conversations ────────────────────────────────────────────────────────────

export async function saveConversation(userMessage: string, assistantResponse: string) {
  await ready;
  await db.execute({
    sql: "INSERT INTO conversations (user_message, assistant_response) VALUES (?, ?)",
    args: [userMessage, assistantResponse],
  });
}

export async function getAllConversations(): Promise<
  { id: number; user_message: string; assistant_response: string; created_at: string }[]
> {
  await ready;
  const result = await db.execute("SELECT * FROM conversations ORDER BY created_at DESC");
  return result.rows as never;
}

// ── personas ─────────────────────────────────────────────────────────────────

export type PersonaRow = {
  persona_id: number;
  name: string | null;
  role: string | null;
  grade_band: string | null;
  relationship: string | null;
  motivation: string | null;
  current_course: string | null;
  goals: string[] | null;
  pain_points: string[] | null;
  ai_relationship: string | null;
  rebrand_risk: string | null;
  needs: string[] | null;
  quote: string | null;
  background: string | null;
  excited_about: string | null;
  nervous_about: string | null;
  success_looks_like: string | null;
  failure_looks_like: string | null;
  aim_feeling: string | null;
  comms_in_control: string[] | null;
  comms_out_of_control: string[] | null;
  content: string | null;
  timeline_data: string | null;
  timeline_gaps: string[] | null;
  timeline_draft: string | null;
  timeline_draft_created_at: string | null;
  timeline_committed_at: string | null;
  google_doc_id: string | null;
  synced_content: string | null;
  last_synced: string | null;
};

export type PersonaRecord = PersonaRow;

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

export async function getAllPersonas(): Promise<PersonaRow[]> {
  await ready;
  const result = await db.execute(
    "SELECT * FROM personas WHERE name IS NOT NULL ORDER BY persona_id ASC"
  );
  return (result.rows as never[]).map(parseRow);
}

export async function getPersonaById(personaId: number): Promise<PersonaRow | null> {
  await ready;
  const result = await db.execute({
    sql: "SELECT * FROM personas WHERE persona_id = ?",
    args: [personaId],
  });
  return result.rows[0] ? parseRow(result.rows[0] as never) : null;
}

export async function getPersonaByName(name: string): Promise<PersonaRow | null> {
  await ready;
  const result = await db.execute({
    sql: "SELECT * FROM personas WHERE name = ?",
    args: [name],
  });
  return result.rows[0] ? parseRow(result.rows[0] as never) : null;
}

type PersonaInput = Omit<PersonaRow, "persona_id" | "google_doc_id" | "synced_content" | "last_synced">;

export async function upsertPersonaByName(data: PersonaInput): Promise<number> {
  await ready;

  const serial = (v: string[] | null) => (v ? JSON.stringify(v) : null);

  const existing = await db.execute({
    sql: "SELECT persona_id FROM personas WHERE name = ?",
    args: [data.name],
  });

  const args = [
    data.role, data.grade_band, data.relationship, data.motivation, data.current_course,
    serial(data.goals), serial(data.pain_points), data.ai_relationship, data.rebrand_risk,
    serial(data.needs), data.quote, data.background, data.excited_about, data.nervous_about,
    data.success_looks_like, data.failure_looks_like, data.aim_feeling,
    serial(data.comms_in_control), serial(data.comms_out_of_control), data.content,
  ];

  if (existing.rows.length > 0) {
    const personaId = existing.rows[0].persona_id as number;
    await db.execute({
      sql: `UPDATE personas SET
        role=?, grade_band=?, relationship=?, motivation=?, current_course=?,
        goals=?, pain_points=?, ai_relationship=?, rebrand_risk=?, needs=?,
        quote=?, background=?, excited_about=?, nervous_about=?, success_looks_like=?,
        failure_looks_like=?, aim_feeling=?, comms_in_control=?, comms_out_of_control=?,
        content=?
        WHERE name=?`,
      args: [...args, data.name],
    });
    return personaId;
  } else {
    const result = await db.execute({
      sql: `INSERT INTO personas (name, role, grade_band, relationship, motivation, current_course,
        goals, pain_points, ai_relationship, rebrand_risk, needs, quote, background, excited_about,
        nervous_about, success_looks_like, failure_looks_like, aim_feeling,
        comms_in_control, comms_out_of_control, content)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [data.name, ...args],
    });
    return Number(result.lastInsertRowid);
  }
}

export async function savePersonaTimeline(personaId: number, timelineData: string) {
  await ready;
  await db.execute({
    sql: "UPDATE personas SET timeline_data = ? WHERE persona_id = ?",
    args: [timelineData, personaId],
  });
}

export async function saveTimelineDraft(personaId: number, draftData: string) {
  await ready;
  await db.execute({
    sql: "UPDATE personas SET timeline_draft = ?, timeline_draft_created_at = datetime('now') WHERE persona_id = ?",
    args: [draftData, personaId],
  });
}

export async function commitTimelineChanges(personaId: number, updatedLiveData: string) {
  await ready;
  await db.execute({
    sql: `UPDATE personas SET
      timeline_data = ?,
      timeline_draft = NULL,
      timeline_draft_created_at = NULL,
      timeline_committed_at = datetime('now')
      WHERE persona_id = ?`,
    args: [updatedLiveData, personaId],
  });
}

export async function dismissTimelineGap(personaId: number, gapId: string) {
  await ready;
  const result = await db.execute({
    sql: "SELECT timeline_gaps FROM personas WHERE persona_id = ?",
    args: [personaId],
  });
  const existing: string[] = result.rows[0]?.timeline_gaps
    ? JSON.parse(result.rows[0].timeline_gaps as string)
    : [];
  if (!existing.includes(gapId)) {
    await db.execute({
      sql: "UPDATE personas SET timeline_gaps = ? WHERE persona_id = ?",
      args: [JSON.stringify([...existing, gapId]), personaId],
    });
  }
}

export async function updatePersonaDocId(personaId: number, docId: string) {
  await ready;
  await db.execute({
    sql: `INSERT INTO personas (persona_id, google_doc_id)
          VALUES (?, ?)
          ON CONFLICT(persona_id) DO UPDATE SET google_doc_id = excluded.google_doc_id`,
    args: [personaId, docId],
  });
}

export async function syncPersonaContent(personaId: number, content: string) {
  await ready;
  await db.execute({
    sql: `INSERT INTO personas (persona_id, synced_content, last_synced)
          VALUES (?, ?, datetime('now'))
          ON CONFLICT(persona_id) DO UPDATE SET
            synced_content = excluded.synced_content,
            last_synced    = excluded.last_synced`,
    args: [personaId, content],
  });
}
