"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Keyboard, Navigation, Pagination } from "swiper/modules";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryPill } from "@/components/ui/CategoryPill";
import { ArticleMeta } from "./ArticleMeta";
import { splitTitle } from "./HighlightTitle";
import type { Article } from "@/data/types";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export function HeroSlider({ articles }: { articles: Article[] }) {
  return (
    <div className="hero-slider relative isolate">
      <Swiper
        modules={[Autoplay, EffectFade, Keyboard, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop
        keyboard={{ enabled: true }}
        speed={700}
        navigation={{
          prevEl: ".hero-slider-prev",
          nextEl: ".hero-slider-next",
        }}
        pagination={{
          el: ".hero-slider-pagination",
          clickable: true,
          bulletClass: "hero-bullet",
          bulletActiveClass: "hero-bullet-active",
        }}
        className="!overflow-hidden"
        a11y={{ prevSlideMessage: "上一张", nextSlideMessage: "下一张" }}
      >
        {articles.map((article, idx) => {
          const { highlight, tail } = splitTitle(article.title);
          return (
            <SwiperSlide key={article.slug} className="!h-auto">
              <article className="group relative isolate aspect-[16/10] w-full overflow-hidden bg-bg-subtle md:aspect-[3/2]">
                <Link href={`/blog/${article.slug}`} className="block h-full">
                  <Image
                    src={article.cover}
                    alt={article.coverAlt ?? article.title}
                    fill
                    priority={idx === 0}
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    className="object-cover transition duration-[1200ms] ease-smooth group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <CategoryPill category={article.category} variant="solid" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                        编辑推荐
                      </span>
                    </div>

                    <h2 className="post-title mt-4 max-w-3xl text-[30px] leading-[1.05] tracking-tight text-white/75 md:text-[42px] [&_.highlight]:text-white">
                      <span className="highlight">{highlight}</span>
                      {tail && <span> {tail}</span>}
                    </h2>

                    <p className="mt-3 hidden max-w-2xl text-white/75 md:block">
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
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* 控件：左右箭头 + 底部圆点指示器 */}
      <button
        type="button"
        aria-label="上一张"
        className="hero-slider-prev ring-focus absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 md:left-5"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="下一张"
        className="hero-slider-next ring-focus absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25 md:right-5"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        aria-label="幻灯片导航"
        className="hero-slider-pagination absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2 md:bottom-5"
      />

      <style jsx global>{`
        .hero-slider .hero-bullet {
          width: 28px;
          height: 3px;
          background: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: background 0.3s ease, width 0.3s ease;
          display: inline-block;
        }
        .hero-slider .hero-bullet-active {
          background: #ffffff;
          width: 56px;
        }
      `}</style>
    </div>
  );
}
