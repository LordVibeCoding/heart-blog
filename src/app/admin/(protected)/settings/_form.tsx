"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Values = Record<string, string>;

export function SettingsForm({
  initial,
  defaults,
}: {
  initial: Values;
  defaults: Values;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Values>(initial);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>, key: string) {
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
    set(key, data.url);
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
    <form onSubmit={submit} className="space-y-10" noValidate>
      <Section title="站点基础" desc="影响所有页面的 metadata、SEO、品牌显示">
        <Row>
          <Field label="站点名" placeholder={defaults.site_name}>
            <input
              type="text"
              value={form.site_name}
              onChange={(e) => set("site_name", e.target.value)}
              placeholder={defaults.site_name}
              className={fieldCls}
            />
          </Field>
          <Field label="短名（Logo / OG）" placeholder={defaults.site_short_name}>
            <input
              type="text"
              value={form.site_short_name}
              onChange={(e) => set("site_short_name", e.target.value)}
              placeholder={defaults.site_short_name}
              className={fieldCls}
            />
          </Field>
        </Row>
        <Field label="标语（Tagline，header 副标 / OG title）" placeholder={defaults.site_tagline}>
          <input
            type="text"
            value={form.site_tagline}
            onChange={(e) => set("site_tagline", e.target.value)}
            placeholder={defaults.site_tagline}
            className={fieldCls}
          />
        </Field>
        <Field
          label="站点描述（meta description / OG description）"
          placeholder={defaults.site_description}
        >
          <textarea
            value={form.site_description}
            onChange={(e) => set("site_description", e.target.value)}
            placeholder={defaults.site_description}
            rows={3}
            className={fieldCls}
          />
        </Field>
        <Field
          label="SEO 关键词（逗号或换行分隔）"
          placeholder={defaults.site_keywords}
        >
          <textarea
            value={form.site_keywords}
            onChange={(e) => set("site_keywords", e.target.value)}
            placeholder={defaults.site_keywords}
            rows={2}
            className={fieldCls}
          />
        </Field>
        <Field label="Favicon（标签页图标，建议 SVG / PNG / ICO）">
          <div className="flex gap-2">
            <input
              type="text"
              value={form.site_favicon}
              onChange={(e) => set("site_favicon", e.target.value)}
              placeholder={defaults.site_favicon}
              className={fieldCls}
            />
            <label className="ring-focus inline-flex cursor-pointer items-center border border-border-strong px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-fg-muted transition hover:border-fg hover:text-fg">
              上传
              <input
                type="file"
                accept="image/svg+xml,image/png,image/x-icon,image/jpeg,image/webp"
                onChange={(e) => uploadCover(e, "site_favicon")}
                hidden
              />
            </label>
          </div>
          {form.site_favicon && (
            <div className="mt-3 inline-flex items-center gap-3 border border-border bg-bg-subtle px-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.site_favicon}
                alt="favicon preview"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xs text-fg-muted">预览（实际显示为 16/32px）</span>
            </div>
          )}
        </Field>
      </Section>

      <Section title="作者信息" desc="出现在 footer / 关于页 / Article schema">
        <Row>
          <Field label="作者名" placeholder={defaults.site_author_name}>
            <input
              type="text"
              value={form.site_author_name}
              onChange={(e) => set("site_author_name", e.target.value)}
              placeholder={defaults.site_author_name}
              className={fieldCls}
            />
          </Field>
          <Field label="作者邮箱" placeholder={defaults.site_author_email}>
            <input
              type="email"
              value={form.site_author_email}
              onChange={(e) => set("site_author_email", e.target.value)}
              placeholder={defaults.site_author_email}
              className={fieldCls}
            />
          </Field>
        </Row>
      </Section>

      <Section title="社交链接" desc="footer + 关于页 + Organization schema 的 sameAs">
        <Field label="GitHub URL" placeholder={defaults.site_social_github}>
          <input
            type="url"
            value={form.site_social_github}
            onChange={(e) => set("site_social_github", e.target.value)}
            placeholder={defaults.site_social_github}
            className={fieldCls}
          />
        </Field>
        <Field label="Telegram URL" placeholder={defaults.site_social_telegram}>
          <input
            type="url"
            value={form.site_social_telegram}
            onChange={(e) => set("site_social_telegram", e.target.value)}
            placeholder={defaults.site_social_telegram}
            className={fieldCls}
          />
        </Field>
        <Field label="Twitter / X" placeholder={defaults.site_social_twitter}>
          <input
            type="text"
            value={form.site_social_twitter}
            onChange={(e) => set("site_social_twitter", e.target.value)}
            placeholder={defaults.site_social_twitter}
            className={fieldCls}
          />
        </Field>
      </Section>

      <Section title="首页 Promo Banner" desc="首页中部那条暗色横幅">
        <Field label="Banner 图片 URL（留空用默认封面图）">
          <div className="flex gap-2">
            <input
              type="text"
              value={form.promo_banner_image}
              onChange={(e) => set("promo_banner_image", e.target.value)}
              placeholder="/uploads/... 或图片 URL"
              className={fieldCls}
            />
            <label className="ring-focus inline-flex cursor-pointer items-center border border-border-strong px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-fg-muted transition hover:border-fg hover:text-fg">
              上传
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadCover(e, "promo_banner_image")}
                hidden
              />
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
        <Row cols="auto-1">
          <Field label="Eyebrow（小标）" placeholder={defaults.promo_banner_eyebrow}>
            <input
              type="text"
              value={form.promo_banner_eyebrow}
              onChange={(e) => set("promo_banner_eyebrow", e.target.value)}
              placeholder={defaults.promo_banner_eyebrow}
              className={fieldCls}
            />
          </Field>
          <Field label="标题" placeholder={defaults.promo_banner_title}>
            <input
              type="text"
              value={form.promo_banner_title}
              onChange={(e) => set("promo_banner_title", e.target.value)}
              placeholder={defaults.promo_banner_title}
              className={fieldCls}
            />
          </Field>
        </Row>
        <Field label="描述">
          <textarea
            value={form.promo_banner_description}
            onChange={(e) => set("promo_banner_description", e.target.value)}
            placeholder={defaults.promo_banner_description}
            rows={2}
            className={fieldCls}
          />
        </Field>
        <Row>
          <Field label="CTA 按钮文字" placeholder={defaults.promo_banner_cta_label}>
            <input
              type="text"
              value={form.promo_banner_cta_label}
              onChange={(e) => set("promo_banner_cta_label", e.target.value)}
              placeholder={defaults.promo_banner_cta_label}
              className={fieldCls}
            />
          </Field>
          <Field label="CTA 链接" placeholder={defaults.promo_banner_cta_href}>
            <input
              type="text"
              value={form.promo_banner_cta_href}
              onChange={(e) => set("promo_banner_cta_href", e.target.value)}
              placeholder={defaults.promo_banner_cta_href}
              className={fieldCls}
            />
          </Field>
        </Row>
      </Section>

      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-4 border-t border-border bg-bg px-6 py-4 lg:-mx-8 lg:px-8">
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

const fieldCls =
  "ring-focus w-full border border-border bg-bg px-3 py-2.5 text-sm focus:border-fg placeholder:text-fg-subtle";

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border bg-bg p-6 lg:p-8">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="font-sans text-lg font-bold tracking-tight">{title}</h2>
        {desc && <p className="mt-1 text-xs text-fg-muted">{desc}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Row({
  children,
  cols = "1-1",
}: {
  children: React.ReactNode;
  cols?: "1-1" | "auto-1";
}) {
  const gridCols =
    cols === "auto-1" ? "md:grid-cols-[180px_1fr]" : "md:grid-cols-2";
  return <div className={`grid gap-4 ${gridCols}`}>{children}</div>;
}

function Field({
  label,
  children,
}: {
  label: string;
  placeholder?: string;
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
