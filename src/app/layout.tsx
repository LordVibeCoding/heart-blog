import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
import { siteJsonLd } from "@/lib/seo";
import { instrumentSans, robotoSlab } from "@/lib/fonts";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author.name, url: site.author.url }],
  keywords: [...site.keywords],
  category: "technology",
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    site: site.social.twitter,
    creator: site.social.twitter,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  icons: { icon: "/favicon.ico" },
};

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
