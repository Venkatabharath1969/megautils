# UtilsNow — Complete Project Context

> **Single source of truth for all AI sessions. Read this FIRST.**
> **Last updated: 2026-08-26 (AdSense compliance, all 194 tools enhanced, video+YouTube pipeline, multi-platform expansion)**

---

## Quick Facts

| Key | Value |
|-----|-------|
| **Brand** | UtilsNow |
| **Domain** | utilsnow.com (registered 2026-08-09, Spaceship) |
| **Old Domain** | megautils.xyz (301 redirects to utilsnow.com) |
| **Framework** | Next.js 16.2.12 (Turbopack), App Router |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 (`@theme inline` in globals.css) |
| **Theme** | next-themes (dark/light/system via `.dark` class) |
| **Icons** | lucide-react |
| **Search** | Fuse.js fuzzy search (Cmd+K command palette) |
| **i18n** | Client-side context (`src/i18n/`), 10 languages, localStorage (`utilsnow-lang`) |
| **Tools** | **194 tools** (177 utility + 17 AI-powered) across 17 categories |
| **Monetization** | Google AdSense (pub-3062425605979427) — under review |
| **Privacy** | All processing in user's browser. No data uploaded/stored. No login. |
| **Blog** | PostgreSQL + file-based fallback, 89 posts (50 visible), auto-publishing through Nov 2028 |
| **Build** | `npm run build` — zero errors |
| **Server** | KVM VPS at `200.141.2.221` (Ubuntu 24.04, 4 CPU, 15GB RAM) |
| **Deployment** | PM2 + Nginx + Certbot (Let's Encrypt SSL) |
| **Git Repo** | github.com/Venkatabharath1969/megautils.git |
| **Project Path** | `/root/megautils/` on KVM |
| **Creator** | Bharath S (Software Engineer, India) |
| **GitHub** | github.com/Venkatabharath1969 |
| **LinkedIn** | linkedin.com/company/techie-boy |

---

## Core Architecture (Phase 1 — Aug 13, 2026)

### Tool Registry (Single Source of Truth)
- **File**: `src/lib/tool-registry.ts` (1,500+ lines)
- Contains ALL 194 tools + 17 categories with types, helpers, and search keywords
- Every tool has 5-15 fuzzy search aliases (e.g., "md to text" → Markdown Converter)
- Exports: `TOOLS`, `CATEGORIES`, `POPULAR_TOOLS`, `getToolsByCategory()`, `getToolById()`, `getRelatedTools()`, `getCategoryById()`, `searchTools()`
- **ALL components import from here** — no more duplicate tool lists

### Cmd+K Command Palette
- **File**: `src/components/command-palette.tsx` (210 lines)
- Opens on Cmd+K / Ctrl+K globally
- Fuse.js fuzzy search (name weight 3, keywords weight 2, description weight 1)
- Keyboard navigation (↑↓ Enter Escape)
- Shows: Recent tools (localStorage) → Popular tools → Search results
- AI badge on AI-powered tools
- Integrated in `layout.tsx`, triggered from header search button

### Share Buttons
- **File**: `src/components/share-buttons.tsx`
- X/Twitter, LinkedIn, Copy Link, Native Web Share API
- Custom SVG icons for X and LinkedIn
- Appears on every tool page near the title

### Favorites / Bookmarks
- **File**: `src/components/favorite-button.tsx`
- Star icon on every tool page (yellow fill when active)
- Persists to `localStorage('utilsnow-favorites')`
- "Your Favorites" section on homepage

### Homepage Sections (in order)
1. Search Results (if `?q=` query active)
2. Hero section
3. Your Favorites (if user has any)
4. Recently Used (if user has history)
5. Popular Tools (8 curated tools, always shown)
6. Social proof section (usage stats, indexed pages)
7. Categories grid (17 categories)
8. Product Hunt badge
9. Trust bar
10. CollectionPage schema

---

## Category Breakdown (Actual Counts)

| Category | ID | Count |
|----------|----|-------|
| Developer Tools | developer | 24 |
| Text Tools | text | 24 |
| Financial Calculators | financial | 23 |
| Image Tools (inc. AI) | image | 19 |
| SEO Tools | seo | 18 |
| CSS Tools | css | 14 |
| Encoders & Decoders | encoders | 14 |
| Unit Converters | converters | 14 |
| Generators | generators | 8 (4 + 4 cross-refs) |
| Color Tools | color | 8 |
| String Utilities | string | 6 |
| Date & Time | datetime | 5 |
| Markdown Tools | markdown | 4 |
| Math & Science | math | 4 |
| Network & API | network | 4 |
| Content & Writing | content | 3 |
| Crypto & Hash | crypto | 3 |
| **TOTAL** | | **194 unique** |

---

## Complete SEO & Trust Stack (100% Coverage)

### Structured Data (Schema.org JSON-LD)
| Schema | Location | Status |
|--------|----------|--------|
| Organization + founder | layout.tsx (every page) | ✅ |
| Person (Bharath S) with @id | layout.tsx (every page) | ✅ |
| WebSite + SearchAction | layout.tsx (every page) | ✅ |
| CollectionPage + ItemList | Homepage (page.tsx) | ✅ |
| SoftwareApplication | Every tool (tool-page.tsx) | ✅ |
| FAQPage | Every tool (194 tools) | ✅ |
| BreadcrumbList | Every tool (tool-page.tsx) | ✅ |
| ItemList | Every category page (17) | ✅ |
| Article + author + publisher | Every blog post (89) | ✅ |

### Discovery Files
| File | URL | Details | Status |
|------|-----|---------|--------|
| robots.txt | /robots.txt | 40+ AI bots + Mediapartners-Google allowed | ✅ |
| sitemap.xml | /sitemap.xml | 617 URLs, accurate lastmod | ✅ |
| llms.txt | /llms.txt | Summary for AI bots | ✅ |
| llms-full.txt | /llms-full.txt | 2,024+ lines, 128KB+, all 194 tools detailed | ✅ |
| ads.txt | /ads.txt | ca-pub-3062425605979427 | ✅ |
| manifest.json | /manifest.json | PWA manifest | ✅ |
| humans.txt | /humans.txt | Creator info | ✅ |
| security.txt | /.well-known/security.txt | RFC 9116 with Expires | ✅ |
| RSS feed | /feed.xml | Blog posts (last 20) | ✅ |
| OG image | /opengraph-image | Dynamic 1200x630, edge runtime | ✅ |

### AI Bot Coverage (robots.txt — 40+ bots)
Google (Googlebot, Google-Extended, Mediapartners-Google), ChatGPT (GPTBot, OAI-SearchBot, ChatGPT-User), Claude (ClaudeBot, Claude-SearchBot, Claude-Web, anthropic-ai), Perplexity (PerplexityBot, Perplexity-User), Bing (Bingbot), Apple (Applebot, Applebot-Extended), Meta (Meta-ExternalAgent, meta-webindexer, FacebookBot), Amazon (Amazonbot, Amzn-SearchBot, Amzn-User), Brave (BraveBot), You.com (YouBot), Phind (PhindBot), DuckDuckGo (DuckDuckBot, DuckAssistBot), Kagi (Kagibot), CCBot, DeepSeekBot, MistralAI-User, QwenBot, cohere-ai. **Blocked**: Bytespider.

### Verification & Monetization
| Service | Status |
|---------|--------|
| Google Search Console | ✅ Verified, 401 pages indexed, 10.7K impressions in 10 days |
| Bing Webmaster Tools | ✅ Verified |
| Google AdSense | ⏳ Under review (pub-3062425605979427), compliance work complete |
| Google Analytics 4 | ✅ Live (G-EJLXNS4PYF) + affiliate click tracking |
| IndexNow | ✅ Active (daily auto-submit) |
| GDPR Consent | ✅ Cookie consent banner with Consent Mode v2 |

### Pages & UX Features
| Feature | Status |
|---------|--------|
| Cmd+K Command Palette (Fuse.js fuzzy search) | ✅ All 194 tools searchable with aliases |
| Share buttons (X, LinkedIn, Copy, Native Share) | ✅ Every tool page |
| Favorites/bookmarks (star icon, localStorage) | ✅ Every tool page + homepage section |
| Recently Used tools (localStorage) | ✅ Homepage section |
| Popular Tools (8 curated) | ✅ Homepage section |
| Social proof section | ✅ Homepage |
| Related tools on tool pages | ✅ Auto-derived, 4 per page |
| helpContent on all tool pages | ✅ All 194 tools (category-specific, not template) |
| UsageCounter on all tool pages | ✅ 118K+ tracked uses, /api/usage endpoint |
| Cookie consent banner (Consent Mode v2) | ✅ |
| Disclaimer page | ✅ /disclaimer |
| How-to guides (54 pages) | ✅ /how-to/[slug] + /how-to hub |
| 404 page with category links | ✅ |
| Error boundary with retry | ✅ |
| Loading spinner | ✅ |
| Cookie/Privacy/Terms/About/Contact/Disclaimer pages | ✅ |
| Blog + RSS feed | ✅ 50 posts visible |
| "Last updated" freshness signal | ✅ |
| Skip-to-content link (WCAG) | ✅ |
| ARIA labels on interactive elements | ✅ |
| Canonical URLs on ALL pages | ✅ |
| Preconnect for AdSense | ✅ |

---

## Domain Reputation (Corporate Firewall Block)

utilsnow.com is blocked by corporate firewalls as "Newly Registered Domain" (registered Aug 9, 2026). Auto-lifts after **30-32 days** (~Sep 10, 2026).

**Categorization services to submit to** (owner action):
| Service | URL | Turnaround |
|---------|-----|-----------|
| BlueCoat/Symantec | sitereview.bluecoat.com | Minutes-hours |
| Zscaler | sitereview.zscaler.com | 24-72 hours |
| FortiGuard | fortiguard.fortinet.com/faq/wfratingsubmit | 1-3 days |
| BrightCloud | brightcloud.com/tools/change-request.php | 24-72 hours |
| TrustedSource/Trellix | trustedsource.org | 3-5 days |
| Norton Safe Web | safeweb.norton.com | Up to 48 hours |
| Cisco Talos | talosintelligence.com | 3-5 days |
| Microsoft SmartScreen | feedback.smartscreen.microsoft.com | Variable |
| Palo Alto PAN-DB | urlfiltering.paloaltonetworks.com | After Sep 10 (32-day NRD) |

**Category to request**: "Technology/Internet" or "Computer/Internet Info"

---

## All 17 AI Tools

| Tool | URL | Technology | Model Size |
|------|-----|-----------|-----------|
| AI Background Remover | /tools/ai-bg-remover | @imgly/background-removal | 25MB |
| AI Image Upscaler | /tools/ai-image-upscaler | upscaler + esrgan-slim | 4.5MB |
| AI Content Detector | /tools/ai-content-detector | Pure JS heuristics | 0 |
| AI Grammar Checker | /tools/ai-grammar-checker | Pure JS rules | 0 |
| AI Paraphrasing Tool | /tools/ai-paraphraser | Pure JS + 300 synonyms | 0 |
| AI Text Summarizer | /tools/ai-text-summarizer | Pure JS TF-IDF | 0 |
| AI Speech to Text | /tools/ai-speech-to-text | Web Speech API | 0 |
| AI Sentiment Analysis | /tools/ai-sentiment-analysis | Pure JS lexicon | 0 |
| AI OCR / Image to Text | /tools/ai-ocr | tesseract.js | 7MB |
| AI Face Blur | /tools/ai-face-blur | @vladmandic/face-api | 190KB |
| AI Image Segmentation | /tools/ai-segment | @huggingface/transformers | 14MB |
| AI Depth Map Generator | /tools/ai-depth-map | @huggingface/transformers | 15MB |
| AI Image Classifier | /tools/ai-image-classifier | @huggingface/transformers | 20MB |
| AI Object Detection | /tools/ai-object-detection | @huggingface/transformers | 43MB |
| AI Object Remover | /tools/ai-object-remover | Canvas API | 0 |
| AI Photo Colorizer | /tools/ai-photo-colorizer | Canvas pixel manipulation | 0 |
| AI Image Caption | /tools/ai-image-caption | @huggingface/transformers | 250MB |

---

## Infrastructure

| Service | Port | Purpose |
|---------|------|---------|
| UtilsNow (Next.js) | 3000 | Main website (PM2 name: "utilsnow") |
| Nginx | 80/443 | Reverse proxy, SSL, gzip |
| UtilsNow PostgreSQL | 5433 | Blog + social posts DB |
| Postiz | 5200 | Social media automation |
| Postiz PostgreSQL | internal | Postiz data |
| Postiz Redis | internal | Postiz cache |
| Temporal | internal | Postiz workflows |
| Temporal Elasticsearch | internal | Temporal search |
| Uptime Kuma | 3001 (Nginx: 8090) | Uptime monitoring (http://200.141.2.221:8090) |
| Listmonk | 9000 (Nginx: 9090) | Newsletter system (http://200.141.2.221:9090) |
| Listmonk PostgreSQL | internal | Listmonk data |
| n8n | 5678 | Workflow automation |
| n8n PostgreSQL | internal | n8n data |

**VPS RAM usage: ~47% of 15GB** (optimized from 69%)
**Cron jobs running: 12**
**Known issue**: Playwright chromium_headless_shell gets cleaned up periodically, needs reinstallation before video generation

### Social Media (Postiz + Direct API)
| Platform | Account | Status | Method |
|----------|---------|--------|--------|
| X/Twitter | @techieBharath | ❌ Credits depleted | Postiz (skipped) |
| LinkedIn | Bharath S (personal) | ✅ Connected | Postiz |
| Bluesky | @utilsnow.bsky.social | ✅ Connected | Postiz |
| Mastodon | @UtilsNow@mastodon.social | ✅ Connected | Direct API |
| Telegram | @utilsnow channel | ✅ Connected | Direct API |
| Discord | UtilsNow Community | ✅ Connected | Webhook |
| Dev.to | UtilsNow | ✅ Connected | Direct API (Gemini AI) |
| YouTube | @utilsnow | ✅ Connected | OAuth API |
| Facebook | UtilsNow page | ✅ Created | Manual |
| Instagram | @utilsnow | ✅ Created | Manual |
| Threads | @utilsnow | ✅ Created | Manual |
| Pinterest | UtilsNow (business) | ✅ Created | Manual (domain verified) |
| LinkedIn Page | Techie Boy | ❌ Not connected | Owner needs to add integration |

**Postiz API**: Public API at `/api/public/v1`. Official n8n community node: `n8n-nodes-postiz`. API key needed from Settings → Developers → Public API.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/tool-registry.ts` | **Single source of truth**: ALL 194 tools + 17 categories + search keywords |
| `src/components/command-palette.tsx` | Cmd+K fuzzy search (Fuse.js) |
| `src/components/share-buttons.tsx` | X, LinkedIn, Copy, Native Share |
| `src/components/favorite-button.tsx` | Star bookmark (localStorage) |
| `src/components/tool-page.tsx` | Tool wrapper: breadcrumb, FAQs, related tools, share, favorite, schema |
| `src/components/header.tsx` | Header with Cmd+K trigger + mobile menu |
| `src/components/footer.tsx` | Footer: author, cookie policy, blog link, nav |
| `src/app/layout.tsx` | Root layout: schemas, AdSense, skip-link, preconnect, OG, CommandPalette |
| `src/app/page.tsx` | Homepage: favorites, recent, popular, categories, search, schema |
| `src/app/not-found.tsx` | 404 page |
| `src/app/error.tsx` | Error boundary |
| `src/app/loading.tsx` | Loading spinner |
| `src/app/opengraph-image.tsx` | Dynamic OG image (1200x630, edge) |
| `src/app/feed.xml/route.ts` | RSS feed for blog |
| `src/app/cookies/page.tsx` | Cookie policy (GDPR) |
| `src/app/robots.ts` | robots.txt (40+ AI bots + Mediapartners-Google) |
| `src/app/sitemap.ts` | Dynamic sitemap (617 URLs) |
| `src/i18n/translations.ts` | 10 languages |
| `src/lib/blog-data.ts` | Blog: PostgreSQL + fallback |
| `public/llms.txt` | AI discovery summary |
| `public/llms-full.txt` | AI discovery full (128KB) |
| `public/ads.txt` | AdSense publisher |
| `public/manifest.json` | PWA manifest |
| `public/humans.txt` | Creator info |
| `public/.well-known/security.txt` | Security contact (RFC 9116) |
| `src/components/file-upload.tsx` | Reusable FileUpload component |
| `src/components/export-button.tsx` | Reusable ExportButton component |
| `src/components/usage-counter.tsx` | UsageCounter component (on every tool page) |
| `src/app/api/usage/route.ts` | Usage counter API endpoint |
| `src/app/how-to/[slug]/page.tsx` | 54 how-to guide pages |
| `src/app/how-to/page.tsx` | How-to hub page |
| `src/app/disclaimer/page.tsx` | Disclaimer page |
| `/opt/automation/AFFILIATE-SETUP.md` | Affiliate setup guide |
| `/opt/automation/devto-publisher.sh` | Dev.to auto-publishing script |
| `/opt/automation/youtube-uploader/upload_video.py` | YouTube upload script |
| `/opt/automation/youtube-uploader/auto-upload.sh` | YouTube auto-upload script |
| `/opt/automation/youtube-uploader/token.json` | YouTube OAuth token |

---

## Automated Cron Jobs (12 Running)

| Schedule | Script | Purpose | Human Effort |
|----------|--------|---------|-------------|
| Daily 3:00 AM IST | auto-index-all.sh | IndexNow batch (617 URLs) + sitemap ping | ZERO |
| Daily 8:30 AM IST | auto-social-optimized.sh | Post to LinkedIn/Bluesky/Mastodon/Telegram/Discord | ZERO |
| Daily 2:00 AM UTC | daily-video.sh | Generate tool demo video (Playwright+Gemini+TTS+FFmpeg) | ZERO |
| Daily 2:30 AM UTC | auto-upload.sh | Upload generated video to YouTube | ZERO |
| 2x/week | devto-publisher.sh | Publish articles to Dev.to via Gemini AI | ZERO |
| 2x/day (Mon-Sat) | linkedin-engage.sh | LinkedIn comment engagement bot | ZERO |
| Weekly Sunday 3 AM UTC | auto-rebuild.sh | Rebuild + deploy | ZERO |
| Weekly Monday 7 AM UTC | generate-social-posts.ts | Generate social content | ZERO |
| + 4 additional cron jobs | Various | Infrastructure maintenance | ZERO |

### Auto Social Posting Details
- **Script**: `/opt/automation/auto-social-post.sh`
- **Data**: `/opt/automation/tools-data.json` (50 tools)
- **Templates**: 5 rotating templates (1 AI-specific)
- **Platforms**: X/Twitter, LinkedIn, Bluesky (all 3 per post)
- **Schedule**: 30min ahead for Temporal processing
- **Lock**: Prevents stacking via `/tmp/utilsnow-social.lock`
- **Log**: `/var/log/utilsnow-social.log`
- **Tested**: HTTP 201 success confirmed

### Auto Indexing Details
- **Script**: `/root/megautils/scripts/auto-index-all.sh`
- **Submits**: ALL 617 sitemap URLs to IndexNow batch API
- **Also**: Detects new blog posts from DB not yet in sitemap
- **Log**: `/var/log/utilsnow-autoindex.log`
- **Tested**: HTTP 200, all URLs accepted

---

## Recent Upgrades

### Aug 26, 2026 — YouTube API & Auto-Upload
- Google Cloud project: utilsnow-youtube, OAuth client configured, app published
- Token obtained and saved at `/opt/automation/youtube-uploader/token.json`
- Upload script: `/opt/automation/youtube-uploader/upload_video.py`
- Auto-upload script: `/opt/automation/youtube-uploader/auto-upload.sh`
- Daily cron at 2:30 AM UTC (runs after video generation at 2 AM)
- First test upload: https://youtube.com/watch?v=3hNwAyJl_u4
- YouTube API audit form submitted (waiting for approval)

### Aug 24-26, 2026 — Platform Expansion
- YouTube: @utilsnow channel created
- Facebook: UtilsNow page created
- Instagram: @utilsnow business account created
- Threads: Created from Instagram
- Pinterest: Business account created, domain verification meta tag in layout.tsx
- TikTok: Not available in India
- Reddit: Account to be created

### Aug 22-26, 2026 — Video Pipeline Enhancements
- Fixed subtitle bug (VTT comma timestamps)
- Fixed shorts generation (mobile screenshots instead of cropping desktop)
- Added Indian English voice (en-IN-NeerjaExpressiveNeural)
- Changed default to US English (en-US-AndrewNeural) for global audience
- Added 7 regional voice options (us, uk, in, au + female variants)
- Added background music, branded intro, longer narrations (60-120s)
- Added daily cron at 2 AM UTC
- Videos generated: color-picker, base64-encoder, rot13-encoder, base32-encoder, json-formatter, word-counter

### Aug 21-24, 2026 — Social Media Automation
- Dev.to auto-publishing: 2x/week via Gemini AI (4 articles live)
- Dev.to publisher script at `/opt/automation/devto-publisher.sh`
- Social posting enhanced with viral templates, "link in comments" pattern
- Pinterest pin generator script ready
- Mastodon: old account suspended, new account created
- Dev.to API key stored in `.social-credentials`

### Aug 21-22, 2026 — Revenue Infrastructure
- Affiliate suggestions expanded from 8 to 17 categories (100% tool coverage)
- GA4 affiliate click tracking
- `rel="sponsored nofollow"` on all affiliate links
- Affiliate setup guide at `/opt/automation/AFFILIATE-SETUP.md`

### Aug 19-21, 2026 — ALL 194 Tools Enhanced (7 Phases)

**Phase 1 — Bug Fixes & Shared Components:**
- Fixed text-to-binary/hex UTF-8 bugs, json-formatter tab bug
- Created FileUpload, ExportButton, CSV export reusable components

**Phase 2 — Developer & Text Tools:**
- Replaced YAML/JS parsers with libraries (js-yaml)
- Enhanced csv-viewer (pagination, filtering, stats), json-to-csv (flatten, delimiters)
- Enhanced csv-to-json, json-to-go (omitempty), json-to-typescript (optional fields)
- Enhanced diff-checker (whitespace, file upload), chmod (setuid/umask)
- Enhanced code-to-image (12 languages), json-path-finder (search)

**Phase 3 — Financial Calculators:**
- compound-interest (contributions), emi (amortization), mortgage (tax/insurance/extra payments)
- sip (step-up, goal-based), tax (FICA, state), gst (multi-item invoice)
- npv (payback period), fd (TDS)

**Phase 4 — Encoders, Crypto & Security:**
- base64 (file encoding, URL-safe), hash (file hashing, HMAC, SHA-384)
- password (passphrases, entropy), uuid (v7, parser)
- regex (substitution, patterns), jwt (live countdown)

**Phase 5 — CSS & Color Tools:**
- gradient (conic, presets), flexbox (per-child props), grid (cell spanning)
- color-picker (CMYK, EyeDropper API, alpha), color-converter (CMYK)
- contrast-checker (APCA), palette (exports)

**Phase 6 — Image & Generator Tools:**
- qr-code (vCard, WiFi), favicon (text-to-favicon, PWA sizes)
- ai-bg-remover (custom backgrounds), image-cropper (aspect ratios)

**Phase 7+ — Remaining 145 tools enhanced with medium/low priority features**

### Aug 18-19, 2026 — AdSense Compliance
- Added Mediapartners-Google to robots.txt
- Added aboutads.info link to Privacy Policy
- Created /disclaimer page
- Added helpContent to ALL 194 tool pages (was only 28, now category-specific content)
- Fixed template sameness (category-specific content across all tools)
- Added cookie consent banner with Consent Mode v2
- Blog posts visible: 50 (was 14)
- Google Search Console: 401 pages indexed, 10.7K impressions in 10 days

### Aug 19-21, 2026 — New Pages & Content
- 54 how-to guide pages at /how-to/[slug]
- How-to hub page at /how-to
- Usage counter API at /api/usage
- UsageCounter component on every tool page (118K+ tracked uses)
- Social proof section on homepage
- Sitemap expanded to 617 URLs
- Disclaimer page created

### Aug 13, 2026 — Phase 1: World-Class UX Overhaul
- Cmd+K command palette with Fuse.js (191 tools, 100+ aliases each)
- Tool registry (1,500 lines, single source of truth)
- Share buttons on every tool page
- Favorites/bookmarks system
- Recently Used + Popular Tools on homepage
- Homepage now uses tool-registry (fixed 70/191 search bug)

### Aug 11, 2026 — SEO/Trust 100% Overhaul
- Person schema + About page author bio
- llms-full.txt (128KB, 2,024 lines)
- Article schema on blog + ItemList on categories
- 404, error, loading pages
- OG image, RSS feed, cookie policy
- 40+ AI bots in robots.txt
- Canonical URLs, skip-to-content, ARIA labels
- VPS RAM: 69% → 47%

### Aug 11, 2026 — Tool Upgrades
- Markdown Converter: complete rewrite (826 lines)
- Markdown Editor: toolbar, shortcuts, auto-save (580 lines)
- QR Code Generator: replaced broken Google Charts API
- Image Resizer: real drag-and-drop + PNG/JPEG/WebP + presets

---

## Deployment Log

| Date | Changes |
|------|---------|
| 2026-08-04 | Initial KVM deployment (megautils.xyz) |
| 2026-08-05 | Phase 1 SEO + blog auto-publishing + 177 FAQs |
| 2026-08-06 | Phase 3 SEO + Postiz deployment + social automation |
| 2026-08-08 | LinkedIn/Twitter/Bluesky connected in Postiz |
| 2026-08-09 | Domain migration to utilsnow.com |
| 2026-08-09 | 17 AI tools built (Phase A + B) |
| 2026-08-09 | AdSense applied, GSC + Bing verified |
| 2026-08-11 | SEO/Trust 100% overhaul + tool upgrades + RAM optimization |
| 2026-08-13 | Phase 1 UX: Cmd+K, share, favorites, popular tools, tool registry |
| 2026-08-13 | Phase 2 Automation: social posting (3x/day), IndexNow (230 URLs), Uptime Kuma, Listmonk, backlink-pilot |
| 2026-08-13 | Removed all MegaUtils brand refs, renamed PM2 process to "utilsnow" |
| 2026-08-13 | Phase 3 Programmatic SEO: 327 new pages (192 conversions + 120 calculators + 6 comparisons + 9 hubs). Sitemap: 230→557 URLs. All submitted to IndexNow. |
| 2026-08-13 | Phase 4 Revenue: Email subscribe (Listmonk), affiliate suggestions, Pro upsell + /pro page, embeddable widgets, GA4 (G-EJLXNS4PYF) |
| 2026-08-13 | Cloudflare Tunnels for admin access (Postiz, Uptime Kuma, Listmonk) |
| 2026-08-18 | AdSense compliance: Mediapartners-Google, aboutads.info, cookie consent Consent Mode v2 |
| 2026-08-19 | /disclaimer page, helpContent on all 194 tools, blog posts visible: 50, 54 how-to guides |
| 2026-08-19 | Tool upgrades Phase 1-2: UTF-8 bug fixes, FileUpload/ExportButton components, YAML/JS library parsers |
| 2026-08-20 | Tool upgrades Phase 3-5: Financial calculators, encoders/crypto, CSS/color tools enhanced |
| 2026-08-21 | Tool upgrades Phase 6-7: Image/generator tools + remaining 145 tools enhanced. All 194 done. |
| 2026-08-21 | Usage counter (118K+), social proof, sitemap 557→617 URLs |
| 2026-08-21 | Affiliate expanded 8→17 categories, GA4 affiliate tracking, rel="sponsored nofollow" |
| 2026-08-22 | Video pipeline: subtitle fix, mobile screenshots for shorts, background music, branded intro |
| 2026-08-22 | Dev.to auto-publishing 2x/week via Gemini AI |
| 2026-08-24 | Social posting: viral templates, "link in comments", Pinterest pin generator |
| 2026-08-24 | Platforms: YouTube @utilsnow, Facebook page, Instagram @utilsnow, Threads, Pinterest business |
| 2026-08-25 | Video pipeline: 7 regional voices, US English default, 60-120s narrations, daily 2 AM cron |
| 2026-08-26 | YouTube API: OAuth configured, upload script, auto-upload cron 2:30 AM, first upload live |
| 2026-08-26 | Pinterest domain verification tag deployed in layout.tsx |

---

## Master Plan — Remaining Phases

### Phase 2: Automation Engine — COMPLETE
| Automation | Status | Details |
|-----------|--------|---------|
| Auto social posting (3x/day) | ✅ LIVE | Shell script → Postiz API, 5 templates, 3 platforms |
| Auto indexing (617 URLs/day) | ✅ LIVE | IndexNow batch API, tested HTTP 200 |
| Uptime monitoring | ✅ LIVE | Uptime Kuma (Cloudflare tunnel) |
| Newsletter system | ✅ DEPLOYED | Listmonk (Cloudflare tunnel), List UUID: a41f23f8-9c36-4b73-ba93-9faae56e4367 |
| Backlink directories | ✅ READY | backlink-pilot (259 sites), config created |
| Postiz OAuth app | ✅ CREATED | Client ID: pca_2sFVY55T8v3GcgTb4iPDXdOSafw3bfKR |

### Phase 4: Revenue Stack — COMPLETE
| Feature | Status | Details |
|---------|--------|---------|
| Email subscription | ✅ LIVE | EmailSubscribe component → /api/subscribe → Listmonk |
| Affiliate suggestions | ✅ LIVE | ProSuggestion: 17 categories (100% tool coverage), GA4 tracking, rel="sponsored nofollow" |
| Pro upsell banner | ✅ LIVE | After 10 daily tool uses (localStorage tracker, dismissible) |
| /pro landing page | ✅ LIVE | Coming Soon, $4.99/mo, feature cards |
| Embeddable widgets | ✅ LIVE | /embed/[slug] + EmbedCode copy button on every tool |
| Google Analytics 4 | ✅ LIVE | G-EJLXNS4PYF (env: NEXT_PUBLIC_GA_ID) |

### Cloudflare Tunnel Access (Corporate Firewall Bypass)
| Service | Tunnel URL | Login |
|---------|-----------|-------|
| Postiz | https://expansion-epson-drum-celebs.trycloudflare.com | co.bharaths@gmail.com / MegaUtils2026! |
| Uptime Kuma | https://foam-presidential-baptist-infant.trycloudflare.com | admin / UtilsNow2026! |
| Listmonk | https://hampton-sierra-stored-website.trycloudflare.com | admin / UtilsNow2026! |
Note: Quick tunnel URLs change on restart. Run `cloudflared tunnel --url http://localhost:PORT` to recreate.

### Phase 3: Programmatic SEO — STATUS (COMPLETE - 383 pages live)
| Page Type | Pages | Routes | Status |
|-----------|-------|--------|--------|
| Unit conversion pairs | 192 | /convert/[cat]/[pair] | ✅ LIVE |
| Category hubs | 6 | /convert/[cat] | ✅ LIVE |
| Master conversion hub | 1 | /convert | ✅ LIVE |
| Percentage calculators | 120 | /calculate/what-is-X-percent-of-Y | ✅ LIVE |
| Calculator hub | 1 | /calculate | ✅ LIVE |
| Comparison pages | 6 | /compare/[slug] | ✅ LIVE |
| Comparison hub | 1 | /compare | ✅ LIVE |
| How-to guides | 54 | /how-to/[slug] | ✅ LIVE |
| How-to hub | 1 | /how-to | ✅ LIVE |
| Disclaimer | 1 | /disclaimer | ✅ LIVE |
| **Total new pages** | **383** | | **617 total sitemap URLs** |

**Data files**: `conversion-data.ts` (6 categories, 35 units), `comparison-data.ts` (6 comparisons)

#### Future expansion (not yet built):
| Page Type | Pages | Traffic Potential |
|-----------|-------|-------------------|
| File format conversions | 134 | 100K-500K/mo |
| More how-to guides | 140 (54 done) | 50K-200K/mo |
| More comparison pages | 100+ | 50K-100K/mo |
| Reference tables | 65 | 30K-50K/mo |

### Phase 4: Revenue Stack (Beyond AdSense)
| Channel | Monthly at Scale |
|---------|-----------------|
| Display Ads (AdSense → Mediavine → Raptive) | $5K-$175K |
| UtilsNow Pro ($4.99/mo via LemonSqueezy) | $1.5K-$750K |
| Affiliate marketing | $3K-$60K |
| API access | $2K-$25K |
| Chrome extension | $750-$15K |
| White-label licensing | $3K-$20K |
| Sponsored placements | $1.5K-$15K |

### Premium UX Features (Future)
- Micro-interactions (copy animations, button feedback)
- Onboarding flow (Developer/Designer/Student personas)
- Usage dashboard + gamification (badges, streaks, shareable stats)
- Tool of the Day
- Progressive disclosure (Basic/Advanced modes)
- Embeddable widgets (/embed/[tool])
- Comparison pages (/vs/tinywow, /vs/10015)
- Audience landing pages (/for/developers, /for/students)

---

## Manual Actions Required (Owner)

| # | Action | Time | Where |
|---|--------|------|-------|
| 1 | Submit domain to BlueCoat | 2min | sitereview.bluecoat.com |
| 2 | Submit to Zscaler | 2min | sitereview.zscaler.com |
| 3 | Submit to FortiGuard | 2min | fortiguard.fortinet.com/faq/wfratingsubmit |
| 4 | Submit to BrightCloud | 2min | brightcloud.com/tools/change-request.php |
| 5 | Submit to Norton Safe Web | 2min | safeweb.norton.com |
| 6 | Submit to Brave Search | 2min | search.brave.com/submit-url |
| 7 | Connect LinkedIn Page in Postiz | 5min | http://200.141.2.221 → Integrations → LinkedIn Page |
| 8 | Generate Postiz API key | 2min | http://200.141.2.221 → Settings → Developers |
| 9 | Request indexing 10 URLs/day in GSC | 10min/day | search.google.com/search-console → URL Inspection |
| 10 | Check AdSense approval | 1min | adsense.google.com |

---

## AI Content & Video Pipeline (Built Aug 14, 2026)

### Gemini-Powered Social Posting (LIVE)
- **Script**: `/opt/automation/auto-social-gemini.sh` (428 lines)
- **API**: Gemini 2.5 Flash (free tier)
- **Key**: `/opt/automation/.gemini-key`
- **Schedule**: Cron 3x/day (9 AM, 1 PM, 6 PM IST)
- **Platforms**: LinkedIn (published), Bluesky (published), X/Twitter (credits depleted)
- **Content**: Platform-native, problem-first hooks, category-aware prompts
- **Fallback**: Template-based if Gemini API fails
- **Log**: `/var/log/utilsnow-social-ai.log`

### AI Video Pipeline (LIVE — Daily Auto-Generation + YouTube Upload)
- **Location**: `/opt/automation/video-pipeline/`
- **Pipeline**: Screenshots (Playwright) → Script (Gemini) → Voiceover (Edge TTS) → Video (FFmpeg)
- **Output**: 1920x1080 MP4, Ken Burns zoom, crossfade transitions, branded intro, background music
- **Narration**: 60-120s (longer than initial 22s test)
- **Default voice**: en-US-AndrewNeural (US English, global audience)
- **Voice options**: 7 regional voices (us, uk, in, au + female variants); Indian English: en-IN-NeerjaExpressiveNeural
- **Shorts**: Mobile screenshots (not cropped desktop) for vertical format
- **Subtitles**: Fixed VTT comma timestamp bug
- **Cost**: $0.01-0.05 per video
- **Videos completed**: color-picker, base64-encoder, rot13-encoder, base32-encoder, json-formatter, word-counter
- **Daily cron**: 2:00 AM UTC — `/opt/automation/video-pipeline/daily-video.sh`
- **Auto-upload**: 2:30 AM UTC — `/opt/automation/youtube-uploader/auto-upload.sh`
- **Known issue**: Playwright chromium_headless_shell gets cleaned up, needs periodic reinstallation

### YouTube API (LIVE — Aug 26, 2026)
- **Google Cloud project**: utilsnow-youtube
- **OAuth client**: Configured, app published (in production)
- **Token**: `/opt/automation/youtube-uploader/token.json`
- **Upload script**: `/opt/automation/youtube-uploader/upload_video.py`
- **Auto-upload script**: `/opt/automation/youtube-uploader/auto-upload.sh`
- **Schedule**: Daily cron at 2:30 AM UTC (after video generation at 2:00 AM)
- **First upload**: https://youtube.com/watch?v=3hNwAyJl_u4
- **API audit**: Form submitted, waiting for approval

### Google Analytics 4
- **Measurement ID**: G-EJLXNS4PYF
- **Env var**: NEXT_PUBLIC_GA_ID in .env.local
- **Status**: LIVE on all pages

### LinkedIn Algorithm Optimization (Aug 15, 2026)

**CRITICAL FINDING:** Posting 4x/day was causing 40%+ reach drop per post (confirmed by 6 studies, 2M+ posts analyzed).

**Old schedule (HARMFUL):** Python 1x/day + Postiz 3x/day = 4 posts/day = 28/week
**New schedule (OPTIMIZED):** Python 3x/week + Postiz 3x/week = 6 posts/week, 24h gap

| Day | LinkedIn Source | Bluesky | Content Type |
|-----|---------------|---------|-------------|
| Mon | Python project (Java/tech) | ✅ Postiz | Personal brand |
| Tue | Postiz (UtilsNow tool) | ✅ Postiz | Tool promotion |
| Wed | Python project (Java/tech) | ✅ Postiz | Personal brand |
| Thu | Postiz (UtilsNow tool) | ✅ Postiz | Tool promotion |
| Fri | Python project (Java/tech) | ✅ Postiz | Personal brand |
| Sat | Postiz (UtilsNow tool) | ✅ Postiz | Tool promotion |
| Sun | REST | ✅ Postiz | No LinkedIn |

**Script:** `/opt/automation/auto-social-optimized.sh`
**Cron:** `0 3 * * *` (8:30 AM IST) — posts LinkedIn only on Tue/Thu/Sat, Bluesky daily

**Key rules (data-backed):**
- Max 1 LinkedIn post/day (40% reach drop at 2+/day)
- Min 24h gap between LinkedIn posts
- 80% value / 20% promotional content mix
- Links in FIRST COMMENT, never in post body (50% reach penalty)
- Reply to every comment within 60 minutes
- Best times: 8:30 AM IST Tue-Thu

---

## Multi-Platform Social Media Strategy (Updated Aug 26, 2026)

### Active Platforms
| Platform | Account | Status | Automation |
|----------|---------|--------|-----------|
| LinkedIn (personal) | Bharath S | ✅ PUBLISHING | Postiz 3x/week + Python 3x/week + Engagement bot 2x/day |
| Bluesky | @utilsnow.bsky.social | ✅ PUBLISHING (11+ posts) | Postiz daily + screenshots |
| Dev.to | UtilsNow | ✅ PUBLISHING (4 articles) | 2x/week via Gemini AI (`devto-publisher.sh`) |
| YouTube | @utilsnow | ✅ PUBLISHING | Daily auto-generated videos + auto-upload |
| Facebook | UtilsNow (page) | ✅ CREATED | Manual |
| Instagram | @utilsnow | ✅ CREATED | Manual (business account) |
| Threads | @utilsnow | ✅ CREATED | Created from Instagram |
| Pinterest | UtilsNow (business) | ✅ CREATED | Domain verification tag deployed, pin generator ready |
| X/Twitter | @techieBharath | ❌ Credits depleted | Skip (paid API $0.20/post) |
| TikTok | N/A | ❌ Not available in India | Skip |
| Reddit | To be created | ⏳ Pending | Manual posting only |

### Platforms To Add (Remaining)
| Platform | Type | Content | Frequency |
|----------|------|---------|-----------|
| LinkedIn Newsletter | Newsletter | "The Developer Toolkit" — weekly edition | 1x/week |
| Reddit | Manual posts | Tool announcements, community engagement | 2-3x/week |

### LinkedIn Engagement (Automated)
- **Engagement bot**: `/opt/automation/linkedin-engage.sh` — runs 2x/day (Mon-Sat)
- **Comment responder**: `/opt/bharath-se-automation/engagement/comment_responder.py`
- **Features**: Fetch comments → classify (substantive/spam) → Gemini AI reply → post threaded response
- **Golden Hour**: Monitors at T+5/15/30/60 minutes after each post

### Carousel Image Service
- **Service**: `/opt/automation/carousel-service/` (Satori + Resvg)
- **Port**: 3457 (systemd: carousel-service)
- **API**: `POST http://localhost:3457/api/slides`
- **Output**: 1080x1080 PNG slides (hook, content, CTA with utilsnow.com)

### LinkedIn Algorithm Rules (Data-Backed)
- Max 1 post/day (40% reach drop at 2+/day, 6 studies, 2M+ posts)
- Min 24h gap between posts
- Carousels get 5.85x more engagement than text (Buffer, 45M posts)
- Links in body (raw URL) = no penalty. Link preview CARDS = 50% penalty
- Reply to comments within 60 minutes (Golden Hour)
- 80% value / 20% promotional content mix

### LinkedIn Groups To Join (Manual)
- Python Developers Community (1.9M members)
- Front End Developer
- Freelance Developers (8K)
- Productivity Tips & Best Practices (23K)
- Link Building and SEO (30K)

### Accounts Owner Needs To Create
| Platform | Action | Credential Needed | Status |
|----------|--------|-------------------|--------|
| Dev.to | Sign up → API key | API key | ✅ DONE — stored in .social-credentials |
| YouTube | Create channel → Enable Data API → OAuth | Client ID + Secret | ✅ DONE — token.json saved |
| Mastodon | Sign up → Create app → Token | Access token | ✅ DONE (new account, old suspended) |
| Telegram | @BotFather → /newbot + Create @utilsnow channel | Bot token | ✅ DONE |
| Discord | Create server → Webhook | Webhook URL | ✅ DONE |
| Facebook | Create page | Page access | ✅ DONE |
| Instagram | Create business account | Business account | ✅ DONE |
| Pinterest | Create business account | Domain verification | ✅ DONE — meta tag deployed |
| Reddit | Create account | Account | ⏳ Pending |
| Brevo | Sign up → SMTP credentials | SMTP host/port/user/pass | ⏳ Pending |

### Multi-Platform Posting — 5 Automated + 6 Manual Platforms

| Platform | Handle/Channel | Status | Automation |
|----------|---------------|--------|----------|
| LinkedIn | Bharath S (personal) | ✅ PUBLISHING | Postiz + engagement bot |
| Bluesky | @utilsnow.bsky.social | ✅ PUBLISHING | Postiz daily |
| Mastodon | @UtilsNow@mastodon.social | ✅ PUBLISHING | auto-social-optimized.sh |
| Telegram | @utilsnow channel | ✅ PUBLISHING | auto-social-optimized.sh |
| Discord | UtilsNow Community webhook | ✅ PUBLISHING | auto-social-optimized.sh |
| Dev.to | UtilsNow | ✅ PUBLISHING | devto-publisher.sh (2x/week) |
| YouTube | @utilsnow | ✅ PUBLISHING | auto-upload.sh (daily) |
| Facebook | UtilsNow page | ✅ CREATED | Manual |
| Instagram | @utilsnow | ✅ CREATED | Manual |
| Threads | @utilsnow | ✅ CREATED | Manual |
| Pinterest | UtilsNow (business) | ✅ CREATED | Pin generator ready |

**Social posting script:** `/opt/automation/auto-social-optimized.sh`
**Dev.to publisher:** `/opt/automation/devto-publisher.sh`
**YouTube uploader:** `/opt/automation/youtube-uploader/auto-upload.sh`
**Credentials:** `/opt/automation/.social-credentials`
**Cron (social):** Daily at 8:30 AM IST — single trigger posts to 5 platforms
**Cron (Dev.to):** 2x/week via Gemini AI
**Cron (YouTube):** Daily 2:30 AM UTC (after video generation at 2:00 AM)
**Content:** Gemini AI generates platform-native content; viral templates + "link in comments" pattern

### Platforms NOT Available (Updated Aug 26, 2026)
| Platform | Reason | Alternative |
|----------|--------|-------------|
| Hashnode | API became PAID-ONLY (May 2026) | Skip — use Dev.to instead |
| X/Twitter | API costs $0.20 per post with URL | Skip — too expensive |
| Medium | API dead since Jan 2025 | Skip — no new tokens |
| TikTok | Not available in India | Skip |
| Lemmy | Registration requires manual approval | Apply at programming.dev |
| Reddit | Commercial API requires manual approval + $0.24/1K calls | Post manually only |
