import { site } from "./site";
import type { Article } from "@/data/types";

const BASE = site.url.replace(/\/$/, "");

/** 网站全局 schema：WebSite + SearchAction + Organization。注入 root layout。 */
export function siteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${BASE}/#website`,
      url: `${BASE}/`,
      name: site.name,
      description: site.description,
      inLanguage: site.locale,
      publisher: { "@id": `${BASE}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${BASE}/#organization`,
      name: site.name,
      url: `${BASE}/`,
      logo: {
        "@type": "ImageObject",
        url: `${BASE}/opengraph-image`,
      },
      sameAs: [site.social.github].filter(Boolean),
      founder: { "@id": `${BASE}/#author` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${BASE}/#author`,
      name: site.author.name,
      url: `${BASE}${site.author.url ?? "/about"}`,
    },
  ];
}

/** 文章 schema：BlogPosting + BreadcrumbList */
export function articleJsonLd(article: Article) {
  const url = `${BASE}/blog/${article.slug}`;
  const plainBody = article.bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainBody.split(/\s+/).length;

  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: article.title,
      description: article.excerpt,
      image: [`${BASE}${article.cover}`],
      datePublished: article.publishedAt,
      dateModified: article.publishedAt,
      inLanguage: site.locale,
      isAccessibleForFree: true,
      wordCount,
      articleBody: plainBody.slice(0, 5000),
      articleSection: article.category.name,
      keywords: article.tags.join(", "),
      author: {
        "@type": "Person",
        "@id": `${BASE}/#author`,
        name: article.author.name,
      },
      publisher: { "@id": `${BASE}/#organization` },
      isPartOf: { "@id": `${BASE}/#website` },
    },
    breadcrumbJsonLd([
      { name: "首页", url: `${BASE}/` },
      { name: "博客", url: `${BASE}/blog` },
      { name: article.category.name, url: `${BASE}/categories/${article.category.slug}` },
      { name: article.title, url },
    ]),
  ];
}

/** 列表 / 分类页 schema：CollectionPage + BreadcrumbList */
export function listJsonLd({
  url,
  name,
  description,
  breadcrumb,
}: {
  url: string;
  name: string;
  description: string;
  breadcrumb: { name: string; url: string }[];
}) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${BASE}${url}#page`,
      url: `${BASE}${url}`,
      name,
      description,
      inLanguage: site.locale,
      isPartOf: { "@id": `${BASE}/#website` },
    },
    breadcrumbJsonLd(breadcrumb),
  ];
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** 把 schema 数组渲染成 <script type="application/ld+json"> 序列。 */
export function renderJsonLd(schemas: unknown[]) {
  return schemas
    .map((s) => JSON.stringify(s).replace(/</g, "\\u003c"))
    .join("");
}
