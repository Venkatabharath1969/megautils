# UtilsNow — Complete Project Context

> **Single source of truth for all AI sessions. Read this FIRST.**
> **Last updated: 2026-08-13**

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
| **Tools** | **191 tools** (174 utility + 17 AI-powered) across 17 categories |
| **Monetization** | Google AdSense (pub-3062425605979427) — under review |
| **Privacy** | All processing in user's browser. No data uploaded/stored. No login. |
| **Blog** | PostgreSQL + file-based fallback, 89 posts auto-publishing through Nov 2028 |
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
- **File**: `src/lib/tool-registry.ts` (1,500 lines)
- Contains ALL 191 tools + 17 categories with types, helpers, and search keywords
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
6. Categories grid (17 categories)
7. Product Hunt badge
8. Trust bar
9. CollectionPage schema

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
| **TOTAL** | | **191 unique** |

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
| FAQPage | Every tool (191 tools) | ✅ |
| BreadcrumbList | Every tool (tool-page.tsx) | ✅ |
| ItemList | Every category page (17) | ✅ |
| Article + author + publisher | Every blog post (89) | ✅ |

### Discovery Files
| File | URL | Details | Status |
|------|-----|---------|--------|
| robots.txt | /robots.txt | 40+ AI bots allowed | ✅ |
| sitemap.xml | /sitemap.xml | 226 URLs, accurate lastmod | ✅ |
| llms.txt | /llms.txt | Summary for AI bots | ✅ |
| llms-full.txt | /llms-full.txt | 2,024 lines, 128KB, all 191 tools detailed | ✅ |
| ads.txt | /ads.txt | ca-pub-3062425605979427 | ✅ |
| manifest.json | /manifest.json | PWA manifest | ✅ |
| humans.txt | /humans.txt | Creator info | ✅ |
| security.txt | /.well-known/security.txt | RFC 9116 with Expires | ✅ |
| RSS feed | /feed.xml | Blog posts (last 20) | ✅ |
| OG image | /opengraph-image | Dynamic 1200x630, edge runtime | ✅ |

### AI Bot Coverage (robots.txt — 40+ bots)
Google (Googlebot, Google-Extended), ChatGPT (GPTBot, OAI-SearchBot, ChatGPT-User), Claude (ClaudeBot, Claude-SearchBot, Claude-Web, anthropic-ai), Perplexity (PerplexityBot, Perplexity-User), Bing (Bingbot), Apple (Applebot, Applebot-Extended), Meta (Meta-ExternalAgent, meta-webindexer, FacebookBot), Amazon (Amazonbot, Amzn-SearchBot, Amzn-User), Brave (BraveBot), You.com (YouBot), Phind (PhindBot), DuckDuckGo (DuckDuckBot, DuckAssistBot), Kagi (Kagibot), CCBot, DeepSeekBot, MistralAI-User, QwenBot, cohere-ai. **Blocked**: Bytespider.

### Verification & Monetization
| Service | Status |
|---------|--------|
| Google Search Console | ✅ Verified, 7+ impressions |
| Bing Webmaster Tools | ✅ Verified |
| Google AdSense | ⏳ Under review (pub-3062425605979427) |
| IndexNow | ✅ Active (daily auto-submit) |
| GDPR Consent | ✅ Google 3-choice CMP |

### Pages & UX Features
| Feature | Status |
|---------|--------|
| Cmd+K Command Palette (Fuse.js fuzzy search) | ✅ All 191 tools searchable with aliases |
| Share buttons (X, LinkedIn, Copy, Native Share) | ✅ Every tool page |
| Favorites/bookmarks (star icon, localStorage) | ✅ Every tool page + homepage section |
| Recently Used tools (localStorage) | ✅ Homepage section |
| Popular Tools (8 curated) | ✅ Homepage section |
| Related tools on tool pages | ✅ Auto-derived, 4 per page |
| 404 page with category links | ✅ |
| Error boundary with retry | ✅ |
| Loading spinner | ✅ |
| Cookie/Privacy/Terms/About/Contact pages | ✅ |
| Blog + RSS feed | ✅ |
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

### Social Media (Postiz)
| Platform | Account | Status |
|----------|---------|--------|
| X/Twitter | @techieBharath | ✅ Connected |
| LinkedIn | Bharath S (personal) | ✅ Connected |
| Bluesky | @utilsnow.bsky.social | ✅ Connected |
| LinkedIn Page | Techie Boy | ❌ Not connected (owner needs to add "LinkedIn Page" integration) |

**Postiz API**: Public API at `/api/public/v1`. Official n8n community node: `n8n-nodes-postiz`. API key needed from Settings → Developers → Public API.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/tool-registry.ts` | **Single source of truth**: ALL 191 tools + 17 categories + search keywords |
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
| `src/app/robots.ts` | robots.txt (40+ AI bots) |
| `src/app/sitemap.ts` | Dynamic sitemap (226 URLs) |
| `src/i18n/translations.ts` | 10 languages |
| `src/lib/blog-data.ts` | Blog: PostgreSQL + fallback |
| `public/llms.txt` | AI discovery summary |
| `public/llms-full.txt` | AI discovery full (128KB) |
| `public/ads.txt` | AdSense publisher |
| `public/manifest.json` | PWA manifest |
| `public/humans.txt` | Creator info |
| `public/.well-known/security.txt` | Security contact (RFC 9116) |

---

## Automated Cron Jobs (Phase 2 — All Running)

| Schedule | Script | Purpose | Human Effort |
|----------|--------|---------|-------------|
| Daily 3:00 AM IST | auto-index-all.sh | IndexNow batch (230 URLs) + sitemap ping | ZERO |
| Daily 9 AM, 1 PM, 6 PM IST | auto-social-post.sh | Post random tool to X/LinkedIn/Bluesky | ZERO |
| Weekly Sunday 3 AM UTC | auto-rebuild.sh | Rebuild + deploy | ZERO |
| Weekly Monday 7 AM UTC | generate-social-posts.ts | Generate social content | ZERO |

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
- **Submits**: ALL 230 sitemap URLs to IndexNow batch API
- **Also**: Detects new blog posts from DB not yet in sitemap
- **Log**: `/var/log/utilsnow-autoindex.log`
- **Tested**: HTTP 200, all URLs accepted

---

## Recent Upgrades

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

---

## Master Plan — Remaining Phases

### Phase 2: Automation Engine — STATUS (COMPLETE)
| Automation | Status | Details |
|-----------|--------|---------|
| Auto social posting (3x/day) | ✅ LIVE | Shell script → Postiz API, 5 templates, 3 platforms |
| Auto indexing (230 URLs/day) | ✅ LIVE | IndexNow batch API, tested HTTP 200 |
| Uptime monitoring | ✅ LIVE | Uptime Kuma at http://200.141.2.221:8090 |
| Newsletter system | ✅ DEPLOYED | Listmonk at http://200.141.2.221:9090 (admin/UtilsNow2026!) |
| Backlink directories | ✅ READY | backlink-pilot (259 sites), config created, tracker ready |
| Postiz OAuth app | ✅ CREATED | Client ID: pca_2sFVY55T8v3GcgTb4iPDXdOSafw3bfKR |
| Auto blog posts (1/day, SEO) | ⏳ Phase 3 | n8n + Gemini 2.5 Flash |
| Auto content refresh | ⏳ Phase 3 | n8n + GSC API + Gemini |

### Phase 3: Programmatic SEO (1,300+ pages)
| Page Type | Pages | Traffic Potential |
|-----------|-------|-------------------|
| Unit conversion pairs | 568 | 100K-200K/mo |
| "What is X% of Y" calculators | 200+ | 50K-200K/mo |
| File format conversions | 134 | 100K-500K/mo |
| "How to" guides | 194 | 50K-200K/mo |
| Comparison pages | 140 | 50K-100K/mo |
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
