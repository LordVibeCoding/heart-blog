import { getAllSettings } from "@/db/repo";
import { site, SITE_SETTING_KEYS } from "@/lib/site";
import { SettingsForm } from "./_form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const all = await getAllSettings();
  // 只取我们认识的 keys
  const values: Record<string, string> = {};
  for (const k of SITE_SETTING_KEYS) values[k] = all[k] ?? "";

  // 默认值（占位提示用，让 UI 显示「不填用啥」）
  const defaults = {
    site_name: site.name,
    site_short_name: site.shortName,
    site_tagline: site.tagline,
    site_description: site.description,
    site_keywords: site.keywords.join(", "),
    site_favicon: "/favicon.svg",
    site_author_name: site.author.name,
    site_author_email: site.author.email,
    site_social_github: site.social.github,
    site_social_telegram: site.social.telegram,
    site_social_twitter: site.social.twitter,
    promo_banner_image: "",
    promo_banner_eyebrow: "Follow",
    promo_banner_title: "想第一时间看到新文章？",
    promo_banner_description:
      "RSS 订阅没有算法，没有邮件营销。把这个站加进你的阅读器，不漏一篇。",
    promo_banner_cta_label: "订阅 RSS",
    promo_banner_cta_href: "/rss.xml",
  };

  return (
    <div className="p-8 lg:p-12">
      <p className="eyebrow">Settings</p>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight">站点设置</h1>
      <p className="mt-2 text-sm text-fg-muted">
        所有字段留空都会使用站内默认值。修改后即时生效，无需重新部署。
      </p>

      <div className="mt-8 max-w-4xl">
        <SettingsForm initial={values} defaults={defaults} />
      </div>
    </div>
  );
}
