export const site = {
  name: "LordVibeCoding'blog",
  shortName: "LVC",
  tagline: "AI 编码笔记 · 海外技术 · 工程实战",
  description:
    "LordVibeCoding 的编码笔记。分享 AI 工程实践、Claude / Cursor / GPT 用法、海外技术资讯（Telegram、Cloudflare、Vercel、独立开发），以及一线落地经验。",
  /** SEO 关键词（meta keywords，部分搜索引擎仍参考；同时输入 OG/Twitter） */
  keywords: [
    "AI 编码", "Claude Code", "Cursor", "GPT", "LLM",
    "Next.js", "Cloudflare", "edge", "serverless", "全栈",
    "Telegram", "海外技术", "独立开发", "indie hacker",
    "编程笔记", "工程实战", "AI agent",
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://okl.la",
  locale: "zh-CN",
  author: {
    name: "LordVibeCoding",
    email: "admin@okl.la",
    url: "/about",
  },
  social: {
    twitter: "@LordVibeCoding",
    github: "https://github.com/LordVibeCoding",
    telegram: "https://t.me/lever",
  },
  nav: [
    { label: "首页", href: "/" },
    { label: "博客", href: "/blog" },
    { label: "分类", href: "/categories" },
    { label: "关于", href: "/about" },
  ],
} as const;

export type SiteConfig = typeof site;
