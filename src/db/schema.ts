import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/** 分类 */
export const categories = sqliteTable(
  "categories",
  {
    slug: text("slug").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    sortIdx: index("categories_sort_idx").on(t.sortOrder),
  }),
);

/** 文章 */
export const articles = sqliteTable(
  "articles",
  {
    id: text("id").primaryKey(), // nanoid
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    cover: text("cover"),
    coverAlt: text("cover_alt"),
    bodyHtml: text("body_html").notNull().default(""),
    bodyMarkdown: text("body_markdown"),
    categorySlug: text("category_slug")
      .notNull()
      .references(() => categories.slug, { onUpdate: "cascade" }),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    authorName: text("author_name").notNull(),
    authorAvatar: text("author_avatar"),
    authorBio: text("author_bio"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    slugUq: uniqueIndex("articles_slug_uq").on(t.slug),
    statusIdx: index("articles_status_published_idx").on(t.status, t.publishedAt),
    categoryIdx: index("articles_category_idx").on(t.categorySlug),
    featuredIdx: index("articles_featured_idx").on(t.featured),
  }),
);

/** 标签 */
export const tags = sqliteTable("tags", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
});

/** 文章 ↔ 标签 */
export const articleTags = sqliteTable(
  "article_tags",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    tagSlug: text("tag_slug")
      .notNull()
      .references(() => tags.slug, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.articleId, t.tagSlug] }),
  }),
);

/** 媒体 — 实际文件在 R2 */
export const media = sqliteTable(
  "media",
  {
    key: text("key").primaryKey(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    createdIdx: index("media_created_idx").on(t.createdAt),
  }),
);

/** 站点级 key-value 设置 */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

/** API Token：给自动化脚本 / AI Agent 用，按 token 粒度管理 */
export const apiTokens = sqliteTable(
  "api_tokens",
  {
    id: text("id").primaryKey(), // nanoid
    name: text("name").notNull(),
    /** sha256(token) hex，明文 token 只在创建时返回一次 */
    tokenHash: text("token_hash").notNull(),
    /** 前 8 字符明文前缀，用于列表识别 */
    prefix: text("prefix").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }),
    revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  },
  (t) => ({
    hashUq: uniqueIndex("api_tokens_hash_uq").on(t.tokenHash),
  }),
);

export type CategoryRow = typeof categories.$inferSelect;
export type ArticleRow = typeof articles.$inferSelect;
export type TagRow = typeof tags.$inferSelect;
export type MediaRow = typeof media.$inferSelect;
export type SettingRow = typeof settings.$inferSelect;
export type ApiTokenRow = typeof apiTokens.$inferSelect;
