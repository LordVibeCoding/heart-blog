import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "./client";
import { articles, articleTags, categories, media, tags } from "./schema";
import { extractExcerpt, extractFirstImage } from "@/lib/content";
import type { Article as ArticleVO, Category as CategoryVO } from "@/data/types";

/* ---------- 转换：DB row → 前端 VO ---------- */

type ArticleRow = typeof articles.$inferSelect;
type CategoryRow = typeof categories.$inferSelect;

function toCategoryVO(c: CategoryRow): CategoryVO {
  return {
    slug: c.slug,
    name: c.name,
    description: c.description ?? undefined,
  };
}

function readingTimeFor(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").trim();
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

async function rowToVO(row: ArticleRow): Promise<ArticleVO> {
  const db = await getDb();
  const cat = await db.query.categories.findFirst({
    where: eq(categories.slug, row.categorySlug),
  });
  const tagRows = await db
    .select({ slug: articleTags.tagSlug, name: tags.name })
    .from(articleTags)
    .innerJoin(tags, eq(tags.slug, articleTags.tagSlug))
    .where(eq(articleTags.articleId, row.id));

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    cover: row.cover ?? "",
    coverAlt: row.coverAlt ?? undefined,
    category: cat
      ? toCategoryVO(cat)
      : { slug: row.categorySlug, name: row.categorySlug },
    tags: tagRows.map((t) => t.name),
    author: {
      slug: "admin",
      name: row.authorName,
      avatar: row.authorAvatar ?? undefined,
      bio: row.authorBio ?? undefined,
    },
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    readingMinutes: row.readingMinutes,
    featured: row.featured,
    bodyHtml: row.bodyHtml,
  };
}

/* ---------- Categories ---------- */

export async function listCategories(): Promise<CategoryVO[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(categories)
    .orderBy(categories.sortOrder, categories.slug);
  return rows.map(toCategoryVO);
}

export async function createCategory(input: {
  slug: string;
  name: string;
  description?: string;
  sortOrder?: number;
}) {
  const db = await getDb();
  await db.insert(categories).values({
    slug: input.slug,
    name: input.name,
    description: input.description,
    sortOrder: input.sortOrder ?? 0,
  });
}

export async function updateCategory(
  slug: string,
  patch: Partial<{ name: string; description: string; sortOrder: number }>,
) {
  const db = await getDb();
  await db.update(categories).set(patch).where(eq(categories.slug, slug));
}

export async function deleteCategory(slug: string) {
  const db = await getDb();
  // 安全：不允许删还有文章的分类
  const has = await db
    .select({ c: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.categorySlug, slug));
  if ((has[0]?.c ?? 0) > 0) {
    throw new Error("该分类下还有文章，无法删除");
  }
  await db.delete(categories).where(eq(categories.slug, slug));
}

/* ---------- Articles ---------- */

export async function listPublishedArticles(): Promise<ArticleVO[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt));
  return Promise.all(rows.map(rowToVO));
}

export async function listAllArticlesAdmin(): Promise<{
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  categorySlug: string;
  updatedAt: Date;
  featured: boolean;
}[]> {
  const db = await getDb();
  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      status: articles.status,
      categorySlug: articles.categorySlug,
      updatedAt: articles.updatedAt,
      featured: articles.featured,
    })
    .from(articles)
    .orderBy(desc(articles.updatedAt));
  return rows;
}

export async function getArticleVOBySlug(slug: string): Promise<ArticleVO | null> {
  const db = await getDb();
  const row = await db.query.articles.findFirst({
    where: and(eq(articles.slug, slug), eq(articles.status, "published")),
  });
  return row ? await rowToVO(row) : null;
}

export async function getArticleAdminById(id: string) {
  const db = await getDb();
  const row = await db.query.articles.findFirst({ where: eq(articles.id, id) });
  if (!row) return null;
  const tagRows = await db
    .select({ slug: articleTags.tagSlug })
    .from(articleTags)
    .where(eq(articleTags.articleId, id));
  return { row, tags: tagRows.map((t) => t.slug) };
}

export async function getRelatedArticles(slug: string, limit = 3): Promise<ArticleVO[]> {
  const db = await getDb();
  const me = await db.query.articles.findFirst({ where: eq(articles.slug, slug) });
  if (!me) return [];
  const rows = await db
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.status, "published"),
        eq(articles.categorySlug, me.categorySlug),
      ),
    )
    .orderBy(desc(articles.publishedAt))
    .limit(limit + 1);
  const filtered = rows.filter((r) => r.slug !== slug).slice(0, limit);
  return Promise.all(filtered.map(rowToVO));
}

export async function getAdjacentArticles(slug: string) {
  const db = await getDb();
  const all = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(articles.publishedAt);
  const idx = all.findIndex((a) => a.slug === slug);
  return {
    prev: idx > 0 ? await rowToVO(all[idx - 1]) : undefined,
    next: idx >= 0 && idx < all.length - 1 ? await rowToVO(all[idx + 1]) : undefined,
  };
}

export type CreateArticleInput = {
  slug: string;
  title: string;
  excerpt: string;
  cover?: string | null;
  coverAlt?: string | null;
  bodyHtml: string;
  bodyMarkdown?: string | null;
  categorySlug: string;
  status: "draft" | "published";
  featured?: boolean;
  tags: string[];
  authorName: string;
  authorAvatar?: string | null;
  authorBio?: string | null;
};

export async function createArticle(input: CreateArticleInput): Promise<string> {
  const db = await getDb();
  const id = nanoid(12);
  const now = new Date();
  // 摘要 / 封面自动从正文提取（如果用户没填）
  const excerpt = input.excerpt?.trim() ? input.excerpt : extractExcerpt(input.bodyHtml);
  const cover = input.cover?.trim() ? input.cover : extractFirstImage(input.bodyHtml);
  await db.insert(articles).values({
    id,
    slug: input.slug,
    title: input.title,
    excerpt,
    cover,
    coverAlt: input.coverAlt ?? null,
    bodyHtml: input.bodyHtml,
    bodyMarkdown: input.bodyMarkdown ?? null,
    categorySlug: input.categorySlug,
    status: input.status,
    featured: input.featured ?? false,
    readingMinutes: readingTimeFor(input.bodyHtml),
    authorName: input.authorName,
    authorAvatar: input.authorAvatar ?? null,
    authorBio: input.authorBio ?? null,
    publishedAt: input.status === "published" ? now : null,
    createdAt: now,
    updatedAt: now,
  });
  await syncArticleTags(id, input.tags);
  return id;
}

export async function updateArticle(
  id: string,
  input: Partial<CreateArticleInput>,
) {
  const db = await getDb();
  const existing = await db.query.articles.findFirst({ where: eq(articles.id, id) });
  if (!existing) throw new Error("Article not found");

  const now = new Date();
  const wasDraft = existing.status === "draft";
  const willPublish = input.status === "published";

  // 若清空摘要/封面，从最新正文自动重新提取
  const incomingBody = input.bodyHtml ?? existing.bodyHtml;
  const finalExcerpt =
    input.excerpt !== undefined
      ? input.excerpt.trim()
        ? input.excerpt
        : extractExcerpt(incomingBody)
      : undefined;
  const finalCover =
    input.cover !== undefined
      ? input.cover && input.cover.trim()
        ? input.cover
        : extractFirstImage(incomingBody)
      : undefined;

  await db
    .update(articles)
    .set({
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.title !== undefined && { title: input.title }),
      ...(finalExcerpt !== undefined && { excerpt: finalExcerpt }),
      ...(finalCover !== undefined && { cover: finalCover }),
      ...(input.coverAlt !== undefined && { coverAlt: input.coverAlt ?? null }),
      ...(input.bodyHtml !== undefined && {
        bodyHtml: input.bodyHtml,
        readingMinutes: readingTimeFor(input.bodyHtml),
      }),
      ...(input.bodyMarkdown !== undefined && { bodyMarkdown: input.bodyMarkdown ?? null }),
      ...(input.categorySlug !== undefined && { categorySlug: input.categorySlug }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.featured !== undefined && { featured: input.featured }),
      ...(input.authorName !== undefined && { authorName: input.authorName }),
      ...(input.authorAvatar !== undefined && { authorAvatar: input.authorAvatar ?? null }),
      ...(input.authorBio !== undefined && { authorBio: input.authorBio ?? null }),
      ...(wasDraft && willPublish && { publishedAt: now }),
      updatedAt: now,
    })
    .where(eq(articles.id, id));

  if (input.tags !== undefined) {
    await syncArticleTags(id, input.tags);
  }
}

export async function deleteArticle(id: string) {
  const db = await getDb();
  await db.delete(articleTags).where(eq(articleTags.articleId, id));
  await db.delete(articles).where(eq(articles.id, id));
}

async function syncArticleTags(articleId: string, tagNames: string[]) {
  const db = await getDb();
  const cleaned = [...new Set(tagNames.map((t) => t.trim()).filter(Boolean))];
  // 上插 tag
  for (const name of cleaned) {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    if (!slug) continue;
    await db
      .insert(tags)
      .values({ slug, name })
      .onConflictDoNothing({ target: tags.slug });
  }
  // 删旧关联
  await db.delete(articleTags).where(eq(articleTags.articleId, articleId));
  // 插新关联
  for (const name of cleaned) {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
    if (!slug) continue;
    await db.insert(articleTags).values({ articleId, tagSlug: slug });
  }
}

/* ---------- Tags ---------- */

export async function getAllTags(limit?: number): Promise<{ tag: string; count: number }[]> {
  const db = await getDb();
  const rows = await db
    .select({
      tagName: tags.name,
      count: sql<number>`count(${articleTags.articleId})`,
    })
    .from(tags)
    .leftJoin(articleTags, eq(articleTags.tagSlug, tags.slug))
    .groupBy(tags.slug)
    .orderBy(desc(sql`count(${articleTags.articleId})`));
  const list = rows.map((r) => ({ tag: r.tagName, count: r.count }));
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

/* ---------- Featured / Recent / Category filter ---------- */

export async function listFeatured(limit = 4): Promise<ArticleVO[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.status, "published"), eq(articles.featured, true)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  if (rows.length >= limit) return Promise.all(rows.map(rowToVO));
  // 不够用最近发布的补
  const more = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  const seen = new Set(rows.map((r) => r.id));
  const merged = [...rows, ...more.filter((r) => !seen.has(r.id))].slice(0, limit);
  return Promise.all(merged.map(rowToVO));
}

export async function listRecent(limit = 10): Promise<ArticleVO[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
  return Promise.all(rows.map(rowToVO));
}

export async function listByCategory(slug: string, limit?: number): Promise<ArticleVO[]> {
  const db = await getDb();
  const q = db
    .select()
    .from(articles)
    .where(and(eq(articles.status, "published"), eq(articles.categorySlug, slug)))
    .orderBy(desc(articles.publishedAt));
  const rows = limit ? await q.limit(limit) : await q;
  return Promise.all(rows.map(rowToVO));
}

/* ---------- Media ---------- */

export async function listMedia(limit = 60) {
  const db = await getDb();
  return db.select().from(media).orderBy(desc(media.createdAt)).limit(limit);
}

export async function recordMedia(input: {
  key: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}) {
  const db = await getDb();
  await db.insert(media).values({
    key: input.key,
    filename: input.filename,
    mimeType: input.mimeType,
    size: input.size,
    width: input.width,
    height: input.height,
  });
}

export async function deleteMedia(key: string) {
  const db = await getDb();
  await db.delete(media).where(eq(media.key, key));
}
