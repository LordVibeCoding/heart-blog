import { notFound } from "next/navigation";
import { getArticleAdminById, listCategories } from "@/db/repo";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, categories] = await Promise.all([
    getArticleAdminById(id),
    listCategories(),
  ]);
  if (!data) notFound();
  const { row, tags } = data;

  return (
    <div className="p-8 lg:p-12">
      <p className="eyebrow">Articles · Edit</p>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight">编辑文章</h1>
      <p className="mt-2 text-sm text-fg-muted">/{row.slug}</p>

      <div className="mt-8 border border-border bg-bg p-6 lg:p-8">
        <ArticleForm
          categories={categories}
          articleId={id}
          initial={{
            slug: row.slug,
            title: row.title,
            excerpt: row.excerpt,
            cover: row.cover ?? "",
            coverAlt: row.coverAlt ?? "",
            bodyHtml: row.bodyHtml,
            categorySlug: row.categorySlug,
            status: row.status,
            featured: row.featured,
            tags: tags.join(", "),
          }}
        />
      </div>
    </div>
  );
}
