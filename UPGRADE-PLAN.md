# UtilsNow Mega Upgrade Plan
## 194 Tools — Functional Enhancement Roadmap

Generated: August 19, 2026
Timeline: 15 days (Phases 1-7)

---

## Phase 1: Critical Bug Fixes & Cross-Cutting Infrastructure (Day 1-2)
*Fix bugs that produce incorrect output + shared utilities needed by all phases*

### 1A. Bug Fixes (MUST DO FIRST)
| Tool | Bug | Fix |
|------|-----|-----|
| **text-to-binary** | `charCodeAt(0)` fails for multi-byte/emoji — produces wrong output | Replace with `TextEncoder` for proper UTF-8 |
| **text-to-hex** | Same `charCodeAt(0)` bug — wrong hex for non-ASCII | Replace with `TextEncoder` |
| **json-formatter** | Tab indent option passes `1` (number) instead of `"\t"` string | Fix value type in select option |
| **ai-photo-colorizer** | Labeled "AI" but uses deterministic luminance tinting, not AI | Rename to "Photo Color Tinter" or integrate real model |

### 1B. Shared Utilities (Infrastructure for all tools)
| Utility | Purpose | Used By |
|---------|---------|---------|
| **CSV Export** | `exportToCSV(headers, rows)` — download breakdown tables | All financial calculators, csv-viewer |
| **File Upload** | Drag-and-drop + click file input component | 30+ tools currently paste-only |
| **Real-time Processing** | Standardize debounced auto-processing pattern | 20+ tools still button-based |

**Audit**: Verify text-to-binary/hex produce correct output for emojis, CJK characters. Verify JSON formatter tab indent works.

---

## Phase 2: Developer Tools — Parsers & Formatters (Day 2-4)
*Replace fragile custom parsers with proven libraries*

### 2A. HIGH Priority (Broken/Fragile)
| Tool | Enhancement | Implementation |
|------|------------|----------------|
| **yaml-to-json** | Replace custom 150-line YAML parser with `js-yaml` | `npm add js-yaml` + `yaml.load(input)` |
| **yaml-formatter** | Same — replace custom parser with `js-yaml` | `yaml.load()` → `yaml.dump()` with indent option |
| **javascript-formatter** | Replace custom formatter (produces incorrect output) | Use `prettier/standalone` + babel plugin |
| **json-formatter** | Add: sort keys, auto-format on paste, file upload, JSON stats | Recursive key sort, `useEffect` on paste event |
| **csv-viewer** | Add: file upload, pagination (100 rows/page), column filtering, sticky header, column stats | Slice rows with page state, filter inputs in thead |

### 2B. MEDIUM Priority (Feature Gaps)
| Tool | Enhancement |
|------|------------|
| **json-to-csv** | Add: nested object flattening, delimiter options (tab/semicolon/pipe), Excel BOM |
| **csv-to-json** | Add: delimiter selector, header toggle, type inference toggle |
| **json-to-typescript** | Add: optional field inference from arrays, `type` vs `interface` toggle |
| **json-to-go** | Add: `omitempty` tag toggle, package declaration |
| **sql-formatter** | Replace custom formatter with `sql-formatter` npm package (15+ dialects) |
| **diff-checker** | Add: ignore whitespace option, context collapse, file upload |
| **html-formatter** | Add: `<pre>` content preservation, XML validation |
| **code-to-image** | Add: language selector (10+ languages), gradient backgrounds, clipboard copy |
| **json-path-finder** | Add: tree search/filter, expand/collapse all buttons |
| **chmod-calculator** | Add: setuid/setgid/sticky (4-digit octal), umask calculator, security warnings |

**Audit**: Test YAML parsing with K8s manifests (anchors, aliases, multi-doc). Test JS formatting with complex code (JSX, async/await, template literals). Verify CSV viewer handles 10K+ rows without crash.

---

## Phase 3: Financial Calculators (Day 4-6)
*Add missing computational features to flagship calculators*

### 3A. HIGH Priority
| Tool | Enhancement | Implementation |
|------|------------|----------------|
| **compound-interest** | Add: regular monthly contributions, continuous compounding, CSV export | Future value of annuity formula |
| **emi-calculator** | Add: amortization schedule (port from mortgage-calculator), prepayment scenarios | Copy amortization loop from mortgage tool |
| **mortgage-calculator** | Add: property tax, insurance, PMI, HOA inputs, extra payments | Additional input fields + PITI total |
| **sip-calculator** | Add: step-up SIP (annual increment), goal-based reverse calc, lump sum + SIP combo | Modified annuity formula with step-up |
| **tax-calculator** | Add: FICA taxes (SS + Medicare), state tax rate input, child tax credit | Add FICA computation + state rate |

### 3B. MEDIUM Priority
| Tool | Enhancement |
|------|------------|
| **gst-calculator** | Add: multi-item invoice with different GST rates, ITC calculation |
| **inflation-calculator** | Add: historical CPI data lookup (US 1913-2024), backward calculation mode |
| **npv-calculator** | Add: profitability index, payback period, discounted payback period |
| **irr-calculator** | Add: MIRR calculation, hurdle rate accept/reject |
| **fd-calculator** | Add: TDS/tax calculation, simple interest option, senior citizen rate |
| **stock-profit-calculator** | Add: capital gains tax (short/long term), holding period, dividends |
| **loan-comparison** | Add: processing fees, APR calculation |
| **salary-calculator** | Add: progressive tax brackets (reuse tax-calculator logic) |
| **ppf-calculator** | Fix: interest calculation timing accuracy, add 80C tax savings display |

### Cross-cutting for ALL financial tools:
- Add CSV export button to every breakdown table
- Add URL state persistence (shareable calculation links)

**Audit**: Verify compound interest with contributions matches calculator.net. Verify EMI amortization final balance = 0. Verify tax calculator FICA + state tax totals.

---

## Phase 4: Encoder/Decoder & Crypto Tools (Day 6-7)
*Fix encoding bugs, add missing formats and modes*

### 4A. HIGH Priority
| Tool | Enhancement |
|------|------------|
| **base64-encoder** | Add: file-to-Base64, URL-safe variant, MIME line wrap (76 chars), real-time processing |
| **hash-generator** | Add: file hashing (drag-drop), HMAC support, SHA-384, hash comparison/verification, Base64 output |
| **password-generator** | Add: passphrase mode (EFF diceware wordlist), exclude ambiguous chars, entropy calculation, guarantee one from each set |
| **uuid-generator** | Add: UUID v7 (timestamp-sortable), ULID generation, no-hyphens format, UUID parser/version detector |
| **regex-tester** | Add: named capture groups, substitution/replace mode, common patterns library, `u`/`d` flags |

### 4B. MEDIUM Priority
| Tool | Enhancement |
|------|------------|
| **jwt-decoder** | Add: live expiry countdown, claim descriptions, token color-coding, real-time decode |
| **html-entity-encoder** | Add: hex entity mode, expanded entity set (100+), encode-all mode |
| **number-base-converter** | Add: custom base (2-36), BigInt for precision, negative numbers |
| **caesar-cipher** | Add: frequency analysis chart, auto-detect shift |
| **morse-code-translator** | Add: audio playback via AudioContext, full reference table (fix slice) |

**Audit**: Test Base64 file encoding with images, PDFs. Test hash-generator file hashing vs known checksums. Test UUID v7 sortability. Test password entropy calculation accuracy.

---

## Phase 5: CSS & Color Tools (Day 7-9)
*Add missing CSS features and color capabilities*

### 5A. HIGH Priority
| Tool | Enhancement |
|------|------------|
| **css-gradient-generator** | Add: conic gradients, repeating gradients, radial shape/position, preset library (50+) |
| **css-flexbox-generator** | Add: child-level properties (flex-grow/shrink/basis, align-self, order), HTML+CSS output |
| **css-grid-generator** | Add: grid-template-areas editor, cell spanning, align/justify items, auto-fill/auto-fit |
| **color-picker** | Add: CMYK output, EyeDropper API, alpha/RGBA, color history, CSS variable format |
| **color-converter** | Add: CMYK (listed but missing), OKLCH/OKLab, alpha channel, visual picker |
| **contrast-checker** | Add: APCA algorithm, auto-suggest passing colors, color blindness simulation |
| **color-palette-generator** | Add: split-complementary, export (CSS vars, SCSS, JSON, Tailwind), image color extraction |

### 5B. MEDIUM Priority
| Tool | Enhancement |
|------|------------|
| **css-box-shadow-generator** | Add: preset library (Material/Tailwind shadows), layer reordering |
| **css-border-radius-generator** | Add: percentage units, elliptical radii, preset shapes |
| **css-text-shadow-generator** | Add: multiple shadow layers, preset effects (neon, 3D, letterpress) |
| **css-animation-generator** | Add: custom keyframe editor, cubic-bezier editor, 25+ presets |
| **css-filter-generator** | Add: custom image upload for preview, filter presets (Instagram-like), drop-shadow |
| **css-transform-generator** | Add: 3D transforms (rotateX/Y/Z, perspective), transform-origin control |
| **tint-shade-generator** | Add: adjustable step count, HSL-based generation, export as CSS vars/Tailwind |
| **tailwind-color-picker** | Add: nearest Tailwind class finder for arbitrary hex, multi-format copy |

**Audit**: Test conic gradient CSS output in Chrome/Firefox. Test CMYK conversion accuracy. Test APCA contrast scores against reference values. Test EyeDropper API (with feature detection fallback).

---

## Phase 6: Image & AI Tools (Day 9-11)
*Enhance processing capabilities and fix misleading tools*

### 6A. HIGH Priority
| Tool | Enhancement |
|------|------------|
| **qr-code-generator** | Add: logo overlay, custom dot/corner shapes, vCard/WiFi structured forms, batch generation |
| **favicon-generator** | Add: ICO format output, 192/512 sizes (PWA), HTML link tags snippet, text-to-favicon |
| **svg-optimizer** | Replace regex approach with SVGO, add file upload, SVG preview rendering |
| **ai-bg-remover** | Add: custom background replacement (solid color, gradient, uploaded image), output format selection |
| **ai-object-remover** | Improve fill algorithm (current Canvas pixel sampling is basic), add auto-select via SAM |
| **ai-photo-colorizer** | Either integrate real AI colorization model or rename honestly |

### 6B. MEDIUM Priority
| Tool | Enhancement |
|------|------------|
| **image-resizer** | Add: percentage-based resize, batch mode, DPI setting |
| **image-format-converter** | Add: AVIF format support, batch conversion, side-by-side comparison |
| **image-cropper** | Add: aspect ratio presets with lock, rotate/flip, output format selection |
| **ai-ocr** | Add: PDF input support, word-level confidence highlighting, more languages |
| **ai-image-upscaler** | Add: 4x upscale option, model selection, comparison slider |
| **ai-face-blur** | Add: selective face blur (per-face toggle), sensitivity slider |

**Audit**: Test QR logo overlay doesn't break scanning. Test ICO favicon in Chrome/Firefox/Safari. Test SVGO optimization produces valid SVG. Test bg-remover custom background compositing.

---

## Phase 7: Text, SEO, Remaining Tools (Day 11-13)
*Enhance text processing, SEO generators, and utility tools*

### 7A. Text Tools
| Tool | Enhancement | Priority |
|------|------------|----------|
| **word-counter** | Add: sentence count, paragraph count, reading level, keyword density | Medium |
| **markdown-editor** | Add: toolbar buttons, keyboard shortcuts, split-pane layout | Medium |
| **find-and-replace** | Add: regex mode with capture group replacement | Medium |
| **text-to-speech** | Add: SSML support, download audio, speed/pitch controls | Medium |

### 7B. SEO Tools
| Tool | Enhancement | Priority |
|------|------------|----------|
| **meta-tag-generator** | Add: character count warnings, Twitter/OG preview, copy all tags | Medium |
| **serp-preview** | Add: mobile preview, rich snippet preview, competitor comparison | Medium |
| **keyword-density-checker** | Add: n-gram analysis (2-word, 3-word phrases), TF-IDF | Medium |
| **readability-score** | Add: multiple formulas (Flesch, Gunning Fog, Coleman-Liau, SMOG) | Medium |

### 7C. DateTime, Network, Converter, Math Tools
| Tool | Enhancement | Priority |
|------|------------|----------|
| **unix-timestamp-converter** | Add: millisecond precision, timezone selector, relative time (3 days ago) | Medium |
| **cron-expression-builder** | Add: next 10 execution times preview, human-readable description | High |
| **scientific-calculator** | Add: calculation history, memory functions, constants library | Medium |
| **bmi-calculator** | Add: BMI Prime, Ponderal Index, waist-to-height ratio | Low |
| All **unit converters** (14) | Add: conversion formula display, common reference values table | Low |

**Audit**: Test word counter matches MS Word counts. Test cron next-execution-times against crontab.guru. Test all unit converter formulas for accuracy.

---

## Phase 8: Final Audit & Polish (Day 13-15)
*Full regression testing, performance check, deploy*

### 8A. Comprehensive Audit
- [ ] Every tool loads without errors
- [ ] Every tool produces correct output for standard inputs
- [ ] No TypeScript compilation errors (`npm run build` passes)
- [ ] No console errors on any page
- [ ] All new features work on mobile
- [ ] All file upload features work with drag-and-drop
- [ ] All export/download features produce valid files
- [ ] Performance: no tool takes >3 seconds to process standard input
- [ ] All help content still renders correctly
- [ ] All FAQs still display correctly

### 8B. Cross-Cutting Enhancements
- [ ] File upload component added to all applicable tools
- [ ] CSV export added to all financial calculators
- [ ] Consistent real-time processing across tools
- [ ] URL state persistence on top 20 tools

### 8C. Deploy
- [ ] `npm run build` — zero errors
- [ ] `pm2 restart utilsnow`
- [ ] Verify live site loads correctly
- [ ] Commit and push to GitHub
- [ ] Submit updated sitemap to Google Search Console

---

## Summary Statistics

| Category | Tools | High Priority Fixes | Medium Priority | Low Priority |
|----------|-------|--------------------:|----------------:|-------------:|
| Developer | 24 | 5 | 11 | 8 |
| Financial | 23 | 5 | 9 | 9 |
| Encoder/Crypto | 20 | 5 | 5 | 10 |
| CSS | 14 | 3 | 8 | 3 |
| Color | 8 | 4 | 1 | 3 |
| Image | 8 | 3 | 3 | 2 |
| AI | 11 | 3 | 3 | 5 |
| Text | 24 | 2 | 6 | 16 |
| SEO | 18 | 0 | 4 | 14 |
| Other | 44 | 1 | 5 | 38 |
| **Total** | **194** | **31** | **55** | **108** |

**Estimated effort**: 31 high-priority upgrades across 15 days = ~2 per day
