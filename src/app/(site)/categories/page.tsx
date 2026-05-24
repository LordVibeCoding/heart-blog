import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { listCategories, listByCategory } from "@/db/repo";
import { listJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "分类",
  description: "按主题浏览全部分类。",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await listCategories();
  const lists = await Promise.all(
    categories.map(async (c) => ({
      category: c,
      articles: await listByCategory(c.slug),
    })),
  );

  const BASE = site.url.replace(/\/$/, "");
  const schemas = listJsonLd({
    url: "/categories",
    name: "分类",
    description: "按主题浏览全部分类。",
    breadcrumb: [
      { name: "首页", url: `${BASE}/` },
      { name: "分类", url: `${BASE}/categories` },
    ],
  });

  return (
    <>
      <JsonLd data={schemas} />
      <div className="divider-rule" />

      <Container className="py-12 lg:py-16">
        <div className="mb-10 flex items-start gap-4 md:gap-5">
          <DecorMark />
          <div>
            <p className="eyebrow">Topics</p>
            <h1 className="post-title mt-2 text-h1 text-fg [&_.highlight]:text-fg balance">
              <span className="highlight">按主题</span> 浏览
            </h1>
            <p className="mt-5 max-w-2xl text-fg-muted">
              共 {categories.length} 个分类
            </p>
          </div>
        </div>

        <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {lists.map(({ category, articles }) => (
            <li key={category.slug}>
              <Link
                href={`/categories/${category.slug}`}
                className="ring-focus group flex h-full flex-col justify-between gap-6 bg-bg p-8 transition hover:bg-bg-subtle md:p-10"
              >
                <div>
                  <p className="eyebrow text-fg-subtle">{category.slug}</p>
                  <h2 className="post-title mt-3 text-h2 text-fg [&_.highlight]:text-fg group-hover:text-accent">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="mt-4 max-w-md text-fg-muted">
                      {category.description}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-fg-muted">
                  {articles.length} 篇 →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}

function DecorMark() {
  return (
    <svg
      aria-hidden
      width="38"
      height="36"
      viewBox="0 0 14 13"
      fill="currentColor"
      className="mt-3 hidden flex-shrink-0 text-fg md:block"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0H4.53968L8.35714 6.5L4.53968 13H0L3.81746 6.5L0 0ZM7.5 0H10.2857L14 6.5L10.2857 13H7.5L11.2143 6.5L7.5 0Z"
      />
    </svg>
  );
}
