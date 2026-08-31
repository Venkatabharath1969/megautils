import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'

const categoryData: Record<string, { label: string; description: string; tools: { id: string; name: string; description: string }[] }> = {
  developer: {
    label: 'Developer Tools',
    description: 'Code formatters, data converters, validators, and diff tools for developers.',
    tools: [
      { id: 'json-formatter', name: 'JSON Formatter & Validator', description: 'Format, validate, and beautify JSON data' },
      { id: 'json-validator', name: 'JSON Validator', description: 'Validate JSON with detailed error messages and stats' },
      { id: 'json-to-yaml', name: 'JSON to YAML', description: 'Convert JSON to YAML format' },
      { id: 'yaml-to-json', name: 'YAML to JSON', description: 'Convert YAML to JSON format' },
      { id: 'json-to-csv', name: 'JSON to CSV', description: 'Convert JSON arrays to CSV' },
      { id: 'csv-to-json', name: 'CSV to JSON', description: 'Convert CSV data to JSON' },
      { id: 'json-to-typescript', name: 'JSON to TypeScript', description: 'Generate TypeScript interfaces from JSON' },
      { id: 'json-to-xml', name: 'JSON to XML', description: 'Convert JSON to XML format' },
      { id: 'xml-to-json', name: 'XML to JSON', description: 'Convert XML to JSON format' },
      { id: 'json-to-go', name: 'JSON to Go Struct', description: 'Generate Go structs from JSON' },
      { id: 'json-to-python', name: 'JSON to Python', description: 'Generate Python dataclasses from JSON' },
      { id: 'xml-formatter', name: 'XML Formatter', description: 'Format and beautify XML data' },
      { id: 'html-formatter', name: 'HTML Formatter', description: 'Format and beautify HTML code' },
      { id: 'css-formatter', name: 'CSS Formatter', description: 'Format, beautify, and minify CSS' },
      { id: 'sql-formatter', name: 'SQL Formatter', description: 'Format SQL queries with keyword capitalization' },
      { id: 'javascript-formatter', name: 'JavaScript Formatter', description: 'Format and beautify JavaScript code' },
      { id: 'yaml-formatter', name: 'YAML Formatter', description: 'Format and beautify YAML' },
      { id: 'toml-formatter', name: 'TOML Formatter', description: 'Format TOML configuration files' },
      { id: 'text-diff', name: 'Text Diff', description: 'Compare two texts with highlighted differences' },
      { id: 'diff-checker', name: 'Diff Checker', description: 'Compare texts with unified or side-by-side diff' },
      { id: 'code-to-image', name: 'Code to Image', description: 'Convert code snippets to beautiful images' },
      { id: 'chmod-calculator', name: 'chmod Calculator', description: 'Unix file permissions calculator' },
      { id: 'json-path-finder', name: 'JSON Path Finder', description: 'Find JSONPath for any element' },
      { id: 'csv-viewer', name: 'CSV Viewer', description: 'View CSV as sortable table' },
      { id: 'api-request-builder', name: 'API Request Builder', description: 'Build API requests visually and generate code in cURL, JavaScript, Python, Node.js, PHP, and Go' },
    ],
  },
  encoders: {
    label: 'Encoders & Decoders',
    description: 'Encode and decode data in Base64, URL, HTML, JWT, binary, hex, and more.',
    tools: [
      { id: 'base64-encoder', name: 'Base64 Encoder/Decoder', description: 'Encode and decode Base64 with UTF-8 support' },
      { id: 'url-encoder', name: 'URL Encoder/Decoder', description: 'Encode and decode URL strings' },
      { id: 'html-entity-encoder', name: 'HTML Entity Encoder/Decoder', description: 'Encode and decode HTML entities' },
      { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens' },
      { id: 'text-to-binary', name: 'Text to Binary', description: 'Convert text to binary and back' },
      { id: 'text-to-hex', name: 'Text to Hex', description: 'Convert text to hexadecimal and back' },
      { id: 'morse-code-translator', name: 'Morse Code Translator', description: 'Convert text to Morse code and back' },
      { id: 'rot13-encoder', name: 'ROT13 Encoder', description: 'ROT13 cipher encoder/decoder' },
      { id: 'number-base-converter', name: 'Number Base Converter', description: 'Convert between binary, octal, decimal, hex' },
      { id: 'base32-encoder', name: 'Base32 Encoder/Decoder', description: 'RFC 4648 Base32 encoding' },
      { id: 'punycode-converter', name: 'Punycode Converter', description: 'Convert international domains to Punycode' },
      { id: 'nato-alphabet', name: 'NATO Phonetic Alphabet', description: 'Convert text to NATO alphabet' },
      { id: 'caesar-cipher', name: 'Caesar Cipher', description: 'Caesar cipher with configurable shift' },
      { id: 'braille-converter', name: 'Braille Converter', description: 'Convert text to Unicode Braille' },
    ],
  },
  crypto: {
    label: 'Crypto & Hash',
    description: 'Hashing, encryption, passwords, and security tools.',
    tools: [
      { id: 'hash-generator', name: 'Hash Generator', description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes' },
      { id: 'password-generator', name: 'Password Generator', description: 'Generate secure passwords with strength meter' },
      { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate UUID v4 with bulk option' },
    ],
  },
  seo: {
    label: 'SEO Tools',
    description: 'Meta tags, schema markup, sitemaps, and SEO analysis tools.',
    tools: [
      { id: 'meta-tag-generator', name: 'Meta Tag Generator', description: 'Generate SEO meta tags with OG and Twitter cards' },
      { id: 'robots-txt-generator', name: 'Robots.txt Generator', description: 'Build robots.txt with rules and sitemap' },
      { id: 'sitemap-generator', name: 'XML Sitemap Generator', description: 'Generate XML sitemaps from URL lists' },
      { id: 'serp-preview', name: 'SERP Preview', description: 'Preview how your page looks in Google search results' },
      { id: 'keyword-density-checker', name: 'Keyword Density Checker', description: 'Analyze keyword frequency and n-gram density' },
      { id: 'readability-score', name: 'Readability Score', description: 'Calculate Flesch-Kincaid, Gunning Fog, SMOG scores' },
      { id: 'open-graph-preview', name: 'Open Graph Preview', description: 'Preview social media sharing cards' },
      { id: 'utm-link-builder', name: 'UTM Link Builder', description: 'Create campaign-tracked URLs with UTM parameters' },
      { id: 'schema-article', name: 'Article Schema Generator', description: 'Generate Article JSON-LD structured data' },
      { id: 'schema-faq', name: 'FAQ Schema Generator', description: 'Generate FAQPage JSON-LD' },
      { id: 'schema-product', name: 'Product Schema Generator', description: 'Generate Product JSON-LD' },
      { id: 'schema-howto', name: 'HowTo Schema Generator', description: 'Generate HowTo JSON-LD' },
      { id: 'schema-local-business', name: 'LocalBusiness Schema', description: 'Generate LocalBusiness JSON-LD' },
      { id: 'schema-organization', name: 'Organization Schema', description: 'Generate Organization JSON-LD' },
      { id: 'schema-event', name: 'Event Schema Generator', description: 'Generate Event JSON-LD' },
      { id: 'schema-job-posting', name: 'JobPosting Schema', description: 'Generate JobPosting JSON-LD' },
      { id: 'schema-breadcrumb', name: 'Breadcrumb Schema', description: 'Generate BreadcrumbList JSON-LD' },
      { id: 'schema-recipe', name: 'Recipe Schema Generator', description: 'Generate Recipe JSON-LD' },
    ],
  },
  text: {
    label: 'Text Tools',
    description: 'Count, convert, clean, sort, and transform text.',
    tools: [
      { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, sentences, and reading time' },
      { id: 'case-converter', name: 'Case Converter', description: 'UPPER, lower, Title, camelCase, snake_case, and more' },
      { id: 'markdown-to-text', name: 'Markdown to Text', description: 'Convert Markdown to plain text, rich text, or HTML' },
      { id: 'duplicate-line-remover', name: 'Duplicate Line Remover', description: 'Remove duplicate lines from text' },
      { id: 'text-sorter', name: 'Text Sorter', description: 'Sort lines A-Z, Z-A, by length, random, reverse' },
      { id: 'text-reverser', name: 'Text Reverser', description: 'Reverse text by characters, words, or lines' },
      { id: 'text-to-slug', name: 'Text to Slug', description: 'Convert text to URL-friendly slugs' },
      { id: 'find-and-replace', name: 'Find & Replace', description: 'Bulk find and replace with regex support' },
      { id: 'blank-line-remover', name: 'Blank Line Remover', description: 'Remove blank and empty lines' },
      { id: 'line-number-adder', name: 'Line Number Adder', description: 'Add line numbers to text' },
      { id: 'reading-time-calculator', name: 'Reading Time Calculator', description: 'Estimate reading and speaking time' },
      { id: 'string-length-calculator', name: 'String Length Calculator', description: 'Character, byte, and UTF-8/16 length' },
      { id: 'html-tag-stripper', name: 'HTML Tag Stripper', description: 'Strip HTML tags keeping text content' },
      { id: 'text-repeater', name: 'Text Repeater', description: 'Repeat text N times with separator' },
      { id: 'list-tools', name: 'List Tools', description: 'Split, join, sort, deduplicate lists' },
      { id: 'unicode-text-formatter', name: 'Unicode Text Formatter', description: 'Bold, italic, strikethrough Unicode text' },
      { id: 'text-to-ascii-art', name: 'Text to ASCII Art', description: 'Convert text to ASCII block art' },
      { id: 'small-text-generator', name: 'Small Text Generator', description: 'Superscript, subscript, small caps' },
      { id: 'ai-text-summarizer', name: 'AI Text Summarizer', description: 'Summarize long text into key points instantly' },
      { id: 'ai-content-detector', name: 'AI Content Detector', description: 'Detect whether text was written by AI or a human' },
      { id: 'ai-speech-to-text', name: 'AI Speech to Text', description: 'Convert speech to text in real-time using your microphone' },
      { id: 'ai-sentiment-analysis', name: 'AI Sentiment Analysis', description: 'Analyze the emotional tone of any text instantly' },
      { id: 'ai-grammar-checker', name: 'AI Grammar Checker', description: 'Check text for grammar, spelling, and punctuation errors instantly' },
      { id: 'ai-paraphraser', name: 'AI Paraphrasing Tool', description: 'Rewrite text in 8 styles — standard, fluency, formal, simple, academic, creative, shorten, expand' },
      { id: 'ai-humanizer', name: 'AI Text Humanizer', description: 'Make AI-generated text sound more natural and human-written' },
    ],
  },
  string: {
    label: 'String Utilities',
    description: 'Regex testing, encoding, generators, and string tools.',
    tools: [
      { id: 'regex-tester', name: 'Regex Tester', description: 'Test regex with match highlighting and capture groups' },
      { id: 'lorem-ipsum-generator', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text' },
      { id: 'json-escape', name: 'JSON Escape/Unescape', description: 'Escape strings for JSON' },
      { id: 'xml-escape', name: 'XML Escape/Unescape', description: 'Escape XML special characters' },
      { id: 'sql-escape', name: 'SQL Escape/Unescape', description: 'Escape strings for SQL queries' },
      { id: 'csv-escape', name: 'CSV Escape/Unescape', description: 'Escape fields for CSV' },
    ],
  },
  content: {
    label: 'Content & Writing',
    description: 'Headlines, readability analysis, and social media tools.',
    tools: [
      { id: 'headline-analyzer', name: 'Headline Analyzer', description: 'Score headlines for emotional impact and SEO' },
      { id: 'social-media-counter', name: 'Social Media Counter', description: 'Character count for Twitter, LinkedIn, Instagram, etc.' },
      { id: 'text-to-speech', name: 'Text to Speech', description: 'Convert text to spoken audio in your browser' },
    ],
  },
  markdown: {
    label: 'Markdown Tools',
    description: 'Markdown editor, converters, and table generator.',
    tools: [
      { id: 'markdown-editor', name: 'Markdown Editor', description: 'Live markdown editor with side-by-side preview' },
      { id: 'markdown-to-html', name: 'Markdown to HTML', description: 'Convert Markdown to clean HTML' },
      { id: 'html-to-markdown', name: 'HTML to Markdown', description: 'Convert HTML to Markdown syntax' },
      { id: 'markdown-table-generator', name: 'Markdown Table Generator', description: 'Visual table builder for GFM tables' },
    ],
  },
  color: {
    label: 'Color Tools',
    description: 'Color picker, converter, palette generator, and contrast checker.',
    tools: [
      { id: 'color-picker', name: 'Color Picker', description: 'Pick colors with HEX, RGB, HSL output' },
      { id: 'color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB, HSL, HSV' },
      { id: 'hex-to-rgb', name: 'HEX to RGB', description: 'Dedicated HEX and RGB converter' },
      { id: 'contrast-checker', name: 'WCAG Contrast Checker', description: 'Check color contrast for accessibility' },
      { id: 'color-palette-generator', name: 'Color Palette Generator', description: 'Generate harmonious color palettes' },
      { id: 'random-color-generator', name: 'Random Color Generator', description: 'Generate random colors with all formats' },
      { id: 'tint-shade-generator', name: 'Tint & Shade Generator', description: 'Generate tints and shades from a base color' },
      { id: 'color-name-finder', name: 'Color Name Finder', description: 'Find nearest CSS named color' },
    ],
  },
  css: {
    label: 'CSS Tools',
    description: 'Visual CSS generators for gradients, shadows, flexbox, grid, and more.',
    tools: [
      { id: 'css-gradient-generator', name: 'CSS Gradient Generator', description: 'Build linear and radial CSS gradients' },
      { id: 'css-box-shadow-generator', name: 'Box Shadow Generator', description: 'Multi-layer CSS box shadow builder' },
      { id: 'css-border-radius-generator', name: 'Border Radius Generator', description: 'Visual border radius builder' },
      { id: 'css-text-shadow-generator', name: 'Text Shadow Generator', description: 'CSS text shadow with live preview' },
      { id: 'css-flexbox-generator', name: 'Flexbox Generator', description: 'Visual CSS flexbox layout builder' },
      { id: 'css-grid-generator', name: 'Grid Generator', description: 'Visual CSS grid layout builder' },
      { id: 'glassmorphism-generator', name: 'Glassmorphism Generator', description: 'Frosted glass effect CSS generator' },
      { id: 'css-unit-converter', name: 'CSS Unit Converter', description: 'Convert between px, rem, em, %, pt, vw, vh' },
      { id: 'css-animation-generator', name: 'Animation Generator', description: 'CSS keyframe animation builder' },
      { id: 'neumorphism-generator', name: 'Neumorphism Generator', description: 'Soft UI / Neumorphism CSS' },
      { id: 'css-filter-generator', name: 'Filter Generator', description: 'CSS filter effects builder' },
      { id: 'css-transform-generator', name: 'Transform Generator', description: 'CSS transform builder' },
      { id: 'tailwind-color-picker', name: 'Tailwind Color Picker', description: 'Browse all Tailwind CSS colors' },
      { id: 'css-columns-generator', name: 'Columns Generator', description: 'Multi-column layout CSS' },
    ],
  },
  financial: {
    label: 'Financial Calculators',
    description: 'Loan, interest, tax, investment, and business calculators.',
    tools: [
      { id: 'compound-interest-calculator', name: 'Compound Interest', description: 'Calculate compound interest with breakdown' },
      { id: 'emi-calculator', name: 'EMI Calculator', description: 'Calculate monthly loan EMI' },
      { id: 'mortgage-calculator', name: 'Mortgage Calculator', description: 'Home loan payments and amortization' },
      { id: 'sip-calculator', name: 'SIP Calculator', description: 'Systematic Investment Plan calculator' },
      { id: 'salary-calculator', name: 'Salary Calculator', description: 'Gross to net salary converter' },
      { id: 'roi-calculator', name: 'ROI Calculator', description: 'Return on Investment calculator' },
      { id: 'discount-calculator', name: 'Discount Calculator', description: 'Calculate discounts and original prices' },
      { id: 'tip-calculator', name: 'Tip Calculator', description: 'Calculate tips and split bills' },
      { id: 'percentage-calculator', name: 'Percentage Calculator', description: 'Calculate percentages in multiple modes' },
      { id: 'gst-calculator', name: 'GST Calculator', description: 'Indian GST calculator with CGST/SGST/IGST' },
      { id: 'inflation-calculator', name: 'Inflation Calculator', description: 'Calculate future value and purchasing power' },
      { id: 'cagr-calculator', name: 'CAGR Calculator', description: 'Compound Annual Growth Rate calculator' },
      { id: 'loan-comparison-calculator', name: 'Loan Comparison', description: 'Compare two loans side by side' },
      { id: 'break-even-calculator', name: 'Break-Even Calculator', description: 'Calculate break-even point for business' },
      { id: 'margin-calculator', name: 'Margin Calculator', description: 'Calculate profit margin and markup' },
      { id: 'npv-calculator', name: 'NPV Calculator', description: 'Net Present Value calculator' },
      { id: 'irr-calculator', name: 'IRR Calculator', description: 'Internal Rate of Return calculator' },
      { id: 'fd-calculator', name: 'FD Calculator', description: 'Fixed Deposit maturity calculator' },
      { id: 'rd-calculator', name: 'RD Calculator', description: 'Recurring Deposit calculator' },
      { id: 'ppf-calculator', name: 'PPF Calculator', description: 'Public Provident Fund calculator' },
      { id: 'hourly-to-salary', name: 'Hourly to Salary', description: 'Convert hourly rate to annual salary' },
      { id: 'stock-profit-calculator', name: 'Stock Profit Calculator', description: 'Calculate stock trading profit/loss' },
      { id: 'tax-calculator', name: 'Tax Calculator', description: 'US federal income tax calculator' },
    ],
  },
  converters: {
    label: 'Unit Converters',
    description: 'Convert between length, weight, temperature, data storage, speed, area, and volume.',
    tools: [
      { id: 'length-converter', name: 'Length Converter', description: 'Meters, km, miles, feet, inches, and more' },
      { id: 'weight-converter', name: 'Weight Converter', description: 'Kilograms, pounds, ounces, grams, and more' },
      { id: 'temperature-converter', name: 'Temperature Converter', description: 'Celsius, Fahrenheit, and Kelvin' },
      { id: 'data-storage-converter', name: 'Data Storage Converter', description: 'Bytes, KB, MB, GB, TB (SI and binary)' },
      { id: 'speed-converter', name: 'Speed Converter', description: 'km/h, mph, m/s, knots, Mach' },
      { id: 'area-converter', name: 'Area Converter', description: 'sq meters, sq feet, acres, hectares' },
      { id: 'volume-converter', name: 'Volume Converter', description: 'Liters, gallons, cups, tablespoons' },
      { id: 'pressure-converter', name: 'Pressure Converter', description: 'Pa, bar, PSI, atm, mmHg, torr' },
      { id: 'energy-converter', name: 'Energy Converter', description: 'Joule, calorie, kWh, BTU, eV' },
      { id: 'power-converter', name: 'Power Converter', description: 'Watt, kilowatt, horsepower' },
      { id: 'frequency-converter', name: 'Frequency Converter', description: 'Hz, kHz, MHz, GHz, RPM' },
      { id: 'fuel-economy-converter', name: 'Fuel Economy', description: 'km/L, mpg, L/100km' },
      { id: 'cooking-converter', name: 'Cooking Converter', description: 'Cups, tablespoons, ml, fl oz' },
      { id: 'angle-converter', name: 'Angle Converter', description: 'Degrees, radians, gradians' },
    ],
  },
  math: {
    label: 'Math & Science',
    description: 'Scientific calculators, BMI, statistics, and equations.',
    tools: [
      { id: 'scientific-calculator', name: 'Scientific Calculator', description: 'Advanced calculator with scientific functions' },
      { id: 'bmi-calculator', name: 'BMI Calculator', description: 'Body Mass Index with category display' },
      { id: 'number-to-words', name: 'Number to Words', description: 'Convert numbers to English words' },
      { id: 'aspect-ratio-calculator', name: 'Aspect Ratio Calculator', description: 'Calculate aspect ratios from dimensions' },
    ],
  },
  image: {
    label: 'Image Tools',
    description: 'QR codes, image resizing, format conversion, cropping, and optimization.',
    tools: [
      { id: 'qr-code-generator', name: 'QR Code Generator', description: 'Generate QR codes from text/URLs' },
      { id: 'image-resizer', name: 'Image Resizer', description: 'Resize images with aspect ratio lock' },
      { id: 'image-to-base64', name: 'Image to Base64', description: 'Convert images to/from Base64' },
      { id: 'favicon-generator', name: 'Favicon Generator', description: 'Generate favicons in all sizes' },
      { id: 'image-format-converter', name: 'Image Format Converter', description: 'Convert PNG, JPG, WebP' },
      { id: 'image-cropper', name: 'Image Cropper', description: 'Crop images visually' },
      { id: 'placeholder-image-generator', name: 'Placeholder Image', description: 'Generate placeholder images' },
      { id: 'svg-optimizer', name: 'SVG Optimizer', description: 'Optimize and minify SVG code' },
      { id: 'ai-bg-remover', name: 'AI Background Remover', description: 'Remove image backgrounds instantly using AI' },
      { id: 'ai-face-blur', name: 'AI Face Blur', description: 'Automatically detect and blur faces for privacy' },
      { id: 'ai-ocr', name: 'AI Image to Text (OCR)', description: 'Extract text from images using AI-powered OCR' },
      { id: 'ai-image-upscaler', name: 'AI Image Upscaler', description: 'Enlarge images 2x using AI super-resolution' },
      { id: 'ai-segment', name: 'AI Image Segmentation', description: 'Click on any object to cut it out using AI' },
      { id: 'ai-depth-map', name: 'AI Depth Map Generator', description: 'Generate 3D depth maps from any photo using AI' },
      { id: 'ai-image-classifier', name: 'AI Image Classifier', description: 'Identify objects, animals, and scenes in photos using AI' },
      { id: 'ai-image-caption', name: 'AI Image Caption Generator', description: 'Generate natural language descriptions and alt text for images using AI' },
      { id: 'ai-object-remover', name: 'AI Object Remover', description: 'Paint over unwanted objects and remove them from photos' },
      { id: 'ai-photo-colorizer', name: 'AI Photo Colorizer', description: 'Add color to black & white photos instantly with style presets' },
      { id: 'ai-object-detection', name: 'AI Object Detection', description: 'Detect and label objects in images with bounding boxes using AI' },
    ],
  },
  datetime: {
    label: 'Date & Time',
    description: 'Unix timestamps, date calculations, age calculator, and cron builder.',
    tools: [
      { id: 'unix-timestamp-converter', name: 'Unix Timestamp Converter', description: 'Convert timestamps to dates and back' },
      { id: 'date-calculator', name: 'Date Calculator', description: 'Add/subtract dates and find differences' },
      { id: 'age-calculator', name: 'Age Calculator', description: 'Calculate exact age with birthday countdown' },
      { id: 'cron-expression-builder', name: 'Cron Expression Builder', description: 'Visual cron schedule builder' },
      { id: 'crontab-reference', name: 'Crontab Reference', description: 'Interactive cron syntax guide with examples' },
    ],
  },
  network: {
    label: 'Network & API',
    description: 'HTTP status codes, URL parser, user agent parser, and IP info.',
    tools: [
      { id: 'http-status-codes', name: 'HTTP Status Codes', description: 'Searchable reference of all HTTP status codes' },
      { id: 'url-parser', name: 'URL Parser', description: 'Parse URLs into components' },
      { id: 'user-agent-parser', name: 'User Agent Parser', description: 'Detect browser, OS, and device from UA string' },
      { id: 'ip-address-info', name: 'IP Address Info', description: 'Show your public IP address and details' },
    ],
  },
  generators: {
    label: 'Generators',
    description: 'Generate UUIDs, passwords, Lorem Ipsum, hashes, barcodes, and more.',
    tools: [
      { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate UUID v4 with bulk option' },
      { id: 'password-generator', name: 'Password Generator', description: 'Secure password generator with strength meter' },
      { id: 'lorem-ipsum-generator', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text' },
      { id: 'hash-generator', name: 'Hash Generator', description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes' },
      { id: 'gitignore-generator', name: '.gitignore Generator', description: 'Generate .gitignore from presets' },
      { id: 'fake-data-generator', name: 'Fake Data Generator', description: 'Generate random names, emails, addresses' },
      { id: 'emoji-picker', name: 'Emoji Picker', description: 'Search and copy emojis' },
      { id: 'barcode-generator', name: 'Barcode Generator', description: 'Generate Code 128 barcodes' },
    ],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const cat = categoryData[id]
  if (!cat) return { title: 'Category Not Found' }
  return {
    title: `${cat.label} - Free Online Tools`,
    description: cat.description,
    openGraph: {
      title: `${cat.label} | UtilsNow`,
      description: cat.description,
      url: `https://utilsnow.com/category/${id}`,
      type: 'website',
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: cat.label }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cat.label} | UtilsNow`,
      description: cat.description,
      images: ['/opengraph-image.png'],
    },
    alternates: { canonical: `https://utilsnow.com/category/${id}` },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cat = categoryData[id]
  if (!cat) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{cat.label}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{cat.label}</h1>
      <p className="text-muted-foreground mb-2">{cat.description}</p>
      <p className="text-sm text-primary font-medium mb-8">{cat.tools.length} tools available</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cat.tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.id}`}
            className="group p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
          >
            <h2 className="font-semibold group-hover:text-primary transition-colors">{tool.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
            <div className="mt-3 text-xs font-medium text-primary">Open tool &rarr;</div>
          </Link>
        ))}
      </div>

      {/* JSON-LD ItemList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Free ${cat.label} Tools`,
            description: cat.description,
            numberOfItems: cat.tools.length,
            itemListElement: cat.tools.map((tool, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: tool.name,
              url: `https://utilsnow.com/tools/${tool.id}`,
            })),
          }),
        }}
      />
    </div>
  )
}
