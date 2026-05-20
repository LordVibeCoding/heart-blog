"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Initial = Record<string, string | undefined>;

export function SettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    promo_banner_image: initial.promo_banner_image ?? "",
    promo_banner_eyebrow: initial.promo_banner_eyebrow ?? "",
    promo_banner_title: initial.promo_banner_title ?? "",
    promo_banner_description: initial.promo_banner_description ?? "",
    promo_banner_cta_label: initial.promo_banner_cta_label ?? "",
    promo_banner_cta_href: initial.promo_banner_cta_href ?? "",
  });
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg("上传中…");
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!r.ok) {
      setMsg("上传失败");
      return;
    }
    const { data } = (await r.json()) as { data: { url: string } };
    set("promo_banner_image", data.url);
    setMsg(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const r = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const d = (await r.json().catch(() => ({}))) as { error?: string };
        setMsg(d.error ?? "保存失败");
        return;
      }
      setMsg("已保存");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Field label="Banner 图片 URL（留空用默认封面图）">
        <div className="flex gap-2">
          <input
            type="text"
            value={form.promo_banner_image}
            onChange={(e) => set("promo_banner_image", e.target.value)}
            placeholder="/uploads/... 或外链 URL"
            className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
          />
          <label className="ring-focus inline-flex cursor-pointer items-center border border-border-strong px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-fg-muted transition hover:border-fg hover:text-fg">
            上传
            <input type="file" accept="image/*" onChange={uploadCover} hidden />
          </label>
        </div>
        {form.promo_banner_image && (
          <div className="mt-3 aspect-[3/1] w-full overflow-hidden border border-border bg-bg-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.promo_banner_image}
              alt="banner preview"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </Field>

      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <Field label="Eyebrow（小标）">
          <input
            type="text"
            value={form.promo_banner_eyebrow}
            onChange={(e) => set("promo_banner_eyebrow", e.target.value)}
            placeholder="Follow"
            className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
          />
        </Field>
        <Field label="标题">
          <input
            type="text"
            value={form.promo_banner_title}
            onChange={(e) => set("promo_banner_title", e.target.value)}
            placeholder="想第一时间看到新文章？"
            className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
          />
        </Field>
      </div>

      <Field label="描述">
        <textarea
          value={form.promo_banner_description}
          onChange={(e) => set("promo_banner_description", e.target.value)}
          rows={2}
          placeholder="RSS 订阅没有算法，没有邮件营销…"
          className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="CTA 按钮文字">
          <input
            type="text"
            value={form.promo_banner_cta_label}
            onChange={(e) => set("promo_banner_cta_label", e.target.value)}
            placeholder="订阅 RSS"
            className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
          />
        </Field>
        <Field label="CTA 链接">
          <input
            type="text"
            value={form.promo_banner_cta_href}
            onChange={(e) => set("promo_banner_cta_href", e.target.value)}
            placeholder="/rss.xml"
            className="ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg"
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-border pt-5">
        {msg && (
          <span
            className={
              msg === "已保存" ? "text-sm text-fg" : "text-sm text-red-600"
            }
          >
            {msg}
          </span>
        )}
        <button
          type="submit"
          disabled={pending}
          className="ring-focus bg-fg px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-bg transition hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "保存中…" : "保 存"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-muted">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
