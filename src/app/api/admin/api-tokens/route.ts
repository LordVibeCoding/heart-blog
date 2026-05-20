import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createApiToken, listApiTokens } from "@/lib/api-token";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().min(1).max(64),
});

/** 列出 token（只返回脱敏字段）。仅 cookie session 可访问。 */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const list = await listApiTokens();
  return NextResponse.json({ data: list });
}

/** 创建 token。返回的 token 明文只出现这一次，请妥善保存。 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "字段无效" }, { status: 400 });
  }
  const created = await createApiToken(parsed.data.name);
  return NextResponse.json({ data: created }, { status: 201 });
}
