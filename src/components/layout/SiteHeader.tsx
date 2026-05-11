import Link from "next/link";
import { Container } from "./Container";
import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";
import { SearchTrigger } from "@/components/search/SearchTrigger";

export function SiteHeader() {
  return (
    <header>
      {/* 顶部日期带（杂志报头气质） */}
      <div className="border-b border-border bg-bg">
        <Container className="flex h-9 items-center justify-between text-[11px] uppercase tracking-[0.16em] text-fg-subtle">
          <span>
            {new Date().toLocaleDateString(site.locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </span>
          <span className="hidden md:inline">{site.tagline}</span>
        </Container>
      </div>

      {/* 主 header */}
      <div className="border-b border-border bg-bg sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-bg/85">
        <Container className="flex h-[68px] items-center justify-between gap-6">
          <Link
            href="/"
            aria-label={site.name}
            className="ring-focus rounded font-sans text-[26px] font-bold leading-none tracking-[-0.02em]"
          >
            {site.name}
            <span className="ml-0.5 text-fg-subtle">.</span>
          </Link>

          <nav aria-label="主导航" className="hidden md:block">
            <ul className="flex items-center gap-7 text-[13px] font-semibold uppercase tracking-[0.14em]">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="ring-focus rounded text-fg-muted transition hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <SearchTrigger />
            <ThemeToggle />
          </div>
        </Container>
      </div>
    </header>
  );
}
