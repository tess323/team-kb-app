import { createClient } from "@libsql/client";
import path from "path";

export interface Record {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

let _db: ReturnType<typeof createClient> | null = null;

function getDb() {
  if (_db) return _db;
  const url = process.env.TURSO_DATABASE_URL
    ?? `file:${process.env.VERCEL ? "/tmp/data.db" : path.join(process.cwd(), "data.db")}`;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  _db = createClient({ url, authToken });
  return _db;
}

async function init() {
  await getDb().execute(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export async function getAllRecords(): Promise<Record[]> {
  await init();
  const res = await getDb().execute("SELECT * FROM records ORDER BY updated_at DESC");
  return res.rows as unknown as Record[];
}

export async function getRecord(id: number): Promise<Record | undefined> {
  await init();
  const res = await getDb().execute({ sql: "SELECT * FROM records WHERE id = ?", args: [id] });
  return res.rows[0] as unknown as Record | undefined;
}

export async function createRecord(title: string, content: string): Promise<Record> {
  await init();
  const res = await getDb().execute({
    sql: "INSERT INTO records (title, content) VALUES (?, ?) RETURNING *",
    args: [title, content],
  });
  return res.rows[0] as unknown as Record;
}

export async function updateRecord(id: number, title: string, content: string): Promise<Record | undefined> {
  await init();
  const res = await getDb().execute({
    sql: "UPDATE records SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ? RETURNING *",
    args: [title, content, id],
  });
  return res.rows[0] as unknown as Record | undefined;
}

export async function deleteRecord(id: number): Promise<boolean> {
  await init();
  const res = await getDb().execute({ sql: "DELETE FROM records WHERE id = ?", args: [id] });
  return (res.rowsAffected ?? 0) > 0;
}
