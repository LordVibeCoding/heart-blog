import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthed } from "@/lib/auth";
import { setSetting } from "@/db/repo";

export const runtime = "nodejs";

const ALLOWED_KEYS = new Set([
  // 站点基础
  "site_name",
  "site_short_name",
  "site_tagline",
  "site_description",
  "site_keywords",
  "site_favicon",
  // 作者
  "site_author_name",
  "site_author_email",
  // 社交
  "site_social_github",
  "site_social_telegram",
  "site_social_twitter",
  // Promo Banner
  "promo_banner_image",
  "promo_banner_eyebrow",
  "promo_banner_title",
  "promo_banner_description",
  "promo_banner_cta_label",
  "promo_banner_cta_href",
]);

const schema = z.record(z.string(), z.string().max(2000));

export async function POST(req: Request) {
  try {
    await requireAuthed();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "字段无效" }, { status: 400 });
  }

  for (const [key, value] of Object.entries(parsed.data)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    await setSetting(key, value);
  }

  return NextResponse.json({ ok: true });
}
