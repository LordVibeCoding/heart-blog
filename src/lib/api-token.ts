import { nanoid } from "nanoid";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { apiTokens } from "@/db/schema";

/** 生成一个新的明文 token（只返回一次给用户保存） */
export function generateToken(): string {
  // 32 字节随机，base64url 形式，无 padding
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `lvc_${b64}`;
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createApiToken(name: string): Promise<{
  id: string;
  name: string;
  token: string; // 明文，仅创建时返回
  prefix: string;
  createdAt: Date;
}> {
  const token = generateToken();
  const tokenHash = await sha256Hex(token);
  const prefix = token.slice(0, 12); // "lvc_xxxxxxxx"
  const id = nanoid(12);
  const now = new Date();
  const db = await getDb();
  await db.insert(apiTokens).values({
    id,
    name,
    tokenHash,
    prefix,
    createdAt: now,
  });
  return { id, name, token, prefix, createdAt: now };
}

export async function listApiTokens() {
  const db = await getDb();
  const rows = await db
    .select({
      id: apiTokens.id,
      name: apiTokens.name,
      prefix: apiTokens.prefix,
      createdAt: apiTokens.createdAt,
      lastUsedAt: apiTokens.lastUsedAt,
      revokedAt: apiTokens.revokedAt,
    })
    .from(apiTokens);
  // 按创建时间倒序（手动排序以兼容简单 driver）
  return rows.sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  );
}

export async function revokeApiToken(id: string) {
  const db = await getDb();
  await db
    .update(apiTokens)
    .set({ revokedAt: new Date() })
    .where(eq(apiTokens.id, id));
}

export async function deleteApiToken(id: string) {
  const db = await getDb();
  await db.delete(apiTokens).where(eq(apiTokens.id, id));
}

/** 验证 Bearer token，返回对应 token 行（若有效）。同时刷新 lastUsedAt。 */
export async function verifyBearerToken(
  authHeader: string | null,
): Promise<{ id: string; name: string } | null> {
  if (!authHeader) return null;
  const m = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!m) return null;
  const token = m[1].trim();
  if (!token.startsWith("lvc_")) return null;

  const hash = await sha256Hex(token);
  const db = await getDb();
  const row = await db.query.apiTokens.findFirst({
    where: eq(apiTokens.tokenHash, hash),
  });
  if (!row) return null;
  if (row.revokedAt) return null;

  // 异步更新 lastUsedAt，不阻塞响应
  void db
    .update(apiTokens)
    .set({ lastUsedAt: sql`(unixepoch() * 1000)` })
    .where(eq(apiTokens.id, row.id))
    .catch(() => {});

  return { id: row.id, name: row.name };
}
