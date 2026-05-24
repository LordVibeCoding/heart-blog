import { Link } from "next-view-transitions";
import { ArticleCard } from "./ArticleCard";
import type { Article, Category } from "@/data/types";

/**
 * 单分类专区：分类标题（带细线）+ 1 大图主卡 + N 篇紧凑列表
 */
export function CategorySpotlight({
  category,
  articles,
}: {
  category: Category;
  articles: Article[];
}) {
  const [hero, ...rest] = articles;
  if (!hero) return null;

  return (
    <section>
      <div className="mb-6 flex items-end justify-between border-b border-border pb-3">
        <h3 className="font-sans text-[18px] font-bold tracking-tight">
          <Link
            href={`/categories/${category.slug}`}
            className="ring-focus rounded transition hover:text-accent"
          >
            <span className="mr-2 inline-block h-2.5 w-2.5 -translate-y-[2px] bg-fg" />
            {category.name}
          </Link>
        </h3>
        <Link
          href={`/categories/${category.slug}`}
          className="ring-focus rounded text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-subtle transition hover:text-fg"
        >
          更多 →
        </Link>
      </div>

      <ArticleCard article={hero} titleSize="md" />

      {rest.length > 0 && (
        <ul className="mt-6 space-y-5 divide-y divide-border [&>li:not(:first-child)]:pt-5">
          {rest.map((a) => (
            <li key={a.slug}>
              <ArticleCard article={a} layout="compact" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
