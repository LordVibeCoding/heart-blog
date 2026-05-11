import path from "node:path";
import fs from "node:fs";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import Database from "better-sqlite3";
import * as schema from "./schema";

/**
 * dev：better-sqlite3 直连 .data/blog.sqlite
 * prod：D1 binding（由 @opennextjs/cloudflare adapter 在 Workers 注入）
 */

export type DB = BaseSQLiteDatabase<"async", unknown, typeof schema>;

let _local: ReturnType<typeof drizzleSqlite<typeof schema>> | null = null;

function getLocal() {
  if (_local) return _local;
  const file = path.resolve(process.cwd(), ".data/blog.sqlite");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  _local = drizzleSqlite(sqlite, { schema });
  return _local;
}

export async function getDb(): Promise<DB> {
  const d1 = await tryGetD1();
  if (d1) return drizzleD1(d1, { schema }) as unknown as DB;
  return getLocal() as unknown as DB;
}

async function tryGetD1(): Promise<D1Database | null> {
  if (process.env.NODE_ENV === "development") return null;
  try {
    const mod = await import("@opennextjs/cloudflare").catch(() => null);
    if (!mod || typeof mod.getCloudflareContext !== "function") return null;
    const ctx = mod.getCloudflareContext();
    return (ctx.env as { DB?: D1Database }).DB ?? null;
  } catch {
    return null;
  }
}

export { schema };
