import { NextResponse } from "next/server";
import { listPublishedArticles } from "@/db/repo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const articles = await listPublishedArticles();
  const docs = articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body: a.bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    tags: a.tags.join(" "),
    category: a.category.name,
    publishedAt: a.publishedAt,
    cover: a.cover,
  }));
  return NextResponse.json(docs, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
