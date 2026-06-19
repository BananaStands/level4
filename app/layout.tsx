import type { Metadata, Viewport } from "next";
import { siteConfig } from "./site-config";
import { FAQS } from "./content";
import "./globals.css";

// ─── SEO METADATA ──────────────────────────────────────────────────────────
// Next.js turns this object into <title>, <meta>, Open Graph, Twitter cards,
// canonical links, and robots directives automatically.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | Level4 Entertainment",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: { canonical: "/" },
  category: "Fundraising",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "Level4 — skill games that raise money for your cause" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

// Mobile viewport — tells phones to render at device width (not zoomed-out
// desktop width). This is what makes the site mobile-friendly.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0C0B",
};

// ─── STRUCTURED DATA (JSON-LD) ───────────────────────────────────────────────
// This is what powers Google rich results. We describe the organization, the
// website, the service (skill-based games / skill sports), and the FAQ.
function jsonLd() {
  const org = {
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.ogImage}`,
    description: siteConfig.description,
    email: siteConfig.contacts.john,
    sameAs: [] as string[],
  };
  const website = {
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: "en-US",
  };
  const service = {
    "@type": "Service",
    "@id": `${siteConfig.url}/#service`,
    name: "Skill-based fundraising tournaments",
    serviceType: "Skill games and skill sports fundraising platform",
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: "US",
    description:
      "Branded skill games and skill sports trivia tournaments where supporters compete for real prizes and every entry funds your cause.",
    keywords: siteConfig.keywords.join(", "),
  };
  const faq = {
    "@type": "FAQPage",
    "@id": `${siteConfig.url}/#faq`,
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return { "@context": "https://schema.org", "@graph": [org, website, service, faq] };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
