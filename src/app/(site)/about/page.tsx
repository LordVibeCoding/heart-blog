import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于",
  description: `关于 ${site.name}：${site.tagline}`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="max-w-prose">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-subtle">
          About
        </p>
        <h1 className="mt-3 font-display text-display-xl font-bold tracking-tight">
          关于这个博客
        </h1>
        <div className="prose prose-neutral mt-8 font-serif text-[1.075rem] leading-[1.75] dark:prose-invert">
          <p>
            {site.name} 是一个关注 <strong>科技、设计与日常思考</strong> 的资讯博客。
            它建在 Cloudflare 全家桶上：Workers、D1、R2、KV，前端用 Next.js + Tailwind。
          </p>
          <p>
            我相信好的内容站不需要花活，而是<em>清晰的层级、克制的颜色、稳定的节奏</em>。
            这里的文章会尽量满足这三件事。
          </p>
          <h2>联系</h2>
          <p>
            邮件：<a href={`mailto:${site.author.email}`}>{site.author.email}</a>
          </p>
          <p>
            订阅：<a href="/rss.xml">RSS</a> · <a href="/blog">最新文章</a>
          </p>
        </div>
      </div>
    </Container>
  );
}
