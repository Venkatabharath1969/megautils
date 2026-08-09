import type { MetadataRoute } from 'next'
import { getVisiblePosts } from '@/lib/blog-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://utilsnow.com'

  // All 177 tool slugs (alphabetical)
  const tools = [
    'age-calculator', 'angle-converter', 'area-converter', 'aspect-ratio-calculator',
    'barcode-generator', 'base32-encoder', 'base64-encoder', 'blank-line-remover',
    'bmi-calculator', 'braille-converter', 'break-even-calculator', 'caesar-cipher',
    'cagr-calculator', 'case-converter', 'chmod-calculator', 'code-to-image',
    'color-converter', 'color-name-finder', 'color-palette-generator', 'color-picker',
    'compound-interest-calculator', 'contrast-checker', 'cooking-converter',
    'cron-expression-builder', 'crontab-reference', 'css-animation-generator',
    'css-border-radius-generator', 'css-box-shadow-generator', 'css-columns-generator',
    'css-filter-generator', 'css-flexbox-generator', 'css-formatter',
    'css-gradient-generator', 'css-grid-generator', 'css-text-shadow-generator',
    'css-transform-generator', 'css-unit-converter', 'csv-escape', 'csv-to-json',
    'csv-viewer', 'data-storage-converter', 'date-calculator', 'diff-checker',
    'discount-calculator', 'duplicate-line-remover', 'emi-calculator', 'emoji-picker',
    'energy-converter', 'fake-data-generator', 'favicon-generator', 'fd-calculator',
    'find-and-replace', 'frequency-converter', 'fuel-economy-converter',
    'gitignore-generator', 'glassmorphism-generator', 'gst-calculator', 'hash-generator',
    'headline-analyzer', 'hex-to-rgb', 'hourly-to-salary', 'htaccess-generator',
    'html-entity-encoder', 'html-formatter', 'html-tag-stripper', 'html-to-markdown',
    'http-status-codes', 'image-cropper', 'image-format-converter', 'image-resizer',
    'image-to-base64', 'inflation-calculator', 'ip-address-info', 'irr-calculator',
    'javascript-formatter', 'json-escape', 'json-formatter', 'json-path-finder',
    'json-to-csv', 'json-to-go', 'json-to-python', 'json-to-typescript', 'json-to-xml',
    'json-to-yaml', 'json-validator', 'jwt-decoder', 'keyword-density-checker',
    'length-converter', 'line-number-adder', 'list-tools', 'loan-comparison-calculator',
    'lorem-ipsum-generator', 'margin-calculator', 'markdown-editor',
    'markdown-table-generator', 'markdown-to-html', 'markdown-to-text',
    'meta-tag-generator', 'morse-code-translator', 'mortgage-calculator', 'nato-alphabet',
    'neumorphism-generator', 'npv-calculator', 'number-base-converter', 'number-to-words',
    'open-graph-preview', 'password-generator', 'percentage-calculator',
    'placeholder-image-generator', 'power-converter', 'ppf-calculator',
    'pressure-converter', 'privacy-policy-generator', 'punycode-converter',
    'qr-code-generator', 'random-color-generator', 'rd-calculator', 'readability-score',
    'reading-time-calculator', 'regex-tester', 'robots-txt-generator', 'roi-calculator',
    'rot13-encoder', 'salary-calculator', 'schema-article', 'schema-breadcrumb',
    'schema-event', 'schema-faq', 'schema-howto', 'schema-job-posting',
    'schema-local-business', 'schema-organization', 'schema-product', 'schema-recipe',
    'scientific-calculator', 'serp-preview', 'sip-calculator', 'sitemap-generator',
    'small-text-generator', 'social-media-counter', 'speed-converter', 'sql-escape',
    'sql-formatter', 'stock-profit-calculator', 'string-length-calculator',
    'svg-optimizer', 'tailwind-color-picker', 'tax-calculator', 'temperature-converter',
    'terms-generator', 'text-diff', 'text-repeater', 'text-reverser', 'text-sorter',
    'text-to-ascii-art', 'text-to-binary', 'text-to-hex', 'text-to-slug',
    'text-to-speech', 'tint-shade-generator', 'tip-calculator', 'toml-formatter',
    'unicode-text-formatter', 'unix-timestamp-converter', 'url-encoder', 'url-parser',
    'user-agent-parser', 'utm-link-builder', 'uuid-generator', 'volume-converter',
    'weight-converter', 'word-counter', 'xml-escape', 'xml-formatter', 'xml-to-json',
    'yaml-formatter', 'yaml-to-json',
  ]

  const categories = [
    'developer', 'encoders', 'crypto', 'seo', 'text', 'string', 'content', 'markdown',
    'color', 'css', 'financial', 'converters', 'math', 'image', 'datetime', 'network', 'generators',
  ]

  const blogPosts = getVisiblePosts()

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    ...categories.map(cat => ({
      url: `${baseUrl}/category/${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...tools.map(tool => ({
      url: `${baseUrl}/tools/${tool}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...blogPosts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishDate),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
