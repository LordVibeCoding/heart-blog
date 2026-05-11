import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.username) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-dvh bg-bg-subtle">
      <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-bg lg:flex lg:flex-col">
        <div className="border-b border-border px-6 py-5">
          <p className="font-sans text-lg font-bold tracking-tight">
            Admin<span className="text-fg-subtle">.</span>
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-fg-subtle">
            Heart Blog
          </p>
        </div>
        <nav className="flex-1 p-4 text-sm">
          <ul className="space-y-1">
            <AdminNavItem href="/admin">仪表板</AdminNavItem>
            <AdminNavItem href="/admin/articles">文章</AdminNavItem>
            <AdminNavItem href="/admin/categories">分类</AdminNavItem>
            <AdminNavItem href="/admin/media">图片</AdminNavItem>
          </ul>
        </nav>
        <div className="border-t border-border p-4">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="ring-focus w-full border border-border px-3 py-2 text-left text-sm text-fg-muted transition hover:border-fg hover:text-fg"
            >
              退出登录
            </button>
          </form>
          <Link
            href="/"
            className="ring-focus mt-3 block text-center text-[11px] uppercase tracking-[0.16em] text-fg-subtle hover:text-fg"
          >
            ← 回到前台
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function AdminNavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="ring-focus block px-3 py-2 text-fg-muted transition hover:bg-bg-subtle hover:text-fg"
      >
        {children}
      </Link>
    </li>
  );
}
