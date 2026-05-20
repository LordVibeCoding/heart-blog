import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ArticleCard } from "@/components/article/ArticleCard";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { Sidebar } from "@/components/article/Sidebar";
import { Comments } from "@/components/article/Comments";
import { splitTitle } from "@/components/article/HighlightTitle";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getArticleVOBySlug,
  getAdjacentArticles,
  getRelatedArticles,
  listPublishedArticles,
} from "@/db/repo";
import { articleJsonLd } from "@/lib/seo";
import { formatDate, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  // 文章页是 force-dynamic 的；build 阶段 D1 可能未就绪，安全返回 [] 让 Next.js 按需渲染
  try {
    const all = await listPublishedArticles();
    return all.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleVOBySlug(slug);
  if (!article) return {};
  const url = `/blog/${slug}`;
  return {
    title: article.title,
    description: truncate(article.excerpt),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: truncate(article.excerpt),
      images: article.cover ? [{ url: article.cover }] : undefined,
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: truncate(article.excerpt),
      images: article.cover ? [article.cover] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleVOBySlug(slug);
  if (!article) notFound();

  const [{ prev, next }, related] = await Promise.all([
    getAdjacentArticles(slug),
    getRelatedArticles(slug, 3),
  ]);
  const { highlight, tail } = splitTitle(article.title);

  return (
    <article>
      <JsonLd data={articleJsonLd(article)} />

      <div className="divider-rule" />

      <Container className="grid items-start gap-12 py-12 lg:grid-cols-[1fr_340px] lg:gap-0 lg:py-14">
        <div className="min-w-0 lg:border-r lg:border-border lg:pr-14">
          <Link
            href="/blog"
            className="ring-focus inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted transition hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" /> 返回列表
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CategoryPill category={article.category} variant="solid" />
            <time
              dateTime={article.publishedAt}
              className="text-[12px] uppercase tracking-[0.16em] text-fg-subtle"
            >
              {formatDate(article.publishedAt)}
            </time>
            <span className="text-[12px] uppercase tracking-[0.16em] text-fg-subtle">
              · {article.readingMinutes} min read
            </span>
          </div>

          <h1 className="post-title mt-5 text-h1 text-fg-muted [&_.highlight]:text-fg balance">
            <span className="highlight">{highlight}</span>
            {tail && <span> {tail}</span>}
          </h1>

          {article.excerpt && (
            <p className="mt-5 text-lg text-fg-muted">{article.excerpt}</p>
          )}

          <div className="mt-8 flex items-center gap-3">
            {article.author.avatar && (
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div className="text-sm">
              <p className="font-semibold">{article.author.name}</p>
              {article.author.bio && (
                <p className="text-fg-subtle">{article.author.bio}</p>
              )}
            </div>
          </div>

          {article.cover && (
            <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden bg-bg-subtle">
              <Image
                src={article.cover}
                alt={article.coverAlt ?? article.title}
                fill
                priority
                sizes="(min-width: 1024px) 880px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-neutral mt-12 max-w-prose font-serif text-[1.06rem] leading-[1.78] dark:prose-invert prose-headings:font-sans prose-headings:tracking-tight prose-headings:font-semibold prose-a:text-fg prose-a:underline prose-a:underline-offset-4 prose-a:decoration-border prose-a:decoration-2 hover:prose-a:decoration-fg prose-blockquote:border-l-fg prose-blockquote:bg-transparent prose-blockquote:px-5 prose-blockquote:text-fg prose-blockquote:not-italic prose-code:rounded prose-code:bg-bg-subtle prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-bg-subtle prose-pre:text-fg"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />

          {article.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-6 text-sm">
              {article.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tags/${encodeURIComponent(t)}`}
                  className="ring-focus rounded text-fg-muted transition hover:text-fg"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}

          <nav aria-label="上下篇" className="mt-12 border-t border-border pt-12">
            <div className="grid md:grid-cols-2 md:divide-x md:divide-border">
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="ring-focus group bg-bg p-8 transition hover:bg-bg-subtle md:p-10"
                >
                  <p className="eyebrow">← 上一篇</p>
                  <p className="post-title mt-3 text-lg text-fg group-hover:text-fg [&_.highlight]:text-fg">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/blog/${next.slug}`}
                  className="ring-focus group bg-bg p-8 text-right transition hover:bg-bg-subtle md:p-10"
                >
                  <p className="eyebrow">下一篇 →</p>
                  <p className="post-title mt-3 text-lg text-fg group-hover:text-fg [&_.highlight]:text-fg">
                    {next.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </nav>

          <section className="mt-16 border-t border-border pt-12">
            <p className="eyebrow">Comments</p>
            <h2 className="post-title mt-2 text-h2 text-fg [&_.highlight]:text-fg">
              评论
            </h2>
            <p className="mt-3 text-sm text-fg-muted">
              评论使用 GitHub 账号登录，由 Giscus 驱动，数据存于本站仓库的 Discussions。
            </p>
            <div className="mt-8">
              <Comments term={article.slug} />
            </div>
          </section>

          {related.length > 0 && (
            <section className="mt-16 border-t border-border pt-12">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="eyebrow">Related</p>
                  <h2 className="post-title mt-2 text-h2 text-fg [&_.highlight]:text-fg">
                    相关阅读
                  </h2>
                </div>
                <Link
                  href={`/categories/${article.category.slug}`}
                  className="ring-focus inline-flex items-center gap-1 rounded text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted transition hover:text-fg"
                >
                  更多 {article.category.name} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {related.map((a) => (
                  <ArticleCard key={a.slug} article={a} titleSize="md" />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:sticky lg:top-[88px] lg:pl-14">
          <Sidebar />
        </div>
      </Container>
    </article>
  );
}
