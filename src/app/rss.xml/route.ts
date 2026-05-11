import { listPublishedArticles } from "@/db/repo";
import { site } from "@/lib/site";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

export async function GET() {
  const base = site.url.replace(/\/$/, "");
  const buildDate = new Date().toUTCString();
  const articles = await listPublishedArticles();

  const items = articles
    .map((a) => `
      <item>
        <title>${escapeXml(a.title)}</title>
        <link>${base}/blog/${a.slug}</link>
        <guid isPermaLink="true">${base}/blog/${a.slug}</guid>
        <description>${escapeXml(a.excerpt)}</description>
        <category>${escapeXml(a.category.name)}</category>
        <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
        <author>${escapeXml(a.author.name)}</author>
      </item>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${base}</link>
    <description>${escapeXml(site.description)}</description>
    <language>${site.locale}</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
