"use client";

import { useEffect, useRef, useState } from "react";
import { ArticleRow } from "./ArticleRow";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/data/types";

const GROUP_SIZE = 7; // 1 大 + 6 小
const INITIAL = GROUP_SIZE;
const STEP = GROUP_SIZE;

export function InfiniteArticleList({ articles }: { articles: Article[] }) {
  const [visible, setVisible] = useState(Math.min(INITIAL, articles.length));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible >= articles.length) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible((v) => Math.min(v + STEP, articles.length));
          }
        }
      },
      { rootMargin: "600px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [visible, articles.length]);

  // 把 0..visible 切成 GROUP_SIZE 一组（1 大 + 6 小）
  const list = articles.slice(0, visible);
  const groups: Article[][] = [];
  for (let i = 0; i < list.length; i += GROUP_SIZE) {
    groups.push(list.slice(i, i + GROUP_SIZE));
  }

  const hasMore = visible < articles.length;

  return (
    <div>
      {groups.map((group, gi) => {
        const [hero, ...rest] = group;
        return (
          <section
            key={gi}
            className={gi > 0 ? "mt-12 border-t border-border pt-12" : ""}
          >
            {hero && (
              <div className="border-b border-border pb-12">
                <ArticleRow article={hero} priority={gi === 0} />
              </div>
            )}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
                {rest.map((a) => (
                  <div key={a.slug} className="bg-bg p-6 md:p-7">
                    <ArticleCard article={a} titleSize="md" />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden
          className="mt-12 flex justify-center py-10"
        >
          <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">
            <span className="loader-dot" />
            <span className="loader-dot loader-dot-delay-1" />
            <span className="loader-dot loader-dot-delay-2" />
            <span className="ml-2">加载更多</span>
          </span>
        </div>
      )}

      {!hasMore && visible > 0 && (
        <p className="mt-16 border-t border-border pt-8 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">
          已显示全部 {articles.length} 篇
        </p>
      )}
    </div>
  );
}
