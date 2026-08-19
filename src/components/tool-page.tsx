'use client'

import { Shield, Download, Copy, Check, RotateCcw, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState, type ReactNode, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { AdSlot } from './ad-slot'
import { ShareButtons } from './share-buttons'
import { FavoriteButton } from './favorite-button'
import { EmailSubscribe } from './email-subscribe'
import { EmbedCode } from './embed-code'
import { ProSuggestion } from './pro-suggestion'
import { ProUpsellBanner } from './usage-tracker'
import { useLanguage } from '@/i18n/language-context'

const CATEGORY_TOOLS: Record<string, { id: string; name: string }[]> = {
  developer: [
    { id: 'json-formatter', name: 'JSON Formatter & Validator' },
    { id: 'json-validator', name: 'JSON Validator' },
    { id: 'json-to-yaml', name: 'JSON to YAML' },
    { id: 'yaml-to-json', name: 'YAML to JSON' },
    { id: 'json-to-csv', name: 'JSON to CSV' },
    { id: 'csv-to-json', name: 'CSV to JSON' },
    { id: 'json-to-typescript', name: 'JSON to TypeScript' },
    { id: 'xml-formatter', name: 'XML Formatter' },
    { id: 'html-formatter', name: 'HTML Formatter' },
    { id: 'css-formatter', name: 'CSS Formatter' },
    { id: 'sql-formatter', name: 'SQL Formatter' },
    { id: 'javascript-formatter', name: 'JavaScript Formatter' },
    { id: 'yaml-formatter', name: 'YAML Formatter' },
    { id: 'text-diff', name: 'Text Diff' },
    { id: 'diff-checker', name: 'Diff Checker' },
    { id: 'code-to-image', name: 'Code to Image' },
    { id: 'chmod-calculator', name: 'chmod Calculator' },
    { id: 'json-path-finder', name: 'JSON Path Finder' },
    { id: 'csv-viewer', name: 'CSV Viewer' },
    { id: 'toml-formatter', name: 'TOML Formatter' },
    { id: 'json-to-xml', name: 'JSON to XML' },
    { id: 'xml-to-json', name: 'XML to JSON' },
    { id: 'json-to-go', name: 'JSON to Go Struct' },
    { id: 'json-to-python', name: 'JSON to Python' },
  ],
  encoders: [
    { id: 'base64-encoder', name: 'Base64 Encoder/Decoder' },
    { id: 'url-encoder', name: 'URL Encoder/Decoder' },
    { id: 'html-entity-encoder', name: 'HTML Entity Encoder/Decoder' },
    { id: 'jwt-decoder', name: 'JWT Decoder' },
    { id: 'text-to-binary', name: 'Text to Binary' },
    { id: 'text-to-hex', name: 'Text to Hex' },
    { id: 'morse-code-translator', name: 'Morse Code Translator' },
    { id: 'rot13-encoder', name: 'ROT13 Encoder' },
    { id: 'number-base-converter', name: 'Number Base Converter' },
    { id: 'base32-encoder', name: 'Base32 Encoder/Decoder' },
    { id: 'punycode-converter', name: 'Punycode Converter' },
    { id: 'nato-alphabet', name: 'NATO Phonetic Alphabet' },
    { id: 'caesar-cipher', name: 'Caesar Cipher' },
    { id: 'braille-converter', name: 'Braille Converter' },
  ],
  crypto: [
    { id: 'hash-generator', name: 'Hash Generator' },
    { id: 'password-generator', name: 'Password Generator' },
    { id: 'uuid-generator', name: 'UUID Generator' },
  ],
  seo: [
    { id: 'meta-tag-generator', name: 'Meta Tag Generator' },
    { id: 'robots-txt-generator', name: 'Robots.txt Generator' },
    { id: 'sitemap-generator', name: 'XML Sitemap Generator' },
    { id: 'serp-preview', name: 'SERP Preview' },
    { id: 'keyword-density-checker', name: 'Keyword Density Checker' },
    { id: 'readability-score', name: 'Readability Score' },
    { id: 'open-graph-preview', name: 'Open Graph Preview' },
    { id: 'utm-link-builder', name: 'UTM Link Builder' },
    { id: 'schema-article', name: 'Article Schema Generator' },
    { id: 'schema-faq', name: 'FAQ Schema Generator' },
    { id: 'schema-product', name: 'Product Schema Generator' },
    { id: 'schema-howto', name: 'HowTo Schema Generator' },
    { id: 'schema-local-business', name: 'LocalBusiness Schema' },
    { id: 'schema-organization', name: 'Organization Schema' },
    { id: 'schema-event', name: 'Event Schema Generator' },
    { id: 'schema-job-posting', name: 'JobPosting Schema' },
    { id: 'schema-breadcrumb', name: 'Breadcrumb Schema' },
    { id: 'schema-recipe', name: 'Recipe Schema Generator' },
  ],
  text: [
    { id: 'word-counter', name: 'Word Counter' },
    { id: 'case-converter', name: 'Case Converter' },
    { id: 'markdown-to-text', name: 'Markdown to Text' },
    { id: 'duplicate-line-remover', name: 'Duplicate Line Remover' },
    { id: 'text-sorter', name: 'Text Sorter' },
    { id: 'text-reverser', name: 'Text Reverser' },
    { id: 'text-to-slug', name: 'Text to Slug' },
    { id: 'find-and-replace', name: 'Find & Replace' },
    { id: 'blank-line-remover', name: 'Blank Line Remover' },
    { id: 'line-number-adder', name: 'Line Number Adder' },
    { id: 'reading-time-calculator', name: 'Reading Time Calculator' },
    { id: 'string-length-calculator', name: 'String Length Calculator' },
    { id: 'html-tag-stripper', name: 'HTML Tag Stripper' },
    { id: 'text-repeater', name: 'Text Repeater' },
    { id: 'list-tools', name: 'List Tools' },
    { id: 'unicode-text-formatter', name: 'Unicode Text Formatter' },
    { id: 'text-to-ascii-art', name: 'Text to ASCII Art' },
    { id: 'small-text-generator', name: 'Small Text Generator' },
    { id: 'ai-text-summarizer', name: 'AI Text Summarizer' },
    { id: 'ai-content-detector', name: 'AI Content Detector' },
    { id: 'ai-speech-to-text', name: 'AI Speech to Text' },
    { id: 'ai-sentiment-analysis', name: 'AI Sentiment Analysis' },
    { id: 'ai-grammar-checker', name: 'AI Grammar Checker' },
    { id: 'ai-paraphraser', name: 'AI Paraphrasing Tool' },
  ],
  string: [
    { id: 'regex-tester', name: 'Regex Tester' },
    { id: 'lorem-ipsum-generator', name: 'Lorem Ipsum Generator' },
    { id: 'json-escape', name: 'JSON Escape/Unescape' },
    { id: 'xml-escape', name: 'XML Escape/Unescape' },
    { id: 'sql-escape', name: 'SQL Escape/Unescape' },
    { id: 'csv-escape', name: 'CSV Escape/Unescape' },
  ],
  content: [
    { id: 'headline-analyzer', name: 'Headline Analyzer' },
    { id: 'social-media-counter', name: 'Social Media Counter' },
    { id: 'text-to-speech', name: 'Text to Speech' },
  ],
  markdown: [
    { id: 'markdown-editor', name: 'Markdown Editor' },
    { id: 'markdown-to-html', name: 'Markdown to HTML' },
    { id: 'html-to-markdown', name: 'HTML to Markdown' },
    { id: 'markdown-table-generator', name: 'Markdown Table Generator' },
  ],
  color: [
    { id: 'color-picker', name: 'Color Picker' },
    { id: 'color-converter', name: 'Color Converter' },
    { id: 'hex-to-rgb', name: 'HEX to RGB' },
    { id: 'contrast-checker', name: 'WCAG Contrast Checker' },
    { id: 'color-palette-generator', name: 'Color Palette Generator' },
    { id: 'random-color-generator', name: 'Random Color Generator' },
    { id: 'tint-shade-generator', name: 'Tint & Shade Generator' },
    { id: 'color-name-finder', name: 'Color Name Finder' },
  ],
  css: [
    { id: 'css-gradient-generator', name: 'CSS Gradient Generator' },
    { id: 'css-box-shadow-generator', name: 'Box Shadow Generator' },
    { id: 'css-border-radius-generator', name: 'Border Radius Generator' },
    { id: 'css-text-shadow-generator', name: 'Text Shadow Generator' },
    { id: 'css-flexbox-generator', name: 'Flexbox Generator' },
    { id: 'css-grid-generator', name: 'Grid Generator' },
    { id: 'glassmorphism-generator', name: 'Glassmorphism Generator' },
    { id: 'css-unit-converter', name: 'CSS Unit Converter' },
    { id: 'css-animation-generator', name: 'Animation Generator' },
    { id: 'neumorphism-generator', name: 'Neumorphism Generator' },
    { id: 'css-filter-generator', name: 'Filter Generator' },
    { id: 'css-transform-generator', name: 'Transform Generator' },
    { id: 'tailwind-color-picker', name: 'Tailwind Color Picker' },
    { id: 'css-columns-generator', name: 'Columns Generator' },
  ],
  financial: [
    { id: 'compound-interest-calculator', name: 'Compound Interest' },
    { id: 'emi-calculator', name: 'EMI Calculator' },
    { id: 'mortgage-calculator', name: 'Mortgage Calculator' },
    { id: 'sip-calculator', name: 'SIP Calculator' },
    { id: 'salary-calculator', name: 'Salary Calculator' },
    { id: 'roi-calculator', name: 'ROI Calculator' },
    { id: 'discount-calculator', name: 'Discount Calculator' },
    { id: 'tip-calculator', name: 'Tip Calculator' },
    { id: 'percentage-calculator', name: 'Percentage Calculator' },
    { id: 'gst-calculator', name: 'GST Calculator' },
    { id: 'inflation-calculator', name: 'Inflation Calculator' },
    { id: 'cagr-calculator', name: 'CAGR Calculator' },
    { id: 'loan-comparison-calculator', name: 'Loan Comparison' },
    { id: 'break-even-calculator', name: 'Break-Even Calculator' },
    { id: 'margin-calculator', name: 'Margin Calculator' },
    { id: 'npv-calculator', name: 'NPV Calculator' },
    { id: 'irr-calculator', name: 'IRR Calculator' },
    { id: 'fd-calculator', name: 'FD Calculator' },
    { id: 'rd-calculator', name: 'RD Calculator' },
    { id: 'ppf-calculator', name: 'PPF Calculator' },
    { id: 'hourly-to-salary', name: 'Hourly to Salary' },
    { id: 'stock-profit-calculator', name: 'Stock Profit Calculator' },
    { id: 'tax-calculator', name: 'Tax Calculator' },
  ],
  converters: [
    { id: 'length-converter', name: 'Length Converter' },
    { id: 'weight-converter', name: 'Weight Converter' },
    { id: 'temperature-converter', name: 'Temperature Converter' },
    { id: 'data-storage-converter', name: 'Data Storage Converter' },
    { id: 'speed-converter', name: 'Speed Converter' },
    { id: 'area-converter', name: 'Area Converter' },
    { id: 'volume-converter', name: 'Volume Converter' },
    { id: 'pressure-converter', name: 'Pressure Converter' },
    { id: 'energy-converter', name: 'Energy Converter' },
    { id: 'power-converter', name: 'Power Converter' },
    { id: 'frequency-converter', name: 'Frequency Converter' },
    { id: 'fuel-economy-converter', name: 'Fuel Economy' },
    { id: 'cooking-converter', name: 'Cooking Converter' },
    { id: 'angle-converter', name: 'Angle Converter' },
  ],
  math: [
    { id: 'scientific-calculator', name: 'Scientific Calculator' },
    { id: 'bmi-calculator', name: 'BMI Calculator' },
    { id: 'number-to-words', name: 'Number to Words' },
    { id: 'aspect-ratio-calculator', name: 'Aspect Ratio Calculator' },
  ],
  image: [
    { id: 'qr-code-generator', name: 'QR Code Generator' },
    { id: 'image-resizer', name: 'Image Resizer' },
    { id: 'image-to-base64', name: 'Image to Base64' },
    { id: 'favicon-generator', name: 'Favicon Generator' },
    { id: 'image-format-converter', name: 'Image Format Converter' },
    { id: 'image-cropper', name: 'Image Cropper' },
    { id: 'placeholder-image-generator', name: 'Placeholder Image' },
    { id: 'svg-optimizer', name: 'SVG Optimizer' },
    { id: 'ai-bg-remover', name: 'AI Background Remover' },
    { id: 'ai-face-blur', name: 'AI Face Blur' },
    { id: 'ai-ocr', name: 'AI Image to Text (OCR)' },
    { id: 'ai-image-upscaler', name: 'AI Image Upscaler' },
    { id: 'ai-segment', name: 'AI Image Segmentation' },
    { id: 'ai-depth-map', name: 'AI Depth Map Generator' },
    { id: 'ai-image-classifier', name: 'AI Image Classifier' },
    { id: 'ai-image-caption', name: 'AI Image Caption Generator' },
    { id: 'ai-object-remover', name: 'AI Object Remover' },
    { id: 'ai-photo-colorizer', name: 'AI Photo Colorizer' },
    { id: 'ai-object-detection', name: 'AI Object Detection' },
  ],
  datetime: [
    { id: 'unix-timestamp-converter', name: 'Unix Timestamp Converter' },
    { id: 'date-calculator', name: 'Date Calculator' },
    { id: 'age-calculator', name: 'Age Calculator' },
    { id: 'cron-expression-builder', name: 'Cron Expression Builder' },
    { id: 'crontab-reference', name: 'Crontab Reference' },
  ],
  network: [
    { id: 'http-status-codes', name: 'HTTP Status Codes' },
    { id: 'url-parser', name: 'URL Parser' },
    { id: 'user-agent-parser', name: 'User Agent Parser' },
    { id: 'ip-address-info', name: 'IP Address Info' },
  ],
  generators: [
    { id: 'uuid-generator', name: 'UUID Generator' },
    { id: 'password-generator', name: 'Password Generator' },
    { id: 'lorem-ipsum-generator', name: 'Lorem Ipsum Generator' },
    { id: 'hash-generator', name: 'Hash Generator' },
    { id: 'gitignore-generator', name: '.gitignore Generator' },
    { id: 'fake-data-generator', name: 'Fake Data Generator' },
    { id: 'emoji-picker', name: 'Emoji Picker' },
    { id: 'barcode-generator', name: 'Barcode Generator' },
  ],
}

interface FAQItem {
  question: string
  answer: string
}

interface ToolPageProps {
  title: string
  description: string
  category: string
  categoryLabel: string
  slug?: string
  children: ReactNode
  helpContent?: ReactNode
  faqs?: FAQItem[]
}

export function ToolPage({ title, description, category, categoryLabel, slug, children, helpContent, faqs }: ToolPageProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const derivedSlug = useMemo(() => slug || pathname?.split('/').pop() || '', [slug, pathname])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">{t('tool.home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/category/${category}`} className="hover:text-foreground transition-colors">{categoryLabel}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{title}</span>
      </nav>

      {/* Pro Upsell Banner (shown after 10 daily uses) */}
      <ProUpsellBanner />

      {/* Title & Privacy Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
          <span className="text-xs text-muted-foreground">Last updated: August 2026</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <FavoriteButton toolId={derivedSlug} />
          <ShareButtons title={title} />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium whitespace-nowrap">
            <Shield className="h-3.5 w-3.5" />
            {t('tool.privacy')}
          </div>
        </div>
      </div>

      {/* Embed Code */}
      {derivedSlug && <EmbedCode slug={derivedSlug} title={title} />}

      {/* Tool Content */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 mt-3">
        {children}
      </div>

      {/* Pro Suggestion */}
      <div className="mt-4">
        <ProSuggestion category={category} />
      </div>

      {/* Below Tool Ad */}
      <AdSlot slot="below-tool" className="mt-6" />

      {/* Help Content */}
      {helpContent && (
        <div className="mt-8 prose prose-sm dark:prose-invert max-w-none">
          {helpContent}
        </div>
      )}

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-card rounded-lg border border-border">
                <summary className="flex items-center justify-between cursor-pointer p-4 text-sm font-medium">
                  {faq.question}
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Schema */}
      {faqs && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map(faq => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      )}

      {/* Related Tools */}
      {derivedSlug && category && CATEGORY_TOOLS[category] && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORY_TOOLS[category]
              .filter(t => t.id !== derivedSlug)
              .slice(0, 4)
              .map(tool => (
                <Link key={tool.id} href={`/tools/${tool.id}`}
                  className="p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium text-center">
                  {tool.name}
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Email Subscribe */}
      <div className="mt-8">
        <EmailSubscribe />
      </div>

      {/* JSON-LD SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: title,
            url: `https://utilsnow.com/tools/${derivedSlug || category}`,
            description: description,
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any (works in any modern browser)',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            browserRequirements: 'Requires JavaScript',
            permissions: 'none',
            isAccessibleForFree: true,
            creator: {
              '@type': 'Organization',
              name: 'UtilsNow',
              url: 'https://utilsnow.com',
            },
          }),
        }}
      />

      {/* JSON-LD BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://utilsnow.com' },
              { '@type': 'ListItem', position: 2, name: categoryLabel, item: `https://utilsnow.com/category/${category}` },
              { '@type': 'ListItem', position: 3, name: title },
            ],
          }),
        }}
      />
    </div>
  )
}

/* Reusable action buttons */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const { t } = useLanguage()
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
      {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> {t('btn.copied')}</> : <><Copy className="h-3.5 w-3.5" /> {t('btn.copy')}</>}
    </button>
  )
}

export function DownloadButton({ content, filename, mimeType = 'text/plain' }: { content: string; filename: string; mimeType?: string }) {
  const { t } = useLanguage()
  const handleDownload = () => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <button onClick={handleDownload} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
      <Download className="h-3.5 w-3.5" /> {t('btn.download')}
    </button>
  )
}

export function ClearButton({ onClear }: { onClear: () => void }) {
  const { t } = useLanguage()
  return (
    <button onClick={onClear} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
      <RotateCcw className="h-3.5 w-3.5" /> {t('btn.clear')}
    </button>
  )
}

/* Standard text area for tool input/output */
export function ToolTextarea({ value, onChange, placeholder, readOnly = false, rows = 10, label, onPaste }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean; rows?: number; label?: string; onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <textarea
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onPaste={onPaste}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        className="tool-textarea w-full rounded-lg border border-input bg-tool-bg p-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground disabled:opacity-50"
      />
    </div>
  )
}
