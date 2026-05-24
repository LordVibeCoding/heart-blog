import Image from "next/image";
import { Link } from "next-view-transitions";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { ArticleMeta } from "./ArticleMeta";
import { splitTitle } from "./HighlightTitle";
import type { Article } from "@/data/types";
import { cn } from "@/lib/utils";

/**
 * 三列共用一张大图的 hover 切换组件。
 * 大图铺满整个组件宽，鼠标移到 N 列时切换成第 N 篇文章的封面。
 */
export function HeroGridHover({
  articles,
  className,
}: {
  articles: Article[];
  className?: string;
}) {
  const slides = articles.slice(0, 3);

  return (
    <section
      className={cn(
        "hero-grid relative isolate h-full w-full overflow-hidden bg-[#0c0c0d]",
        className,
      )}
      aria-label="编辑推荐"
    >
      {/* 共享底图层：N 张图叠在一起，全幅铺满，opacity 切换 */}
      <div aria-hidden className="absolute inset-0 z-0">
        {slides.map((a) => (
          <div key={a.slug} className="hero-bg absolute inset-0 transition-opacity duration-500">
            <Image
              src={a.cover}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 75vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
          </div>
        ))}
      </div>

      {/* 三列文字层 */}
      <div className="relative z-10 grid h-full grid-cols-1 md:grid-cols-3">
        {slides.map((article) => (
          <Tile key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}

function Tile({ article }: { article: Article }) {
  const { highlight, tail } = splitTitle(article.title);
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="hero-tile relative flex h-full min-h-[520px] flex-col justify-end border-r border-white/25 p-7 text-white last:border-r-0 md:p-9"
    >
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
