"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ArticleRowActions({
  id,
  slug,
  status,
}: {
  id: string;
  slug: string;
  status: "draft" | "published";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function deleteOne() {
    if (!confirm("确认删除这篇文章？此操作不可撤销。")) return;
    startTransition(async () => {
      await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      router.refresh();
    });
  }

  function togglePublish() {
    startTransition(async () => {
      const next = status === "published" ? "draft" : "published";
      await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-3 text-[12px] font-semibold uppercase tracking-[0.14em]">
      <a
        href={`/blog/${slug}`}
        target="_blank"
        rel="noreferrer"
        className="text-fg-muted hover:text-fg"
      >
        预览
      </a>
      <button
        type="button"
        onClick={togglePublish}
        disabled={pending}
        className="text-fg-muted transition hover:text-fg disabled:opacity-50"
      >
        {status === "published" ? "转草稿" : "发布"}
      </button>
      <button
        type="button"
        onClick={deleteOne}
        disabled={pending}
        className="text-red-600 transition hover:text-red-700 disabled:opacity-50"
      >
        删除
      </button>
    </div>
  );
}
