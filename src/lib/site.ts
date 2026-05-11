export const site = {
  name: "Heart Blog",
  shortName: "Heart",
  tagline: "想法、笔记、和值得分享的东西",
  description:
    "一个关注科技、设计、与日常思考的资讯博客。记录每一次值得停下来的瞬间。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog.example.com",
  locale: "zh-CN",
  author: {
    name: "Heart",
    email: "hello@example.com",
    url: "/about",
  },
  social: {
    twitter: "@heart",
    github: "https://github.com/LordVibeCoding",
  },
  nav: [
    { label: "首页", href: "/" },
    { label: "博客", href: "/blog" },
    { label: "分类", href: "/categories" },
    { label: "关于", href: "/about" },
  ],
} as const;

export type SiteConfig = typeof site;
