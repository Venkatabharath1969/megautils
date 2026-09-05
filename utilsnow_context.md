# UtilsNow — Complete Project Context

> **Single source of truth for all AI sessions. Read this FIRST.**
> **Last updated: 2026-09-05 (235 tools, 18 categories, 50 SaaS comparison pages, Google spam update recovery, GSC API, monetization activated)**

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
| **Tools** | **235 tools** (217 utility + 18 AI-powered) across **18 categories** |
| **Monetization** | Google AdSense (pub-3062425605979427) — active ad slots, Ko-fi donations, Pro waitlist ($4.99/mo) |
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

## Core Architecture

### Tool Registry (Single Source of Truth)
- **File**: `src/lib/tool-registry.ts` (~1,825 lines)
- Contains ALL 235 tools + 18 categories with types, helpers, and search keywords
- Every tool has 5-15 fuzzy search aliases (e.g., "md to text" -> Markdown Converter)
- Exports: `TOOLS`, `CATEGORIES`, `POPULAR_TOOLS`, `getToolsByCategory()`, `getToolById()`, `getRelatedTools()`, `getCategoryById()`, `searchTools()`
- **ALL components import from here** — no more duplicate tool lists

### Cmd+K Command Palette
- **File**: `src/components/command-palette.tsx`
- Opens on Cmd+K / Ctrl+K globally
- Fuse.js fuzzy search (name weight 3, keywords weight 2, description weight 1)
- Keyboard navigation (Up/Down Enter Escape)
- Shows: Recent tools (localStorage) -> Popular tools -> Search results
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
2. Hero section (animated gradient text, glow orbs background)
3. Trust indicators above the fold (Private, No Sign-up, Browser-Based, Free)
4. Your Favorites (if user has any)
5. Recently Used (if user has history)
6. Popular Tools (12 curated tools, always shown)
7. Categories grid (18 categories with card hover lift effects)
8. Product Hunt badge
9. Trust bar (tool count shows "230+")
10. Social proof section (usage stats, tool count, browser-based, zero data)
11. CollectionPage + ItemList schema (18 categories)

---

## Category Breakdown (Actual Counts — 18 Categories, 235 Tools)

| Category | ID | Count |
|----------|----|-------|
| Image Tools (inc. AI) | image | 31 |
| Text Tools | text | 27 |
| Developer Tools | developer | 25 |
| Financial Calculators | financial | 25 |
| SEO Tools | seo | 18 |
| PDF Tools | pdf | 17 |
| CSS Tools | css | 15 |
| Encoders & Decoders | encoders | 14 |
| Unit Converters | converters | 14 |
| Generators | generators | 10 (+ 4 cross-refs from crypto/string) |
| Color Tools | color | 8 |
| String Utilities | string | 6 |
| Date & Time | datetime | 6 |
| Math & Science | math | 5 |
| Network & API | network | 4 |
| Markdown Tools | markdown | 4 |
| Content & Writing | content | 3 |
| Crypto & Hash | crypto | 3 |
| **TOTAL** | | **235 unique** |

---

## New Tools Added Since Aug 26 (194 -> 235, +41 tools)

### PDF Tools (17 new — entire new category)
pdf-merge, pdf-compress, pdf-split, pdf-unlock, pdf-page-numbers, pdf-watermark, pdf-rotate, pdf-sign, pdf-to-jpg, pdf-to-text, pdf-protect, pdf-crop, pdf-reorder, jpg-to-pdf, text-to-pdf, word-to-pdf, html-to-pdf

### Image Tools (12 new)
image-compressor, heic-to-jpg, social-media-resizer, exif-viewer, image-filters, image-crop, ocr-text-extractor, video-to-gif, meme-generator, image-collage, image-watermark, screen-recorder

### Developer Tools (1 new)
api-request-builder

### Text Tools (3 new)
ai-humanizer, typing-speed-test, citation-generator

### Financial Tools (3 new)
currency-converter, invoice-generator, calorie-calculator (moved to math)

### Generators (3 new)
resume-builder, logo-maker, whiteboard

### CSS Tools (1 new)
text-gradient-generator

### DateTime (1 new)
pomodoro-timer

---

## Feature Upgrades (28 Existing Tools Enhanced)

| Tool | Enhancement |
|------|-------------|
| JSON Formatter | Interactive tree view |
| Regex Tester | Pattern explanation panel |
| Color Palette Generator | Random + Lock/Unlock + Spacebar shortcut |
| QR Code Generator | Logo overlay on QR codes |
| Code to Image | SVG export |
| Password Generator | Crack time estimate + passphrase options + download |
| Word Counter | Syllables, Flesch score, unique words, pages |
| Case Converter | Alternating case + remove diacritics |
| Meta Tag Generator | Live SERP preview + social previews |
| Fake Data Generator | SQL output + 8 new field types |
| Privacy Policy Generator | CCPA compliance toggle |
| AI Grammar Checker | Writing style reports |
| AI Paraphraser | 8 modes (was 2): standard, fluency, formal, simple, academic, creative, shorten, expand |
| Base64 Encoder | Image preview + MIME wrapping + size display |
| Text-to-Speech | Word-by-word highlighting |
| Hash Generator | HMAC-SHA1 + HMAC-SHA512 |
| UUID Generator | Format options (JSON/CSV/SQL) + 500 bulk |
| Lorem Ipsum | HTML + List output modes |
| Htaccess Generator | Fixed hardcoded domain bug |
| All financial calculators | Recharts pie/area charts |
| All markdown tools | PDF download + Copy Rich Text + File upload |
| Contrast Checker | Enhanced |
| Markdown Table Generator | Enhanced |

---

## New Shared Components

| Component | File | Technology |
|-----------|------|------------|
| PdfDownloadButton | `src/components/pdf-download-button.tsx` | html2pdf.js (lazy-loaded) |
| CopyRichTextButton | `src/components/copy-rich-text-button.tsx` | ClipboardItem API |

---

## npm Packages (Current)

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.12 | Framework |
| react / react-dom | 19.2.4 | UI |
| @huggingface/transformers | ^4.2.0 | AI models (segmentation, depth, classification, detection, caption) |
| @imgly/background-removal | ^1.7.0 | AI background removal |
| @upscalerjs/esrgan-slim | ^1.0.0 | AI image upscaling |
| @vladmandic/face-api | ^1.7.15 | AI face detection/blur |
| upscaler | ^1.0.0 | AI upscaler core |
| tesseract.js | ^7.0.0 | OCR text extraction |
| heic2any | ^0.0.4 | HEIC/HEIF image conversion |
| html2pdf.js | ^0.10.2 | PDF download from HTML |
| pdf-lib | ^1.17.1 | PDF manipulation (merge, split, watermark, etc.) |
| pdfjs-dist | ^5.6.205 | PDF rendering/parsing |
| mammoth | ^1.12.2 | Word (.docx) to HTML conversion |
| jszip | ^3.10.1 | ZIP file handling |
| recharts | ^3.10.1 | Charts for financial calculators |
| fuse.js | ^7.5.0 | Fuzzy search |
| js-yaml | ^5.3.0 | YAML parsing |
| lucide-react | ^1.28.0 | Icons |
| next-themes | ^0.4.6 | Dark/light mode |
| next-intl | ^4.13.4 | i18n |
| clsx | ^2.1.1 | Class merging |
| pg | ^8.22.0 | PostgreSQL client |

### New Since Aug 26
recharts, html2pdf.js, tesseract.js, heic2any, jszip, pdfjs-dist, pdf-lib, mammoth

---

## Complete SEO & Trust Stack

### Structured Data (Schema.org JSON-LD)
| Schema | Location | Status |
|--------|----------|--------|
| Organization + founder | layout.tsx (every page) | Done |
| Person (Bharath S) with @id | layout.tsx (every page) | Done |
| WebSite + SearchAction | layout.tsx (every page) | Done |
| CollectionPage + ItemList (18 cats) | Homepage (page.tsx) | Done |
| **WebApplication** (was SoftwareApplication) | Every tool (tool-page.tsx) | Done |
| FAQPage | Every tool (235 tools) | Done |
| BreadcrumbList | Every tool (tool-page.tsx) | Done |
| ItemList | Every category page (18) | Done |
| Article + author + publisher | Every blog post (89) | Done |
| datePublished + dateModified | Every tool (tool-page.tsx) | Done |

### Discovery Files
| File | URL | Details | Status |
|------|-----|---------|--------|
| robots.txt | /robots.txt | 40+ AI bots + Mediapartners-Google allowed | Done |
| sitemap.xml | /sitemap.xml | ~710 URLs, accurate lastmod | Done |
| llms.txt | /llms.txt | Summary for AI bots (updated with all 235 tools) | Done |
| llms-full.txt | /llms-full.txt | Full details for AI discovery | Done |
| ads.txt | /ads.txt | ca-pub-3062425605979427 | Done |
| manifest.json | /manifest.json | PWA manifest | Done |
| humans.txt | /humans.txt | Creator info | Done |
| security.txt | /.well-known/security.txt | RFC 9116 with Expires | Done |
| RSS feed | /feed.xml | Blog posts (last 20) | Done |
| OG image | /opengraph-image | Dynamic 1200x630, edge runtime | Done |

### SEO Improvements (New since Aug 26)
- **generateStaticParams** on all tool pages (SSG via `src/app/tools/[slug]/page.tsx`)
- **Unique meta descriptions** per tool (from tool-registry.ts)
- **WebApplication schema** (changed from SoftwareApplication)
- **dateModified + datePublished** in JSON-LD on every tool page
- **Twitter cards + OG images** on all pages
- Tool count unified to **"230+"** across homepage, trust bar, social proof section
- llms.txt updated with all 235 tools
- **50 SaaS comparison pages** added (buyer-intent keywords) via `src/lib/saas-comparison-data.ts`

### AI Bot Coverage (robots.txt — 40+ bots)
Google (Googlebot, Google-Extended, Mediapartners-Google), ChatGPT (GPTBot, OAI-SearchBot, ChatGPT-User), Claude (ClaudeBot, Claude-SearchBot, Claude-Web, anthropic-ai), Perplexity (PerplexityBot, Perplexity-User), Bing (Bingbot), Apple (Applebot, Applebot-Extended), Meta (Meta-ExternalAgent, meta-webindexer, FacebookBot), Amazon (Amazonbot, Amzn-SearchBot, Amzn-User), Brave (BraveBot), You.com (YouBot), Phind (PhindBot), DuckDuckGo (DuckDuckBot, DuckAssistBot), Kagi (Kagibot), CCBot, DeepSeekBot, MistralAI-User, QwenBot, cohere-ai. **Blocked**: Bytespider.

### Verification & Monetization
| Service | Status |
|---------|--------|
| Google Search Console | Verified, ~684 static pages, ~6 impressions/week (spam update impact) |
| Bing Webmaster Tools | Verified |
| Google AdSense | Active ad slots (pub-3062425605979427), AdSlot component with real `ins` tags |
| Google Analytics 4 | Live (G-EJLXNS4PYF) + affiliate click tracking |
| IndexNow | Active (daily auto-submit) |
| GDPR Consent | Cookie consent banner with Consent Mode v2 |

---

## CRITICAL: Google August 2026 Spam Update

- **Spam update completed**: August 21, 2026
- **Impact**: Impressions dropped from **8,201/week to ~4/week** (99.95% drop)
- **Root cause**: Likely the 900 programmatic /calculate/ pages triggered thin-content spam signals
- **Recovery actions taken**:
  - /calculate/ pages reverted from **900 -> 120** to reduce thin content
  - Static pages reduced from **1,464 -> 684**
  - Focus shifted to quality content over quantity
- **Current GSC impressions** (last 7 days as of Sep 5): **~6** (near zero)
- **Recovery timeline**: May take **weeks to months** after spam update lifts
- **GSC monitoring**: Daily automated check via `/opt/automation/gsc-api/daily-gsc-check.sh`

---

## Google Search Console API

| Key | Value |
|-----|-------|
| **Token** | `/opt/automation/gsc-api/gsc_token.json` |
| **Fetch script** | `/opt/automation/gsc-api/fetch_gsc_data.py` |
| **Daily check script** | `/opt/automation/gsc-api/daily-gsc-check.sh` |
| **Data output** | `/opt/automation/gsc-api/data/` |
| **Site URL** | `https://utilsnow.com/` |
| **Account** | `co.bharaths@gmail.com` (Owner) |
| **Scope** | `https://www.googleapis.com/auth/webmasters` (full access) |
| **Run command** | `cd /opt/automation/video-pipeline && source .venv/bin/activate && python3 /opt/automation/gsc-api/fetch_gsc_data.py` |

**Always check GSC data before making SEO decisions.**

---

## UI/UX Overhaul (New since Aug 26)

| Feature | Details |
|---------|---------|
| Animated gradient hero text | `gradient-text` class with animation on homepage h1 |
| Hero background glow orbs | `hero-glow` class on homepage wrapper |
| Trust indicators above the fold | 4 trust badges (Private, No Sign-up, Browser-Based, Free) |
| Card hover lift effects | `hover:-translate-y-1 hover:shadow-xl` on category cards + tool cards |
| Tool page card styling | `rounded-2xl`, `shadow-sm`, gradient accent border (`h-px bg-gradient-to-r via-primary/30`) |
| Fade-in-up animations | `animate-fade-in-up` + `stagger-1`, `stagger-2` CSS classes |
| Button micro-interactions | Hover/active states on all interactive elements |
| Smooth FAQ accordion | `<details>` with `group-open:rotate-90` chevron transition |
| Print CSS | Print-friendly styles |
| Cross-category suggestions | "You Might Also Like" section on every tool page (4 tools from related categories) |
| Cross-category map | `CROSS_CATEGORY_MAP` in tool-page.tsx — maps each category to 4 related tools |

---

## Monetization Setup (Active)

| Feature | Status | Details |
|---------|--------|---------|
| AdSlot component | Active | Real AdSense `ins` tags (pub-3062425605979427) |
| Ad slot: below tool | Active | `<AdSlot slot="below-tool" />` after tool content |
| Ad slot: mid-content | Active | `<AdSlot slot="mid-content" />` between help content and FAQs |
| Ko-fi donation button | Active | In footer, links to ko-fi.com/utilsnow |
| GitHub FUNDING.yml | Active | `.github/FUNDING.yml` (ko_fi: utilsnow, github: Venkatabharath1969) |
| Pro page | Active | `/pro` — $4.99/month, waitlist only (no payment integration yet) |
| Affiliate URLs | Active | In `pro-suggestion.tsx` — plain URLs, no tracking IDs yet |
| ProSuggestion | Active | 17 categories with contextual affiliate suggestions |
| Pro upsell banner | Active | After 10 daily tool uses (localStorage tracker, dismissible) |
| Embeddable widgets | Active | `/embed/[slug]` + EmbedCode copy button on every tool |
| Google Analytics 4 | Active | G-EJLXNS4PYF with affiliate click tracking |

---

## Current Numbers (September 5, 2026)

| Metric | Value |
|--------|-------|
| **Tool directories** | 235 |
| **Categories** | 18 |
| **Static pages** | ~684 |
| **Sitemap URLs** | ~710 |
| **SaaS comparison pages** | 50 |
| **Cron jobs** | 15 |
| **Build errors** | 0 |
| **GSC impressions (last 7 days)** | ~6 (spam update impact) |
| **AI-powered tools** | 18 |
| **Blog posts** | 89 (50 visible) |
| **How-to guides** | 54 |
| **Comparison pages (original)** | 8 |
| **npm dependencies** | 22 production |

---

## All 18 AI Tools

| Tool | URL | Technology | Model Size |
|------|-----|-----------|-----------|
| AI Background Remover | /tools/ai-bg-remover | @imgly/background-removal | 25MB |
| AI Image Upscaler | /tools/ai-image-upscaler | upscaler + esrgan-slim | 4.5MB |
| AI Content Detector | /tools/ai-content-detector | Pure JS heuristics | 0 |
| AI Grammar Checker | /tools/ai-grammar-checker | Pure JS rules + writing style reports | 0 |
| AI Paraphrasing Tool | /tools/ai-paraphraser | Pure JS + 300 synonyms, 8 modes | 0 |
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
| AI Text Humanizer | /tools/ai-humanizer | Pure JS text transformation | 0 |

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
| Carousel Service | 3457 | Satori + Resvg slide generation |

**VPS RAM usage: ~47% of 15GB**
**Cron jobs running: 15**
**Known issue**: Playwright chromium_headless_shell gets cleaned up periodically, needs reinstallation before video generation

### Social Media (Postiz + Direct API)
| Platform | Account | Status | Method |
|----------|---------|--------|--------|
| X/Twitter | @techieBharath | Credits depleted | Postiz (skipped) |
| LinkedIn | Bharath S (personal) | Connected | Postiz |
| Bluesky | @utilsnow.bsky.social | Connected | Postiz |
| Mastodon | @UtilsNow@mastodon.social | Connected | Direct API |
| Telegram | @utilsnow channel | Connected | Direct API |
| Discord | UtilsNow Community | Connected | Webhook |
| Dev.to | UtilsNow | Connected | Direct API (Gemini AI) |
| YouTube | @utilsnow | Connected | OAuth API |
| Facebook | UtilsNow page | Created | Manual |
| Instagram | @utilsnow | Created | Manual |
| Threads | @utilsnow | Created | Manual |
| Pinterest | UtilsNow (business) | Created | Manual (domain verified) |
| LinkedIn Page | Techie Boy | Not connected | Owner needs to add integration |

---

## Automated Cron Jobs (15 Running)

| Schedule | Script | Purpose | Platform/Details |
|----------|--------|---------|-----------------|
| Daily 3:00 AM IST (21:30 UTC) | auto-index-all.sh | IndexNow batch (~710 URLs) + sitemap ping | All sitemap URLs |
| 4x/week (Sun,Mon,Wed,Fri + Tue,Thu,Sat) | auto-social-optimized.sh | Post to LinkedIn/Bluesky/Mastodon/Telegram/Discord | Social posting |
| Daily 2:00 AM UTC | daily-video.sh | Generate tool demo video (Playwright+Gemini+TTS+FFmpeg) | Video pipeline |
| Daily 2:30 AM UTC | auto-upload.sh | Upload generated video to YouTube | YouTube |
| 2x/week (Tue, Fri 2 PM UTC) | devto-publisher.sh | Publish articles to Dev.to via Gemini AI | Dev.to |
| 2x/day Mon-Sat (4 AM + 7 AM UTC) | linkedin-engage.sh | LinkedIn comment engagement bot | LinkedIn |
| Weekly Sunday 3 AM UTC | auto-rebuild.sh | Rebuild + deploy | Infrastructure |
| Weekly Monday 7 AM UTC | generate-social-posts.ts | Generate social content batch | Social |
| Weekly Monday 5 AM UTC | auto-backlink-submit.sh | Backlink directory submissions | SEO |
| Daily 10:30 PM UTC | backup-databases.sh | Database backups | Infrastructure |
| Daily 6 AM UTC | telegram_token_watchdog.py | Token health monitoring | Bharath-SE |
| Daily 3:45 AM UTC | daily_engagement_briefing.py | Engagement report | Bharath-SE |
| **Daily 8 AM UTC** | **daily-gsc-check.sh** | **GSC data fetch + monitoring (NEW)** | **SEO/Recovery** |

**Total: 15 cron jobs, all ZERO human effort**

---

## Pages & UX Features

| Feature | Status |
|---------|--------|
| Cmd+K Command Palette (Fuse.js fuzzy search) | All 235 tools searchable with aliases |
| Share buttons (X, LinkedIn, Copy, Native Share) | Every tool page |
| Favorites/bookmarks (star icon, localStorage) | Every tool page + homepage section |
| Recently Used tools (localStorage) | Homepage section |
| Popular Tools (12 curated) | Homepage section |
| Social proof section | Homepage |
| Related tools on tool pages | Auto-derived, 4 per page |
| "You Might Also Like" cross-category section | Every tool page, 4 suggestions |
| helpContent on all tool pages | All 235 tools (category-specific, not template) |
| UsageCounter on all tool pages | 118K+ tracked uses, /api/usage endpoint |
| Cookie consent banner (Consent Mode v2) | All pages |
| PdfDownloadButton | Available for markdown tools |
| CopyRichTextButton | Available for markdown tools |
| Disclaimer page | /disclaimer |
| How-to guides (54 pages) | /how-to/[slug] + /how-to hub |
| SaaS comparison pages (50 pages) | /compare/[slug] |
| 404 page with category links | Done |
| Error boundary with retry | Done |
| Loading spinner | Done |
| Cookie/Privacy/Terms/About/Contact/Disclaimer pages | Done |
| Blog + RSS feed | 50 posts visible |
| "Last updated" freshness signal | "Last updated: September 2026" on every tool |
| Skip-to-content link (WCAG) | Done |
| ARIA labels on interactive elements | Done |
| Canonical URLs on ALL pages | Done |
| Preconnect for AdSense | Done |
| Print CSS | Done |
| Animated gradient hero + glow orbs | Homepage |
| Card hover lift effects | Category cards + tool cards |
| Smooth FAQ accordion | Every tool page |

---

## Domain Reputation (Corporate Firewall Block)

utilsnow.com was blocked by corporate firewalls as "Newly Registered Domain" (registered Aug 9, 2026). Auto-lift expected around ~Sep 10, 2026 (30-32 days).

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

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/tool-registry.ts` | **Single source of truth**: ALL 235 tools + 18 categories + search keywords (~1,825 lines) |
| `src/components/command-palette.tsx` | Cmd+K fuzzy search (Fuse.js) |
| `src/components/share-buttons.tsx` | X, LinkedIn, Copy, Native Share |
| `src/components/favorite-button.tsx` | Star bookmark (localStorage) |
| `src/components/tool-page.tsx` | Tool wrapper: breadcrumb, FAQs, related tools, share, favorite, schema, cross-category suggestions, ads |
| `src/components/header.tsx` | Header with Cmd+K trigger + mobile menu |
| `src/components/footer.tsx` | Footer: author, cookie policy, blog link, nav, Ko-fi donation button |
| `src/components/ad-slot.tsx` | AdSense ad slots (real `ins` tags in production) |
| `src/components/pdf-download-button.tsx` | PDF download via html2pdf.js (lazy-loaded) |
| `src/components/copy-rich-text-button.tsx` | Copy as rich text via ClipboardItem API |
| `src/components/pro-suggestion.tsx` | Contextual affiliate suggestions (17 categories, ~20 links) |
| `src/app/layout.tsx` | Root layout: schemas, AdSense, skip-link, preconnect, OG, CommandPalette |
| `src/app/page.tsx` | Homepage: favorites, recent, popular, categories, search, schema, trust indicators |
| `src/app/tools/[slug]/page.tsx` | Dynamic tool page with generateStaticParams (SSG) |
| `src/app/pro/page.tsx` | Pro landing page ($4.99/mo waitlist) |
| `src/app/compare/[slug]/page.tsx` | SaaS comparison pages (50 pages) |
| `src/app/not-found.tsx` | 404 page |
| `src/app/error.tsx` | Error boundary |
| `src/app/loading.tsx` | Loading spinner |
| `src/app/opengraph-image.tsx` | Dynamic OG image (1200x630, edge) |
| `src/app/feed.xml/route.ts` | RSS feed for blog |
| `src/app/cookies/page.tsx` | Cookie policy (GDPR) |
| `src/app/robots.ts` | robots.txt (40+ AI bots + Mediapartners-Google) |
| `src/app/sitemap.ts` | Dynamic sitemap (~710 URLs) |
| `src/i18n/translations.ts` | 10 languages |
| `src/lib/blog-data.ts` | Blog: PostgreSQL + fallback |
| `src/lib/comparison-data.ts` | 8 original comparison pages |
| `src/lib/saas-comparison-data.ts` | 50 SaaS comparison pages |
| `public/llms.txt` | AI discovery summary |
| `public/llms-full.txt` | AI discovery full |
| `public/ads.txt` | AdSense publisher |
| `public/manifest.json` | PWA manifest |
| `public/humans.txt` | Creator info |
| `public/.well-known/security.txt` | Security contact (RFC 9116) |
| `.github/FUNDING.yml` | Ko-fi + GitHub Sponsors |
| `src/components/file-upload.tsx` | Reusable FileUpload component |
| `src/components/export-button.tsx` | Reusable ExportButton component |
| `src/components/usage-counter.tsx` | UsageCounter component (on every tool page) |
| `src/app/api/usage/route.ts` | Usage counter API endpoint |
| `src/app/how-to/[slug]/page.tsx` | 54 how-to guide pages |
| `src/app/how-to/page.tsx` | How-to hub page |
| `src/app/disclaimer/page.tsx` | Disclaimer page |
| `REVENUE-ACTION-PLAN-SEP2026.md` | Revenue plan: target 1L/month by Dec 2026 |
| `AGENTS.md` | GSC API access info |
| `/opt/automation/AFFILIATE-SETUP.md` | Affiliate setup guide |
| `/opt/automation/devto-publisher.sh` | Dev.to auto-publishing script |
| `/opt/automation/auto-social-optimized.sh` | Social posting (5 platforms) |
| `/opt/automation/linkedin-engage.sh` | LinkedIn engagement bot |
| `/opt/automation/auto-backlink-submit.sh` | Backlink directory submissions |
| `/opt/automation/backup-databases.sh` | Database backup script |
| `/opt/automation/gsc-api/fetch_gsc_data.py` | GSC data fetch script |
| `/opt/automation/gsc-api/daily-gsc-check.sh` | Daily GSC monitoring cron |
| `/opt/automation/gsc-api/gsc_token.json` | GSC OAuth token |
| `/opt/automation/youtube-uploader/upload_video.py` | YouTube upload script |
| `/opt/automation/youtube-uploader/auto-upload.sh` | YouTube auto-upload script |
| `/opt/automation/youtube-uploader/token.json` | YouTube OAuth token |
| `/opt/automation/video-pipeline/daily-video.sh` | Daily video generation |

---

## Recent Upgrades (Chronological)

### Sep 1-5, 2026 — GSC API + Spam Recovery Monitoring
- Google Search Console API integration: full webmasters scope
- Token at `/opt/automation/gsc-api/gsc_token.json`
- Fetch script at `/opt/automation/gsc-api/fetch_gsc_data.py`
- Daily automated GSC check cron at 8 AM UTC
- Monitoring impressions for spam update recovery

### Aug 27 - Sep 5, 2026 — Massive Tool Expansion (194 -> 235)
- **17 PDF tools** (entire new category): merge, split, compress, unlock, watermark, rotate, sign, page numbers, crop, reorder, protect, to-jpg, to-text, jpg-to-pdf, text-to-pdf, word-to-pdf, html-to-pdf
- **12 new Image tools**: image-compressor, heic-to-jpg, social-media-resizer, exif-viewer, image-filters, image-crop, ocr-text-extractor, video-to-gif, meme-generator, image-collage, image-watermark, screen-recorder
- **3 new Text tools**: ai-humanizer, typing-speed-test, citation-generator
- **3 new Financial tools**: currency-converter, invoice-generator
- **3 new Generators**: resume-builder, logo-maker, whiteboard
- **1 new Developer tool**: api-request-builder
- **1 new CSS tool**: text-gradient-generator
- **1 new DateTime tool**: pomodoro-timer
- **1 new Math tool**: calorie-calculator
- New npm packages: recharts, html2pdf.js, tesseract.js, heic2any, jszip, pdfjs-dist, pdf-lib, mammoth
- 28 existing tools enhanced with major features (see Feature Upgrades section)
- New shared components: PdfDownloadButton, CopyRichTextButton
- UI/UX overhaul: animated gradient hero, glow orbs, trust indicators, card hover effects, gradient accent borders, fade-in animations, cross-category suggestions, print CSS

### Aug 27 - Sep 5, 2026 — SEO & Monetization
- generateStaticParams on all tool pages (SSG)
- Unique meta descriptions per tool
- WebApplication schema (changed from SoftwareApplication)
- dateModified + datePublished in schema
- Twitter cards + OG images on all pages
- 50 SaaS comparison pages (buyer-intent keywords)
- AdSlot component activated with real AdSense ins tags
- Ko-fi donation button in footer
- GitHub FUNDING.yml
- Second ad slot between help content and FAQs
- Pro page at $4.99/month (waitlist only)
- Affiliate URLs in pro-suggestion.tsx

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

### Aug 22-26, 2026 — Video Pipeline Enhancements
- Fixed subtitle bug (VTT comma timestamps)
- Fixed shorts generation (mobile screenshots instead of cropping desktop)
- Added Indian English voice (en-IN-NeerjaExpressiveNeural)
- Changed default to US English (en-US-AndrewNeural) for global audience
- Added 7 regional voice options (us, uk, in, au + female variants)
- Added background music, branded intro, longer narrations (60-120s)
- Added daily cron at 2 AM UTC

### Aug 21-24, 2026 — Social Media Automation
- Dev.to auto-publishing: 2x/week via Gemini AI (4+ articles live)
- Social posting enhanced with viral templates, "link in comments" pattern
- Mastodon: old account suspended, new account created

### Aug 21-22, 2026 — Revenue Infrastructure
- Affiliate suggestions expanded from 8 to 17 categories (100% tool coverage)
- GA4 affiliate click tracking
- `rel="sponsored nofollow"` on all affiliate links

### Aug 19-21, 2026 — ALL Original 194 Tools Enhanced (7 Phases)
- Phase 1: Bug fixes + shared components (FileUpload, ExportButton)
- Phase 2: Developer & Text tools (YAML/JS parsers, CSV pagination, etc.)
- Phase 3: Financial calculators (contributions, amortization, step-up)
- Phase 4: Encoders, Crypto & Security (file encoding, HMAC, passphrases)
- Phase 5: CSS & Color tools (conic gradients, EyeDropper API, APCA)
- Phase 6: Image & Generator tools (QR vCard/WiFi, custom backgrounds)
- Phase 7: Remaining 145 tools enhanced

### Aug 18-19, 2026 — AdSense Compliance
- Mediapartners-Google in robots.txt, aboutads.info in Privacy Policy
- /disclaimer page, helpContent on ALL tools, cookie consent Consent Mode v2
- Blog posts visible: 50, 54 how-to guides, usage counter API

### Aug 13, 2026 — Phase 1: World-Class UX Overhaul
- Cmd+K command palette, tool registry, share buttons, favorites, popular tools

### Aug 11, 2026 — SEO/Trust 100% Overhaul
- Person schema, llms-full.txt, Article schema, 40+ AI bots, canonical URLs

---

## Programmatic SEO — Page Inventory

| Page Type | Pages | Routes | Status |
|-----------|-------|--------|--------|
| Unit conversion pairs | 192 | /convert/[cat]/[pair] | Live |
| Category hubs | 6 | /convert/[cat] | Live |
| Master conversion hub | 1 | /convert | Live |
| Percentage calculators | **120** (reduced from 900) | /calculate/[query] | Live |
| Calculator hub | 1 | /calculate | Live |
| Original comparison pages | 8 | /compare/[slug] | Live |
| **SaaS comparison pages** | **50** | /compare/[slug] | **Live (NEW)** |
| Comparison hub | 1 | /compare | Live |
| How-to guides | 54 | /how-to/[slug] | Live |
| How-to hub | 1 | /how-to | Live |
| Tool pages | 235 | /tools/[slug] | Live (SSG) |
| Category pages | 18 | /category/[id] | Live |
| Blog posts | 50 (visible) | /blog/[slug] | Live |
| Static pages | ~10 | /about, /privacy, etc. | Live |
| **Total sitemap URLs** | **~710** | | |

---

## Revenue Action Plan (Sep 2026)

**Goal: 1 Lakh INR/month by December 2026**

| Revenue Source | Monthly Target | What's Needed |
|---------------|---------------|---------------|
| Display Ads (AdSense/Mediavine) | 25,000 INR | 125K-170K pageviews |
| Pro Subscriptions | 40,000 INR | 100 subscribers at 399 INR/mo |
| Affiliate Marketing | 20,000 INR | ~12 conversions at $20 each |
| Sponsored Content | 15,000 INR | 1-2 sponsored posts/month |
| **TOTAL** | **1,00,000 INR** | **150K-200K monthly pageviews** |

**Realistic timeline**: 1 lakh/month by February-March 2027.

See `REVENUE-ACTION-PLAN-SEP2026.md` for full details including:
- Phase 0: Immediate monetization setup (Impact.com, Ko-fi, LemonSqueezy, EthicalAds)
- Phase 1: Free promotion (directory blitz, Reddit karma building, content machine)
- Phase 2: SEO growth (3-5 blog articles/week, link building, GSC routine)
- Phase 3: Monetization scale (Pro tier launch, affiliate programs)
- Ready-to-post social media content templates
- Top 30 subreddits to target

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
| 2026-08-13 | Phase 2 Automation: social posting, IndexNow, Uptime Kuma, Listmonk |
| 2026-08-13 | Phase 3 Programmatic SEO: 327 new pages. Sitemap: 230->557 URLs |
| 2026-08-13 | Phase 4 Revenue: Email subscribe, affiliate suggestions, Pro page, GA4 |
| 2026-08-18 | AdSense compliance: Mediapartners-Google, cookie consent Consent Mode v2 |
| 2026-08-19 | /disclaimer, helpContent on all 194 tools, 54 how-to guides |
| 2026-08-19-21 | Tool upgrades Phases 1-7: All 194 tools enhanced |
| 2026-08-21 | Usage counter (118K+), social proof, sitemap 557->617 URLs |
| 2026-08-21 | **Google Aug 2026 spam update completed** — impressions crashed 99.95% |
| 2026-08-22 | Video pipeline enhancements, Dev.to auto-publishing |
| 2026-08-24 | Platforms: YouTube, Facebook, Instagram, Threads, Pinterest |
| 2026-08-26 | YouTube API: OAuth, upload script, auto-upload cron |
| 2026-08-27 - Sep 5 | **41 new tools** (194->235): PDF suite, image tools, generators |
| 2026-08-27 - Sep 5 | **28 existing tools enhanced** with major features |
| 2026-08-27 - Sep 5 | **UI/UX overhaul**: gradient hero, glow orbs, animations, cross-category |
| 2026-08-27 - Sep 5 | **SEO**: SSG, WebApplication schema, 50 SaaS comparison pages |
| 2026-08-27 - Sep 5 | **Monetization**: AdSlot activated, Ko-fi, FUNDING.yml, 2nd ad slot |
| 2026-08-27 - Sep 5 | /calculate/ pages reduced 900->120 for spam recovery |
| 2026-09-01-05 | GSC API integration, daily monitoring cron, spam recovery tracking |

---

## AI Content & Video Pipeline

### Gemini-Powered Social Posting (LIVE)
- **Script**: `/opt/automation/auto-social-optimized.sh`
- **API**: Gemini 2.5 Flash (free tier)
- **Key**: `/opt/automation/.gemini-key`
- **Schedule**: 4x/week (alternating days)
- **Platforms**: LinkedIn, Bluesky, Mastodon, Telegram, Discord
- **Content**: Platform-native, problem-first hooks, category-aware prompts
- **Fallback**: Template-based if Gemini API fails
- **Log**: `/var/log/utilsnow-social-ai.log`

### AI Video Pipeline (LIVE — Daily Auto-Generation + YouTube Upload)
- **Location**: `/opt/automation/video-pipeline/`
- **Pipeline**: Screenshots (Playwright) -> Script (Gemini) -> Voiceover (Edge TTS) -> Video (FFmpeg)
- **Output**: 1920x1080 MP4, Ken Burns zoom, crossfade transitions, branded intro, background music
- **Narration**: 60-120s
- **Default voice**: en-US-AndrewNeural (US English, global audience)
- **Voice options**: 7 regional voices (us, uk, in, au + female variants)
- **Shorts**: Mobile screenshots for vertical format
- **Cost**: $0.01-0.05 per video
- **Daily cron**: 2:00 AM UTC
- **Auto-upload**: 2:30 AM UTC
- **Known issue**: Playwright chromium_headless_shell gets cleaned up, needs periodic reinstallation

### YouTube API (LIVE)
- **Google Cloud project**: utilsnow-youtube
- **OAuth client**: Configured, app published (in production)
- **Token**: `/opt/automation/youtube-uploader/token.json`
- **Upload script**: `/opt/automation/youtube-uploader/upload_video.py`
- **Auto-upload script**: `/opt/automation/youtube-uploader/auto-upload.sh`
- **Schedule**: Daily cron at 2:30 AM UTC
- **First upload**: https://youtube.com/watch?v=3hNwAyJl_u4

### LinkedIn Algorithm Optimization
- **Old schedule (HARMFUL):** 4 posts/day = 28/week (40%+ reach drop)
- **New schedule (OPTIMIZED):** 4x/week via auto-social-optimized.sh, 24h gap
- Max 1 LinkedIn post/day, min 24h gap
- Links in FIRST COMMENT (50% reach penalty for link preview cards)
- Reply to comments within 60 minutes (Golden Hour)
- 80% value / 20% promotional content mix
- **Engagement bot**: `/opt/automation/linkedin-engage.sh` — 2x/day Mon-Sat

---

## Multi-Platform Social Media

### Active Platforms (7 automated + 5 manual)
| Platform | Handle/Channel | Status | Automation |
|----------|---------------|--------|----------|
| LinkedIn | Bharath S (personal) | PUBLISHING | auto-social-optimized.sh + engagement bot |
| Bluesky | @utilsnow.bsky.social | PUBLISHING | auto-social-optimized.sh |
| Mastodon | @UtilsNow@mastodon.social | PUBLISHING | auto-social-optimized.sh |
| Telegram | @utilsnow channel | PUBLISHING | auto-social-optimized.sh |
| Discord | UtilsNow Community webhook | PUBLISHING | auto-social-optimized.sh |
| Dev.to | UtilsNow | PUBLISHING | devto-publisher.sh (2x/week) |
| YouTube | @utilsnow | PUBLISHING | auto-upload.sh (daily) |
| Facebook | UtilsNow page | CREATED | Manual |
| Instagram | @utilsnow | CREATED | Manual |
| Threads | @utilsnow | CREATED | Manual |
| Pinterest | UtilsNow (business) | CREATED | Pin generator ready |
| X/Twitter | @techieBharath | Credits depleted | Skipped ($0.20/post) |

### Platforms NOT Available
| Platform | Reason |
|----------|--------|
| TikTok | Not available in India |
| Hashnode | API became PAID-ONLY (May 2026) |
| Medium | API dead since Jan 2025 |
| Reddit | Commercial API requires manual approval + $0.24/1K calls (post manually) |

---

## Cloudflare Tunnel Access (Corporate Firewall Bypass)

| Service | Tunnel URL | Login |
|---------|-----------|-------|
| Postiz | Quick tunnel (changes on restart) | co.bharaths@gmail.com / MegaUtils2026! |
| Uptime Kuma | Quick tunnel (changes on restart) | admin / UtilsNow2026! |
| Listmonk | Quick tunnel (changes on restart) | admin / UtilsNow2026! |

Note: Quick tunnel URLs change on restart. Run `cloudflared tunnel --url http://localhost:PORT` to recreate.

---

## Manual Actions Required (Owner — Priority Order)

| # | Action | Time | Where | Priority |
|---|--------|------|-------|----------|
| 1 | Check AdSense approval status | 1min | adsense.google.com | HIGH |
| 2 | Monitor GSC for spam recovery signs | 5min | search.google.com/search-console | HIGH |
| 3 | Create Impact.com publisher account | 15min | impact.com | HIGH |
| 4 | Create LemonSqueezy account (Pro payments) | 10min | lemonsqueezy.com | MEDIUM |
| 5 | Build Reddit karma (30 days before promoting) | Ongoing | reddit.com | MEDIUM |
| 6 | Submit domain to BlueCoat | 2min | sitereview.bluecoat.com | LOW |
| 7 | Submit to Zscaler | 2min | sitereview.zscaler.com | LOW |
| 8 | Submit to FortiGuard | 2min | fortiguard.fortinet.com | LOW |
| 9 | Connect LinkedIn Page in Postiz | 5min | Postiz -> Integrations | LOW |
| 10 | Request indexing 10 URLs/day in GSC | 10min/day | GSC URL Inspection | LOW |

---

## Future Expansion (Not Yet Built)

### Tool Ideas
| Category | Count | Examples |
|----------|-------|---------|
| File format conversions | 134 | PDF to Word, Excel to CSV, etc. |
| More how-to guides | 86 remaining | (54 done) |
| Reference tables | 65 | ASCII table, HTTP headers, etc. |

### Premium UX Features
- Onboarding flow (Developer/Designer/Student personas)
- Usage dashboard + gamification (badges, streaks)
- Tool of the Day
- Progressive disclosure (Basic/Advanced modes)
- Chrome extension
- API access for Pro users
- White-label licensing

### Revenue at Scale
| Channel | Monthly at Scale |
|---------|-----------------|
| Display Ads (AdSense -> Mediavine -> Raptive) | $5K-$175K |
| UtilsNow Pro ($4.99/mo via LemonSqueezy) | $1.5K-$750K |
| Affiliate marketing | $3K-$60K |
| API access | $2K-$25K |
| Chrome extension | $750-$15K |
| White-label licensing | $3K-$20K |
| Sponsored placements | $1.5K-$15K |
