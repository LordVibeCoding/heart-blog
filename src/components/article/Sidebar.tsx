import { Link } from "next-view-transitions";
import { Rss, Github, ArrowRight } from "lucide-react";
import { listCategories, listRecent, getAllTags } from "@/db/repo";
import { ArticleCard } from "./ArticleCard";
import { site } from "@/lib/site";

export async function Sidebar() {
  const [recent, categories, tags] = await Promise.all([
    listRecent(4),
    listCategories(),
    getAllTags(10),
  ]);

  return (
    <aside className="space-y-12">
      {recent.length > 0 && (
        <SidebarBlock title="Latest Posts">
          <ul className="space-y-5">
            {recent.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} layout="compact" />
              </li>
            ))}
          </ul>
        </SidebarBlock>
      )}

      {categories.length > 0 && (
        <SidebarBlock title="分类">
          <ul className="divide-y divide-border text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="ring-focus flex items-center justify-between py-3 text-fg-muted transition hover:text-fg"
                >
                  <span className="font-medium">{c.name}</span>
                  <span aria-hidden className="text-fg-subtle">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </SidebarBlock>
      )}

      {tags.length > 0 && (
        <SidebarBlock title="标签">
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="ring-focus text-fg-muted transition hover:text-fg"
              >
                #{tag}
                <span className="ml-0.5 text-fg-subtle">{count}</span>
              </Link>
            ))}
          </div>
        </SidebarBlock>
      )}

      <SidebarBlock title="跟进">
        <ul className="space-y-2.5 text-sm">
          <li>
            <a
              href="/rss.xml"
              className="ring-focus group flex items-center justify-between border-b border-border pb-3 text-fg-muted transition hover:text-fg"
            >
              <span className="inline-flex items-center gap-2">
                <Rss className="h-4 w-4" /> RSS
              </span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
          </li>
          <li>
            <a
              href={site.social.github}
              className="ring-focus group flex items-center justify-between text-fg-muted transition hover:text-fg"
            >
              <span className="inline-flex items-center gap-2">
                <Github className="h-4 w-4" /> GitHub
              </span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
          </li>
        </ul>
      </SidebarBlock>
    </aside>
  );
}

function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <span className="h-px w-7 bg-fg" aria-hidden />
        <h2 className="eyebrow">{title}</h2>
      </div>
      {children}
    </section>
  );
}
