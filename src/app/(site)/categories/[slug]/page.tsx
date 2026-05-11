import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { InfiniteArticleList } from "@/components/article/InfiniteArticleList";
import { Sidebar } from "@/components/article/Sidebar";
import { JsonLd } from "@/components/seo/JsonLd";
import { listCategories, listByCategory } from "@/db/repo";
import { listJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cats = await listCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: `${cat.name} · 分类`,
    description: cat.description ?? `「${cat.name}」分类下的全部文章`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const cats = await listCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  const articles = await listByCategory(slug);
  const BASE = site.url.replace(/\/$/, "");
  const schemas = listJsonLd({
    url: `/categories/${slug}`,
    name: `${cat.name} · 分类`,
    description: cat.description ?? `「${cat.name}」分类下的全部文章`,
    breadcrumb: [
      { name: "首页", url: `${BASE}/` },
      { name: "分类", url: `${BASE}/categories` },
      { name: cat.name, url: `${BASE}/categories/${slug}` },
    ],
  });

  return (
    <>
      <JsonLd data={schemas} />
      <div className="divider-rule" />

      <Container className="grid items-start gap-12 py-12 lg:grid-cols-[1fr_340px] lg:gap-0 lg:py-14">
        <div className="lg:border-r lg:border-border lg:pr-14">
          <div className="mb-8 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg">
            <span aria-hidden className="text-fg">»</span>
            <Link href="/categories" className="text-fg-muted hover:text-fg">
              分类
            </Link>
            <span className="mx-2 text-fg-subtle">:</span>
            <span>{cat.name}</span>
          </div>

          {cat.description && (
            <p className="mb-10 max-w-2xl text-fg-muted">{cat.description}</p>
          )}

          {articles.length === 0 ? (
            <div className="border border-dashed border-border p-14 text-center text-fg-muted">
              该分类下暂无文章。
            </div>
          ) : (
            <InfiniteArticleList articles={articles} />
          )}

          <div className="mt-16 border-t border-border pt-6">
            <p className="eyebrow mb-4">其他分类</p>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {cats
                .filter((c) => c.slug !== slug)
                .map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/categories/${c.slug}`}
                      className="ring-focus rounded text-sm font-semibold uppercase tracking-[0.16em] text-fg-muted transition hover:text-fg"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="lg:sticky lg:top-[88px] lg:pl-14">
          <Sidebar />
        </div>
      </Container>
    </>
  );
}
