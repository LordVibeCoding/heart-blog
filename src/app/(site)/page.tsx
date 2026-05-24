import Image from "next/image";
import { Link } from "next-view-transitions";
import { ArrowRight, Github, Rss } from "lucide-react";
import { site } from "@/lib/site";
import { ArticleCard } from "@/components/article/ArticleCard";
import { HeroGridHover } from "@/components/article/HeroGridHover";
import { HeroSide } from "@/components/article/HeroSide";
import { PostsSlider } from "@/components/article/PostsSlider";
import { AsideStack } from "@/components/article/AsideStack";
import { CategorySpotlight } from "@/components/article/CategorySpotlight";
import { PromoBanner } from "@/components/article/PromoBanner";
import {
  listCategories,
  listFeatured,
  listRecent,
  listByCategory,
  getSettings,
} from "@/db/repo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, recent, categories, promoSettings] = await Promise.all([
    listFeatured(4),
    listRecent(20),
    listCategories(),
    getSettings([
      "promo_banner_image",
      "promo_banner_eyebrow",
      "promo_banner_title",
      "promo_banner_description",
      "promo_banner_cta_label",
      "promo_banner_cta_href",
    ]),
  ]);

  // 空数据时显示 placeholder
  if (recent.length === 0) {
    return <EmptyHome />;
  }

  const featuredSlugs = new Set(featured.map((a) => a.slug));
  const pool = recent.filter((a) => !featuredSlugs.has(a.slug));
  const hoverThree = featured.slice(0, 3);
  const sidekick = featured[3] ?? pool[0];

  const sliderItems = pool.slice(0, 8);
  const asideLeft = pool.slice(2, 7);
  const asideRight = pool.slice(7, 12);
  const popular = recent.slice(0, 4);
  const spotlightCategories = categories.slice(0, 3);

  // 各分类文章
  const spotlightLists = await Promise.all(
    spotlightCategories.map(async (c) => ({
      category: c,
      articles: await listByCategory(c.slug, 3),
    })),
  );

  return (
    <>
      <SectionDivider />

      {/* Hero: 左 3 列 hover + 右独立单卡 */}
      {hoverThree.length > 0 && (
        <div className="mx-auto w-full max-w-[1720px] px-4 py-8 lg:px-6 lg:py-10">
          <div
            className="grid grid-cols-1 gap-px bg-border lg:grid-cols-4"
            style={{ minHeight: "min(720px, 82vh)" }}
          >
            <div className="lg:col-span-3">
              <HeroGridHover articles={hoverThree} />
            </div>
            {sidekick && <HeroSide article={sidekick} className="lg:col-span-1" />}
          </div>
        </div>
      )}

      <SectionDivider />

      {sliderItems.length > 0 && (
        <>
          <Wide className="py-14 lg:py-18">
            <SectionHeader
              eyebrow="Latest"
              title="最近更新"
              link={{ href: "/blog", label: "查看全部" }}
            />
            <div className="mt-12">
              <PostsSlider articles={sliderItems} />
            </div>
          </Wide>
          <SectionDivider />
        </>
      )}

      {(asideLeft.length > 0 || asideRight.length > 0) && (
        <>
          <Wide className="py-14 lg:py-18">
            <div className="grid gap-12 lg:grid-cols-3 lg:gap-14">
              {asideLeft.length > 0 && (
                <div>
                  <SectionHeader eyebrow="In depth" title="深度阅读" small />
                  <div className="mt-8">
                    <AsideStack articles={asideLeft} size="lg" />
                  </div>
                </div>
              )}
              {asideRight.length > 0 && (
                <div>
                  <SectionHeader eyebrow="Don't miss" title="别错过的" small />
                  <div className="mt-8">
                    <AsideStack articles={asideRight} size="lg" />
                  </div>
                </div>
              )}
              <AboutColumn />
            </div>
          </Wide>
          <SectionDivider />
        </>
      )}

      {spotlightLists.some((s) => s.articles.length > 0) && (
        <>
          <Wide className="py-14 lg:py-18">
            <SectionHeader eyebrow="Topics" title="按主题浏览" />
            <div className="mt-12 grid gap-12 lg:grid-cols-3 lg:gap-14">
              {spotlightLists.map(
                ({ category, articles }) =>
                  articles.length > 0 && (
                    <CategorySpotlight
                      key={category.slug}
                      category={category}
                      articles={articles}
                    />
                  ),
              )}
            </div>
          </Wide>
          <SectionDivider />
        </>
      )}

      <PromoBanner
        image={promoSettings.promo_banner_image}
        eyebrow={promoSettings.promo_banner_eyebrow || "Follow"}
        title={promoSettings.promo_banner_title || "想第一时间看到新文章？"}
        description={
          promoSettings.promo_banner_description ||
          "RSS 订阅没有算法，没有邮件营销。把这个站加进你的阅读器，不漏一篇。"
        }
        cta={{
          href: promoSettings.promo_banner_cta_href || "/rss.xml",
          label: promoSettings.promo_banner_cta_label || "订阅 RSS",
        }}
      />

      {popular.length > 0 && (
        <>
          <SectionDivider />
          <Wide className="py-14 lg:py-18">
            <SectionHeader
              eyebrow="Most popular"
              title="本月热门"
              link={{ href: "/blog?sort=popular", label: "查看全部" }}
            />
            <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((a) => (
                <ArticleCard key={a.slug} article={a} titleSize="md" />
              ))}
            </div>
          </Wide>
        </>
      )}
    </>
  );
}

function EmptyHome() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="eyebrow">Welcome</p>
      <h1 className="post-title mt-3 text-h1 text-fg [&_.highlight]:text-fg">
        <span className="highlight">这里还很</span> 安静
      </h1>
      <p className="mt-5 text-fg-muted">
        还没有发布任何文章。登录后台开始写第一篇。
      </p>
      <Link
        href="/admin/login"
        className="ring-focus mt-8 inline-flex items-center gap-2 bg-fg px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-bg transition hover:bg-accent-hover"
      >
        进入后台
      </Link>
    </main>
  );
}

function SectionDivider() {
  return <div aria-hidden className="divider-rule" />;
}

function Wide({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1720px] px-4 lg:px-6 ${className ?? ""}`}>
      {children}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  link,
  small = false,
}: {
  eyebrow: string;
  title: string;
  link?: { href: string; label: string };
  small?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-border pb-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2
          className={`post-title mt-2 text-fg [&_.highlight]:text-fg ${
            small ? "text-h3" : "text-h2"
          }`}
        >
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="ring-focus inline-flex items-center gap-1 rounded text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted transition hover:text-fg"
        >
          {link.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function AboutColumn() {
  return (
    <aside className="bg-bg-subtle p-8">
      <p className="eyebrow">About</p>
      <h3 className="post-title mt-3 text-h3 text-fg [&_.highlight]:text-fg">
        <span className="highlight">关于这里</span> 与我
      </h3>

      <div className="mt-6 flex items-start gap-4">
        <Image
          src="/avatar.webp"
          alt={site.author.name}
          width={56}
          height={56}
          className="h-14 w-14 flex-shrink-0 rounded-full bg-bg object-cover"
        />
        <div className="text-sm leading-[1.65] text-fg-muted">
          一个写关于科技、设计与日常思考的小站。慢更新、长文章、不追热点。
        </div>
      </div>

      <ul className="mt-7 space-y-3 text-sm">
        <li>
          <Link
            href="/about"
            className="ring-focus group flex items-center justify-between border-b border-border pb-3 hover:text-accent"
          >
            <span className="font-medium">关于这个博客</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </li>
        <li>
          <a
            href="/rss.xml"
            className="ring-focus group flex items-center justify-between border-b border-border pb-3 hover:text-accent"
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <Rss className="h-4 w-4" /> RSS
            </span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </li>
        <li>
          <a
            href={site.social.github}
            className="ring-focus group flex items-center justify-between hover:text-accent"
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <Github className="h-4 w-4" /> GitHub
            </span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </li>
      </ul>
    </aside>
  );
}
