import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { InfiniteArticleList } from "@/components/article/InfiniteArticleList";
import { Sidebar } from "@/components/article/Sidebar";
import { JsonLd } from "@/components/seo/JsonLd";
import { listCategories, listPublishedArticles } from "@/db/repo";
import { listJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "博客",
  description: "全部文章列表 — 按时间倒序。",
  alternates: { canonical: "/blog" },
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const activeCategory = sp.category;

  const [allArticles, categories] = await Promise.all([
    listPublishedArticles(),
    listCategories(),
  ]);

  const activeCategoryName = activeCategory
    ? (categories.find((c) => c.slug === activeCategory)?.name ?? activeCategory)
    : null;

  const filtered = activeCategory
    ? allArticles.filter((a) => a.category.slug === activeCategory)
    : allArticles;

  const BASE = site.url.replace(/\/$/, "");
  const breadcrumb = activeCategoryName
    ? [
        { name: "首页", url: `${BASE}/` },
        { name: "博客", url: `${BASE}/blog` },
        { name: activeCategoryName, url: `${BASE}/blog?category=${activeCategory}` },
      ]
    : [
        { name: "首页", url: `${BASE}/` },
        { name: "博客", url: `${BASE}/blog` },
      ];

  const schemas = listJsonLd({
    url: activeCategory ? `/blog?category=${activeCategory}` : "/blog",
    name: activeCategoryName ? `${activeCategoryName} · 博客` : "全部文章",
    description: activeCategoryName
      ? `「${activeCategoryName}」分类下的全部文章`
      : "按时间倒序排列的全部文章。",
    breadcrumb,
  });

  return (
    <>
      <JsonLd data={schemas} />
      <div className="divider-rule" />

      <Container className="grid items-start gap-12 py-12 lg:grid-cols-[1fr_340px] lg:gap-0 lg:py-14">
        <div className="lg:border-r lg:border-border lg:pr-14">
          <div className="mb-8 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg">
            <span aria-hidden className="text-fg">»</span>
            {activeCategoryName ? (
              <span>
                <Link href="/blog" className="text-fg-muted hover:text-fg">
                  分类
                </Link>
                <span className="mx-2 text-fg-subtle">:</span>
                <span>{activeCategoryName}</span>
              </span>
            ) : (
              <span>所有文章</span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="border border-dashed border-border p-14 text-center text-fg-muted">
              {activeCategory
                ? "该分类下暂无文章。"
                : "还没有文章。登录后台开始写第一篇。"}
            </div>
          ) : (
            <InfiniteArticleList articles={filtered} />
          )}

          {!activeCategory && categories.length > 0 && (
            <div className="mt-16 border-t border-border pt-6">
              <p className="eyebrow mb-4">浏览分类</p>
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/blog?category=${c.slug}`}
                      className="ring-focus rounded text-sm font-semibold uppercase tracking-[0.16em] text-fg-muted transition hover:text-fg"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-[88px] lg:pl-14">
          <Sidebar />
        </div>
      </Container>
    </>
  );
}
