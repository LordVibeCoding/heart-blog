#!/usr/bin/env node
// 本地 sqlite 迁移：把 drizzle/*.sql 一次性应用到 .data/blog.sqlite
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const root = process.cwd();
const dbFile = path.join(root, ".data/blog.sqlite");
const dir = path.join(root, "drizzle");

fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = new Database(dbFile);
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS _migrations (
  filename TEXT PRIMARY KEY,
  applied_at INTEGER NOT NULL
);
`);

const applied = new Set(
  db.prepare("SELECT filename FROM _migrations").all().map((r) => r.filename),
);

const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

let count = 0;
for (const f of files) {
  if (applied.has(f)) continue;
  const sql = fs.readFileSync(path.join(dir, f), "utf8");
  // drizzle 用 --> statement-breakpoint 分隔，按它切
  const stmts = sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  const tx = db.transaction(() => {
    for (const s of stmts) db.exec(s);
    db.prepare("INSERT INTO _migrations(filename, applied_at) VALUES (?, ?)").run(
      f,
      Date.now(),
    );
  });
  tx();
  console.log(`✓ applied ${f}`);
  count++;
}

if (count === 0) console.log("nothing to migrate");
console.log(`db: ${dbFile}`);
