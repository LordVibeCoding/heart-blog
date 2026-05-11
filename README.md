<div align="center">

# Heart Blog

**一套跑在 Cloudflare 上、克制而精致的资讯博客系统**

零服务器 · 全栈 TypeScript · 边缘部署 · 完整 SEO

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20%2B%20D1%20%2B%20R2-F38020?style=flat-square&logo=cloudflare)](https://cloudflare.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#-license)

</div>

---

## ✨ 它是什么

一个**完整可发布**的资讯博客 — 不是 starter，是落地版本。

- 前台：杂志感首页（hover 切图大图 + 横向轮播 + 多分类专区）、无限滚动列表、长文阅读、暗色模式
- 后台：登录 → 富文本写文章（Tiptap）→ 粘贴/拖拽图片自动上传 → 一键发布
- 数据：Cloudflare D1 + Drizzle ORM，文章/分类/标签/媒体一应俱全
- SEO：JSON-LD、动态 OG 图、sitemap、RSS、Breadcrumb、Article 全套结构化数据
- 部署：**零长进程服务器**，全部跑在 Cloudflare Workers 边缘节点

## 🎯 设计哲学

**克制高级**。三种颜色（黑 / 白 / 灰），紧凑字号（H1 ~45px），杂志副标题感的两段式标题，没有圆角和阴影狂欢，没有 13 种渐变。把视觉做轻、把内容做重。

## 🚀 特性一览

### 前端
- **Hero Grid Hover** — 整张大图分 3 列分隔，hover 哪列大图切到哪篇
- **资讯杂志布局** — 横向 Posts Slider、三栏 Aside Stack、分类专区
- **无限滚动列表** — 1 篇大卡 + 6 篇网格，循环加载
- **粘性侧栏** — 跟随滚动，自动隐藏滚动条
- **两段式标题** — 模板 Sport News 同款 `.highlight` + 弱色尾段
- **暗色模式** — Header 切换 + 跟随系统
- **响应式** — 移动端到 1720px 大屏全适配
- **Cmd+K 搜索** — MiniSearch 客户端全文，fuzzy + prefix
- **Giscus 评论** — GitHub 账号登录，零后端

### 后台
- **PBKDF2 + iron-session 认证** — Workers 兼容，零数据库依赖（账号走 env）
- **Tiptap 富文本编辑器** — 工具栏 + Markdown 快捷输入
- **粘贴/拖拽自动上传图片** — 截图 ⌘V 即可，自动写 R2
- **粘贴图片 URL 自动转 `<img>`**
- **摘要自动提取** — 留空时从正文首段取前 200 字
- **封面自动提取** — 留空时取正文第一张图
- **拼音 slug 自动生成** — 中文标题 → URL 友好的 kebab-case
- **分类 CRUD** — 行内编辑
- **草稿 / 已发布**双状态

### SEO（2026 真实有效的项）
- WebSite + SearchAction（Google 站内搜索框）
- Organization + Person
- BreadcrumbList（每页面包屑）
- BlogPosting 完整字段（wordCount、articleBody、inLanguage、isAccessibleForFree）
- 动态 OG 图（站点 + 每篇文章）
- sitemap.xml / robots.txt / rss.xml / manifest.webmanifest
- 自定义 not-found（真 404，避免软 404）
- preconnect 评论域名，加速 INP
- 紧凑字号、字体 swap、图片 lazy + width/height（防 CLS）

## 🧱 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16（App Router，webpack 引擎）|
| UI | Tailwind v3 · Instrument Sans / Roboto Slab · lucide-react · Swiper |
| 编辑器 | Tiptap 3 + StarterKit + Image + Link + Placeholder |
| 数据库 | Cloudflare D1（生产）/ better-sqlite3（本地）|
| ORM | Drizzle |
| 存储 | Cloudflare R2 |
| 认证 | iron-session + PBKDF2-SHA256 |
| 搜索 | MiniSearch（客户端） |
| 评论 | Giscus |
| 部署 | `@opennextjs/cloudflare` → Cloudflare Workers |
| 验证 | Zod |

## 📦 快速开始

```bash
git clone https://github.com/LordVibeCoding/heart-blog.git
cd heart-blog
pnpm install

# 1. 生成管理员密码哈希 + Session secret
node scripts/hash-password.mjs 'your-strong-password'
# 把输出粘到 .env.local（参考 .env.example）

# 2. 建本地数据库 + 灌入分类
pnpm db:migrate:local
pnpm db:seed

# 3. 跑起来
pnpm dev
```

打开 http://localhost:3000

后台：http://localhost:3000/admin

## ⚙️ 配置

复制 `.env.example` 为 `.env.local`：

```env
# 基础
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME="Heart Blog"

# 管理员（用 scripts/hash-password.mjs 生成）
ADMIN_USERNAME=admin
ADMIN_PASSWORD_ITER=200000
ADMIN_PASSWORD_SALT=...
ADMIN_PASSWORD_HASH=...
SESSION_SECRET=...

# 评论（可选；不配会显示占位）
NEXT_PUBLIC_GISCUS_REPO=user/repo
NEXT_PUBLIC_GISCUS_REPO_ID=R_kgDO...
NEXT_PUBLIC_GISCUS_CATEGORY=General
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_kwDO...

# 生产 R2 公开域名（CF dashboard 配 custom domain）
NEXT_PUBLIC_R2_PUBLIC_URL=https://media.your-domain.com
```

## ☁️ 部署到 Cloudflare

```bash
# 1. 创建 D1 数据库
wrangler d1 create blog
# 把生成的 database_id 写进 wrangler.toml

# 2. 应用迁移到远程 D1
pnpm db:migrate:remote

# 3. 创建 R2 bucket
wrangler r2 bucket create blog-media

# 4. 在 CF dashboard 添加 secrets（不要走 env file）
wrangler secret put ADMIN_PASSWORD_HASH
wrangler secret put ADMIN_PASSWORD_SALT
wrangler secret put SESSION_SECRET

# 5. 构建并部署
pnpm cf:deploy
```

## 🧬 API（用于自动化发文章）

最小载荷一行命令发文章：

```bash
curl -X POST https://your-domain.com/api/admin/articles \
  -H "Cookie: blog_session=<your-session>" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "auto-post-1",
    "title": "自动发的文章",
    "bodyHtml": "<p>正文</p><img src=\"...\">",
    "categorySlug": "tech",
    "tags": ["test"]
  }'
```

未传字段自动补默认：
- `excerpt` → 正文首段前 200 字
- `cover` → 正文第一张 `<img>`
- `status` → `published`
- `featured` → `false`
- `readingMinutes` → 按字数自动算

## 🗂 项目结构

```
src/
├── app/
│   ├── (site)/              前台（首页 / 列表 / 详情 / 关于）
│   ├── admin/
│   │   ├── (protected)/     登录后访问（仪表板 / 文章 / 分类）
│   │   └── login/
│   ├── api/
│   │   ├── admin/           文章 / 分类 / 上传 CRUD
│   │   ├── auth/            login / logout
│   │   └── search-index/
│   ├── sitemap.ts robots.ts rss.xml/  SEO
│   └── manifest.ts opengraph-image.tsx not-found.tsx
├── components/
│   ├── article/             ArticleCard / HeroGridHover / Sidebar / ...
│   ├── admin/               ArticleForm / RichEditor (Tiptap)
│   ├── search/              SearchDialog / SearchTrigger
│   ├── layout/              SiteHeader / SiteFooter / Container
│   └── seo/                 JsonLd
├── db/
│   ├── schema.ts            Drizzle schema (articles/categories/tags/media)
│   ├── client.ts            D1 / better-sqlite3 双驱动
│   └── repo.ts              数据访问层
└── lib/
    ├── auth.ts site.ts seo.ts upload.ts content.ts fonts.ts utils.ts
```

## 🔐 安全

- 密码 PBKDF2-SHA256 + 16B salt + 20 万次迭代
- 密码哈希仅存 env，永不入库 / 入日志
- iron-session 加密 cookie（HttpOnly + Secure + SameSite=Lax）
- 时序安全密码比较
- 登录速率限制（每 IP 5 次 / 分钟）
- 所有 admin API 鉴权 + Zod 输入校验
- 上传白名单（image/* 6 种格式，15MB 上限）
- 评论走 GitHub OAuth（Giscus）— 不存储邮箱密码

## 📜 License

MIT © [LordVibeCoding](https://github.com/LordVibeCoding)

---

<div align="center">
  <sub>Built with restraint on <a href="https://cloudflare.com">Cloudflare</a>.</sub>
</div>
