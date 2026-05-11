/** 从正文 HTML 自动提取摘要和封面。 */

export function extractExcerpt(html: string, max = 200): string {
  if (!html) return "";
  // 优先用 <p> 首段
  const firstP = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const raw = firstP ? firstP[1] : html;
  const text = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function extractFirstImage(html: string): string | null {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}
