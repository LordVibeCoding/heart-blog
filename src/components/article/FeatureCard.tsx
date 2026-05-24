import Image from "next/image";
import { Link } from "next-view-transitions";
import { ArrowUpRight } from "lucide-react";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { ArticleMeta } from "./ArticleMeta";
import { splitTitle } from "./HighlightTitle";
import type { Article } from "@/data/types";

export function FeatureCard({ article }: { article: Article }) {
  const { highlight, tail } = splitTitle(article.title);

  return (
    <article className="group relative isolate overflow-hidden bg-bg-subtle">
      <Link href={`/blog/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] w-full md:aspect-[3/2]">
          <Image
            src={article.cover}
            alt={article.coverAlt ?? article.title}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover transition duration-700 ease-smooth group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <CategoryPill category={article.category} variant="solid" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              编辑推荐
            </span>
          </div>

          <h2 className="post-title mt-4 max-w-3xl text-[34px] leading-[1.05] tracking-tight text-white/75 md:text-[42px] [&_.highlight]:text-white">
            <span className="highlight">{highlight}</span>
            {tail && <span> {tail}</span>}
          </h2>

          <p className="mt-3 hidden max-w-2xl text-white/75 md:block md:text-base">
            {article.excerpt}
          </p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <ArticleMeta article={article} inverted />
            <span className="hidden items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.16em] sm:inline-flex">
              阅读 <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
