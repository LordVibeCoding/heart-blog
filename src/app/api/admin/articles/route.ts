import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createArticle, listAllArticlesAdmin } from "@/db/repo";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const createSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "slug 仅允许小写英文 / 数字 / 连字符"),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(400).default(""),
  cover: z.string().nullable().optional(),
  coverAlt: z.string().nullable().optional(),
  bodyHtml: z.string().min(1),
  bodyMarkdown: z.string().nullable().optional(),
  categorySlug: z.string().min(1),
  status: z.enum(["draft", "published"]).default("published"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const list = await listAllArticlesAdmin();
  return NextResponse.json({ data: list });
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "表单字段无效", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const id = await createArticle({
      ...parsed.data,
      authorName: site.author.name,
      authorBio: "写代码、写字、找让自己专注的方法。",
    });
    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "创建失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
