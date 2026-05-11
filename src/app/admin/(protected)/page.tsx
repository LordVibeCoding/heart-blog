import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await getSession();
  return (
    <div className="p-8 lg:p-12">
      <p className="eyebrow">Dashboard</p>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight">
        欢迎回来，{session.username}
      </h1>
      <p className="mt-3 text-fg-muted">从左侧导航管理文章、分类与图片。</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Tile href="/admin/articles/new" title="写一篇新文章" desc="启动 Tiptap 编辑器" />
        <Tile href="/admin/articles" title="文章管理" desc="发布 / 草稿 / 编辑" />
        <Tile href="/admin/categories" title="分类管理" desc="新建、重命名、删除" />
        <Tile href="/admin/media" title="图片库" desc="上传到 R2，复制 URL" />
      </div>
    </div>
  );
}

function Tile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="ring-focus group block border border-border bg-bg p-6 transition hover:border-fg"
    >
      <p className="font-sans text-lg font-semibold tracking-tight group-hover:text-accent">
        {title}
      </p>
      <p className="mt-2 text-sm text-fg-muted">{desc}</p>
    </Link>
  );
}
