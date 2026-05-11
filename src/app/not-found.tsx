import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 · 页面未找到",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="post-title mt-3 text-h1 text-fg [&_.highlight]:text-fg">
        <span className="highlight">这一页</span> 不在这里
      </h1>
      <p className="mt-5 max-w-md text-fg-muted">
        你访问的链接可能被搬走了、改名了，或者从来就不存在。
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="ring-focus inline-flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-bg transition hover:bg-accent-hover"
        >
          返回首页
        </Link>
        <Link
          href="/blog"
          className="ring-focus inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted transition hover:text-fg"
        >
          浏览全部文章 →
        </Link>
      </div>
    </main>
  );
}
