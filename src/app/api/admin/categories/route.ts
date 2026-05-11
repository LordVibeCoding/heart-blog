import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createCategory, listCategories } from "@/db/repo";

export const runtime = "nodejs";

const createSchema = z.object({
  slug: z.string().min(1).max(64).regex(/^[a-z0-9一-龥-]+$/),
  name: z.string().min(1).max(64),
  description: z.string().max(200).optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const list = await listCategories();
  return NextResponse.json({ data: list });
}

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
  try {
    await createCategory(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "创建失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
