// ─────────────────────────────────────────────────────────────────────────
// ONE place to change your site-wide info. Update SITE_URL to your real
// domain once you have it (e.g. after you connect a custom domain in Vercel).
// Everything — metadata, canonical URLs, sitemap, social previews, and the
// structured data Google reads — flows from here.
// ─────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  // Your live domain. While you're on the free *.vercel.app URL, you can
  // leave this — but set it to your real domain before you launch for best SEO.
  url: "https://www.level4e.com",

  name: "Level4 Entertainment",
  shortName: "Level4",

  // The single most important SEO string. Front-loaded with your keywords.
  title: "Level4 — Skill Games & Skill-Based Fundraising Tournaments",

  description:
    "Level4 builds branded skill games and skill sports trivia tournaments where supporters compete for real prizes and every entry funds your cause. A compliant, skill-based gaming platform for schools, charities, sports teams, and fan communities.",

  // Targeted keywords. Search engines weight these lightly today, but they
  // keep your team aligned and feed the structured data below.
  keywords: [
    "skill games",
    "skill sports",
    "skill-based games",
    "skill-based gaming platform",
    "skill-based fundraising",
    "trivia fundraiser",
    "branded trivia tournament",
    "gamified fundraising",
    "fundraising games",
    "prize-based fundraising",
    "skill gaming for nonprofits",
    "sports trivia tournament",
  ],

  ogImage: "/og.png",
  locale: "en_US",

  contacts: {
    john: "john@level4e.com",
    bradley: "bradley@level4e.com",
  },
};

export type SiteConfig = typeof siteConfig;
