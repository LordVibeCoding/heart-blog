import { getSettings } from "@/db/repo";
import { SettingsForm } from "./_form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const values = await getSettings([
    "promo_banner_image",
    "promo_banner_eyebrow",
    "promo_banner_title",
    "promo_banner_description",
    "promo_banner_cta_label",
    "promo_banner_cta_href",
  ]);

  return (
    <div className="p-8 lg:p-12">
      <p className="eyebrow">Settings</p>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-tight">站点设置</h1>
      <p className="mt-2 text-sm text-fg-muted">
        编辑首页的 Promo Banner（暗色横幅）。留空将使用站内默认值。
      </p>

      <div className="mt-8 max-w-3xl border border-border bg-bg p-6 lg:p-8">
        <SettingsForm initial={values} />
      </div>
    </div>
  );
}
