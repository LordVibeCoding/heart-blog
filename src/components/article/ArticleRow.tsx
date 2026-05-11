import Image from "next/image";
import Link from "next/link";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { ArticleMeta } from "./ArticleMeta";
import { HighlightTitle } from "./HighlightTitle";
import type { Article } from "@/data/types";

/**
 * 列表页主卡片：单列、整宽。模板 layout-normal 风格——
 * 分类小标签在最上 → 大封面图 → 大号两段式标题 → 作者+日期。
 */
export function ArticleRow({
  article,
  priority = false,
}: {
  article: Article;
  priority?: boolean;
}) {
  return (
    <article className="group flex flex-col gap-6">
      <CategoryPill category={article.category} variant="solid" className="self-start" />

      <Link
        href={`/blog/${article.slug}`}
        className="ring-focus relative block aspect-[16/9] w-full overflow-hidden bg-bg-subtle"
      >
        <Image
          src={article.cover}
          alt={article.coverAlt ?? article.title}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 880px, 100vw"
          className="object-cover transition duration-700 ease-smooth group-hover:scale-[1.03]"
        />
      </Link>

      <HighlightTitle
        article={article}
        as="h2"
        size="xl"
        className="max-w-[28ch] balance"
      />

      <p className="max-w-3xl text-fg-muted">{article.excerpt}</p>

      <ArticleMeta article={article} />
    </article>
  );
}
