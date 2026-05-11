import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2.5rem" },
      screens: { "2xl": "1520px" },
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          subtle: "var(--bg-subtle)",
          elevated: "var(--bg-elevated)",
        },
        fg: {
          DEFAULT: "var(--fg)",
          muted: "var(--fg-muted)",
          subtle: "var(--fg-subtle)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          fg: "var(--accent-fg)",
          hover: "var(--accent-hover)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // 对齐模板字号阶（紧凑型）
        "h1": ["clamp(2rem, 4.4vw, 2.8125rem)", { lineHeight: "1.06", letterSpacing: "-0.015em", fontWeight: "700" }],
        "h2": ["clamp(1.625rem, 3vw, 1.875rem)", { lineHeight: "1.08", letterSpacing: "-0.012em", fontWeight: "600" }],
        "h3": ["clamp(1.25rem, 2vw, 1.5rem)", { lineHeight: "1.1", letterSpacing: "-0.008em", fontWeight: "600" }],
        "lead": ["1.125rem", { lineHeight: "1.55", fontWeight: "400" }],
      },
      maxWidth: {
        prose: "68ch",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [typography],
};

export default config;
