import Image from "next/image";
import { Link } from "next-view-transitions";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { ArticleMeta } from "./ArticleMeta";
import { HighlightTitle } from "./HighlightTitle";
import type { Article } from "@/data/types";
import { cn } from "@/lib/utils";

type Layout = "vertical" | "horizontal" | "compact";
type TitleSize = "sm" | "md" | "lg" | "xl";

export function ArticleCard({
  article,
  layout = "vertical",
  titleSize = "lg",
  priority = false,
}: {
  article: Article;
  layout?: Layout;
  titleSize?: TitleSize;
  priority?: boolean;
}) {
  if (layout === "compact") return <CompactCard article={article} />;

  const horizontal = layout === "horizontal";

  return (
    <article className={cn("group flex gap-5", horizontal ? "flex-row" : "flex-col")}>
      <Link
        href={`/blog/${article.slug}`}
        className={cn(
          "ring-focus relative block overflow-hidden bg-bg-subtle",
          horizontal
            ? "aspect-[4/3] w-[40%] flex-shrink-0 sm:w-[44%]"
            : "aspect-[16/10] w-full",
        )}
      >
        <Image
          src={article.cover}
          alt={article.coverAlt ?? article.title}
          fill
          priority={priority}
          sizes={
            horizontal
              ? "(min-width: 1024px) 240px, 40vw"
              : "(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
          }
          className="object-cover transition duration-700 ease-smooth group-hover:scale-[1.04]"
        />
      </Link>

      <div className={cn("flex flex-col", horizontal && "flex-1 justify-center")}>
        <CategoryPill category={article.category} variant="minimal" className="mb-2.5" />

        <HighlightTitle
          article={article}
          size={titleSize}
          className="mb-3 balance"
        />

        {!horizontal && (
          <p className="line-clamp-2 text-sm text-fg-muted">{article.excerpt}</p>
        )}

        <ArticleMeta article={article} className="mt-3" />
      </div>
    </article>
  );
}

function CompactCard({ article }: { article: Article }) {
  return (
    <article className="group flex items-start gap-4">
      <Link
        href={`/blog/${article.slug}`}
        className="ring-focus relative aspect-[4/3] w-28 flex-shrink-0 overflow-hidden bg-bg-subtle"
      >
        <Image
          src={article.cover}
          alt={article.title}
          fill
          sizes="112px"
          className="object-cover transition group-hover:scale-105"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <CategoryPill category={article.category} variant="minimal" className="mb-1.5" />
        <HighlightTitle article={article} size="sm" className="line-clamp-3" />
      </div>
    </article>
  );
}
