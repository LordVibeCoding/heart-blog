import Link from "next/link";
import { Plus } from "lucide-react";
import { listAllArticlesAdmin, listCategories } from "@/db/repo";
import { ArticleRowActions } from "./_actions";

export const dynamic = "force-dynamic";

export default async function ArticlesAdmin() {
  const [rows, cats] = await Promise.all([listAllArticlesAdmin(), listCategories()]);
  const catName = (slug: string) => cats.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <div className="p-8 lg:p-12">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Articles</p>
          <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight">文章管理</h1>
          <p className="mt-2 text-sm text-fg-muted">共 {rows.length} 篇</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="ring-focus inline-flex items-center gap-2 bg-fg px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-bg transition hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" /> 新建
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 border border-dashed border-border p-14 text-center text-fg-muted">
          还没有文章。<Link href="/admin/articles/new" className="text-fg underline underline-offset-4">创建第一篇</Link>
        </div>
      ) : (
        <div className="mt-10 border border-border bg-bg">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-bg-subtle text-left text-[11px] uppercase tracking-[0.16em] text-fg-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">标题</th>
                <th className="px-4 py-3 font-semibold">分类</th>
                <th className="px-4 py-3 font-semibold">状态</th>
                <th className="px-4 py-3 font-semibold">推荐</th>
                <th className="px-4 py-3 font-semibold">更新时间</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-bg-subtle/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/articles/${r.id}/edit`}
                      className="ring-focus rounded font-semibold hover:text-accent"
                    >
                      {r.title}
                    </Link>
                    <p className="mt-1 text-xs text-fg-subtle">/{r.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{catName(r.categorySlug)}</td>
                  <td className="px-4 py-3">
                    {r.status === "published" ? (
                      <span className="inline-flex items-center bg-fg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-bg">
                        已发布
                      </span>
                    ) : (
                      <span className="inline-flex items-center border border-border-strong px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-muted">
                        草稿
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-fg-muted">
                    {r.featured ? "★" : "—"}
                  </td>
                  <td className="px-4 py-3 text-fg-muted">
                    {new Intl.DateTimeFormat("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(r.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ArticleRowActions id={r.id} slug={r.slug} status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
