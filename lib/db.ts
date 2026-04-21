import { createClient } from "@libsql/client";

const db = createClient({ url: "file:/tmp/conversations.db" });

async function setup() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS conversations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_message      TEXT NOT NULL,
      assistant_response TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

const ready = setup();

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
