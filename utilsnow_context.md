# UtilsNow — Complete Project Context

> **This file is the single source of truth for all AI sessions working on this project.**
> **Last updated: 2026-08-09**

---

## Quick Facts

| Key | Value |
|-----|-------|
| **Brand** | UtilsNow |
| **Domain** | utilsnow.com (purchased on Spaceship, 2026-08-09, $2.90) |
| **Old Domain** | megautils.xyz (301 redirects to utilsnow.com) |
| **Framework** | Next.js 16.2.12 (Turbopack), App Router |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 (`@theme inline` in globals.css) |
| **Theme** | next-themes (dark/light/system via `.dark` class) |
| **Icons** | lucide-react |
| **i18n** | Client-side context (`src/i18n/`), 10 languages, localStorage (`utilsnow-lang`) |
| **Tools** | **194 tools** (177 utility + 17 AI-powered) across 17 categories |
| **AI Tools** | 17 browser-based AI tools (background remover, OCR, upscaler, grammar checker, content detector, etc.) |
| **Monetization** | Google AdSense (pub-3062425605979427) + Infolinks (PID: 3446872, temporarily disabled) |
| **Privacy** | All processing in user's browser. No data uploaded/stored. No login. |
| **Blog** | PostgreSQL + file-based fallback, 89 posts auto-publishing through Nov 2028 |
| **Build** | `npm run build` — zero errors |
| **Server** | KVM VPS at `200.141.2.221` (Ubuntu 24.04, 4 CPU, 15GB RAM) |
| **Deployment** | PM2 + Nginx + Certbot (Let's Encrypt SSL) |
| **Git Repo** | https://github.com/Venkatabharath1969/megautils.git |
| **Project Path** | `/root/megautils/` on KVM |

---

## All 17 AI Tools

| Tool | URL | Technology | Model Size |
|------|-----|-----------|-----------|
| AI Background Remover | /tools/ai-bg-remover | @imgly/background-removal | 25MB (quantized) |
| AI Image Upscaler | /tools/ai-image-upscaler | upscaler + esrgan-slim | 4.5MB |
| AI Content Detector | /tools/ai-content-detector | Pure JS heuristics | 0 (no model) |
| AI Grammar Checker | /tools/ai-grammar-checker | Pure JS rules + 500 misspellings | 0 |
| AI Paraphrasing Tool | /tools/ai-paraphraser | Pure JS + 300 synonyms | 0 |
| AI Text Summarizer | /tools/ai-text-summarizer | Pure JS TF-IDF extractive | 0 |
| AI Speech to Text | /tools/ai-speech-to-text | Web Speech API | 0 |
| AI Sentiment Analysis | /tools/ai-sentiment-analysis | Pure JS + 400 word lexicon | 0 |
| AI OCR / Image to Text | /tools/ai-ocr | tesseract.js | 7MB |
| AI Face Blur | /tools/ai-face-blur | @vladmandic/face-api | 190KB |
| AI Image Segmentation | /tools/ai-segment | @huggingface/transformers (SlimSAM) | 14MB |
| AI Depth Map Generator | /tools/ai-depth-map | @huggingface/transformers (Depth Anything) | 15MB |
| AI Image Classifier | /tools/ai-image-classifier | @huggingface/transformers (MobileViT) | 20MB |
| AI Object Detection | /tools/ai-object-detection | @huggingface/transformers (DETR) | 43MB |
| AI Object Remover | /tools/ai-object-remover | Canvas API content-aware fill | 0 |
| AI Photo Colorizer | /tools/ai-photo-colorizer | Canvas pixel manipulation | 0 |
| AI Image Caption Generator | /tools/ai-image-caption | @huggingface/transformers (ViT-GPT2) | 250MB |

---

## Infrastructure

| Service | Port | Purpose | Auto-restart |
|---------|------|---------|-------------|
| UtilsNow app (Next.js) | 3000 | Main website | PM2 + systemd |
| Nginx | 80/443 | Reverse proxy, SSL, gzip, security headers | systemd |
| UtilsNow PostgreSQL | 5433 | Blog posts + social posts DB | Docker |
| Postiz (social scheduler) | 5200 (via Nginx on 80) | Auto-post to LinkedIn/Twitter/Bluesky | Docker |
| Postiz PostgreSQL | internal | Postiz data | Docker |
| Postiz Redis | internal | Postiz cache | Docker |
| Temporal | internal | Postiz workflows | Docker |
| n8n | 5678 | Workflow automation | Docker |

---

## Automated Cron Jobs

| Schedule | Script | What It Does |
|----------|--------|-------------|
| Daily 6:00 AM UTC | auto-indexnow.sh | Submits new blog post URLs to Bing/Yandex via IndexNow |
| Daily 6:30 AM UTC | auto-sitemap-ping.sh | Pings Google & Bing that sitemap updated |
| Weekly Sunday 3 AM | auto-rebuild.sh | Rebuilds Next.js app, restarts PM2, runs IndexNow + sitemap ping |
| Weekly Monday 7 AM | generate-social-posts.ts | Generates LinkedIn/Twitter/Reddit posts from new blog content |

---

## Social Media Integration (Postiz)

| Platform | Status | Posts Queued |
|----------|--------|-------------|
| LinkedIn | Connected (Techie Boy company page) | 6 posts (Aug 11 - Sep 15) |
| Twitter/X | Connected | 6 posts (Aug 7 - Sep 11) |
| Bluesky | Connected | Ready |
| Reddit | Pending (API approval needed) | 6 posts generated |

Postiz URL: `http://200.141.2.221` (Nginx proxies port 80 → Postiz 5200)
Login: `co.bharaths@gmail.com` / `MegaUtils2026!`

---

## SEO & Trust Configuration

| Item | Status | Details |
|------|--------|---------|
| Google Search Console | Verified | HTML file verification, sitemap submitted |
| Bing Webmaster Tools | Verified | XML file verification |
| Google AdSense | Applied | pub-3062425605979427, script in `<head>`, ads.txt ready |
| Infolinks | Temporarily disabled | PID: 3446872, will re-enable after AdSense approval |
| GDPR Consent | Configured | Google's 3-choice CMP (Consent, Do not consent, Manage) |
| IndexNow | Active | Key: dcfb9d8fec340f7ea5f85fdf5924ba8f, auto-submits daily |
| robots.txt | Allows all | Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot + all AI bots |
| llms.txt | Updated | 194 tools listed with AI section, utilsnow.com URLs |
| Sitemap | 226 URLs | All 194 tools + categories + blog + static pages |
| Schema markup | Complete | Organization, WebSite+SearchAction, SoftwareApplication, FAQPage, BreadcrumbList |
| helpContent | 25 tools | Top 25 tools have 300-500 word educational descriptions |
| FAQs | All 194 tools | Every tool has 3-4 FAQs with FAQPage JSON-LD |
| Product Hunt | Scheduled | Launch Thursday, badge on homepage |
| Hacker News | Posted | Show HN submitted |

---

## Blog System

- **Database:** PostgreSQL (port 5433, db: megautils, user: megautils)
- **Posts:** 89 posts (15 original + 75 generated)
- **Date range:** Aug 1, 2026 → Nov 13, 2028 (2+ years auto-publishing)
- **Mechanism:** Posts appear automatically when `publish_date <= today`
- **Fallback:** File-based in `src/lib/blog-data.ts` + `src/lib/blog-posts-generated.ts`
- **Seed script:** `npx tsx scripts/seed-blog.ts` (idempotent)

---

## Nginx Configuration

**utilsnow.com** → Full proxy to port 3000 with:
- SSL (Certbot auto-renewal)
- Gzip compression
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Static asset caching (1 year for /_next/static/)
- Cache for ads.txt, robots.txt, sitemap.xml, llms.txt (1 day)

**megautils.xyz** → 301 redirect to utilsnow.com (preserves SEO)

**Postiz** → Nginx on port 80 (IP-based: 200.141.2.221) proxies to Postiz on 5200

---

## Revenue & Growth Plan

### Current Revenue Stack
| Network | Status | Publisher ID |
|---------|--------|-------------|
| Google AdSense | Under review | ca-pub-3062425605979427 |
| Infolinks | Disabled (re-enable after AdSense) | PID: 3446872 |

### Revenue Targets
| Timeline | Visitors/Month | Revenue/Month |
|----------|---------------|---------------|
| Month 1-3 | 10K-50K | $200-$1,000 |
| Month 3-6 | 50K-200K | $1,000-$5,000 |
| Month 6-12 | 200K-1M | $5,000-$20,000 |
| Year 2 | 1M-5M | $20K-$50K |
| Year 3+ | 5M-50M | $50K-$500K |

### Growth Strategy
1. **SEO:** 194 tool pages + 89 blog posts = 283+ Google entry points
2. **AI tools:** 17 AI tools targeting 22M+ monthly searches
3. **Auto-publishing:** Blog posts through Nov 2028
4. **Social auto-posting:** LinkedIn, Twitter, Bluesky via Postiz
5. **IndexNow:** Instant Bing/Yandex indexing for new content
6. **Product Hunt + Hacker News:** Launch traffic spikes

### Phase C (Next to implement)
- AI Translator (414M global searches)
- Upgrade Text-to-Speech with AI voices
- Add helpContent to remaining 169 tools
- Programmatic SEO (500+ format conversion pages)
- Chrome extension
- Freemium subscription ($4.99/mo)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout: ThemeProvider, LanguageProvider, Header, Footer, AdSense script |
| `src/app/page.tsx` | Homepage: hero + 17 category cards + trust bar + PH badge |
| `src/components/tool-page.tsx` | Tool wrapper: breadcrumb, privacy badge, FAQs, helpContent, schema |
| `src/i18n/translations.ts` | 10 languages × UI strings |
| `src/lib/blog-data.ts` | Blog system: PostgreSQL + file fallback |
| `src/lib/db.ts` | PostgreSQL connection pool |
| `src/app/sitemap.ts` | Dynamic sitemap (226 URLs) |
| `src/app/robots.ts` | robots.txt with AI bot rules |
| `public/llms.txt` | AI search discovery file (194 tools) |
| `public/ads.txt` | AdSense publisher ID |
| `scripts/auto-indexnow.sh` | Daily IndexNow submission |
| `scripts/auto-rebuild.sh` | Weekly rebuild + deploy |
| `scripts/generate-social-posts.ts` | Weekly social content generation |
| `scripts/seed-blog.ts` | Blog database seeder |

---

## Deployment Log

### 2026-08-04 — Initial KVM deployment (megautils.xyz)
### 2026-08-05 — Phase 1 SEO + Phase 2 blog auto-publishing + all 177 FAQs
### 2026-08-06 — Phase 3 critical SEO fixes + Postiz deployment + social automation
### 2026-08-08 — LinkedIn/Twitter/Bluesky connected in Postiz
### 2026-08-09 — Domain migration: megautils.xyz → utilsnow.com
### 2026-08-09 — Brand migration: MegaUtils → UtilsNow
### 2026-08-09 — Phase A: 7 AI tools (content detector, grammar checker, summarizer, speech-to-text, sentiment, depth map, classifier)
### 2026-08-09 — Phase B: 5 AI tools (paraphraser, object remover, photo colorizer, image caption, object detection)
### 2026-08-09 — AdSense readiness: verification script, helpContent on 25 tools, identity on About page
### 2026-08-09 — Google Search Console + Bing Webmaster Tools verified
### 2026-08-09 — Product Hunt scheduled (Thursday) + Hacker News posted
### 2026-08-09 — AdSense applied: ca-pub-3062425605979427
