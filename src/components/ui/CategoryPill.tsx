import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";
import type { Category } from "@/data/types";

type Variant = "solid" | "outline" | "ghost" | "minimal";

export function CategoryPill({
  category,
  variant = "minimal",
  className,
}: {
  category: Category;
  variant?: Variant;
  className?: string;
}) {
  const styles: Record<Variant, string> = {
    solid: "bg-fg text-bg",
    outline: "border border-border-strong text-fg hover:border-fg",
    ghost: "bg-bg-subtle text-fg-muted hover:bg-fg hover:text-bg",
    minimal: "text-fg-muted hover:text-fg",
  };

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "ring-focus inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.18em] transition",
        variant !== "minimal" && "rounded-full px-2.5 py-1",
        styles[variant],
        className,
      )}
    >
      {category.name}
    </Link>
  );
}
