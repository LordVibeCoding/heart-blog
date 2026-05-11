"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Keyboard, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ArticleCard } from "./ArticleCard";
import type { Article } from "@/data/types";

import "swiper/css";
import "swiper/css/navigation";

export function PostsSlider({ articles }: { articles: Article[] }) {
  return (
    <div className="posts-slider relative">
      <Swiper
        modules={[Autoplay, Keyboard, Navigation]}
        spaceBetween={40}
        slidesPerView={1.1}
        breakpoints={{
          640: { slidesPerView: 2.2, spaceBetween: 32 },
          1024: { slidesPerView: 3, spaceBetween: 40 },
          1440: { slidesPerView: 4, spaceBetween: 40 },
        }}
        navigation={{
          prevEl: ".posts-slider-prev",
          nextEl: ".posts-slider-next",
        }}
        keyboard={{ enabled: true }}
        a11y={{ prevSlideMessage: "上一组", nextSlideMessage: "下一组" }}
      >
        {articles.map((a) => (
          <SwiperSlide key={a.slug}>
            <ArticleCard article={a} titleSize="md" />
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        type="button"
        aria-label="上一组"
        className="posts-slider-prev ring-focus absolute -top-14 right-12 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-fg-muted transition hover:border-fg hover:text-fg disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="下一组"
        className="posts-slider-next ring-focus absolute -top-14 right-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-fg-muted transition hover:border-fg hover:text-fg disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
