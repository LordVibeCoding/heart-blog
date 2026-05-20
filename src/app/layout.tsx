import type { Metadata, Viewport } from "next";
import { site, getSiteConfig } from "@/lib/site";
import { siteJsonLd } from "@/lib/seo";
import { instrumentSans, robotoSlab } from "@/lib/fonts";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getSiteConfig();
  return {
    metadataBase: new URL(c.url),
    title: {
      default: `${c.name} — ${c.tagline}`,
      template: `%s · ${c.name}`,
    },
    description: c.description,
    applicationName: c.name,
    authors: [{ name: c.author.name, url: c.author.url }],
    keywords: c.keywords,
    category: "technology",
    openGraph: {
      type: "website",
      locale: c.locale,
      siteName: c.name,
      title: c.name,
      description: c.description,
      url: c.url,
    },
    twitter: {
      card: "summary_large_image",
      site: c.social.twitter,
      creator: c.social.twitter,
    },
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": "/rss.xml" },
    },
    icons: { icon: c.favicon },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0d" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={site.locale}
      className={`${instrumentSans.variable} ${robotoSlab.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://giscus.app" crossOrigin="" />
        <link rel="dns-prefetch" href="https://giscus.app" />
        <JsonLd data={siteJsonLd()} />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
