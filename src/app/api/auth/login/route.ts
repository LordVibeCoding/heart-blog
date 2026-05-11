import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs"; // 本地 dev 用 nodejs runtime；CF 部署时 opennext 会自动适配

const schema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(256),
});

// 简单内存速率限制（每 IP 每分钟 5 次失败）
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW = 60_000;
const MAX = 5;

function rateLimitKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0]?.trim() ?? req.headers.get("cf-connecting-ip") ?? "anon");
}

function tooMany(key: string): boolean {
  const now = Date.now();
  const r = attempts.get(key);
  if (!r || r.resetAt < now) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW });
    return false;
  }
  return r.count >= MAX;
}

function recordFail(key: string) {
  const now = Date.now();
  const r = attempts.get(key) ?? { count: 0, resetAt: now + WINDOW };
  r.count += 1;
  attempts.set(key, r);
}

export async function POST(req: Request) {
  const key = rateLimitKey(req);
  if (tooMany(key)) {
    return NextResponse.json({ error: "尝试过多，请稍后再试" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "字段无效" }, { status: 400 });
  }

  const { username, password } = parsed.data;
  const expectedUser = process.env.ADMIN_USERNAME;
  if (!expectedUser || !process.env.ADMIN_PASSWORD_HASH) {
    return NextResponse.json(
      { error: "服务端未配置管理员账号" },
      { status: 500 },
    );
  }

  // 用户名错也要走 hash 校验，避免时序泄漏
  const userMatch = username === expectedUser;
  const pwOk = await verifyPassword(password);

  if (!userMatch || !pwOk) {
    recordFail(key);
    // 失败信息统一：不告诉哪边错
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }

  const session = await getSession();
  session.username = expectedUser;
  session.loggedInAt = Date.now();
  await session.save();

  return NextResponse.json({ ok: true });
}
