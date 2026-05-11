"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { pinyin } from "pinyin-pro";
import type { Category } from "@/data/types";
import { RichEditor } from "./RichEditor";

type FormState = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  coverAlt: string;
  bodyHtml: string;
  categorySlug: string;
  status: "draft" | "published";
  featured: boolean;
  tags: string;
};

const DEFAULTS: FormState = {
  slug: "",
  title: "",
  excerpt: "",
  cover: "",
  coverAlt: "",
  bodyHtml: "",
  categorySlug: "",
  status: "published",
  featured: false,
  tags: "",
};

export function ArticleForm({
  categories,
  initial,
  articleId,
}: {
  categories: Category[];
  initial?: Partial<FormState>;
  articleId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    ...DEFAULTS,
    categorySlug: categories[0]?.slug ?? "",
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function autoSlug() {
    if (!form.title || form.slug) return;
    // 把中文转拼音，整体 lowercase + kebab-case + 截 80 字符
    const ascii = pinyin(form.title, {
      toneType: "none",
      type: "string",
      v: true,
    });
    const slug = ascii
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    set("slug", slug || generateFallbackSlug());
  }

  function generateFallbackSlug(): string {
    // 标题完全无 ASCII / 拼音失败时的兜底
    return `post-${Math.random().toString(36).slice(2, 8)}`;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...form,
        tags,
        cover: form.cover || null,
        coverAlt: form.coverAlt || null,
      };

      const url = articleId
        ? `/api/admin/articles/${articleId}`
        : "/api/admin/articles";
      const method = articleId ? "PATCH" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const data = (await r.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "保存失败");
        return;
      }
      router.push("/admin/articles");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Field label="标题" required>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          onBlur={autoSlug}
          required
          maxLength={200}
          className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-base font-semibold focus:border-fg"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Slug（URL 路径，仅小写英文/数字/连字符）" required>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value.toLowerCase())}
            required
            pattern="[a-z0-9-]+"
            maxLength={120}
            className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
            placeholder="auto-generated from title"
          />
        </Field>
        <Field label="分类" required>
          <select
            value={form.categorySlug}
            onChange={(e) => set("categorySlug", e.target.value)}
            required
            className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="摘要（留空将自动取正文首段前 200 字）">
        <textarea
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          maxLength={400}
          rows={2}
          placeholder="不写也行，会从正文自动提取"
          className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <Field label="封面图（留空自动用正文第一张图片）">
          <input
            type="text"
            value={form.cover}
            onChange={(e) => set("cover", e.target.value)}
            placeholder="/uploads/... 或图片 URL，留空自动提取"
            className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
          />
        </Field>
        <Field label="封面 alt（无障碍）">
          <input
            type="text"
            value={form.coverAlt}
            onChange={(e) => set("coverAlt", e.target.value)}
            className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
          />
        </Field>
      </div>

      <Field label="标签（逗号分隔）">
        <input
          type="text"
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="Cloudflare, Edge, Next.js"
          className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
        />
      </Field>

      <Field label="正文" required>
        <RichEditor
          value={form.bodyHtml}
          onChange={(html) => set("bodyHtml", html)}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-6 border-t border-border pt-5">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="h-4 w-4 accent-fg"
          />
          标记为编辑推荐
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <span className="text-fg-muted">状态：</span>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as "draft" | "published")}
            className="ring-focus border border-border bg-bg px-2 py-1 text-sm focus:border-fg"
          >
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
          </select>
        </label>

        <div className="ml-auto flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="ring-focus border border-border px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted transition hover:border-fg hover:text-fg"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={pending}
            className="ring-focus bg-fg px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-bg transition hover:bg-accent-hover disabled:opacity-50"
          >
            {pending ? "保存中…" : "保 存"}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded border border-red-500/40 bg-red-500/5 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-muted">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
