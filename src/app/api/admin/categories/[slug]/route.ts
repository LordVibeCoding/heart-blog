import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { deleteCategory, updateCategory } from "@/db/repo";

export const runtime = "nodejs";

const patchSchema = z
  .object({
    name: z.string().min(1).max(64).optional(),
    description: z.string().max(200).optional(),
    sortOrder: z.number().int().optional(),
  })
  .strict();

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "字段无效" }, { status: 400 });
  }
  await updateCategory(slug, parsed.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  try {
    await deleteCategory(slug);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "删除失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
