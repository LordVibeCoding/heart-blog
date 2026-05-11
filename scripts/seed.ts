import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../src/db/schema";

const sqlite = new Database(".data/blog.sqlite");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

const initialCategories = [
  { slug: "tech", name: "科技", description: "代码、工具、行业观察", sortOrder: 1 },
  { slug: "design", name: "设计", description: "视觉、交互、产品思考", sortOrder: 2 },
  { slug: "life", name: "生活", description: "随笔、旅行、片段", sortOrder: 3 },
  { slug: "reading", name: "阅读", description: "读书、摘抄、回响", sortOrder: 4 },
  { slug: "tools", name: "工具", description: "效率、流程、自动化", sortOrder: 5 },
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
