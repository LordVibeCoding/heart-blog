import type { Metadata } from "next";
import { Github, Rss, Mail, Send, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { site } from "@/lib/site";

const REPO_URL = "https://github.com/LordVibeCoding/heart-blog";

export const metadata: Metadata = {
  title: "关于",
  description: `关于 ${site.name}：${site.tagline}`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <div className="divider-rule" />

      <Container className="py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">About</p>
          <h1 className="post-title mt-3 text-h1 text-fg [&_.highlight]:text-fg balance">
            <span className="highlight">关于</span> 这个博客
          </h1>

          <p className="mt-8 text-lg leading-relaxed text-fg-muted">
            {site.name} 用来记录 <strong className="text-fg">AI 编码</strong>（Claude、Cursor、GPT）、
            <strong className="text-fg"> 海外技术</strong>（Telegram、Cloudflare、独立开发），
            以及一线工程实战的笔记。
          </p>

          {/* 开源信息卡 */}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="ring-focus group mt-12 flex items-center justify-between gap-6 border border-border bg-bg-subtle p-6 text-left transition hover:border-fg lg:p-8"
          >
            <div className="min-w-0">
              <p className="eyebrow text-fg-subtle">Open Source</p>
              <p className="mt-3 font-sans text-xl font-bold tracking-tight">
                LordVibeCoding / heart-blog
              </p>
              <p className="mt-2 text-sm text-fg-muted">
                整个博客的源码完全开源（MIT），跑在 Cloudflare Workers + D1 + R2 上。欢迎 Star / Fork / 提 Issue。
              </p>
            </div>
            <ArrowUpRight className="h-6 w-6 flex-shrink-0 text-fg-muted transition group-hover:translate-x-1 group-hover:translate-y-[-2px] group-hover:text-fg" />
          </a>

          {/* 联系方式 */}
          <ul className="mx-auto mt-10 divide-y divide-border border-y border-border text-sm">
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="ring-focus group flex items-center justify-between py-4 hover:text-accent"
              >
                <span className="inline-flex items-center gap-3 font-medium">
                  <Github className="h-4 w-4" /> GitHub
                </span>
                <span className="text-fg-subtle">@LordVibeCoding</span>
              </a>
            </li>
            <li>
              <a
                href={site.social.telegram}
                target="_blank"
                rel="noreferrer"
                className="ring-focus group flex items-center justify-between py-4 hover:text-accent"
              >
                <span className="inline-flex items-center gap-3 font-medium">
                  <Send className="h-4 w-4" /> Telegram
                </span>
                <span className="text-fg-subtle">t.me/lever</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.author.email}`}
                className="ring-focus group flex items-center justify-between py-4 hover:text-accent"
              >
                <span className="inline-flex items-center gap-3 font-medium">
                  <Mail className="h-4 w-4" /> 邮箱联系
                </span>
                <span className="text-fg-subtle">{site.author.email}</span>
              </a>
            </li>
            <li>
              <a
                href="/rss.xml"
                className="ring-focus group flex items-center justify-between py-4 hover:text-accent"
              >
                <span className="inline-flex items-center gap-3 font-medium">
                  <Rss className="h-4 w-4" /> RSS
                </span>
                <span className="text-fg-subtle">/rss.xml</span>
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </>
  );
}
