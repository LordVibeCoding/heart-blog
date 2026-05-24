import { Link } from "next-view-transitions";

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="面包屑">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">
        {items.map((it, i) => (
          <li key={`${it.label}-${i}`} className="inline-flex items-center gap-2">
            {i > 0 && <span aria-hidden>/</span>}
            {it.href ? (
              <Link href={it.href} className="ring-focus rounded transition hover:text-fg">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
