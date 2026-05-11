"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/data/types";
import { Plus, Trash2 } from "lucide-react";

export function CategoriesEditor({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  function refresh() {
    router.refresh();
  }

  function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newSlug || !newName) return;
    startTransition(async () => {
      const r = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: newSlug, name: newName, description: newDesc }),
      });
      if (!r.ok) {
        const d = (await r.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "创建失败");
        return;
      }
      setNewSlug("");
      setNewName("");
      setNewDesc("");
      refresh();
    });
  }

  function remove(slug: string) {
    if (!confirm(`删除分类「${slug}」？`)) return;
    startTransition(async () => {
      const r = await fetch(`/api/admin/categories/${slug}`, { method: "DELETE" });
      if (!r.ok) {
        const d = (await r.json().catch(() => ({}))) as { error?: string };
        alert(d.error ?? "删除失败");
        return;
      }
      refresh();
    });
  }

  function update(
    slug: string,
    patch: Partial<{ name: string; description: string }>,
  ) {
    startTransition(async () => {
      await fetch(`/api/admin/categories/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      refresh();
    });
  }

  return (
    <div>
      {/* 现有分类 */}
      <ul className="border border-border bg-bg">
        {initial.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-fg-muted">还没有分类</li>
        )}
        {initial.map((c) => (
          <li
            key={c.slug}
            className="grid grid-cols-[120px_1fr_1.5fr_auto] items-center gap-4 border-b border-border px-5 py-3 last:border-b-0"
          >
            <code className="text-xs text-fg-subtle">{c.slug}</code>
            <input
              type="text"
              defaultValue={c.name}
              onBlur={(e) =>
                e.target.value !== c.name && update(c.slug, { name: e.target.value })
              }
              className="ring-focus border-b border-transparent bg-transparent py-1 text-sm font-semibold focus:border-fg"
            />
            <input
              type="text"
              defaultValue={c.description ?? ""}
              onBlur={(e) =>
                update(c.slug, { description: e.target.value })
              }
              className="ring-focus border-b border-transparent bg-transparent py-1 text-sm text-fg-muted focus:border-fg"
              placeholder="描述（可选）"
            />
            <button
              type="button"
              onClick={() => remove(c.slug)}
              disabled={pending}
              className="ring-focus inline-flex items-center gap-1 text-xs text-red-600 transition hover:text-red-700 disabled:opacity-40"
              aria-label="删除"
            >
              <Trash2 className="h-3.5 w-3.5" /> 删除
            </button>
          </li>
        ))}
      </ul>

      {/* 新建 */}
      <form
        onSubmit={create}
        className="mt-8 grid grid-cols-[120px_1fr_1.5fr_auto] items-end gap-4 border border-dashed border-border-strong bg-bg px-5 py-4"
      >
        <Field label="Slug">
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            required
            pattern="[a-z0-9一-龥-]+"
            className="ring-focus w-full border-b border-border bg-transparent py-1 text-sm focus:border-fg"
            placeholder="tech"
          />
        </Field>
        <Field label="名称">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            className="ring-focus w-full border-b border-border bg-transparent py-1 text-sm focus:border-fg"
            placeholder="科技"
          />
        </Field>
        <Field label="描述">
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="ring-focus w-full border-b border-border bg-transparent py-1 text-sm focus:border-fg"
            placeholder="代码、工具、行业观察"
          />
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="ring-focus inline-flex items-center gap-1.5 bg-fg px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-bg transition hover:bg-accent-hover disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> 添加
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-subtle">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
