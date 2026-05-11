import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../src/db/schema";

const sqlite = new Database(".data/blog.sqlite");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

const initialCategories = [
  { slug: "ai", name: "AI", description: "Claude / GPT / Cursor / LLM 工程实践", sortOrder: 1 },
  { slug: "coding", name: "编码笔记", description: "全栈、架构、调试、性能", sortOrder: 2 },
  { slug: "overseas", name: "海外技术", description: "Telegram、Cloudflare、Vercel 与海外生态", sortOrder: 3 },
  { slug: "tools", name: "工具", description: "效率、流程、自动化、生产力", sortOrder: 4 },
  { slug: "notes", name: "随笔", description: "想法、阅读、片段记录", sortOrder: 5 },
];

for (const c of initialCategories) {
  db.insert(schema.categories)
    .values(c)
    .onConflictDoNothing({ target: schema.categories.slug })
    .run();
}

const rows = db.select().from(schema.categories).all();
console.log("categories:", rows.map((r) => r.slug).join(", "));
sqlite.close();
