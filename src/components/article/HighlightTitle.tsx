import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";
import type { Article } from "@/data/types";

type Size = "sm" | "md" | "lg" | "xl" | "2xl";

const sizeClass: Record<Size, string> = {
  sm: "text-base leading-[1.18]",
  md: "text-lg leading-[1.14]",
  lg: "text-[22px] leading-[1.1]",
  xl: "text-[28px] leading-[1.06] sm:text-[30px]",
  "2xl": "text-h1",
};

export function HighlightTitle({
  article,
  as: Tag = "h3",
  size = "lg",
  className,
  hover = true,
  inverted = false,
  href,
}: {
  article: Article;
  as?: "h1" | "h2" | "h3" | "h4";
  size?: Size;
  className?: string;
  hover?: boolean;
  inverted?: boolean;
  href?: string;
}) {
  const link = href ?? `/blog/${article.slug}`;
  const { highlight, tail } = splitTitle(article.title);

  const titleClass = cn(
    "post-title",
    sizeClass[size],
    inverted && "text-white/70 [&_.highlight]:text-white",
    className,
  );

  return (
    <Tag className={titleClass}>
      {hover ? (
        <Link href={link} className="ring-focus rounded transition">
          <span className="highlight">{highlight}</span>
          {tail && <span> {tail}</span>}
        </Link>
      ) : (
        <>
          <span className="highlight">{highlight}</span>
          {tail && <span> {tail}</span>}
        </>
      )}
    </Tag>
  );
}

/** 把标题按"前 ~55% 字符 + 第一个空格回退"切两段，模板的副标题感由此而来。 */
export function splitTitle(title: string): { highlight: string; tail: string } {
  const trimmed = title.trim();
  if (trimmed.length <= 14) return { highlight: trimmed, tail: "" };

  const target = Math.floor(trimmed.length * 0.55);
  // 在 target 附近找最近的空格，避免切断词
  let cut = trimmed.indexOf(" ", target);
  if (cut === -1 || cut > trimmed.length - 6) {
    cut = trimmed.lastIndexOf(" ", target);
  }
  if (cut === -1) {
    return { highlight: trimmed.slice(0, target), tail: trimmed.slice(target) };
  }
  return { highlight: trimmed.slice(0, cut), tail: trimmed.slice(cut + 1) };
}
