# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PartyHooks — free AI TikTok hook generator for party guests (weddings, birthdays, bachelorettes, graduations). Tentpole 3 of the SnapDance product family. Full context in `C:\PROJECTS\SnapDance\CLAUDE.md` under "Tentpole 3".

## Architecture

Pure static site — no build step, no bundler, no node_modules. Single JS file (`js/app.js`) is a self-contained IIFE. API calls proxy through Vercel rewrites to the SnapDance Railway automation server.

```
Browser → Vercel CDN (partyhooks.com)
  └── POST /api/hooks/generate → snapdance-production.up.railway.app/api/hooks/generate
```

The Railway endpoint is the same one used by viralhooks.app. Body: `{ niche: "<occasion> party reel" }`. Response: `{ hooks: [{ text, explainer, template: { id, name, thumbnailVideo } }] }`.

## Pages

| File | URL | Notes |
|------|-----|-------|
| `index.html` | `/` | Main generator with occasion chips |
| `wedding-hooks.html` | `/wedding-hooks` | Occasion landing page |
| `birthday-hooks.html` | `/birthday-hooks` | Occasion landing page |
| `bachelorette-hooks.html` | `/bachelorette-hooks` | Occasion landing page |
| `graduation-hooks.html` | `/graduation-hooks` | Occasion landing page |
| `blog.html` | `/blog` | Blog index |
| `blog/<slug>.html` | `/blog/<slug>` | Blog posts (3 live) |

**Occasion landing pages** pre-fill the generator input via `<body data-preset-occasion="...">`. The IIFE in `app.js` reads `document.body.dataset.presetOccasion` on load. Clean URLs are enabled in `vercel.json` (`cleanUrls: true`) so `/wedding-hooks` serves `wedding-hooks.html` without extension.

## Styling

- `css/styles.css` — all main page styles (index + occasion pages share this)
- `css/occasion.css` — occasion landing page-specific layout
- `css/blog-post.css` — blog article styles (dark theme, `#e8e8e8` body text, `max-width: 700px`, `line-height: 1.8`)

## Blog posts

3 live articles (all built from Word docs using `C:\PROJECTS\SnapDance\automation\scripts\parse-docx.cjs` — never use sed-based tag stripping, it silently drops embedded images):
- `how-party-vendors-use-ai-experiences-make-events-viral-2026`
- `why-viral-guest-experiences-replacing-traditional-party-entertainment-2026`
- `best-interactive-party-entertainment-ideas-2026`

Each post has 5 images in `assets/blog/<slug>/image1.{jpeg,png}` … `image5.{jpeg,png}`. The blog index card thumbnail is `image1.*` from each slug's asset folder — no separate thumbnail.

**UTM contract (BUG-062 — locked):**
- Inline CTA links: `utm_source=blog&utm_medium=partyhooks&utm_campaign=tentpole&utm_content=<slug>`
- Nav/footer links on blog pages: `utm_source=partyhooks` (global page elements, not blog attribution)

Breaking this routes traffic to the wrong dashboard card on snapdance.app.

**Register new posts:** add an entry to `BLOG_ARTICLES` in `C:\PROJECTS\SnapDance\website\js\dashboard.js` with `{ slug, title, url }` where `url` is the absolute `https://partyhooks.com/blog/<slug>` and slug matches `utm_content`.

## Deploy

```bash
cd C:\PROJECTS\partyhooks && vercel --prod --yes
```

Branch is `master` (not `main`). Push to GitHub separately:
```bash
git push https://<PAT>@github.com/kmoini/partyhooks.git master
```

## DNS & GSC

Nameservers are Hostinger (`dns-parking.com`), not Vercel — `vercel dns add` is silently ignored. DNS changes require Hostinger web panel (API token expired).

GSC property verified via HTML meta tag (`W8BeBwWupJZs01PNLq4KNvBa0RFcqGqvtrCpRusv5OY`). URL prefix method.

Submit new pages to GSC: `node C:\PROJECTS\SnapDance\automation\scripts\gsc-submit-partyhooks-blog.js` (close Chrome first — uses Chrome system profile session).

## Sitemap

`sitemap.xml` is hand-maintained. Current: 9 URLs — `/`, 4 occasion pages, `/blog`, 3 blog posts. Add new pages here manually when deploying.
