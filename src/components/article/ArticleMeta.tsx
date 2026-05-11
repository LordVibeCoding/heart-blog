import { cn, formatDate } from "@/lib/utils";
import type { Article } from "@/data/types";

export function ArticleMeta({
  article,
  className,
  inverted = false,
}: {
  article: Article;
  className?: string;
  inverted?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-[12px] font-medium uppercase tracking-[0.14em]",
        inverted ? "text-white/70" : "text-fg-subtle",
        className,
      )}
    >
      <span>By {article.author.name}</span>
      <span className="mx-2 inline-block h-[3px] w-[3px] translate-y-[-3px] rounded-full bg-current opacity-60" />
      <time dateTime={article.publishedAt} className="normal-case tracking-normal">
        {formatDate(article.publishedAt)}
      </time>
    </p>
  );
}
