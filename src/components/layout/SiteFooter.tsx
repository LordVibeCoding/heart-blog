import Link from "next/link";
import { Container } from "./Container";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-bg">
      <Container className="grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-sans text-[26px] font-bold leading-none tracking-[-0.02em]">
            {site.name}
            <span className="text-fg-subtle">.</span>
          </p>
          <p className="mt-4 max-w-md text-fg-muted">{site.description}</p>
        </div>

        <FooterColumn title="栏目">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-fg">
                {item.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="订阅">
          <li>
            <a href="/rss.xml" className="hover:text-fg">
              RSS
            </a>
          </li>
          <li>
            <a href={site.social.github} className="hover:text-fg">
              GitHub
            </a>
          </li>
          <li>
            <a href={`mailto:${site.author.email}`} className="hover:text-fg">
              邮箱联系
            </a>
          </li>
        </FooterColumn>
      </Container>

      <div className="border-t border-border">
        <Container className="flex h-12 items-center justify-between text-[11px] uppercase tracking-[0.16em] text-fg-subtle">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>Built on Cloudflare</span>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm text-fg-muted">{children}</ul>
    </nav>
  );
}
