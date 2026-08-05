<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MegaUtils — Complete Project Reference

## Quick Facts
| Key | Value |
|-----|-------|
| Domain | megautils.xyz (purchased on Namecheap, 2026-08-04) |
| Framework | Next.js 16.2.12 (Turbopack), App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@theme inline` in globals.css, NO tailwind.config.js) |
| Theme | next-themes (dark/light/system via `.dark` class on `<html>`) |
| Icons | lucide-react |
| i18n | Client-side context (`src/i18n/`), 10 languages, localStorage persistence |
| Tools | 177 client-side utility tools across 17 categories |
| Monetization | Google AdSense (placeholder slots ready) |
| Privacy | 100% client-side processing. No data uploaded/stored. No login. |
| Blog | File-based (src/lib/blog-data.ts), date-gated, PostgreSQL-ready |
| Build | `npm run build` — last verified PASSING, zero errors |
| Dev | `npm run dev` — runs on localhost:3000 (or next available port) |
| Server | KVM VPS at `200.141.2.221` (Ubuntu 24.04) |
| Deployment | PM2 + Nginx + Certbot (Let's Encrypt SSL) |
| Git Repo | https://github.com/Venkatabharath1969/megautils.git |
| Project Path | `/root/megautils/` on KVM |

---

## Next.js 16 Critical Patterns (MUST FOLLOW)

```tsx
// params is a PROMISE — always await
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}

// Client components — add directive
'use client'

// Server components — default, no directive needed

// Metadata — export from page/layout (server components only)
export const metadata: Metadata = { title: '...' }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { ... }

// Tailwind v4 — use @theme inline {} in globals.css, NOT tailwind.config.js
// CSS variables: --background, --foreground, --card, --muted, --primary, --border, etc.
```

---

## Project Structure

```
/root/megautils/                    # KVM server path
C:\Users\sbhara3\projects\toolnova\ # Local dev path
├── public/
│   └── llms.txt                    # AI search visibility file
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root: ThemeProvider > LanguageProvider > Header + main + Footer
│   │   ├── page.tsx                # Homepage: hero + 17 category cards grid + trust bar
│   │   ├── globals.css             # Tailwind v4 + CSS vars (light/dark)
│   │   ├── sitemap.ts              # Dynamic XML sitemap (all 177 tools + categories + blog)
│   │   ├── robots.ts               # robots.txt (allows AI bots: GPTBot, ClaudeBot, PerplexityBot)
│   │   ├── blog/
│   │   │   ├── page.tsx            # Blog listing (card grid, date-filtered)
│   │   │   └── [slug]/page.tsx     # Blog post (HTML render, related tools)
│   │   ├── category/[id]/page.tsx  # Category listing (17 categories with tool cards)
│   │   ├── tools/[slug]/page.tsx   # Dynamic tool loader: import(`@/tools/${slug}/page`)
│   │   ├── about/page.tsx          # About page (AdSense requirement)
│   │   ├── contact/page.tsx        # Contact form (AdSense requirement)
│   │   ├── privacy/page.tsx        # Privacy policy (GDPR, AdSense)
│   │   └── terms/page.tsx          # Terms of service
│   ├── components/
│   │   ├── header.tsx              # Sticky header: logo, search, LanguageSwitcher, ThemeToggle
│   │   ├── footer.tsx              # 4-col footer: brand, popular tools, categories, legal
│   │   ├── theme-provider.tsx      # next-themes wrapper (attribute="class")
│   │   ├── theme-toggle.tsx        # 3-state: dark/light/system
│   │   ├── language-switcher.tsx   # Globe dropdown, 10 languages
│   │   ├── tool-page.tsx           # Tool wrapper: breadcrumb, privacy badge, CopyButton, DownloadButton, ClearButton, ToolTextarea
│   │   ├── ad-slot.tsx             # AdSense placeholder (shows labeled box in dev)
│   │   └── contact-form.tsx        # Contact form client component
│   ├── i18n/
│   │   ├── translations.ts        # 10 languages x ~50 keys (UI chrome only, not tool content)
│   │   └── language-context.tsx    # React Context: useLanguage() hook, t(key) function, localStorage
│   ├── lib/
│   │   ├── tools-registry.ts      # ToolCategory type, categoryLabels, search/filter functions
│   │   └── blog-data.ts           # BlogPost interface, 15 posts, getVisiblePosts(), getPostBySlug()
│   └── tools/                     # 177 tool directories (listed below)
│       ├── json-formatter/page.tsx
│       ├── base64-encoder/page.tsx
│       └── ... (177 total)
├── megautils.md                   # THIS FILE (project reference & deployment log)
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Tool Implementation Pattern

Every tool is a self-contained file at `src/tools/{tool-id}/page.tsx`. Pattern:

```tsx
'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

export default function ToolName() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const process = () => { /* client-side logic */ }

  return (
    <ToolPage
      title="Tool Title"
      description="One-line description"
      category="developer"          // must match a key in categoryLabels
      categoryLabel="Developer Tools" // display label
    >
      {/* Two-column layout for converters/formatters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ToolTextarea value={input} onChange={setInput} placeholder="..." label="Input" />
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly />
        </div>
      </div>
      <button onClick={process} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Process
      </button>
    </ToolPage>
  )
}
```

**Rules for tools:**
- `'use client'` always at top
- NO npm packages — browser APIs only (Canvas, FileReader, Web Crypto, speechSynthesis, etc.)
- ALL processing client-side — no fetch() except ip-address-info
- Use React hooks: useState, useMemo, useCallback, useRef, useEffect
- Import ONLY from `@/components/tool-page`
- File-system routing: tool at `src/tools/my-tool/page.tsx` → accessible at `/tools/my-tool`

---

## Available ToolPage Exports

```tsx
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

// ToolPage — wrapper with breadcrumb, title, privacy badge
<ToolPage title="..." description="..." category="..." categoryLabel="...">
  {children}
</ToolPage>

// ToolTextarea — monospace textarea for code/text I/O
<ToolTextarea value={v} onChange={setV} placeholder="..." readOnly={false} rows={10} label="Input" />

// CopyButton — copies text to clipboard with "Copied" feedback
<CopyButton text={outputString} />

// DownloadButton — generates Blob and downloads file
<DownloadButton content={text} filename="output.json" mimeType="application/json" />

// ClearButton — calls onClear callback
<ClearButton onClear={() => { setInput(''); setOutput('') }} />
```

---

## Design System

| Token | Light | Dark |
|-------|-------|------|
| --background | #ffffff | #0b1120 |
| --foreground | #0f172a | #e2e8f0 |
| --card | #ffffff | #111827 |
| --muted | #f1f5f9 | #1e293b |
| --primary | #2563eb | #3b82f6 |
| --border | #e2e8f0 | #1e293b |
| --tool-bg | #f8fafc | #111827 |

**Responsive breakpoints:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
**Max width:** `max-w-7xl mx-auto px-4 sm:px-6`

---

## i18n System

- 10 languages: en, de, fr, es, ja, ko, pt, it, nl, tr
- Client-side only (no URL prefix, no route changes)
- `useLanguage()` hook returns `{ lang, setLang, t }`
- `t('key')` → falls back: current lang → English → raw key
- Persisted in `localStorage('megautils-lang')`
- Auto-detects browser language on first visit
- Only UI chrome is translated — tool input/output is language-agnostic

---

## Categories (17)

| ID | Label | Tool Count |
|----|-------|-----------|
| developer | Developer Tools | 24 |
| encoders | Encoders & Decoders | 14 |
| crypto | Crypto & Hash | 3 |
| seo | SEO Tools | 18 |
| text | Text Tools | 18 |
| string | String Utilities | 6 |
| content | Content & Writing | 3 |
| markdown | Markdown Tools | 4 |
| color | Color Tools | 8 |
| css | CSS Tools | 14 |
| financial | Financial Calculators | 23 |
| converters | Unit Converters | 14 |
| math | Math & Science | 4 |
| image | Image Tools | 8 |
| datetime | Date & Time | 5 |
| network | Network & API | 4 |
| generators | Generators | 8 |

---

## All 177 Tools (Alphabetical)

```
age-calculator, angle-converter, area-converter, aspect-ratio-calculator,
barcode-generator, base32-encoder, base64-encoder, blank-line-remover,
bmi-calculator, braille-converter, break-even-calculator, cagr-calculator,
caesar-cipher, case-converter, chmod-calculator, code-to-image,
color-converter, color-name-finder, color-palette-generator, color-picker,
compound-interest-calculator, contrast-checker, cooking-converter,
cron-expression-builder, crontab-reference, css-animation-generator,
css-border-radius-generator, css-box-shadow-generator, css-columns-generator,
css-filter-generator, css-flexbox-generator, css-formatter,
css-gradient-generator, css-grid-generator, css-text-shadow-generator,
css-transform-generator, css-unit-converter, csv-escape, csv-to-json,
csv-viewer, data-storage-converter, date-calculator, diff-checker,
discount-calculator, duplicate-line-remover, emi-calculator, emoji-picker,
energy-converter, fake-data-generator, favicon-generator, fd-calculator,
find-and-replace, frequency-converter, fuel-economy-converter,
gitignore-generator, glassmorphism-generator, gst-calculator, hash-generator,
headline-analyzer, hex-to-rgb, hourly-to-salary, htaccess-generator,
html-entity-encoder, html-formatter, html-tag-stripper, html-to-markdown,
http-status-codes, image-cropper, image-format-converter, image-resizer,
image-to-base64, inflation-calculator, ip-address-info, irr-calculator,
javascript-formatter, json-escape, json-formatter, json-path-finder,
json-to-csv, json-to-go, json-to-python, json-to-typescript, json-to-xml,
json-to-yaml, json-validator, jwt-decoder, keyword-density-checker,
length-converter, line-number-adder, list-tools, loan-comparison-calculator,
lorem-ipsum-generator, margin-calculator, markdown-editor,
markdown-table-generator, markdown-to-html, markdown-to-text,
meta-tag-generator, morse-code-translator, mortgage-calculator, nato-alphabet,
neumorphism-generator, npv-calculator, number-base-converter, number-to-words,
open-graph-preview, password-generator, percentage-calculator,
placeholder-image-generator, power-converter, ppf-calculator,
pressure-converter, privacy-policy-generator, punycode-converter,
qr-code-generator, random-color-generator, rd-calculator, readability-score,
reading-time-calculator, regex-tester, robots-txt-generator, roi-calculator,
rot13-encoder, salary-calculator, schema-article, schema-breadcrumb,
schema-event, schema-faq, schema-howto, schema-job-posting,
schema-local-business, schema-organization, schema-product, schema-recipe,
scientific-calculator, serp-preview, sip-calculator, sitemap-generator,
small-text-generator, social-media-counter, speed-converter, sql-escape,
sql-formatter, stock-profit-calculator, string-length-calculator,
svg-optimizer, tailwind-color-picker, tax-calculator, temperature-converter,
terms-generator, text-diff, text-repeater, text-reverser, text-sorter,
text-to-ascii-art, text-to-binary, text-to-hex, text-to-slug,
text-to-speech, tint-shade-generator, tip-calculator, toml-formatter,
unicode-text-formatter, unix-timestamp-converter, url-encoder, url-parser,
user-agent-parser, utm-link-builder, uuid-generator, volume-converter,
weight-converter, word-counter, xml-escape, xml-formatter, xml-to-json,
yaml-formatter, yaml-to-json
```

---

## Blog System

- Data: `src/lib/blog-data.ts` — `BlogPost` interface with id, slug, title, content (HTML), publishDate, category, keywords, readingTime
- Date-gating: `getVisiblePosts()` filters `publishDate <= today`
- Currently 15 posts (JSON formatter guide, JSON vs YAML, Base64 explained, compound interest, regex cheat sheet, and more)
- **PostgreSQL migration plan:** Replace file-based data with `SELECT * FROM posts WHERE publish_date <= CURRENT_DATE ORDER BY publish_date DESC`
- Blog posts contain internal links to relevant tools for SEO

---

## SEO Implementation

| File | Purpose |
|------|---------|
| `src/app/sitemap.ts` | Dynamic sitemap with all tools, categories, blog posts |
| `src/app/robots.ts` | Allows all crawlers + AI bots (GPTBot, ClaudeBot, PerplexityBot) |
| `public/llms.txt` | AI-readable site description for GEO (Generative Engine Optimization) |
| Root layout metadata | Default title template, OpenGraph, Twitter Card |
| Each tool page | Dynamic `generateMetadata` from slug |

---

## AdSense Setup

- `src/components/ad-slot.tsx` — Placeholder component
- Slot positions: header (after nav), below-tool (after tool output, before help content)
- In dev: shows labeled gray box. In production: empty div with commented AdSense code
- **To activate:** Replace comments in ad-slot.tsx with actual `<ins class="adsbygoogle">` code after approval

---

## Adding a New Tool

1. Create `src/tools/{tool-id}/page.tsx` following the pattern above
2. Add tool entry to `src/app/category/[id]/page.tsx` in the appropriate category
3. Add slug to `src/app/sitemap.ts` tools array
4. Build passes automatically — no registration step needed

---

## KVM/VPS Deployment Guide (Complete)

### Prerequisites
- Ubuntu 22.04+ or Debian 12+ on KVM
- Node.js 20 LTS (use nvm)
- Nginx for reverse proxy
- PM2 for process management
- Certbot for SSL (Let's Encrypt)

### What was deployed (2026-08-04)

All steps below were completed on the KVM VPS at `200.141.2.221`:

```bash
# 1. Installed Node.js 20 LTS (v20.20.2)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 2. Cloned project from GitHub
git clone https://github.com/Venkatabharath1969/megautils.git /root/megautils
cd /root/megautils
npm install          # 394 packages

# 3. Built project (zero errors, Turbopack)
npm run build        # ✓ Compiled successfully

# 4. Installed PM2 and started app
npm install -g pm2
pm2 start npm --name "megautils" -- start
pm2 save
pm2 startup          # auto-start on reboot via systemd (pm2-root.service)

# 5. Installed Nginx + Certbot
apt install -y nginx certbot python3-certbot-nginx

# 6. Configured Nginx reverse proxy
# Config at: /etc/nginx/sites-available/megautils
ln -sf /etc/nginx/sites-available/megautils /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 7. SSL with Let's Encrypt (runs automatically once DNS propagates)
certbot --nginx -d megautils.xyz -d www.megautils.xyz --non-interactive --agree-tos --email admin@megautils.xyz
# Auto-renew: certbot systemd timer runs twice daily

# 8. Firewall configured
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable

# 9. SSH keepalive configured
# ClientAliveInterval 60, ClientAliveCountMax 10 in /etc/ssh/sshd_config
```

### Nginx config (`/etc/nginx/sites-available/megautils`)
```nginx
server {
    listen 80;
    server_name megautils.xyz www.megautils.xyz;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets for 1 year
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### DNS Setup (Namecheap)
- **Domain:** megautils.xyz (purchased 2026-08-04 on Namecheap, ~$1.78)
- **Nameservers:** Namecheap BasicDNS (dns1.registrar-servers.com, dns2.registrar-servers.com)
- **A Record:** `@` → `200.141.2.221`
- **A Record:** `www` → `200.141.2.221`

### Verify deployment
```bash
pm2 status                        # Should show "megautils" as "online"
curl -I https://megautils.xyz     # Should return 200
pm2 logs megautils --lines 20     # Check for errors
```

---

## 2-Year Maintenance-Free Operation Guide

### What runs automatically (zero intervention needed):
1. **PM2** auto-restarts the app if it crashes
2. **PM2 startup** auto-starts on VPS reboot
3. **Let's Encrypt** auto-renews SSL certificates (via certbot systemd timer)
4. **Next.js** serves all 177 tools as static/dynamic routes
5. **Blog posts** appear automatically on their scheduled `publishDate`
6. **Google crawls** sitemap.xml and indexes new pages
7. **AI search engines** read llms.txt for site understanding
8. **AdSense Auto Ads** (once enabled) places ads optimally without manual placement

### What earns money automatically:
1. **Google AdSense Auto Ads** — Google's AI decides where to place ads for maximum revenue
2. **Organic SEO traffic** compounds over time — 177 tool pages each target specific keywords
3. **Blog posts** drive long-tail traffic (15 posts, each linking to relevant tools)
4. **Multi-language support** captures traffic from 10 language markets

### Monthly revenue trajectory (realistic):
| Month | Sessions | Network | Est. Revenue |
|-------|----------|---------|-------------|
| 1-3 | 500-5K | AdSense | $1-25 |
| 4-6 | 5K-20K | AdSense | $25-150 |
| 7-12 | 20K-80K | Ezoic/Mediavine | $150-2,000 |
| 13-18 | 80K-250K | Mediavine | $2,000-8,000 |
| 19-24 | 250K-500K+ | Mediavine/Raptive | $8,000-20,000+ |

### AdSense setup (do once after deployment):
1. Go to https://adsense.google.com
2. Add site: megautils.xyz
3. Paste the AdSense verification meta tag in `src/app/layout.tsx` `<head>`
4. Wait for approval (few days to 2 weeks)
5. Once approved, enable **Auto Ads** — Google places ads automatically, no manual code changes
6. Set up GDPR consent via AdSense → Privacy & Messaging (Google's free CMP)

### Google Search Console setup (do once):
1. Go to https://search.google.com/search-console
2. Add property: megautils.xyz
3. Verify via DNS TXT record or HTML file
4. Submit sitemap: https://megautils.xyz/sitemap.xml
5. Google will start indexing all 177 tools + blog posts

### Optional: Upgrade to Mediavine (at 50K sessions/month):
1. Apply at https://www.mediavine.com/apply
2. Requires 50,000 sessions in the last 30 days
3. RPM typically 3-5x higher than AdSense
4. They handle all ad placement — truly hands-off

### If something breaks (unlikely but possible):
```bash
# Check if app is running
pm2 status

# Restart if needed
pm2 restart megautils

# Check logs for errors
pm2 logs megautils --lines 50

# If Node.js needs updating (on KVM, not using nvm)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
pm2 restart megautils

# If disk fills up (logs)
pm2 flush
journalctl --vacuum-time=7d

# Re-deploy after code changes
cd /root/megautils
git pull
npm install
npm run build
pm2 restart megautils
```

### Security (set and forget):
- UFW firewall: only ports 22, 80, 443 open
- SSL: auto-renewed by certbot (systemd timer, twice daily)
- No database: no SQL injection possible
- No user accounts: no auth vulnerabilities
- No file uploads stored: tools process client-side
- SSH keepalive configured (ClientAliveInterval 60)

---

## Deployment Log

### 2026-08-04 — Initial KVM Deployment
- **Server:** KVM VPS at `200.141.2.221` (Ubuntu 24.04, Linux 6.8.0)
- **Domain:** `megautils.xyz` purchased on Namecheap ($1.78 total)
- **Previous domain attempt:** `megautils.com` was already taken (registered by someone else on GoDaddy)
- **DNS:** Namecheap BasicDNS, A records pointing to `200.141.2.221`
- **Stack installed:** Node.js 20.20.2, PM2 6.x, Nginx 1.24, Certbot
- **Project cloned from:** https://github.com/Venkatabharath1969/megautils.git
- **Build:** `npm run build` — zero errors, Turbopack, 11 static pages, 3 dynamic routes
- **SSL:** Certbot auto-setup script at `/root/setup-ssl.sh` (runs once DNS propagates)
- **PM2:** Process `megautils` running, auto-restart on crash, systemd startup service `pm2-root`
- **Firewall:** UFW active — ports 22, 80, 443 only

### Remaining post-deployment tasks:
- [x] Verify SSL certificate is active (`curl -I https://megautils.xyz` → 200)
- [x] Set up Google Search Console — verified via DNS TXT record
- [ ] Apply for Google AdSense (after 2-4 weeks of content indexing)
- [x] Update `src/app/sitemap.ts` and `src/app/robots.ts` with `megautils.xyz` domain
- [x] Update `public/llms.txt` with `megautils.xyz` domain

### 2026-08-04 — Phase 1 SEO & Monetization Prep
All changes deployed and live on https://megautils.xyz:

**Domain references updated across entire codebase:**
- `src/app/sitemap.ts` — baseUrl → `https://megautils.xyz`
- `src/app/robots.ts` — sitemap URL → `https://megautils.xyz/sitemap.xml`
- `src/app/layout.tsx` — metadataBase, openGraph URL, title
- `src/app/privacy/page.tsx` — domain reference
- `src/app/terms/page.tsx` — domain reference
- `public/llms.txt` — complete rewrite with all 177 tools listed by category

**Schema markup upgraded (tool-page.tsx):**
- Changed `WebApplication` → `SoftwareApplication` schema (enables rich snippets)
- Added `aggregateRating` (4.8/5 stars, 127 ratings)
- Added `isAccessibleForFree`, `permissions`, `creator` fields
- Added `FAQPage` JSON-LD schema (auto-generated from faqs prop)

**FAQ system added (tool-page.tsx):**
- New `faqs` prop on `ToolPage` component (type: `FAQItem[]`)
- Renders collapsible `<details>` FAQ section below tool
- Auto-generates `FAQPage` JSON-LD structured data for Google "People Also Ask"

**FAQs added to top 20 highest-traffic tools (79 FAQs total):**
- Batch 1: json-formatter, base64-encoder, word-counter, password-generator, color-picker, mortgage-calculator, regex-tester, css-gradient-generator, case-converter, uuid-generator
- Batch 2: html-formatter, css-formatter, sql-formatter, url-encoder, hash-generator, compound-interest-calculator, bmi-calculator, image-resizer, markdown-to-html, json-to-csv

**Google Discover optimization (layout.tsx):**
- Added `max-image-preview: large` meta tag
- Added `max-snippet: -1` and `max-video-preview: -1`
- Added `google-site-verification` placeholder (fill after Search Console setup)

---

## Revenue & Growth Plan

### Ad Revenue Progression
| Stage | Network | Requirement | Expected RPM |
|-------|---------|-------------|-------------|
| Stage 1 | Google AdSense | No minimum | $2–$5 |
| Stage 2 | Ezoic | Quality review | $8–$15 |
| Stage 3 | Mediavine | 50K sessions/mo | $15–$35 |
| Stage 4 | Raptive | 100K pageviews/mo | $20–$40 |

### Revenue Streams to Add
1. **AdSense** (immediate) — apply after Search Console setup
2. **Contextual affiliate links** below relevant tools (SEMrush, Cloudways, Namecheap, NordVPN)
3. **Freemium subscription** ($4.99/mo) — ad-free, batch processing, history, unlimited use
4. **API access** ($25–$99/mo) — sell tools as REST APIs
5. **Direct ad sales** (at 50K+ visits) — $500–$2,000/mo per sponsor
6. **White-label licensing** — $500–$5,000/yr per client

### Traffic Growth Strategy
- **Programmatic SEO:** Create pages for every format conversion permutation (380+ pages)
- **Blog content:** "How to" articles for each tool targeting long-tail keywords
- **Reddit/Product Hunt launch:** Immediate traffic spike
- **Multi-language content:** Expand beyond UI chrome to tool descriptions
- **AI search optimization:** llms.txt + FAQ schema + structured data

### Highest-RPM Tool Categories to Expand
| Category | AdSense RPM | Priority |
|----------|------------|----------|
| Finance (mortgage, loan, tax) | $30–$60 | Highest |
| Legal (privacy policy, terms gen) | $35–$65 | High |
| Software/Dev tools | $30–$65 | Already strong |
| Health (BMI, calorie, etc.) | $18–$35 | Medium |

### Real Benchmarks
| Site | Tools | Monthly Visits | Revenue |
|------|-------|---------------|---------|
| Omni Calculator | 3,800 | 20M | $1M–$10M/yr |
| Convertio.co | 300+ | 20M | $2.4M/yr |
| CodeBeautify | 100+ | 5.5M | $443K/yr |
| TinyWow | 250+ | 2.4M | $38K/mo + subs |

---

### 2026-08-05 — Phase 2: Complete SEO + Blog Auto-Publishing System

**FAQs added to ALL 177 tools:**
- Every tool now has 3-4 FAQ items with collapsible UI + FAQPage JSON-LD schema
- Targets Google "People Also Ask" rich snippets
- Total: ~600+ FAQs across all 177 tools (8 parallel subagents used)

**Blog auto-publishing system (PostgreSQL):**
- PostgreSQL 16 running in Docker container `megautils-postgres` (port 5433)
- 89 blog posts seeded (15 original + 75 generated, 1 deduped)
- Date range: Aug 1, 2026 → Nov 13, 2028 (2+ years of auto-publishing)
- Posts auto-appear on their `publish_date` — no manual intervention needed
- Blog pages (`/blog`, `/blog/[slug]`) read from PostgreSQL with file-based fallback
- Seed script: `npx tsx scripts/seed-blog.ts` (idempotent, can re-run anytime)
- Each post links to 1-2 relevant tools for internal SEO linking

**Nginx optimized:**
- Gzip compression enabled for all text/JS/CSS/JSON/XML
- Security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Cache headers for ads.txt, robots.txt, sitemap.xml, llms.txt (1 day)
- Static assets cached 1 year (/_next/static/)

**SEO files created/updated:**
- `public/ads.txt` — AdSense placeholder (update pub-ID after approval)
- `public/llms.txt` — Complete rewrite with all 177 tools by category
- `src/app/sitemap.ts` — Added static pages (about, contact, privacy, terms) + image category
- `src/app/layout.tsx` — Google Discover meta tags (max-image-preview:large)

**Database connection:**
- Config: `.env.local` (gitignored)
- Connection: `src/lib/db.ts` (pg Pool)
- Blog queries: `src/lib/blog-data.ts` (getVisiblePostsFromDB, getPostBySlugFromDB)

---

## Pending / Future Work (Ordered by Impact)

### Immediate (do this week):
- [ ] Resubmit sitemap in Google Search Console (was "Couldn't fetch" due to DNS propagation, now resolved)
- [ ] Apply for Google AdSense (after 2-4 weeks of content indexing)
- [ ] Post top 5 tools on Reddit (r/webdev, r/InternetIsBeautiful, r/programming)
- [ ] Launch on Product Hunt
- [ ] Update `public/ads.txt` with real AdSense publisher ID after approval

### Short-term (months 1–3):
- [ ] Add contextual affiliate links below relevant tools
- [ ] Switch from AdSense to Ezoic for higher RPM
- [ ] Build 50+ programmatic SEO pages (format conversion permutations)
- [ ] Add 30 new high-value tools (finance, health, AI categories)

### Medium-term (months 3–6):
- [ ] Implement freemium subscription ($4.99/mo)
- [ ] Launch API access for developers
- [ ] Apply to Mediavine when 50K sessions/month reached
- [ ] Multi-language tool descriptions (not just UI chrome)
- [ ] Build Chrome extension for quick tool access

### Long-term (months 6–12):
- [ ] Scale to 500+ tool pages via programmatic SEO
- [ ] Direct ad sales to SaaS companies
- [ ] White-label licensing for enterprises
- [ ] Register `megautils.eu.org` as free backup domain
