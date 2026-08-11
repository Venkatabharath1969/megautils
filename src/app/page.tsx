'use client'

import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Code2, Binary, Shield, Search, Type, Terminal, PenTool, FileText, Palette, Paintbrush, DollarSign, ArrowLeftRight, Calculator, ImageIcon, Clock, Globe, Sparkles, X } from 'lucide-react'
import { useLanguage } from '@/i18n/language-context'

// Flat list of all tools for search — id, name, description, category
const allTools: { id: string; name: string; description: string; category: string }[] = [
  // Developer Tools
  { id: 'json-formatter', name: 'JSON Formatter & Validator', description: 'Format, validate, and beautify JSON data', category: 'developer' },
  { id: 'json-to-yaml', name: 'JSON to YAML', description: 'Convert JSON to YAML format', category: 'developer' },
  { id: 'yaml-to-json', name: 'YAML to JSON', description: 'Convert YAML to JSON format', category: 'developer' },
  { id: 'json-to-csv', name: 'JSON to CSV', description: 'Convert JSON arrays to CSV', category: 'developer' },
  { id: 'csv-to-json', name: 'CSV to JSON', description: 'Convert CSV data to JSON', category: 'developer' },
  { id: 'json-to-typescript', name: 'JSON to TypeScript', description: 'Generate TypeScript interfaces from JSON', category: 'developer' },
  { id: 'json-to-xml', name: 'JSON to XML', description: 'Convert JSON to XML format', category: 'developer' },
  { id: 'xml-to-json', name: 'XML to JSON', description: 'Convert XML to JSON format', category: 'developer' },
  { id: 'html-formatter', name: 'HTML Formatter', description: 'Format and beautify HTML code', category: 'developer' },
  { id: 'css-formatter', name: 'CSS Formatter', description: 'Format, beautify, and minify CSS', category: 'developer' },
  { id: 'sql-formatter', name: 'SQL Formatter', description: 'Format SQL queries', category: 'developer' },
  { id: 'javascript-formatter', name: 'JavaScript Formatter', description: 'Format and beautify JavaScript code', category: 'developer' },
  { id: 'text-diff', name: 'Text Diff', description: 'Compare two texts with highlighted differences', category: 'developer' },
  { id: 'code-to-image', name: 'Code to Image', description: 'Convert code snippets to beautiful images', category: 'developer' },
  // Encoders & Decoders
  { id: 'base64-encoder', name: 'Base64 Encoder/Decoder', description: 'Encode and decode Base64', category: 'encoders' },
  { id: 'url-encoder', name: 'URL Encoder/Decoder', description: 'Encode and decode URL strings', category: 'encoders' },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens', category: 'encoders' },
  { id: 'text-to-binary', name: 'Text to Binary', description: 'Convert text to binary and back', category: 'encoders' },
  { id: 'morse-code-translator', name: 'Morse Code Translator', description: 'Convert text to Morse code', category: 'encoders' },
  // Crypto & Hash
  { id: 'hash-generator', name: 'Hash Generator', description: 'Generate MD5, SHA-1, SHA-256 hashes', category: 'crypto' },
  { id: 'password-generator', name: 'Password Generator', description: 'Generate secure passwords', category: 'crypto' },
  // SEO Tools
  { id: 'meta-tag-generator', name: 'Meta Tag Generator', description: 'Generate SEO meta tags with OG and Twitter cards', category: 'seo' },
  { id: 'sitemap-generator', name: 'XML Sitemap Generator', description: 'Generate XML sitemaps', category: 'seo' },
  { id: 'serp-preview', name: 'SERP Preview', description: 'Preview how your page looks in Google search', category: 'seo' },
  { id: 'keyword-density-checker', name: 'Keyword Density Checker', description: 'Analyze keyword frequency', category: 'seo' },
  // Text Tools
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, sentences', category: 'text' },
  { id: 'case-converter', name: 'Case Converter', description: 'UPPER, lower, Title, camelCase, snake_case', category: 'text' },
  { id: 'duplicate-line-remover', name: 'Duplicate Line Remover', description: 'Remove duplicate lines from text', category: 'text' },
  { id: 'find-and-replace', name: 'Find & Replace', description: 'Bulk find and replace with regex', category: 'text' },
  { id: 'text-to-slug', name: 'Text to Slug', description: 'Convert text to URL-friendly slugs', category: 'text' },
  // String Utilities
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test regex with match highlighting', category: 'string' },
  { id: 'lorem-ipsum-generator', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text', category: 'string' },
  // Color Tools
  { id: 'color-picker', name: 'Color Picker', description: 'Pick colors with HEX, RGB, HSL output', category: 'color' },
  { id: 'contrast-checker', name: 'WCAG Contrast Checker', description: 'Check color contrast for accessibility', category: 'color' },
  { id: 'color-palette-generator', name: 'Color Palette Generator', description: 'Generate harmonious color palettes', category: 'color' },
  // CSS Tools
  { id: 'css-gradient-generator', name: 'CSS Gradient Generator', description: 'Build CSS gradients', category: 'css' },
  { id: 'css-box-shadow-generator', name: 'Box Shadow Generator', description: 'CSS box shadow builder', category: 'css' },
  { id: 'css-flexbox-generator', name: 'Flexbox Generator', description: 'Visual CSS flexbox layout builder', category: 'css' },
  { id: 'css-grid-generator', name: 'Grid Generator', description: 'Visual CSS grid layout builder', category: 'css' },
  // Financial
  { id: 'compound-interest-calculator', name: 'Compound Interest', description: 'Calculate compound interest', category: 'financial' },
  { id: 'emi-calculator', name: 'EMI Calculator', description: 'Calculate monthly loan EMI', category: 'financial' },
  { id: 'mortgage-calculator', name: 'Mortgage Calculator', description: 'Home loan payments', category: 'financial' },
  { id: 'percentage-calculator', name: 'Percentage Calculator', description: 'Calculate percentages', category: 'financial' },
  { id: 'tip-calculator', name: 'Tip Calculator', description: 'Calculate tips and split bills', category: 'financial' },
  // Unit Converters
  { id: 'length-converter', name: 'Length Converter', description: 'Meters, km, miles, feet, inches', category: 'converters' },
  { id: 'weight-converter', name: 'Weight Converter', description: 'Kilograms, pounds, ounces, grams', category: 'converters' },
  { id: 'temperature-converter', name: 'Temperature Converter', description: 'Celsius, Fahrenheit, Kelvin', category: 'converters' },
  { id: 'data-storage-converter', name: 'Data Storage Converter', description: 'Bytes, KB, MB, GB, TB', category: 'converters' },
  // Image Tools
  { id: 'qr-code-generator', name: 'QR Code Generator', description: 'Generate QR codes from text/URLs', category: 'image' },
  { id: 'image-resizer', name: 'Image Resizer', description: 'Resize images with aspect ratio', category: 'image' },
  { id: 'favicon-generator', name: 'Favicon Generator', description: 'Generate favicons in all sizes', category: 'image' },
  { id: 'ai-bg-remover', name: 'AI Background Remover', description: 'Remove image backgrounds with AI', category: 'image' },
  // Date & Time
  { id: 'unix-timestamp-converter', name: 'Unix Timestamp Converter', description: 'Convert timestamps to dates', category: 'datetime' },
  { id: 'date-calculator', name: 'Date Calculator', description: 'Add/subtract dates', category: 'datetime' },
  { id: 'age-calculator', name: 'Age Calculator', description: 'Calculate exact age', category: 'datetime' },
  // Generators
  { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate UUID v4', category: 'generators' },
  { id: 'fake-data-generator', name: 'Fake Data Generator', description: 'Generate random names, emails', category: 'generators' },
  // Math
  { id: 'scientific-calculator', name: 'Scientific Calculator', description: 'Advanced calculator with scientific functions', category: 'math' },
  { id: 'bmi-calculator', name: 'BMI Calculator', description: 'Body Mass Index calculator', category: 'math' },
  // Network
  { id: 'http-status-codes', name: 'HTTP Status Codes', description: 'Searchable HTTP status code reference', category: 'network' },
  { id: 'url-parser', name: 'URL Parser', description: 'Parse URLs into components', category: 'network' },
  // Markdown
  { id: 'markdown-editor', name: 'Markdown Editor', description: 'Live markdown editor with preview', category: 'markdown' },
  { id: 'markdown-to-html', name: 'Markdown to HTML', description: 'Convert Markdown to clean HTML', category: 'markdown' },
  // Content
  { id: 'headline-analyzer', name: 'Headline Analyzer', description: 'Score headlines for impact and SEO', category: 'content' },
  { id: 'text-to-speech', name: 'Text to Speech', description: 'Convert text to spoken audio', category: 'content' },
]

const categoryLabels: Record<string, string> = {
  developer: 'Developer Tools', encoders: 'Encoders & Decoders', crypto: 'Crypto & Hash',
  seo: 'SEO Tools', text: 'Text Tools', string: 'String Utilities', content: 'Content & Writing',
  markdown: 'Markdown Tools', color: 'Color Tools', css: 'CSS Tools', financial: 'Financial Calculators',
  converters: 'Unit Converters', math: 'Math & Science', image: 'Image Tools', datetime: 'Date & Time',
  network: 'Network & API', generators: 'Generators',
}

const categories = [
  { id: 'developer', label: 'Developer Tools', description: '24 tools -- Formatters, converters, validators', icon: Code2, count: 24, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { id: 'encoders', label: 'Encoders & Decoders', description: '14 tools -- Base64, URL, JWT, Binary, Hex', icon: Binary, count: 14, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { id: 'crypto', label: 'Crypto & Hash', description: '3 tools -- MD5, SHA, AES, bcrypt, passwords', icon: Shield, count: 3, color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  { id: 'seo', label: 'SEO Tools', description: '18 tools -- Meta tags, schema, sitemaps', icon: Search, count: 18, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { id: 'text', label: 'Text Tools', description: '24 tools -- Counters, case converters, cleaning', icon: Type, count: 24, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  { id: 'string', label: 'String Utilities', description: '6 tools -- Escape, regex, Lorem Ipsum', icon: Terminal, count: 6, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { id: 'content', label: 'Content & Writing', description: '3 tools -- Headlines, readability, social', icon: PenTool, count: 3, color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { id: 'markdown', label: 'Markdown Tools', description: '4 tools -- Editor, converters, tables', icon: FileText, count: 4, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  { id: 'color', label: 'Color Tools', description: '8 tools -- Picker, palettes, contrast', icon: Palette, count: 8, color: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400' },
  { id: 'css', label: 'CSS Tools', description: '14 tools -- Gradients, shadows, flexbox, grid', icon: Paintbrush, count: 14, color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  { id: 'financial', label: 'Financial Calculators', description: '23 tools -- Loans, interest, tax, ROI', icon: DollarSign, count: 23, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'converters', label: 'Unit Converters', description: '14 tools -- Length, weight, data, temp', icon: ArrowLeftRight, count: 14, color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  { id: 'math', label: 'Math & Science', description: '4 tools -- Scientific, statistics, BMI', icon: Calculator, count: 4, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'image', label: 'Image Tools', description: '19 tools -- AI + Compress, resize, QR codes', icon: ImageIcon, count: 19, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { id: 'datetime', label: 'Date & Time', description: '5 tools -- Timestamps, timezones, cron', icon: Clock, count: 5, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { id: 'network', label: 'Network & API', description: '4 tools -- DNS, IP, HTTP codes, cURL', icon: Globe, count: 4, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { id: 'generators', label: 'Generators', description: '10 tools -- UUID, passwords, fake data', icon: Sparkles, count: 10, color: 'bg-lime-500/10 text-lime-600 dark:text-lime-400' },
]

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const results = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
    )
  }, [query])

  if (!query) return null

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </h2>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Link>
      </div>
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
            >
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{tool.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
              <div className="mt-2 text-xs text-primary font-medium">{categoryLabels[tool.category] || tool.category} &rarr;</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <p className="text-muted-foreground">No tools found. Try a different search term.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-primary hover:underline">Browse all categories</Link>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Search Results */}
      <Suspense>
        <SearchResults />
      </Suspense>

      {/* Hero */}
      <div className="text-center mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          <span className="text-primary">194+</span> {t('hero.title')}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('hero.subtitle')}
          <span className="block mt-1 text-sm font-medium text-green-600 dark:text-green-400">
            {t('hero.privacy')}
          </span>
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${cat.color} mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-base group-hover:text-primary transition-colors">{t('cat.' + cat.id)}</h2>
              <p className="text-xs text-muted-foreground mt-1 flex-1">{cat.description}</p>
              <div className="mt-3 text-xs font-medium text-primary">{cat.count} tools &rarr;</div>
            </Link>
          )
        })}
      </div>

      {/* Product Hunt Badge */}
      <div className="mt-10 flex justify-center">
        <a href="https://www.producthunt.com/posts/utilsnow" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors text-sm">
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#DA552F"/><path d="M22.667 20H18v-6.667h4.667a3.333 3.333 0 010 6.667zM18 22.667v4h-2.667V11.333H22.667a6 6 0 110 12H18v-.666z" fill="#fff"/></svg>
          <span className="text-muted-foreground">Featured on <span className="font-semibold text-foreground">Product Hunt</span></span>
        </a>
      </div>

      {/* Trust Bar */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          { label: t('trust.free'), value: t('trust.free.value') },
          { label: t('trust.login'), value: t('trust.login.value') },
          { label: t('trust.data'), value: t('trust.data.value') },
          { label: t('trust.tools'), value: '194+' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CollectionPage + ItemList Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'UtilsNow - Free Online Tools',
        'description': '194+ free browser-based tools for developers, designers, and everyone. No signup required.',
        'url': 'https://utilsnow.com',
        'mainEntity': {
          '@type': 'ItemList',
          'numberOfItems': 17,
          'itemListElement': categories.map((cat, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'name': cat.label,
            'url': `https://utilsnow.com/category/${cat.id}`
          }))
        }
      }) }} />
    </div>
  )
}
