import { listCategories } from "@/db/repo";
import { CategoriesEditor } from "./_editor";

export const dynamic = "force-dynamic";

export default async function CategoriesAdmin() {
  const cats = await listCategories();
  return (
    <div className="p-8 lg:p-12">
      <p className="eyebrow">Categories</p>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight">分类管理</h1>
      <p className="mt-2 text-sm text-fg-muted">
        共 {cats.length} 个分类。删除前需确保该分类下没有文章。
      </p>

      <div className="mt-8 max-w-3xl">
        <CategoriesEditor initial={cats} />
      </div>
    </div>
  );
}
