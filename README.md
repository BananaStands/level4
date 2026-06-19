# Level4 Entertainment — Website

Your marketing site, built with **Next.js (App Router) + React + TypeScript** — the modern, Vercel-native stack. This README walks you through everything from zero to live, the **GitHub → Vercel** way.

---

## What you have

```
level4-site/
├─ app/
│  ├─ page.tsx          ← the whole landing page (edit your content here)
│  ├─ layout.tsx        ← SEO metadata + Google rich-result structured data
│  ├─ globals.css       ← animations & hover styles
│  ├─ site-config.ts    ← ⭐ your domain, title, keywords, emails (edit this first)
│  ├─ content.ts        ← FAQ questions (shared by the page + SEO schema)
│  ├─ robots.ts         ← auto-generates /robots.txt
│  └─ sitemap.ts        ← auto-generates /sitemap.xml
├─ public/
│  └─ og.png            ← social-share preview image
├─ package.json
└─ next.config.mjs
```

---

## Part 1 — Run it on your own computer first (5 min)

You want to see it working locally before the world does.

### 1. Install Node.js
Download the **LTS** version from <https://nodejs.org> and install it. This gives you `node` and `npm`. To confirm, open **Terminal** (Mac) / **PowerShell** (Windows) and run:
```bash
node -v
```
You should see a version number (v20 or higher).

### 2. Open the project & install dependencies
In your terminal, go into the project folder and install:
```bash
cd path/to/level4-site
npm install
```
(This downloads Next.js & React into a `node_modules` folder. One-time, takes a minute.)

### 3. Start the dev server
```bash
npm run dev
```
Open <http://localhost:3000> in your browser. You'll see the site. Leave this running — edit any file, save, and the browser updates instantly. Press `Ctrl+C` in the terminal to stop.

---

## Part 2 — Make it yours (do this before launch)

1. **Open `app/site-config.ts`** — this is the one file that controls SEO. Set:
   - `url` → your real domain (e.g. `https://www.level4e.com`). Leave as-is for now if you don't have it yet.
   - `title`, `description`, `keywords` → already tuned for **"skill games," "skill sports," "skill-based"**. Adjust the wording if you like.
2. **Replace the placeholder images** (see next section).
3. Save. The local site updates live.

### Your photos (already wired in)
The 8 photos you placed in the original design were extracted to real image files in **`public/photos/`** and are now used directly on the page — no more placeholders.

To **change** a photo: drop a new file into `public/photos/` and update the matching `src="/photos/…"` in `app/page.tsx` (or just overwrite the existing file with the same name).

**Still to add:** the "Who it's for" section has 6 audience tabs, but only **Schools** has a photo so far. The other five (Charities, Sports, Alumni, Corporate, Fan communities) show a clean text-only panel until you add images. To fill one:
1. Add the photo to `public/photos/`, e.g. `public/photos/img-aud-sports.webp`.
2. In `app/page.tsx`, find `const TAB_IMG` and add a line, e.g. `"Sports + boosters": "img-aud-sports"`.

👉 Keep the `alt` text descriptive — it helps SEO and accessibility.

---

## Part 3 — Put it on GitHub

You've already set up GitHub — here's how to get this project into a repo.

### Option A — GitHub Desktop (easiest, no commands)
1. Install **GitHub Desktop** from <https://desktop.github.com>.
2. **File → Add Local Repository →** choose your `level4-site` folder.
3. It'll offer to **create a repository** — do it (keep it Private if you prefer).
4. Click **Publish repository** to push it to GitHub.

### Option B — Command line
From inside the `level4-site` folder:
```bash
git init
git add .
git commit -m "Initial Level4 site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```
(Replace the URL with your repo's URL — copy it from the green **Code** button on your empty GitHub repo.)

> The included `.gitignore` makes sure `node_modules` is **not** uploaded — that's correct and intentional. Vercel reinstalls it for you.

---

## Part 4 — Deploy to Vercel (the magic part, ~3 min)

1. Go to <https://vercel.com> and **Sign up with GitHub** (use the same GitHub account).
2. On your dashboard, click **Add New… → Project**.
3. Vercel lists your GitHub repos — find your Level4 repo and click **Import**.
4. Vercel **auto-detects Next.js** — you don't need to change any settings. Just click **Deploy**.
5. Wait ~1–2 minutes. 🎉 You get a live URL like `your-repo.vercel.app`.

**From now on:** every time you push a change to GitHub's `main` branch, Vercel rebuilds and redeploys automatically. (And every branch/PR gets its own preview URL.)

---

## Part 5 — Connect your custom domain

1. In your Vercel project → **Settings → Domains**.
2. Type your domain (e.g. `level4e.com`) and click **Add**.
3. Vercel shows you the DNS records to add. Go to wherever you bought the domain (GoDaddy, Namecheap, etc.) and add those records. (Vercel has a guide for each registrar.)
4. Once it verifies (minutes to a couple hours), your site is live on your domain with free HTTPS.
5. **Important for SEO:** go back to `app/site-config.ts`, set `url` to your real domain, commit & push. This makes your sitemap, canonical tags, and social previews point at the right place.

---

## SEO: what's already done for you

You asked for "skill games / skill sports" optimization. Built in:

- **Keyword-tuned title & description** in `site-config.ts`, front-loaded with your target terms.
- **Open Graph + Twitter cards** with the `og.png` preview image — good link previews on social/iMessage/Slack.
- **Structured data (JSON-LD)** in `layout.tsx`: `Organization`, `WebSite`, `Service` (typed as a skill-based gaming platform), and a **FAQPage** — this is what can get you the expandable FAQ "rich results" in Google.
- **`/sitemap.xml` and `/robots.txt`** generated automatically.
- **Semantic HTML** — one `<h1>`, proper `<h2>`/`<h3>` hierarchy, and `alt` text on images.

### After you're live, do these two things:
1. **Google Search Console** (<https://search.google.com/search-console>): add your domain, verify, and submit `https://yourdomain.com/sitemap.xml`. This tells Google to index you.
2. Test your rich results at <https://search.google.com/test/rich-results> by pasting your live URL.

> SEO ranking takes weeks and depends on real-world signals (links, traffic, content). This setup gets you technically perfect — the rest is ongoing.

---

## The lead form

The "Start a campaign" form currently opens the visitor's email app pre-filled to `john@level4e.com` (no backend needed). When you want submissions to arrive automatically without relying on the visitor's mail app, the next step is a Vercel **Route Handler** + an email service (Resend is the easy one). Happy to set that up when you're ready.

---

## Cheat sheet

| I want to… | Do this |
|---|---|
| See the site locally | `npm run dev` → open localhost:3000 |
| Change SEO / keywords / domain | edit `app/site-config.ts` |
| Edit page content | edit `app/page.tsx` |
| Edit FAQ | edit `app/content.ts` |
| Publish a change | commit & push to GitHub → Vercel auto-deploys |
| Make the build strict (recommended later) | delete the two `ignore` lines in `next.config.mjs` |
