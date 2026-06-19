# Level4 Entertainment — Website

Your marketing site, built with **Next.js (App Router) + React + TypeScript** — the modern, Vercel-native stack. This README walks you through everything from zero to live, the **GitHub → Vercel** way.

## What you have

```
level4-site/
├─ app/
│  ├─ page.tsx          ← the whole landing page (edit your content here)
│  ├─ layout.tsx        ← SEO metadata + Google rich-result structured data
│  ├─ globals.css       ← animations & hover styles
│  ├─ site-config.ts    ← your domain, title, keywords, emails
│  ├─ content.ts        ← FAQ questions
│  ├─ robots.ts         ← auto-generates /robots.txt
│  └─ sitemap.ts        ← auto-generates /sitemap.xml
├─ public/
│  └─ og.png            ← social-share preview image
├─ package.json
└─ next.config.mjs
```

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run start
```

## Vercel

Vercel auto-detects this as a Next.js project. No environment variables are required for the current site. Future variables can be added in Vercel under Project Settings → Environment Variables.

Every push to the `main` branch will trigger a new Vercel deployment once the GitHub repo is imported into Vercel.
