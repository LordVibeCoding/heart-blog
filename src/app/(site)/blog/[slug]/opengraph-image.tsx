import { ImageResponse } from "next/og";
import { getArticleVOBySlug } from "@/db/repo";
import { site } from "@/lib/site";

export const alt = "Article cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleVOBySlug(slug);
  const title = article?.title ?? site.name;
  const category = article?.category.name ?? "Article";
  const author = article?.author.name ?? site.author.name;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0c0c0d",
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              background: "#ffd84d",
              color: "#0c0c0d",
              padding: "4px 14px",
              borderRadius: 4,
            }}
          >
            {site.shortName}
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, opacity: 0.7 }}>Blog</div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 22,
              padding: "6px 18px",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 999,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {category}
          </div>
        </div>

        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        <div style={{ fontSize: 26, opacity: 0.7 }}>by {author}</div>
      </div>
    ),
    { ...size },
  );
}
