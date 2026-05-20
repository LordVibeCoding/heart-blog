import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthed } from "@/lib/auth";
import { deleteArticle, updateArticle } from "@/db/repo";

export const runtime = "nodejs";

const patchSchema = z
  .object({
    slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
    title: z.string().min(1).max(200).optional(),
    excerpt: z.string().max(400).optional(),
    cover: z.string().nullable().optional(),
    coverAlt: z.string().nullable().optional(),
    bodyHtml: z.string().optional(),
    bodyMarkdown: z.string().nullable().optional(),
    categorySlug: z.string().optional(),
    status: z.enum(["draft", "published"]).optional(),
    featured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  })
  .strict();

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthed();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "字段无效", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    await updateArticle(id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "更新失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuthed();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await ctx.params;
  await deleteArticle(id);
  return NextResponse.json({ ok: true });
}
