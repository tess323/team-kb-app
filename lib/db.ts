import { createClient } from "@libsql/client";

const db = createClient({ url: "file:/tmp/conversations.db" });

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

export type PersonaRecord = {
  persona_id: number;
  google_doc_id: string | null;
  synced_content: string | null;
  last_synced: string | null;
};

export async function getPersonaById(personaId: number): Promise<PersonaRecord | null> {
  await ready;
  const result = await db.execute({
    sql: "SELECT * FROM personas WHERE persona_id = ?",
    args: [personaId],
  });
  return (result.rows[0] as never) ?? null;
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
