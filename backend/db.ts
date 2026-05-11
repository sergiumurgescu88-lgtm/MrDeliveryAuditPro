import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'audit.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    credits INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export function getUser(id: string) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
}

export function createUser(id: string, email: string, name: string) {
  db.prepare('INSERT OR IGNORE INTO users (id, email, name, credits) VALUES (?, ?, ?, 100)').run(id, email, name);
  return getUser(id);
}

export function deductCredits(id: string, amount: number): boolean {
  const user = getUser(id);
  if (!user || user.credits < amount) return false;
  db.prepare('UPDATE users SET credits = credits - ? WHERE id = ?').run(amount, id);
  return true;
}

export function addCredits(id: string, amount: number) {
  db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(amount, id);
  return getUser(id);
}

export default db;
