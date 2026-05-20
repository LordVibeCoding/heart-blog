import { cookies, headers } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { verifyBearerToken } from "./api-token";

export type SessionData = {
  username?: string;
  loggedInAt?: number;
};

export type AdminPrincipal =
  | { kind: "session"; username: string }
  | { kind: "token"; tokenId: string; tokenName: string };

const SESSION_COOKIE = "blog_session";

function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET 未设置或太短（需 ≥ 32 字符）");
  }
  return {
    password,
    cookieName: SESSION_COOKIE,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 天
      path: "/",
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

export async function requireAdmin(): Promise<IronSession<SessionData>> {
  const session = await getSession();
  if (!session.username) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/** 支持两种鉴权：cookie session（后台 UI）或 Bearer token（API）。 */
export async function requireAuthed(): Promise<AdminPrincipal> {
  // 1) cookie session
  const session = await getSession();
  if (session.username) {
    return { kind: "session", username: session.username };
  }
  // 2) Bearer token
  const hdrs = await headers();
  const auth = hdrs.get("authorization");
  const token = await verifyBearerToken(auth);
  if (token) {
    return { kind: "token", tokenId: token.id, tokenName: token.name };
  }
  throw new Error("UNAUTHORIZED");
}

/** PBKDF2 密码校验。env 用 3 个变量传：ADMIN_PASSWORD_ITER / SALT(b64) / HASH(b64) */
export async function verifyPassword(plaintext: string): Promise<boolean> {
  const iter = Number(process.env.ADMIN_PASSWORD_ITER);
  const saltB64 = process.env.ADMIN_PASSWORD_SALT;
  const hashB64 = process.env.ADMIN_PASSWORD_HASH;
  if (!Number.isFinite(iter) || iter < 10_000) return false;
  if (!saltB64 || !hashB64) return false;

  const salt = b64ToBytes(saltB64);
  const expected = b64ToBytes(hashB64);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(plaintext),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: iter, hash: "SHA-256" },
      keyMaterial,
      expected.length * 8,
    ),
  );

  return timingSafeEqual(derived, expected);
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
