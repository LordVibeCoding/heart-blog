import { listCategories } from "@/db/repo";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const categories = await listCategories();
  return (
    <div className="p-8 lg:p-12">
      <p className="eyebrow">Articles</p>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight">写一篇新文章</h1>
      <p className="mt-2 text-sm text-fg-muted">填好表单点击保存。草稿不会出现在前台。</p>

      <div className="mt-8 border border-border bg-bg p-6 lg:p-8">
        <ArticleForm categories={categories} />
        <input type="hidden" name="authorName" value={site.author.name} />
      </div>
    </div>
  );
}
