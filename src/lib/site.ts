/** 站点默认值。所有这些字段都可以在 /admin/settings 后台覆盖。 */
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

/* ---------- 后台可覆盖的运行时配置 ---------- */

import { getAllSettings } from "@/db/repo";

export const SITE_SETTING_KEYS = [
  "site_name",
  "site_short_name",
  "site_tagline",
  "site_description",
  "site_keywords",
  "site_favicon",
  "site_author_name",
  "site_author_email",
  "site_social_github",
  "site_social_telegram",
  "site_social_twitter",
  // Promo Banner（已有）
  "promo_banner_image",
  "promo_banner_eyebrow",
  "promo_banner_title",
  "promo_banner_description",
  "promo_banner_cta_label",
  "promo_banner_cta_href",
] as const;

export type ResolvedSite = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  keywords: string[];
  favicon: string;
  url: string;
  locale: string;
  author: { name: string; email: string; url: string };
  social: { twitter: string; github: string; telegram: string };
  nav: typeof site.nav;
};

/** 服务端：合并默认值 + D1 settings，返回最终生效的站点配置。 */
export async function getSiteConfig(): Promise<ResolvedSite> {
  let s: Record<string, string> = {};
  try {
    s = await getAllSettings();
  } catch {
    // D1 不可用时回落到默认
  }
  const pickKeywords = (v: string | undefined): string[] => {
    if (!v) return [...site.keywords];
    return v
      .split(/[,，;；\n]/)
      .map((t) => t.trim())
      .filter(Boolean);
  };
  return {
    name: s.site_name?.trim() || site.name,
    shortName: s.site_short_name?.trim() || site.shortName,
    tagline: s.site_tagline?.trim() || site.tagline,
    description: s.site_description?.trim() || site.description,
    keywords: pickKeywords(s.site_keywords),
    favicon: s.site_favicon?.trim() || "/favicon.svg",
    url: site.url,
    locale: site.locale,
    author: {
      name: s.site_author_name?.trim() || site.author.name,
      email: s.site_author_email?.trim() || site.author.email,
      url: site.author.url,
    },
    social: {
      github: s.site_social_github?.trim() || site.social.github,
      telegram: s.site_social_telegram?.trim() || site.social.telegram,
      twitter: s.site_social_twitter?.trim() || site.social.twitter,
    },
    nav: site.nav,
  };
}
