<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MegaUtils — Complete Project Reference

## Quick Facts
| Key | Value |
|-----|-------|
| Domain | megautils.com |
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
C:\Users\sbhara3\projects\toolnova\
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
├── AGENTS.md                      # THIS FILE
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

### Step-by-step deployment
```bash
# 1. Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Install PM2 globally
sudo npm install -g pm2

# 3. Upload project files (from local machine)
# scp -r C:\Users\sbhara3\projects\toolnova user@your-vps-ip:/home/user/megautils

# 4. On VPS: Install dependencies and build
cd /home/user/megautils
npm install --production=false
npm run build

# 5. Start with PM2
pm2 start npm --name "megautils" -- start
pm2 save
pm2 startup  # auto-start on reboot

# 6. Install and configure Nginx
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/megautils
```

### Nginx config (`/etc/nginx/sites-available/megautils`)
```nginx
server {
    listen 80;
    server_name megautils.com www.megautils.com;

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

```bash
# 7. Enable site and SSL
sudo ln -s /etc/nginx/sites-available/megautils /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. SSL with Let's Encrypt (auto-renews for 2 years)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d megautils.com -d www.megautils.com
# Certbot auto-renew is set up via systemd timer — runs twice daily, no manual intervention needed

# 9. Setup firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Verify deployment
```bash
pm2 status                    # Should show "megautils" as "online"
curl -I https://megautils.com # Should return 200
pm2 logs megautils --lines 20 # Check for errors
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
2. Add site: megautils.com
3. Paste the AdSense verification meta tag in `src/app/layout.tsx` `<head>`
4. Wait for approval (few days to 2 weeks)
5. Once approved, enable **Auto Ads** — Google places ads automatically, no manual code changes
6. Set up GDPR consent via AdSense → Privacy & Messaging (Google's free CMP)

### Google Search Console setup (do once):
1. Go to https://search.google.com/search-console
2. Add property: megautils.com
3. Verify via DNS TXT record or HTML file
4. Submit sitemap: https://megautils.com/sitemap.xml
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

# If Node.js needs updating
nvm install 20 --lts
pm2 restart megautils

# If disk fills up (logs)
pm2 flush
sudo journalctl --vacuum-time=7d
```

### Security (set and forget):
- UFW firewall: only ports 22, 80, 443 open
- SSL: auto-renewed by certbot
- No database: no SQL injection possible
- No user accounts: no auth vulnerabilities
- No file uploads stored: tools process client-side
- PM2: runs as non-root user

---

## Pending / Future Work (Optional, not needed for 2-year operation)
- [ ] Migrate blog to PostgreSQL + daily AI auto-publish cron (increases SEO but not required)
- [ ] Expand to 435+ tools (more traffic but 177 is strong)
- [ ] Upgrade to Mediavine at 50K sessions/month (higher RPM)
- [ ] Chrome extension linking to tools (growth channel)
- [ ] Open-source core tool logic on GitHub (backlinks + trust)
