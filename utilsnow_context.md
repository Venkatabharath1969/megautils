# UtilsNow — Complete Project Context

> **Single source of truth for all AI sessions. Read this FIRST.**
> **Last updated: 2026-08-11**

---

## Quick Facts

| Key | Value |
|-----|-------|
| **Brand** | UtilsNow |
| **Domain** | utilsnow.com |
| **Old Domain** | megautils.xyz (301 redirects to utilsnow.com) |
| **Framework** | Next.js 16.2.12 (Turbopack), App Router |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 (`@theme inline` in globals.css) |
| **Theme** | next-themes (dark/light/system via `.dark` class) |
| **Icons** | lucide-react |
| **i18n** | Client-side context (`src/i18n/`), 10 languages, localStorage (`utilsnow-lang`) |
| **Tools** | **194 tools** (177 utility + 17 AI-powered) across 17 categories |
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
| Generators | generators | 10 |
| Color Tools | color | 8 |
| String Utilities | string | 6 |
| Date & Time | datetime | 5 |
| Markdown Tools | markdown | 4 |
| Math & Science | math | 4 |
| Network & API | network | 4 |
| Content & Writing | content | 3 |
| Crypto & Hash | crypto | 3 |
| **TOTAL** | | **197** (194 dirs + 3 sub-tools) |

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
| File | URL | Size/Lines | Status |
|------|-----|-----------|--------|
| robots.txt | /robots.txt | 40+ AI bots | ✅ |
| sitemap.xml | /sitemap.xml | 226 URLs, accurate lastmod | ✅ |
| llms.txt | /llms.txt | Summary | ✅ |
| llms-full.txt | /llms-full.txt | 2,024 lines, 128KB | ✅ |
| ads.txt | /ads.txt | ca-pub-3062425605979427 | ✅ |
| manifest.json | /manifest.json | PWA manifest | ✅ |
| humans.txt | /humans.txt | Creator info | ✅ |
| security.txt | /.well-known/security.txt | RFC 9116 with Expires | ✅ |
| RSS feed | /feed.xml | Blog posts (last 20) | ✅ |
| OG image | /opengraph-image | Dynamic 1200x630, edge runtime | ✅ |

### AI Bot Coverage (robots.txt)
| Platform | Bot(s) Allowed |
|----------|---------------|
| Google Search | Googlebot |
| Google Gemini | Google-Extended |
| ChatGPT/OpenAI | GPTBot, OAI-SearchBot, ChatGPT-User |
| Claude/Anthropic | ClaudeBot, Claude-SearchBot, Claude-Web, anthropic-ai |
| Perplexity | PerplexityBot, Perplexity-User |
| Bing/Copilot | Bingbot |
| Apple Intelligence | Applebot, Applebot-Extended |
| Meta AI | Meta-ExternalAgent, meta-webindexer, FacebookBot |
| Amazon Alexa | Amazonbot, Amzn-SearchBot, Amzn-User |
| Brave/Leo AI | BraveBot |
| You.com | YouBot |
| Phind | PhindBot |
| DuckDuckGo | DuckDuckBot, DuckAssistBot |
| Kagi | Kagibot |
| Common Crawl | CCBot |
| DeepSeek | DeepSeekBot |
| Mistral | MistralAI-User |
| Qwen/Alibaba | QwenBot |
| Cohere | cohere-ai |
| ByteDance | Bytespider (BLOCKED) |

### Verification & Monetization
| Service | Status |
|---------|--------|
| Google Search Console | ✅ Verified (HTML file), 7+ impressions |
| Bing Webmaster Tools | ✅ Verified (XML file) |
| Google AdSense | ⏳ Under review (pub-3062425605979427) |
| IndexNow | ✅ Active (daily auto-submit) |
| GDPR Consent | ✅ Google 3-choice CMP |

### Pages & UX
| Feature | Status |
|---------|--------|
| 404 page (not-found.tsx) | ✅ With category links |
| Error boundary (error.tsx) | ✅ With retry button |
| Loading spinner (loading.tsx) | ✅ Centered spinner |
| Cookie policy (/cookies) | ✅ GDPR compliant |
| Privacy policy (/privacy) | ✅ |
| Terms of service (/terms) | ✅ |
| About page (/about) | ✅ With author bio |
| Contact page (/contact) | ✅ |
| Working search (header) | ✅ Filters tools on homepage |
| Related tools on tool pages | ✅ Auto-derived from URL, 4 per page |
| "Last updated" on tools | ✅ August 2026 |

### Accessibility (WCAG 2.1)
| Feature | Status |
|---------|--------|
| Skip-to-content link | ✅ sr-only, visible on focus |
| ARIA labels on search | ✅ role="search", aria-label |
| Breadcrumb aria-label | ✅ |
| Footer aria-label | ✅ |
| Canonical URLs (all pages) | ✅ |
| Preconnect for AdSense | ✅ |
| Author identity in footer | ✅ "Built by Bharath S" |
| sameAs (GitHub, LinkedIn, X) | ✅ On Organization + Person |

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

| Service | Port | RAM Limit | Purpose |
|---------|------|-----------|---------|
| UtilsNow (Next.js) | 3000 | ~60MB | Main website (PM2) |
| Nginx | 80/443 | ~20MB | Reverse proxy, SSL, gzip |
| UtilsNow PostgreSQL | 5433 | ~26MB | Blog + social posts DB |
| Postiz | 5200 | 1.5GB limit | Social media automation |
| Postiz PostgreSQL | internal | ~27MB | Postiz data |
| Postiz Redis | internal | ~5MB | Postiz cache |
| Temporal | internal | 384MB limit | Postiz workflows |
| Temporal Elasticsearch | internal | ~256MB | Temporal search |
| n8n | 5678 | 512MB limit | Workflow automation |
| n8n PostgreSQL | internal | ~33MB | n8n data |

**Total VPS RAM usage: ~47% of 15GB** (optimized from 69%)

---

## Automated Cron Jobs

| Schedule | Script | Purpose |
|----------|--------|---------|
| Daily 6:00 AM UTC | auto-indexnow.sh | Submit blog URLs to Bing/Yandex |
| Daily 6:30 AM UTC | auto-sitemap-ping.sh | Ping Google & Bing |
| Weekly Sunday 3 AM | auto-rebuild.sh | Rebuild + deploy + ping |
| Weekly Monday 7 AM | generate-social-posts.ts | Generate social content |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout: schemas, AdSense, skip-link, preconnect, OG |
| `src/app/page.tsx` | Homepage: search, categories, CollectionPage schema |
| `src/app/not-found.tsx` | 404 page with category links |
| `src/app/error.tsx` | Error boundary with retry |
| `src/app/loading.tsx` | Loading spinner |
| `src/app/opengraph-image.tsx` | Dynamic OG image (1200x630, edge) |
| `src/app/feed.xml/route.ts` | RSS feed for blog |
| `src/app/cookies/page.tsx` | Cookie policy (GDPR) |
| `src/app/robots.ts` | robots.txt (40+ AI bots) |
| `src/app/sitemap.ts` | Dynamic sitemap (226 URLs) |
| `src/components/tool-page.tsx` | Tool wrapper: breadcrumb, FAQs, related tools, schema |
| `src/components/header.tsx` | Header with working search |
| `src/components/footer.tsx` | Footer: author, cookie policy, nav |
| `src/i18n/translations.ts` | 10 languages |
| `src/lib/blog-data.ts` | Blog: PostgreSQL + fallback |
| `public/llms.txt` | AI discovery summary |
| `public/llms-full.txt` | AI discovery full (128KB) |
| `public/ads.txt` | AdSense publisher |
| `public/manifest.json` | PWA manifest |
| `public/humans.txt` | Creator info |
| `public/.well-known/security.txt` | Security contact (RFC 9116) |

---

## Recent Tool Upgrades (Aug 11, 2026)

| Tool | Changes |
|------|---------|
| Markdown Converter | Complete rewrite: 3 output modes (dropdown), file upload, clipboard paste, load example, stats bar, 826 lines |
| Markdown Editor | 16-button toolbar, keyboard shortcuts, auto-save, file upload, drag-and-drop, 580 lines |
| QR Code Generator | Replaced broken Google Charts API with 100% client-side Canvas, color customization, SVG download |
| Image Resizer | Fixed fake drag-and-drop, added PNG/JPEG/WebP format selector + quality slider, 6 social presets |

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
| 2026-08-11 | Homepage counts fixed to match reality |
| 2026-08-11 | Markdown Converter rewrite + Editor upgrade |
| 2026-08-11 | QR Code fix + Image Resizer fix |
| 2026-08-11 | Person schema + llms-full.txt (128KB) + Article schema |
| 2026-08-11 | ItemList schema on categories + freshness signals |
| 2026-08-11 | 100% SEO/GEO/Trust overhaul: 404, error, loading, OG image, canonical URLs, RSS feed, cookie policy, skip-to-content, ARIA, search, related tools, 40+ AI bots in robots.txt, manifest, humans.txt, security.txt |
| 2026-08-11 | VPS RAM optimized: 69% → 47% (Docker limits + cleanup) |

---

## Manual Actions Required (For Owner)

| Action | Where | Priority |
|--------|-------|----------|
| Check AdSense approval | adsense.google.com | Wait (2-14 days) |
| Request indexing of top 20 pages | Google Search Console → URL Inspection | Do daily (10-15/day) |
| Submit URL to Brave Search | search.brave.com/submit-url | Do once |
| Submit to AlternativeTo | alternativeto.net | Week 2 |
| Submit to SaaSHub | saashub.com | Week 2 |
| Submit to SourceForge | sourceforge.net | Week 2 |
| Create Crunchbase profile | crunchbase.com | Week 2 |
| Start Reddit/Quora presence | r/webdev, r/productivity | Build karma first |

---

## Future Roadmap

| Phase | Features | Impact |
|-------|----------|--------|
| Tool upgrades | JSON tree view, regex colored highlights, EMI amortization, Base64 file upload | Higher user retention |
| AI Translator | 414M global searches target | Massive traffic |
| Programmatic SEO | 500+ format conversion pages | More Google entry points |
| Comparison pages | "UtilsNow vs SmallPDF" etc. | High-conversion traffic |
| helpContent on all tools | Remaining 169 tools | Better AdSense approval odds |
| Chrome extension | Quick-access to tools | User retention |
| Freemium subscription | $4.99/mo for premium features | Direct revenue |
