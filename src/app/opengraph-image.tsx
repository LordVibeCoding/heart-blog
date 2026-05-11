import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0c0c0d",
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              background: "#ffffff",
              color: "#0c0c0d",
              padding: "4px 16px",
              borderRadius: 4,
            }}
          >
            {site.shortName}
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, opacity: 0.8 }}>Blog</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {site.tagline}
          </div>
          <div style={{ fontSize: 28, opacity: 0.65, maxWidth: 900 }}>
            {site.description}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
