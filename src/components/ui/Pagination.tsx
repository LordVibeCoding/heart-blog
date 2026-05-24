import { Link } from "next-view-transitions";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const href = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);
  const items = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="分页"
      className="mt-14 flex items-center justify-between border-t border-border pt-6"
    >
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "ring-focus inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition",
          page === 1 ? "pointer-events-none opacity-30" : "text-fg-muted hover:text-fg",
        )}
      >
        <ChevronLeft className="h-4 w-4" /> 上一页
      </Link>

      <ul className="flex items-center gap-1">
        {items.map((n) => (
          <li key={n}>
            <Link
              href={href(n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "ring-focus inline-flex h-9 w-9 items-center justify-center text-[13px] font-semibold transition",
                n === page
                  ? "bg-fg text-bg"
                  : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
              )}
            >
              {n}
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href={href(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "ring-focus inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition",
          page === totalPages
            ? "pointer-events-none opacity-30"
            : "text-fg-muted hover:text-fg",
        )}
      >
        下一页 <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
