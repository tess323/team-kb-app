import Database from "better-sqlite3";
import path from "path";

export interface Record {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  const dbPath = path.join(process.cwd(), "data.db");
  _db = new Database(dbPath);
  _db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  return _db;
}

export function getAllRecords(): Record[] {
  return getDb()
    .prepare("SELECT * FROM records ORDER BY updated_at DESC")
    .all() as Record[];
}

export function getRecord(id: number): Record | undefined {
  return getDb()
    .prepare("SELECT * FROM records WHERE id = ?")
    .get(id) as Record | undefined;
}

export function createRecord(title: string, content: string): Record {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO records (title, content) VALUES (?, ?) RETURNING *"
    )
    .get(title, content) as Record;
  return result;
}

export function updateRecord(
  id: number,
  title: string,
  content: string
): Record | undefined {
  const db = getDb();
  return db
    .prepare(
      "UPDATE records SET title = ?, content = ?, updated_at = datetime('now') WHERE id = ? RETURNING *"
    )
    .get(title, content, id) as Record | undefined;
}

export function deleteRecord(id: number): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM records WHERE id = ?").run(id);
  return result.changes > 0;
}
