import Image from "next/image";
import { Link } from "next-view-transitions";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { ArticleMeta } from "./ArticleMeta";
import { splitTitle } from "./HighlightTitle";
import type { Article } from "@/data/types";
import { cn } from "@/lib/utils";

/** 独立单卡：自己的封面、自己的文字，与 HeroGridHover 等高并排。 */
export function HeroSide({
  article,
  className,
}: {
  article: Article;
  className?: string;
}) {
  const { highlight, tail } = splitTitle(article.title);

  return (
    <Link
      href={`/blog/${article.slug}`}
      className={cn(
        "group relative isolate flex h-full min-h-[520px] flex-col justify-end overflow-hidden bg-[#0c0c0d] p-7 text-white md:p-9",
        className,
      )}
    >
      <Image
        src={article.cover}
        alt={article.coverAlt ?? article.title}
        fill
        priority
        sizes="(min-width: 1024px) 25vw, 100vw"
        className="-z-10 object-cover transition duration-700 ease-smooth group-hover:scale-[1.04]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/35" />

      <CategoryPill
        category={article.category}
        variant="solid"
        className="self-start !bg-white !text-[#0c0c0d]"
      />
      <h3 className="post-title mt-5 max-w-[20ch] text-[22px] leading-[1.06] tracking-tight text-white/70 md:text-[28px] [&_.highlight]:text-white">
        <span className="highlight">{highlight}</span>
        {tail && <span> {tail}</span>}
      </h3>
      <ArticleMeta article={article} inverted className="mt-5" />
    </Link>
  );
}
