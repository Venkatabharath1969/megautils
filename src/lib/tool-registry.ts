// ============================================================================
// tool-registry.ts — Single Source of Truth for ALL tools & categories
// ============================================================================
// Every component that needs tool or category data MUST import from here.
// Do NOT duplicate tool lists in page.tsx, tool-page.tsx, or anywhere else.
// ============================================================================

export interface Tool {
  id: string          // URL slug, e.g. "json-formatter"
  name: string        // Display name, e.g. "JSON Formatter & Validator"
  description: string // Short description for cards / meta
  category: string    // Category ID, e.g. "developer"
  keywords: string[]  // Aliases & synonyms for fuzzy search
  isAI?: boolean      // true for AI-powered tools
}

export interface Category {
  id: string
  label: string
  description: string
  count: number
}

// ---------------------------------------------------------------------------
// Categories (17 total)
// ---------------------------------------------------------------------------
export const CATEGORIES: Category[] = [
  { id: 'developer',   label: 'Developer Tools',        description: 'Code formatters, data converters, validators, and diff tools for developers.', count: 24 },
  { id: 'encoders',    label: 'Encoders & Decoders',    description: 'Encode and decode data in Base64, URL, HTML, JWT, binary, hex, and more.', count: 14 },
  { id: 'crypto',      label: 'Crypto & Hash',          description: 'Hashing, encryption, passwords, and security tools.', count: 3 },
  { id: 'seo',         label: 'SEO Tools',              description: 'Meta tags, schema markup, sitemaps, and SEO analysis tools.', count: 18 },
  { id: 'text',        label: 'Text Tools',             description: 'Count, convert, clean, sort, and transform text.', count: 26 },
  { id: 'string',      label: 'String Utilities',       description: 'Regex testing, encoding, generators, and string tools.', count: 6 },
  { id: 'content',     label: 'Content & Writing',      description: 'Headlines, readability analysis, and social media tools.', count: 3 },
  { id: 'markdown',    label: 'Markdown Tools',         description: 'Markdown editor, converters, and table generator.', count: 4 },
  { id: 'color',       label: 'Color Tools',            description: 'Color picker, converter, palette generator, and contrast checker.', count: 8 },
  { id: 'css',         label: 'CSS Tools',              description: 'Visual CSS generators for gradients, shadows, flexbox, grid, and more.', count: 15 },
  { id: 'financial',   label: 'Financial Calculators',  description: 'Loan, interest, tax, investment, and business calculators.', count: 24 },
  { id: 'converters',  label: 'Unit Converters',        description: 'Convert between length, weight, temperature, data storage, speed, area, and volume.', count: 14 },
  { id: 'math',        label: 'Math & Science',         description: 'Scientific calculators, BMI, statistics, and equations.', count: 5 },
  { id: 'image',       label: 'Image Tools',            description: 'QR codes, image resizing, format conversion, cropping, and optimization.', count: 24 },
  { id: 'datetime',    label: 'Date & Time',            description: 'Unix timestamps, date calculations, age calculator, and cron builder.', count: 6 },
  { id: 'network',     label: 'Network & API',          description: 'HTTP status codes, URL parser, user agent parser, and IP info.', count: 4 },
  { id: 'generators',  label: 'Generators',             description: 'Generate UUIDs, passwords, Lorem Ipsum, hashes, barcodes, and more.', count: 12 },
  { id: 'pdf',         label: 'PDF Tools',              description: 'Merge, split, compress, unlock, watermark, rotate, and manipulate PDF files directly in your browser.', count: 9 },
]

// Tools that appear on the generators category page but whose primary
// category lives elsewhere. Use getGeneratorTools() to fetch all 8.
export const GENERATOR_CROSS_REFS: string[] = [
  'uuid-generator',       // primary: crypto
  'password-generator',   // primary: crypto
  'lorem-ipsum-generator', // primary: string
  'hash-generator',       // primary: crypto
]

// ---------------------------------------------------------------------------
// Tools (202 total)
// ---------------------------------------------------------------------------
export const TOOLS: Tool[] = [
  // ── Developer Tools (24) ─────────────────────────────────────────────────
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description: 'Format, validate, and beautify JSON data',
    category: 'developer',
    keywords: ['json beauty', 'json beautify', 'json prettify', 'json pretty print', 'json lint', 'json validate', 'json minify', 'json viewer', 'json format', 'json indent', 'json parse', 'json editor'],
  },
  {
    id: 'json-validator',
    name: 'JSON Validator',
    description: 'Validate JSON with detailed error messages and stats',
    category: 'developer',
    keywords: ['json check', 'json verify', 'json lint', 'json syntax', 'json error', 'validate json', 'json debug', 'json test'],
  },
  {
    id: 'json-to-yaml',
    name: 'JSON to YAML',
    description: 'Convert JSON to YAML format',
    category: 'developer',
    keywords: ['json yaml', 'json2yaml', 'json to yml', 'convert json yaml', 'yaml converter', 'json yml'],
  },
  {
    id: 'yaml-to-json',
    name: 'YAML to JSON',
    description: 'Convert YAML to JSON format',
    category: 'developer',
    keywords: ['yaml json', 'yaml2json', 'yml to json', 'convert yaml json', 'yml json', 'yaml converter'],
  },
  {
    id: 'json-to-csv',
    name: 'JSON to CSV',
    description: 'Convert JSON arrays to CSV',
    category: 'developer',
    keywords: ['json csv', 'json2csv', 'json spreadsheet', 'json excel', 'json table', 'export json csv', 'convert json csv'],
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    description: 'Convert CSV data to JSON',
    category: 'developer',
    keywords: ['csv json', 'csv2json', 'csv converter', 'spreadsheet json', 'excel json', 'import csv json'],
  },
  {
    id: 'json-to-typescript',
    name: 'JSON to TypeScript',
    description: 'Generate TypeScript interfaces from JSON',
    category: 'developer',
    keywords: ['json ts', 'json2ts', 'json typescript interface', 'json type', 'json to ts', 'typescript generator', 'json interface'],
  },
  {
    id: 'json-to-xml',
    name: 'JSON to XML',
    description: 'Convert JSON to XML format',
    category: 'developer',
    keywords: ['json xml', 'json2xml', 'convert json xml', 'json to markup', 'xml converter'],
  },
  {
    id: 'xml-to-json',
    name: 'XML to JSON',
    description: 'Convert XML to JSON format',
    category: 'developer',
    keywords: ['xml json', 'xml2json', 'convert xml json', 'xml converter', 'parse xml', 'xml parser'],
  },
  {
    id: 'json-to-go',
    name: 'JSON to Go Struct',
    description: 'Generate Go structs from JSON',
    category: 'developer',
    keywords: ['json go', 'json2go', 'json golang', 'go struct generator', 'json to golang', 'go type'],
  },
  {
    id: 'json-to-python',
    name: 'JSON to Python',
    description: 'Generate Python dataclasses from JSON',
    category: 'developer',
    keywords: ['json python', 'json2python', 'json py', 'python dataclass', 'json to py', 'python class generator', 'pydantic'],
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    description: 'Format and beautify XML data',
    category: 'developer',
    keywords: ['xml beautify', 'xml prettify', 'xml indent', 'format xml', 'xml pretty print', 'xml viewer', 'xml tidy'],
  },
  {
    id: 'html-formatter',
    name: 'HTML Formatter',
    description: 'Format and beautify HTML code',
    category: 'developer',
    keywords: ['html beautify', 'html prettify', 'html indent', 'format html', 'html pretty print', 'html tidy', 'html viewer'],
  },
  {
    id: 'css-formatter',
    name: 'CSS Formatter',
    description: 'Format, beautify, and minify CSS',
    category: 'developer',
    keywords: ['css beautify', 'css prettify', 'css indent', 'format css', 'css minify', 'css pretty print', 'css tidy', 'css minifier'],
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format SQL queries with keyword capitalization',
    category: 'developer',
    keywords: ['sql beautify', 'sql prettify', 'sql indent', 'format sql', 'sql pretty print', 'sql tidy', 'query formatter'],
  },
  {
    id: 'javascript-formatter',
    name: 'JavaScript Formatter',
    description: 'Format and beautify JavaScript code',
    category: 'developer',
    keywords: ['js formatter', 'js beautify', 'js prettify', 'format js', 'javascript beautify', 'js indent', 'js pretty print'],
  },
  {
    id: 'yaml-formatter',
    name: 'YAML Formatter',
    description: 'Format and beautify YAML',
    category: 'developer',
    keywords: ['yaml beautify', 'yml formatter', 'yaml prettify', 'format yaml', 'yaml indent', 'yml beautify'],
  },
  {
    id: 'toml-formatter',
    name: 'TOML Formatter',
    description: 'Format TOML configuration files',
    category: 'developer',
    keywords: ['toml beautify', 'toml prettify', 'format toml', 'toml indent', 'toml config', 'cargo.toml'],
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two texts with highlighted differences',
    category: 'developer',
    keywords: ['diff tool', 'text compare', 'compare text', 'file diff', 'string diff', 'text difference', 'side by side compare'],
  },
  {
    id: 'diff-checker',
    name: 'Diff Checker',
    description: 'Compare texts with unified or side-by-side diff',
    category: 'developer',
    keywords: ['diff tool', 'code compare', 'unified diff', 'side by side diff', 'file compare', 'text comparison', 'merge conflict'],
  },
  {
    id: 'code-to-image',
    name: 'Code to Image',
    description: 'Convert code snippets to beautiful images',
    category: 'developer',
    keywords: ['code screenshot', 'code snapshot', 'carbon', 'code image', 'snippet to image', 'code photo', 'code png', 'ray.so'],
  },
  {
    id: 'chmod-calculator',
    name: 'chmod Calculator',
    description: 'Unix file permissions calculator',
    category: 'developer',
    keywords: ['chmod', 'file permissions', 'unix permissions', 'linux permissions', 'rwx', 'permission calculator', 'octal permissions', '755', '644'],
  },
  {
    id: 'json-path-finder',
    name: 'JSON Path Finder',
    description: 'Find JSONPath for any element',
    category: 'developer',
    keywords: ['jsonpath', 'json path', 'json query', 'json selector', 'json navigate', 'json tree', 'json explorer'],
  },
  {
    id: 'csv-viewer',
    name: 'CSV Viewer',
    description: 'View CSV as sortable table',
    category: 'developer',
    keywords: ['csv table', 'csv reader', 'csv preview', 'csv display', 'spreadsheet viewer', 'csv browser', 'tsv viewer'],
  },

  // ── Encoders & Decoders (14) ─────────────────────────────────────────────
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 with UTF-8 support',
    category: 'encoders',
    keywords: ['base64', 'base64 encode', 'base64 decode', 'b64', 'base 64', 'btoa', 'atob', 'base64 converter'],
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder/Decoder',
    description: 'Encode and decode URL strings',
    category: 'encoders',
    keywords: ['url encode', 'url decode', 'percent encoding', 'urlencode', 'urldecode', 'encodeURIComponent', 'url escape'],
  },
  {
    id: 'html-entity-encoder',
    name: 'HTML Entity Encoder/Decoder',
    description: 'Encode and decode HTML entities',
    category: 'encoders',
    keywords: ['html entities', 'html encode', 'html decode', 'html escape', 'html unescape', 'special characters html', 'amp lt gt'],
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens',
    category: 'encoders',
    keywords: ['jwt', 'json web token', 'jwt decode', 'jwt parse', 'jwt inspect', 'token decoder', 'jwt viewer', 'jwt debug'],
  },
  {
    id: 'text-to-binary',
    name: 'Text to Binary',
    description: 'Convert text to binary and back',
    category: 'encoders',
    keywords: ['binary converter', 'text binary', 'binary text', 'ascii binary', 'binary code', '01 converter', 'binary translator'],
  },
  {
    id: 'text-to-hex',
    name: 'Text to Hex',
    description: 'Convert text to hexadecimal and back',
    category: 'encoders',
    keywords: ['hex converter', 'text hex', 'hex text', 'hexadecimal', 'ascii hex', 'hex encoder', 'hex decoder'],
  },
  {
    id: 'morse-code-translator',
    name: 'Morse Code Translator',
    description: 'Convert text to Morse code and back',
    category: 'encoders',
    keywords: ['morse code', 'morse translator', 'dot dash', 'morse encoder', 'morse decoder', 'sos morse', 'telegraph code'],
  },
  {
    id: 'rot13-encoder',
    name: 'ROT13 Encoder',
    description: 'ROT13 cipher encoder/decoder',
    category: 'encoders',
    keywords: ['rot13', 'rot 13', 'caesar 13', 'rotate 13', 'rot13 cipher', 'rot13 decode', 'rot13 encode'],
  },
  {
    id: 'number-base-converter',
    name: 'Number Base Converter',
    description: 'Convert between binary, octal, decimal, hex',
    category: 'encoders',
    keywords: ['base converter', 'number converter', 'binary decimal', 'hex decimal', 'octal decimal', 'radix converter', 'base 2 10 16'],
  },
  {
    id: 'base32-encoder',
    name: 'Base32 Encoder/Decoder',
    description: 'RFC 4648 Base32 encoding',
    category: 'encoders',
    keywords: ['base32', 'base32 encode', 'base32 decode', 'b32', 'base 32', 'rfc 4648'],
  },
  {
    id: 'punycode-converter',
    name: 'Punycode Converter',
    description: 'Convert international domains to Punycode',
    category: 'encoders',
    keywords: ['punycode', 'idn', 'internationalized domain', 'xn--', 'domain encode', 'unicode domain', 'ace'],
  },
  {
    id: 'nato-alphabet',
    name: 'NATO Phonetic Alphabet',
    description: 'Convert text to NATO alphabet',
    category: 'encoders',
    keywords: ['nato', 'phonetic alphabet', 'alpha bravo charlie', 'spelling alphabet', 'nato code', 'icao phonetic', 'radio alphabet'],
  },
  {
    id: 'caesar-cipher',
    name: 'Caesar Cipher',
    description: 'Caesar cipher with configurable shift',
    category: 'encoders',
    keywords: ['caesar cipher', 'shift cipher', 'caesar encode', 'caesar decode', 'rotation cipher', 'cipher wheel', 'substitution cipher'],
  },
  {
    id: 'braille-converter',
    name: 'Braille Converter',
    description: 'Convert text to Unicode Braille',
    category: 'encoders',
    keywords: ['braille', 'braille text', 'braille unicode', 'braille converter', 'braille dots', 'braille alphabet', 'accessibility text'],
  },

  // ── Crypto & Hash (3) ────────────────────────────────────────────────────
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes',
    category: 'crypto',
    keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'checksum', 'digest', 'hash calculator', 'file hash', 'crypto hash'],
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure passwords with strength meter',
    category: 'crypto',
    keywords: ['password', 'strong password', 'random password', 'passphrase', 'password maker', 'secure password', 'password strength', 'generate password'],
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate UUID v4 with bulk option',
    category: 'crypto',
    keywords: ['uuid', 'guid', 'uuid4', 'uuidv4', 'unique id', 'random id', 'uuid generator', 'bulk uuid'],
  },

  // ── SEO Tools (18) ───────────────────────────────────────────────────────
  {
    id: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    description: 'Generate SEO meta tags with OG and Twitter cards',
    category: 'seo',
    keywords: ['meta tags', 'og tags', 'open graph', 'twitter card', 'seo tags', 'meta description', 'meta title', 'social meta'],
  },
  {
    id: 'robots-txt-generator',
    name: 'Robots.txt Generator',
    description: 'Build robots.txt with rules and sitemap',
    category: 'seo',
    keywords: ['robots.txt', 'robots txt', 'crawler rules', 'bot rules', 'search engine crawl', 'disallow', 'sitemap directive'],
  },
  {
    id: 'sitemap-generator',
    name: 'XML Sitemap Generator',
    description: 'Generate XML sitemaps from URL lists',
    category: 'seo',
    keywords: ['sitemap', 'xml sitemap', 'sitemap.xml', 'sitemap generator', 'url list', 'search engine sitemap', 'site map'],
  },
  {
    id: 'serp-preview',
    name: 'SERP Preview',
    description: 'Preview how your page looks in Google search results',
    category: 'seo',
    keywords: ['serp', 'google preview', 'search preview', 'google result', 'search result preview', 'snippet preview', 'title tag preview'],
  },
  {
    id: 'keyword-density-checker',
    name: 'Keyword Density Checker',
    description: 'Analyze keyword frequency and n-gram density',
    category: 'seo',
    keywords: ['keyword density', 'keyword frequency', 'keyword analysis', 'seo keywords', 'keyword count', 'word frequency', 'n-gram', 'keyword checker'],
  },
  {
    id: 'readability-score',
    name: 'Readability Score',
    description: 'Calculate Flesch-Kincaid, Gunning Fog, SMOG scores',
    category: 'seo',
    keywords: ['readability', 'flesch kincaid', 'gunning fog', 'smog', 'reading level', 'readability score', 'text readability', 'reading ease'],
  },
  {
    id: 'open-graph-preview',
    name: 'Open Graph Preview',
    description: 'Preview social media sharing cards',
    category: 'seo',
    keywords: ['open graph', 'og preview', 'social card preview', 'facebook preview', 'twitter preview', 'linkedin preview', 'social share preview'],
  },
  {
    id: 'utm-link-builder',
    name: 'UTM Link Builder',
    description: 'Create campaign-tracked URLs with UTM parameters',
    category: 'seo',
    keywords: ['utm', 'utm builder', 'utm generator', 'campaign url', 'utm parameters', 'tracking url', 'google analytics utm', 'utm link'],
  },
  {
    id: 'schema-article',
    name: 'Article Schema Generator',
    description: 'Generate Article JSON-LD structured data',
    category: 'seo',
    keywords: ['article schema', 'json-ld article', 'structured data article', 'blog schema', 'news article schema', 'schema.org article'],
  },
  {
    id: 'schema-faq',
    name: 'FAQ Schema Generator',
    description: 'Generate FAQPage JSON-LD',
    category: 'seo',
    keywords: ['faq schema', 'json-ld faq', 'structured data faq', 'faqpage schema', 'schema.org faq', 'faq markup'],
  },
  {
    id: 'schema-product',
    name: 'Product Schema Generator',
    description: 'Generate Product JSON-LD',
    category: 'seo',
    keywords: ['product schema', 'json-ld product', 'structured data product', 'ecommerce schema', 'schema.org product', 'product markup'],
  },
  {
    id: 'schema-howto',
    name: 'HowTo Schema Generator',
    description: 'Generate HowTo JSON-LD',
    category: 'seo',
    keywords: ['howto schema', 'json-ld howto', 'structured data howto', 'tutorial schema', 'schema.org howto', 'how-to markup', 'step by step schema'],
  },
  {
    id: 'schema-local-business',
    name: 'LocalBusiness Schema',
    description: 'Generate LocalBusiness JSON-LD',
    category: 'seo',
    keywords: ['local business schema', 'json-ld local business', 'structured data business', 'business schema', 'schema.org local', 'store schema'],
  },
  {
    id: 'schema-organization',
    name: 'Organization Schema',
    description: 'Generate Organization JSON-LD',
    category: 'seo',
    keywords: ['organization schema', 'json-ld organization', 'structured data org', 'company schema', 'schema.org organization', 'org markup'],
  },
  {
    id: 'schema-event',
    name: 'Event Schema Generator',
    description: 'Generate Event JSON-LD',
    category: 'seo',
    keywords: ['event schema', 'json-ld event', 'structured data event', 'schema.org event', 'event markup', 'concert schema', 'conference schema'],
  },
  {
    id: 'schema-job-posting',
    name: 'JobPosting Schema',
    description: 'Generate JobPosting JSON-LD',
    category: 'seo',
    keywords: ['job posting schema', 'json-ld job', 'structured data job', 'schema.org job', 'job listing schema', 'career schema', 'hiring schema'],
  },
  {
    id: 'schema-breadcrumb',
    name: 'Breadcrumb Schema',
    description: 'Generate BreadcrumbList JSON-LD',
    category: 'seo',
    keywords: ['breadcrumb schema', 'json-ld breadcrumb', 'structured data breadcrumb', 'schema.org breadcrumb', 'breadcrumb markup', 'navigation schema'],
  },
  {
    id: 'schema-recipe',
    name: 'Recipe Schema Generator',
    description: 'Generate Recipe JSON-LD',
    category: 'seo',
    keywords: ['recipe schema', 'json-ld recipe', 'structured data recipe', 'schema.org recipe', 'recipe markup', 'cooking schema', 'food schema'],
  },

  // ── Text Tools (24) ──────────────────────────────────────────────────────
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, sentences, and reading time',
    category: 'text',
    keywords: ['word count', 'character count', 'letter count', 'char count', 'sentence count', 'reading time', 'text counter', 'word calculator'],
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'UPPER, lower, Title, camelCase, snake_case, and more',
    category: 'text',
    keywords: ['uppercase', 'lowercase', 'title case', 'camel case', 'snake case', 'pascal case', 'kebab case', 'case change', 'text case'],
  },
  {
    id: 'markdown-to-text',
    name: 'Markdown to Text',
    description: 'Convert Markdown to plain text, rich text, or HTML',
    category: 'text',
    keywords: ['md to text', 'markdown plain text', 'strip markdown', 'markdown convert', 'md convert', 'markdown to plaintext'],
  },
  {
    id: 'duplicate-line-remover',
    name: 'Duplicate Line Remover',
    description: 'Remove duplicate lines from text',
    category: 'text',
    keywords: ['remove duplicates', 'deduplicate', 'dedup lines', 'unique lines', 'remove duplicate lines', 'distinct lines', 'dedupe'],
  },
  {
    id: 'text-sorter',
    name: 'Text Sorter',
    description: 'Sort lines A-Z, Z-A, by length, random, reverse',
    category: 'text',
    keywords: ['sort lines', 'sort text', 'alphabetical sort', 'line sorter', 'sort alphabetically', 'random sort', 'reverse sort'],
  },
  {
    id: 'text-reverser',
    name: 'Text Reverser',
    description: 'Reverse text by characters, words, or lines',
    category: 'text',
    keywords: ['reverse text', 'flip text', 'backwards text', 'mirror text', 'reverse string', 'reverse words', 'text flip'],
  },
  {
    id: 'text-to-slug',
    name: 'Text to Slug',
    description: 'Convert text to URL-friendly slugs',
    category: 'text',
    keywords: ['slug generator', 'url slug', 'slugify', 'url friendly', 'permalink', 'seo url', 'text to url', 'slug maker'],
  },
  {
    id: 'find-and-replace',
    name: 'Find & Replace',
    description: 'Bulk find and replace with regex support',
    category: 'text',
    keywords: ['find replace', 'search replace', 'text replace', 'bulk replace', 'regex replace', 'find and replace', 'str replace'],
  },
  {
    id: 'blank-line-remover',
    name: 'Blank Line Remover',
    description: 'Remove blank and empty lines',
    category: 'text',
    keywords: ['remove blank lines', 'remove empty lines', 'strip blank lines', 'clean text', 'remove whitespace lines', 'trim blank'],
  },
  {
    id: 'line-number-adder',
    name: 'Line Number Adder',
    description: 'Add line numbers to text',
    category: 'text',
    keywords: ['add line numbers', 'number lines', 'line numbering', 'prepend numbers', 'line count prefix', 'numbered lines'],
  },
  {
    id: 'reading-time-calculator',
    name: 'Reading Time Calculator',
    description: 'Estimate reading and speaking time',
    category: 'text',
    keywords: ['reading time', 'read time', 'speaking time', 'speech time', 'wpm', 'words per minute', 'time to read', 'article length'],
  },
  {
    id: 'string-length-calculator',
    name: 'String Length Calculator',
    description: 'Character, byte, and UTF-8/16 length',
    category: 'text',
    keywords: ['string length', 'char length', 'byte length', 'utf8 length', 'utf16 length', 'text length', 'string size'],
  },
  {
    id: 'html-tag-stripper',
    name: 'HTML Tag Stripper',
    description: 'Strip HTML tags keeping text content',
    category: 'text',
    keywords: ['strip html', 'remove html tags', 'html to text', 'strip tags', 'clean html', 'remove tags', 'html stripper'],
  },
  {
    id: 'text-repeater',
    name: 'Text Repeater',
    description: 'Repeat text N times with separator',
    category: 'text',
    keywords: ['repeat text', 'text multiply', 'duplicate text', 'repeat string', 'text loop', 'copy paste repeat', 'text repeater'],
  },
  {
    id: 'list-tools',
    name: 'List Tools',
    description: 'Split, join, sort, deduplicate lists',
    category: 'text',
    keywords: ['list splitter', 'list joiner', 'list sort', 'list dedup', 'list converter', 'split list', 'join list', 'comma separated'],
  },
  {
    id: 'unicode-text-formatter',
    name: 'Unicode Text Formatter',
    description: 'Bold, italic, strikethrough Unicode text',
    category: 'text',
    keywords: ['unicode bold', 'unicode italic', 'fancy text', 'unicode formatter', 'strikethrough text', 'bold text generator', 'unicode font'],
  },
  {
    id: 'text-to-ascii-art',
    name: 'Text to ASCII Art',
    description: 'Convert text to ASCII block art',
    category: 'text',
    keywords: ['ascii art', 'text art', 'figlet', 'banner text', 'ascii text', 'block letters', 'ascii generator', 'text banner'],
  },
  {
    id: 'small-text-generator',
    name: 'Small Text Generator',
    description: 'Superscript, subscript, small caps',
    category: 'text',
    keywords: ['small text', 'tiny text', 'superscript', 'subscript', 'small caps', 'mini text', 'small font generator'],
  },
  {
    id: 'ai-text-summarizer',
    name: 'AI Text Summarizer',
    description: 'Summarize long text into key points instantly',
    category: 'text',
    keywords: ['summarize', 'text summary', 'tldr', 'summarizer', 'ai summary', 'key points', 'abstract', 'condense text'],
    isAI: true,
  },
  {
    id: 'ai-content-detector',
    name: 'AI Content Detector',
    description: 'Detect whether text was written by AI or a human',
    category: 'text',
    keywords: ['ai detector', 'ai checker', 'chatgpt detector', 'ai writing detector', 'human vs ai', 'ai content check', 'gpt detector'],
    isAI: true,
  },
  {
    id: 'ai-speech-to-text',
    name: 'AI Speech to Text',
    description: 'Convert speech to text in real-time using your microphone',
    category: 'text',
    keywords: ['speech to text', 'voice to text', 'transcribe', 'dictation', 'voice typing', 'audio to text', 'stt', 'speech recognition'],
    isAI: true,
  },
  {
    id: 'ai-sentiment-analysis',
    name: 'AI Sentiment Analysis',
    description: 'Analyze the emotional tone of any text instantly',
    category: 'text',
    keywords: ['sentiment', 'tone analysis', 'emotion detection', 'positive negative', 'text mood', 'opinion analysis', 'sentiment score'],
    isAI: true,
  },
  {
    id: 'ai-grammar-checker',
    name: 'AI Grammar Checker',
    description: 'Check text for grammar, spelling, and punctuation errors instantly',
    category: 'text',
    keywords: ['grammar check', 'spell check', 'punctuation check', 'grammar fixer', 'proofreader', 'writing checker', 'grammarly alternative'],
    isAI: true,
  },
  {
    id: 'ai-paraphraser',
    name: 'AI Paraphrasing Tool',
    description: 'Rewrite text in 8 styles — standard, fluency, formal, simple, academic, creative, shorten, expand',
    category: 'text',
    keywords: ['paraphrase', 'rewrite', 'rephrase', 'reword', 'text rewriter', 'paraphrasing tool', 'sentence rewriter', 'ai rewrite', 'quillbot alternative'],
    isAI: true,
  },
  {
    id: 'ai-humanizer',
    name: 'AI Text Humanizer',
    description: 'Make AI-generated text sound more natural and human-written',
    category: 'text',
    keywords: ['ai humanizer', 'humanize text', 'ai bypass', 'ai detector bypass', 'make ai text human', 'undetectable ai', 'ai rewriter', 'human text'],
    isAI: true,
  },
  {
    id: 'typing-speed-test',
    name: 'Typing Speed Test',
    description: 'Test your typing speed with real-time WPM, accuracy, and error tracking',
    category: 'text',
    keywords: ['typing test', 'typing speed', 'wpm test', 'words per minute', 'typing practice', 'typing game', 'keyboard speed', 'typing accuracy', 'type test', 'speed typing'],
  },

  // ── String Utilities (6) ─────────────────────────────────────────────────
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test regex with match highlighting and capture groups',
    category: 'string',
    keywords: ['regex', 'regexp', 'regular expression', 'regex test', 'regex match', 'regex101', 'regex pattern', 'regex debugger'],
  },
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text',
    category: 'string',
    keywords: ['lorem ipsum', 'placeholder text', 'dummy text', 'filler text', 'lipsum', 'sample text', 'mock text'],
  },
  {
    id: 'json-escape',
    name: 'JSON Escape/Unescape',
    description: 'Escape strings for JSON',
    category: 'string',
    keywords: ['json escape', 'json unescape', 'escape json string', 'json string', 'stringify escape', 'json special chars'],
  },
  {
    id: 'xml-escape',
    name: 'XML Escape/Unescape',
    description: 'Escape XML special characters',
    category: 'string',
    keywords: ['xml escape', 'xml unescape', 'escape xml', 'xml special characters', 'xml entities', 'xml encode'],
  },
  {
    id: 'sql-escape',
    name: 'SQL Escape/Unescape',
    description: 'Escape strings for SQL queries',
    category: 'string',
    keywords: ['sql escape', 'sql unescape', 'escape sql', 'sql injection', 'sql sanitize', 'sql string escape', 'sql quote'],
  },
  {
    id: 'csv-escape',
    name: 'CSV Escape/Unescape',
    description: 'Escape fields for CSV',
    category: 'string',
    keywords: ['csv escape', 'csv unescape', 'escape csv', 'csv quote', 'csv field escape', 'csv special chars'],
  },

  // ── Content & Writing (3) ────────────────────────────────────────────────
  {
    id: 'headline-analyzer',
    name: 'Headline Analyzer',
    description: 'Score headlines for emotional impact and SEO',
    category: 'content',
    keywords: ['headline score', 'title analyzer', 'headline checker', 'blog title', 'headline grader', 'coschedule', 'emotional headline'],
  },
  {
    id: 'social-media-counter',
    name: 'Social Media Counter',
    description: 'Character count for Twitter, LinkedIn, Instagram, etc.',
    category: 'content',
    keywords: ['twitter character limit', 'tweet counter', 'social media character', 'instagram caption length', 'linkedin post length', 'x character count'],
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    description: 'Convert text to spoken audio in your browser',
    category: 'content',
    keywords: ['tts', 'text to speech', 'read aloud', 'speak text', 'voice reader', 'text reader', 'audio from text', 'speech synthesis'],
  },

  // ── Markdown Tools (4) ───────────────────────────────────────────────────
  {
    id: 'markdown-editor',
    name: 'Markdown Editor',
    description: 'Live markdown editor with side-by-side preview',
    category: 'markdown',
    keywords: ['md editor', 'markdown preview', 'markdown live', 'markdown writer', 'md preview', 'wysiwyg markdown', 'markdown ide'],
  },
  {
    id: 'markdown-to-html',
    name: 'Markdown to HTML',
    description: 'Convert Markdown to clean HTML',
    category: 'markdown',
    keywords: ['md to html', 'markdown html', 'markdown convert', 'md converter', 'markdown to webpage', 'md2html'],
  },
  {
    id: 'html-to-markdown',
    name: 'HTML to Markdown',
    description: 'Convert HTML to Markdown syntax',
    category: 'markdown',
    keywords: ['html to md', 'html markdown', 'html convert', 'html2md', 'webpage to markdown', 'html2markdown'],
  },
  {
    id: 'markdown-table-generator',
    name: 'Markdown Table Generator',
    description: 'Visual table builder for GFM tables',
    category: 'markdown',
    keywords: ['md table', 'markdown table', 'gfm table', 'table generator', 'markdown table builder', 'github table', 'pipe table'],
  },

  // ── Color Tools (8) ──────────────────────────────────────────────────────
  {
    id: 'color-picker',
    name: 'Color Picker',
    description: 'Pick colors with HEX, RGB, HSL output',
    category: 'color',
    keywords: ['color picker', 'colour picker', 'hex color', 'rgb color', 'hsl color', 'color chooser', 'color selector', 'eyedropper'],
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert between HEX, RGB, HSL, HSV',
    category: 'color',
    keywords: ['color convert', 'colour convert', 'hex to rgb', 'rgb to hex', 'hsl to rgb', 'hsv to rgb', 'color format'],
  },
  {
    id: 'hex-to-rgb',
    name: 'HEX to RGB',
    description: 'Dedicated HEX and RGB converter',
    category: 'color',
    keywords: ['hex rgb', 'hex to rgb', 'rgb to hex', 'hex color code', 'rgb values', 'color code converter', '#ffffff to rgb'],
  },
  {
    id: 'contrast-checker',
    name: 'WCAG Contrast Checker',
    description: 'Check color contrast for accessibility',
    category: 'color',
    keywords: ['contrast ratio', 'wcag', 'accessibility contrast', 'a11y contrast', 'color contrast', 'aa aaa', 'contrast checker', 'ada compliance'],
  },
  {
    id: 'color-palette-generator',
    name: 'Color Palette Generator',
    description: 'Generate harmonious color palettes',
    category: 'color',
    keywords: ['color palette', 'colour palette', 'color scheme', 'palette generator', 'color harmony', 'complementary colors', 'analogous colors'],
  },
  {
    id: 'random-color-generator',
    name: 'Random Color Generator',
    description: 'Generate random colors with all formats',
    category: 'color',
    keywords: ['random color', 'random colour', 'color randomizer', 'random hex', 'random rgb', 'color generator'],
  },
  {
    id: 'tint-shade-generator',
    name: 'Tint & Shade Generator',
    description: 'Generate tints and shades from a base color',
    category: 'color',
    keywords: ['tint shade', 'color tint', 'color shade', 'lighten darken', 'color variations', 'color steps', 'tint generator'],
  },
  {
    id: 'color-name-finder',
    name: 'Color Name Finder',
    description: 'Find nearest CSS named color',
    category: 'color',
    keywords: ['color name', 'colour name', 'css color name', 'named color', 'color identifier', 'what color is this', 'color lookup'],
  },

  // ── CSS Tools (14) ───────────────────────────────────────────────────────
  {
    id: 'css-gradient-generator',
    name: 'CSS Gradient Generator',
    description: 'Build linear and radial CSS gradients',
    category: 'css',
    keywords: ['gradient', 'css gradient', 'linear gradient', 'radial gradient', 'gradient maker', 'gradient builder', 'color gradient', 'background gradient'],
  },
  {
    id: 'css-box-shadow-generator',
    name: 'Box Shadow Generator',
    description: 'Multi-layer CSS box shadow builder',
    category: 'css',
    keywords: ['box shadow', 'css shadow', 'drop shadow', 'shadow generator', 'card shadow', 'element shadow', 'box-shadow css'],
  },
  {
    id: 'css-border-radius-generator',
    name: 'Border Radius Generator',
    description: 'Visual border radius builder',
    category: 'css',
    keywords: ['border radius', 'rounded corners', 'css radius', 'corner radius', 'border-radius css', 'round corners', 'blob maker'],
  },
  {
    id: 'css-text-shadow-generator',
    name: 'Text Shadow Generator',
    description: 'CSS text shadow with live preview',
    category: 'css',
    keywords: ['text shadow', 'css text shadow', 'text effect', 'text glow', 'text-shadow css', 'font shadow'],
  },
  {
    id: 'css-flexbox-generator',
    name: 'Flexbox Generator',
    description: 'Visual CSS flexbox layout builder',
    category: 'css',
    keywords: ['flexbox', 'css flexbox', 'flex layout', 'flexbox builder', 'flex container', 'flex direction', 'justify content', 'align items'],
  },
  {
    id: 'css-grid-generator',
    name: 'Grid Generator',
    description: 'Visual CSS grid layout builder',
    category: 'css',
    keywords: ['css grid', 'grid layout', 'grid builder', 'grid template', 'grid columns', 'grid rows', 'css grid generator'],
  },
  {
    id: 'glassmorphism-generator',
    name: 'Glassmorphism Generator',
    description: 'Frosted glass effect CSS generator',
    category: 'css',
    keywords: ['glassmorphism', 'glass effect', 'frosted glass', 'blur background', 'glass css', 'backdrop filter', 'glass ui'],
  },
  {
    id: 'css-unit-converter',
    name: 'CSS Unit Converter',
    description: 'Convert between px, rem, em, %, pt, vw, vh',
    category: 'css',
    keywords: ['px to rem', 'rem to px', 'em to px', 'css units', 'unit converter css', 'pixel rem', 'css calc', 'viewport units'],
  },
  {
    id: 'css-animation-generator',
    name: 'Animation Generator',
    description: 'CSS keyframe animation builder',
    category: 'css',
    keywords: ['css animation', 'keyframes', 'css animate', 'animation builder', 'keyframe generator', 'css transition', 'animate css'],
  },
  {
    id: 'neumorphism-generator',
    name: 'Neumorphism Generator',
    description: 'Soft UI / Neumorphism CSS',
    category: 'css',
    keywords: ['neumorphism', 'soft ui', 'neomorphism', 'neumorphic', 'soft shadow', 'clay ui', 'neumorphism css'],
  },
  {
    id: 'css-filter-generator',
    name: 'Filter Generator',
    description: 'CSS filter effects builder',
    category: 'css',
    keywords: ['css filter', 'blur', 'brightness', 'contrast', 'grayscale', 'sepia', 'saturate', 'hue-rotate', 'filter effects'],
  },
  {
    id: 'css-transform-generator',
    name: 'Transform Generator',
    description: 'CSS transform builder',
    category: 'css',
    keywords: ['css transform', 'rotate', 'scale', 'skew', 'translate', 'transform css', 'css rotate', 'css scale'],
  },
  {
    id: 'tailwind-color-picker',
    name: 'Tailwind Color Picker',
    description: 'Browse all Tailwind CSS colors',
    category: 'css',
    keywords: ['tailwind colors', 'tailwindcss', 'tailwind palette', 'tailwind color', 'tw colors', 'tailwind css palette', 'tailwind shades'],
  },
  {
    id: 'css-columns-generator',
    name: 'Columns Generator',
    description: 'Multi-column layout CSS',
    category: 'css',
    keywords: ['css columns', 'multi column', 'column layout', 'column count', 'column gap', 'newspaper layout', 'css column-count'],
  },
  {
    id: 'text-gradient-generator',
    name: 'Text Gradient Generator',
    description: 'Create beautiful CSS gradient text with live preview, copy CSS, and download as PNG',
    category: 'css',
    keywords: ['gradient text', 'text gradient', 'css gradient text', 'gradient heading', 'gradient font', 'colorful text', 'text effect', 'background clip text', 'gradient title', 'rainbow text'],
  },

  // ── Financial Calculators (23) ───────────────────────────────────────────
  {
    id: 'compound-interest-calculator',
    name: 'Compound Interest',
    description: 'Calculate compound interest with breakdown',
    category: 'financial',
    keywords: ['compound interest', 'interest calc', 'ci calculator', 'compound interest formula', 'interest calculator', 'savings calculator', 'investment growth'],
  },
  {
    id: 'emi-calculator',
    name: 'EMI Calculator',
    description: 'Calculate monthly loan EMI',
    category: 'financial',
    keywords: ['emi', 'loan emi', 'emi calc', 'monthly installment', 'loan payment', 'equated monthly installment', 'emi formula'],
  },
  {
    id: 'mortgage-calculator',
    name: 'Mortgage Calculator',
    description: 'Home loan payments and amortization',
    category: 'financial',
    keywords: ['mortgage', 'home loan', 'mortgage calc', 'house payment', 'amortization', 'home loan emi', 'mortgage payment', 'property loan'],
  },
  {
    id: 'sip-calculator',
    name: 'SIP Calculator',
    description: 'Systematic Investment Plan calculator',
    category: 'financial',
    keywords: ['sip', 'systematic investment', 'sip calc', 'mutual fund sip', 'sip returns', 'monthly investment', 'sip calculator india'],
  },
  {
    id: 'salary-calculator',
    name: 'Salary Calculator',
    description: 'Gross to net salary converter',
    category: 'financial',
    keywords: ['salary calc', 'gross to net', 'net salary', 'take home pay', 'salary after tax', 'paycheck calculator', 'salary breakdown'],
  },
  {
    id: 'roi-calculator',
    name: 'ROI Calculator',
    description: 'Return on Investment calculator',
    category: 'financial',
    keywords: ['roi', 'return on investment', 'roi calc', 'investment return', 'profit percentage', 'roi formula', 'investment roi'],
  },
  {
    id: 'discount-calculator',
    name: 'Discount Calculator',
    description: 'Calculate discounts and original prices',
    category: 'financial',
    keywords: ['discount', 'discount calc', 'percent off', 'sale price', 'discount percentage', 'price after discount', 'savings calculator'],
  },
  {
    id: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills',
    category: 'financial',
    keywords: ['tip calc', 'tip calculator', 'bill splitter', 'split bill', 'restaurant tip', 'gratuity calculator', 'tip percentage'],
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Calculate percentages in multiple modes',
    category: 'financial',
    keywords: ['percentage', 'percent calc', 'percent calculator', 'what percent', 'percentage of', 'percentage increase', 'percentage decrease'],
  },
  {
    id: 'gst-calculator',
    name: 'GST Calculator',
    description: 'Indian GST calculator with CGST/SGST/IGST',
    category: 'financial',
    keywords: ['gst', 'gst calc', 'goods and services tax', 'cgst', 'sgst', 'igst', 'gst india', 'tax calculator india'],
  },
  {
    id: 'inflation-calculator',
    name: 'Inflation Calculator',
    description: 'Calculate future value and purchasing power',
    category: 'financial',
    keywords: ['inflation', 'inflation calc', 'purchasing power', 'future value', 'cpi calculator', 'inflation rate', 'money value over time'],
  },
  {
    id: 'cagr-calculator',
    name: 'CAGR Calculator',
    description: 'Compound Annual Growth Rate calculator',
    category: 'financial',
    keywords: ['cagr', 'compound annual growth', 'cagr calc', 'growth rate', 'annual return', 'cagr formula', 'investment growth rate'],
  },
  {
    id: 'loan-comparison-calculator',
    name: 'Loan Comparison',
    description: 'Compare two loans side by side',
    category: 'financial',
    keywords: ['loan compare', 'compare loans', 'loan comparison', 'best loan', 'loan vs loan', 'side by side loan', 'loan rate compare'],
  },
  {
    id: 'break-even-calculator',
    name: 'Break-Even Calculator',
    description: 'Calculate break-even point for business',
    category: 'financial',
    keywords: ['break even', 'breakeven', 'break even point', 'bep calculator', 'business break even', 'cost analysis', 'profit break even'],
  },
  {
    id: 'margin-calculator',
    name: 'Margin Calculator',
    description: 'Calculate profit margin and markup',
    category: 'financial',
    keywords: ['margin', 'profit margin', 'markup', 'gross margin', 'margin calc', 'markup calculator', 'cost margin', 'margin vs markup'],
  },
  {
    id: 'npv-calculator',
    name: 'NPV Calculator',
    description: 'Net Present Value calculator',
    category: 'financial',
    keywords: ['npv', 'net present value', 'npv calc', 'present value', 'discounted cash flow', 'dcf', 'npv formula'],
  },
  {
    id: 'irr-calculator',
    name: 'IRR Calculator',
    description: 'Internal Rate of Return calculator',
    category: 'financial',
    keywords: ['irr', 'internal rate of return', 'irr calc', 'rate of return', 'irr formula', 'investment irr', 'project irr'],
  },
  {
    id: 'fd-calculator',
    name: 'FD Calculator',
    description: 'Fixed Deposit maturity calculator',
    category: 'financial',
    keywords: ['fd', 'fixed deposit', 'fd calc', 'fd maturity', 'fd interest', 'bank fd', 'term deposit', 'fixed deposit calculator'],
  },
  {
    id: 'rd-calculator',
    name: 'RD Calculator',
    description: 'Recurring Deposit calculator',
    category: 'financial',
    keywords: ['rd', 'recurring deposit', 'rd calc', 'rd maturity', 'rd interest', 'monthly deposit', 'recurring deposit calculator'],
  },
  {
    id: 'ppf-calculator',
    name: 'PPF Calculator',
    description: 'Public Provident Fund calculator',
    category: 'financial',
    keywords: ['ppf', 'public provident fund', 'ppf calc', 'ppf interest', 'ppf maturity', 'ppf returns', 'ppf india'],
  },
  {
    id: 'hourly-to-salary',
    name: 'Hourly to Salary',
    description: 'Convert hourly rate to annual salary',
    category: 'financial',
    keywords: ['hourly to salary', 'hourly rate', 'annual salary', 'wage converter', 'hourly pay', 'salary from hourly', 'pay calculator'],
  },
  {
    id: 'stock-profit-calculator',
    name: 'Stock Profit Calculator',
    description: 'Calculate stock trading profit/loss',
    category: 'financial',
    keywords: ['stock profit', 'stock calc', 'stock gain', 'stock loss', 'trading calculator', 'share profit', 'stock return', 'buy sell stock'],
  },
  {
    id: 'tax-calculator',
    name: 'Tax Calculator',
    description: 'US federal income tax calculator',
    category: 'financial',
    keywords: ['tax calc', 'income tax', 'federal tax', 'tax bracket', 'us tax', 'tax estimator', 'irs tax', '1040 calculator'],
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    description: 'Convert between 30+ currencies with live exchange rates',
    category: 'financial',
    keywords: ['currency converter', 'exchange rate', 'forex', 'money converter', 'usd to eur', 'usd to inr', 'usd to gbp', 'currency exchange', 'convert currency', 'foreign exchange', 'fx converter', 'dollar to euro', 'dollar to rupee'],
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    description: 'Create professional invoices with line items, tax, discounts, and download as PDF',
    category: 'financial',
    keywords: ['invoice generator', 'create invoice', 'invoice maker', 'free invoice', 'invoice template', 'pdf invoice', 'billing', 'invoice pdf', 'freelance invoice', 'business invoice', 'freshbooks alternative', 'invoice ninja alternative'],
  },

  // ── Unit Converters (14) ─────────────────────────────────────────────────
  {
    id: 'length-converter',
    name: 'Length Converter',
    description: 'Meters, km, miles, feet, inches, and more',
    category: 'converters',
    keywords: ['length', 'distance', 'meters to feet', 'km to miles', 'inches to cm', 'feet to meters', 'convert length', 'height converter'],
  },
  {
    id: 'weight-converter',
    name: 'Weight Converter',
    description: 'Kilograms, pounds, ounces, grams, and more',
    category: 'converters',
    keywords: ['weight', 'mass', 'kg to lbs', 'pounds to kg', 'ounces to grams', 'convert weight', 'lbs to kg', 'weight converter'],
  },
  {
    id: 'temperature-converter',
    name: 'Temperature Converter',
    description: 'Celsius, Fahrenheit, and Kelvin',
    category: 'converters',
    keywords: ['temperature', 'celsius fahrenheit', 'f to c', 'c to f', 'kelvin', 'convert temperature', 'temp converter', 'degrees'],
  },
  {
    id: 'data-storage-converter',
    name: 'Data Storage Converter',
    description: 'Bytes, KB, MB, GB, TB (SI and binary)',
    category: 'converters',
    keywords: ['data storage', 'bytes', 'kb mb gb', 'file size', 'storage converter', 'megabytes to gigabytes', 'data size', 'tb to gb'],
  },
  {
    id: 'speed-converter',
    name: 'Speed Converter',
    description: 'km/h, mph, m/s, knots, Mach',
    category: 'converters',
    keywords: ['speed', 'velocity', 'kmh to mph', 'mph to kmh', 'knots', 'mach', 'meters per second', 'speed converter'],
  },
  {
    id: 'area-converter',
    name: 'Area Converter',
    description: 'sq meters, sq feet, acres, hectares',
    category: 'converters',
    keywords: ['area', 'sq ft', 'square meters', 'acres', 'hectares', 'sq m to sq ft', 'convert area', 'land area'],
  },
  {
    id: 'volume-converter',
    name: 'Volume Converter',
    description: 'Liters, gallons, cups, tablespoons',
    category: 'converters',
    keywords: ['volume', 'liters', 'gallons', 'cups', 'ml', 'fluid ounces', 'convert volume', 'liquid measurement'],
  },
  {
    id: 'pressure-converter',
    name: 'Pressure Converter',
    description: 'Pa, bar, PSI, atm, mmHg, torr',
    category: 'converters',
    keywords: ['pressure', 'psi', 'bar', 'atm', 'pascal', 'mmhg', 'torr', 'pressure converter', 'tire pressure'],
  },
  {
    id: 'energy-converter',
    name: 'Energy Converter',
    description: 'Joule, calorie, kWh, BTU, eV',
    category: 'converters',
    keywords: ['energy', 'joules', 'calories', 'kwh', 'btu', 'electron volt', 'convert energy', 'energy units'],
  },
  {
    id: 'power-converter',
    name: 'Power Converter',
    description: 'Watt, kilowatt, horsepower',
    category: 'converters',
    keywords: ['power', 'watts', 'kilowatts', 'horsepower', 'hp to kw', 'kw to hp', 'convert power', 'watt converter'],
  },
  {
    id: 'frequency-converter',
    name: 'Frequency Converter',
    description: 'Hz, kHz, MHz, GHz, RPM',
    category: 'converters',
    keywords: ['frequency', 'hertz', 'khz', 'mhz', 'ghz', 'rpm', 'convert frequency', 'hz converter'],
  },
  {
    id: 'fuel-economy-converter',
    name: 'Fuel Economy',
    description: 'km/L, mpg, L/100km',
    category: 'converters',
    keywords: ['fuel economy', 'mpg', 'km per liter', 'l/100km', 'gas mileage', 'fuel efficiency', 'fuel consumption', 'mpg converter'],
  },
  {
    id: 'cooking-converter',
    name: 'Cooking Converter',
    description: 'Cups, tablespoons, ml, fl oz',
    category: 'converters',
    keywords: ['cooking', 'cups to ml', 'tablespoon', 'teaspoon', 'fl oz', 'recipe converter', 'kitchen converter', 'baking measurements'],
  },
  {
    id: 'angle-converter',
    name: 'Angle Converter',
    description: 'Degrees, radians, gradians',
    category: 'converters',
    keywords: ['angle', 'degrees', 'radians', 'gradians', 'deg to rad', 'rad to deg', 'convert angle', 'angle units'],
  },

  // ── Math & Science (5) ───────────────────────────────────────────────────
  {
    id: 'calorie-calculator',
    name: 'Calorie Calculator',
    description: 'Calculate BMR, TDEE, and daily calorie needs with macros',
    category: 'math',
    keywords: ['calorie calculator', 'bmr calculator', 'tdee calculator', 'calorie counter', 'basal metabolic rate', 'daily calories', 'macro calculator', 'mifflin st jeor', 'weight loss calories', 'calorie intake', 'how many calories'],
  },
  {
    id: 'scientific-calculator',
    name: 'Scientific Calculator',
    description: 'Advanced calculator with scientific functions',
    category: 'math',
    keywords: ['calculator', 'scientific calc', 'advanced calculator', 'math calculator', 'sin cos tan', 'logarithm', 'scientific', 'trig calculator'],
  },
  {
    id: 'bmi-calculator',
    name: 'BMI Calculator',
    description: 'Body Mass Index with category display',
    category: 'math',
    keywords: ['bmi', 'body mass index', 'bmi calc', 'weight index', 'healthy weight', 'bmi chart', 'bmi check', 'obesity calculator'],
  },
  {
    id: 'number-to-words',
    name: 'Number to Words',
    description: 'Convert numbers to English words',
    category: 'math',
    keywords: ['number words', 'number to text', 'spell number', 'write number', 'number in words', 'digits to words', 'number spelling'],
  },
  {
    id: 'aspect-ratio-calculator',
    name: 'Aspect Ratio Calculator',
    description: 'Calculate aspect ratios from dimensions',
    category: 'math',
    keywords: ['aspect ratio', 'ratio calc', '16:9', '4:3', 'screen ratio', 'image ratio', 'video ratio', 'resolution calculator'],
  },

  // ── Image Tools (19) ─────────────────────────────────────────────────────
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes from text/URLs',
    category: 'image',
    keywords: ['qr code', 'qr generator', 'qr maker', 'qr create', 'barcode qr', 'scan code', 'qr url', 'qr text'],
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images with aspect ratio lock',
    category: 'image',
    keywords: ['resize image', 'img resize', 'image size', 'scale image', 'resize photo', 'image dimensions', 'resize picture', 'shrink image'],
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    description: 'Convert images to/from Base64',
    category: 'image',
    keywords: ['image base64', 'img to base64', 'base64 image', 'image encode', 'data uri', 'base64 to image', 'image string'],
  },
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    description: 'Generate favicons in all sizes',
    category: 'image',
    keywords: ['favicon', 'favicon generator', 'ico generator', 'website icon', 'favicon maker', 'favicon.ico', 'browser icon', 'tab icon'],
  },
  {
    id: 'image-format-converter',
    name: 'Image Format Converter',
    description: 'Convert PNG, JPG, WebP',
    category: 'image',
    keywords: ['image convert', 'png to jpg', 'jpg to png', 'webp to png', 'image format', 'convert image', 'jpg to webp', 'img converter'],
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    description: 'Crop images visually',
    category: 'image',
    keywords: ['crop image', 'image crop', 'photo crop', 'trim image', 'cut image', 'crop photo', 'image cutter', 'crop picture'],
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress JPG, PNG, WebP images to reduce file size',
    category: 'image',
    keywords: ['compress image', 'reduce image size', 'image optimizer', 'compress jpg', 'compress png', 'tinypng alternative', 'image compression', 'optimize image', 'shrink image', 'reduce file size', 'squoosh', 'compressor'],
  },
  {
    id: 'heic-to-jpg',
    name: 'HEIC to JPG Converter',
    description: 'Convert iPhone HEIC/HEIF photos to JPG, PNG, or WebP',
    category: 'image',
    keywords: ['heic converter', 'heif to jpg', 'iphone photo converter', 'heic to png', 'convert heic', 'heic to jpeg', 'heif converter', 'apple photo convert', 'heic to webp', 'iphone heic'],
  },
  {
    id: 'placeholder-image-generator',
    name: 'Placeholder Image',
    description: 'Generate placeholder images',
    category: 'image',
    keywords: ['placeholder', 'placeholder image', 'dummy image', 'test image', 'mock image', 'placeholder.com', 'filler image', 'sample image'],
  },
  {
    id: 'svg-optimizer',
    name: 'SVG Optimizer',
    description: 'Optimize and minify SVG code',
    category: 'image',
    keywords: ['svg optimize', 'svg minify', 'svgo', 'svg compress', 'svg cleaner', 'svg reduce', 'optimize svg', 'svg minifier'],
  },
  {
    id: 'ai-bg-remover',
    name: 'AI Background Remover',
    description: 'Remove image backgrounds instantly using AI',
    category: 'image',
    keywords: ['remove background', 'bg remover', 'background eraser', 'transparent background', 'cutout', 'remove bg', 'background remove', 'photo background'],
    isAI: true,
  },
  {
    id: 'ai-face-blur',
    name: 'AI Face Blur',
    description: 'Automatically detect and blur faces for privacy',
    category: 'image',
    keywords: ['face blur', 'blur face', 'face detection', 'privacy blur', 'anonymize face', 'censor face', 'face redact', 'face pixelate'],
    isAI: true,
  },
  {
    id: 'ai-ocr',
    name: 'AI Image to Text (OCR)',
    description: 'Extract text from images using AI-powered OCR',
    category: 'image',
    keywords: ['ocr', 'image to text', 'text recognition', 'extract text', 'photo to text', 'scan text', 'optical character recognition', 'read image'],
    isAI: true,
  },
  {
    id: 'ai-image-upscaler',
    name: 'AI Image Upscaler',
    description: 'Enlarge images 2x using AI super-resolution',
    category: 'image',
    keywords: ['upscale', 'image upscaler', 'super resolution', 'enlarge image', 'enhance image', 'increase resolution', 'ai upscale', '2x image'],
    isAI: true,
  },
  {
    id: 'ai-segment',
    name: 'AI Image Segmentation',
    description: 'Click on any object to cut it out using AI',
    category: 'image',
    keywords: ['segment', 'image segmentation', 'object cutout', 'cut out object', 'segment anything', 'sam', 'magic select', 'ai cutout'],
    isAI: true,
  },
  {
    id: 'ai-depth-map',
    name: 'AI Depth Map Generator',
    description: 'Generate 3D depth maps from any photo using AI',
    category: 'image',
    keywords: ['depth map', 'depth estimation', '3d depth', 'monocular depth', 'depth image', 'ai depth', 'parallax effect', 'depth sensing'],
    isAI: true,
  },
  {
    id: 'ai-image-classifier',
    name: 'AI Image Classifier',
    description: 'Identify objects, animals, and scenes in photos using AI',
    category: 'image',
    keywords: ['image classifier', 'image recognition', 'identify image', 'what is this', 'photo identify', 'ai classify', 'object recognition', 'scene recognition'],
    isAI: true,
  },
  {
    id: 'ai-image-caption',
    name: 'AI Image Caption Generator',
    description: 'Generate natural language descriptions and alt text for images using AI',
    category: 'image',
    keywords: ['image caption', 'alt text', 'image description', 'describe image', 'ai caption', 'photo caption', 'auto alt text', 'image to text description'],
    isAI: true,
  },
  {
    id: 'ai-object-remover',
    name: 'AI Object Remover',
    description: 'Paint over unwanted objects and remove them from photos',
    category: 'image',
    keywords: ['object remover', 'remove object', 'inpainting', 'erase object', 'photo eraser', 'remove unwanted', 'ai erase', 'magic eraser'],
    isAI: true,
  },
  {
    id: 'ai-photo-colorizer',
    name: 'AI Photo Colorizer',
    description: 'Add color to black & white photos instantly with style presets',
    category: 'image',
    keywords: ['colorize', 'photo colorizer', 'bw to color', 'black white color', 'colorize photo', 'ai colorize', 'old photo color', 'restore color'],
    isAI: true,
  },
  {
    id: 'ai-object-detection',
    name: 'AI Object Detection',
    description: 'Detect and label objects in images with bounding boxes using AI',
    category: 'image',
    keywords: ['object detection', 'detect objects', 'bounding box', 'yolo', 'image detection', 'find objects', 'ai detect', 'label objects'],
    isAI: true,
  },
  {
    id: 'social-media-resizer',
    name: 'Social Media Image Resizer',
    description: 'Resize images for every social platform in one click',
    category: 'image',
    keywords: ['social media resize', 'instagram resize', 'facebook resize', 'twitter resize', 'linkedin resize', 'youtube thumbnail', 'tiktok resize', 'pinterest resize', 'social image', 'batch resize'],
  },
  {
    id: 'exif-viewer',
    name: 'Image EXIF Viewer',
    description: 'View, inspect, and strip EXIF metadata from photos',
    category: 'image',
    keywords: ['exif', 'exif viewer', 'exif data', 'photo metadata', 'image metadata', 'gps location', 'camera info', 'strip exif', 'remove metadata', 'photo info'],
  },
  {
    id: 'image-filters',
    name: 'Image Filters',
    description: 'Apply photo filters and adjustments with live preview',
    category: 'image',
    keywords: ['image filter', 'photo filter', 'instagram filter', 'brightness', 'contrast', 'saturation', 'sepia', 'vintage filter', 'photo edit', 'image adjust'],
  },
  {
    id: 'ocr-text-extractor',
    name: 'OCR Text Extractor',
    description: 'Extract text from images using browser-based OCR with 12 language support',
    category: 'image',
    keywords: ['ocr', 'text extractor', 'image to text', 'extract text', 'optical character recognition', 'scan text', 'tesseract', 'ocr free', 'photo to text', 'screenshot text', 'digitize text', 'scan document'],
  },
  {
    id: 'image-crop',
    name: 'Image Crop Tool',
    description: 'Crop images with interactive drag handles, aspect ratio presets, and format options',
    category: 'image',
    keywords: ['crop image', 'image crop', 'photo crop', 'crop tool', 'image cutter', 'resize crop', 'aspect ratio crop', 'passport crop', 'square crop', 'drag crop', 'interactive crop'],
  },
  {
    id: 'video-to-gif',
    name: 'Video to GIF/WebM Converter',
    description: 'Convert video clips to animated WebM or extract frames — free, no upload',
    category: 'image',
    keywords: ['video to gif', 'gif maker', 'video converter', 'mp4 to gif', 'webm converter', 'video clip', 'animated gif', 'gif creator', 'video to animation', 'cloudconvert alternative', 'convertio alternative'],
  },
  {
    id: 'meme-generator',
    name: 'Meme Generator',
    description: 'Create memes with custom text, fonts, and styles — free, no watermark',
    category: 'image',
    keywords: ['meme maker', 'meme creator', 'meme generator', 'imgflip alternative', 'meme text', 'impact font', 'meme template', 'create meme', 'funny meme', 'meme editor', 'custom meme'],
  },

  // ── Date & Time (5) ──────────────────────────────────────────────────────
  {
    id: 'unix-timestamp-converter',
    name: 'Unix Timestamp Converter',
    description: 'Convert timestamps to dates and back',
    category: 'datetime',
    keywords: ['unix timestamp', 'epoch', 'timestamp', 'epoch converter', 'unix time', 'timestamp to date', 'date to timestamp', 'epoch time'],
  },
  {
    id: 'date-calculator',
    name: 'Date Calculator',
    description: 'Add/subtract dates and find differences',
    category: 'datetime',
    keywords: ['date calc', 'date difference', 'days between', 'add days', 'subtract days', 'date diff', 'how many days', 'date math'],
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate exact age with birthday countdown',
    category: 'datetime',
    keywords: ['age calc', 'how old', 'birthday calculator', 'age from date', 'exact age', 'birthday countdown', 'age in days', 'calculate age'],
  },
  {
    id: 'cron-expression-builder',
    name: 'Cron Expression Builder',
    description: 'Visual cron schedule builder',
    category: 'datetime',
    keywords: ['cron', 'cron builder', 'cron generator', 'crontab', 'cron schedule', 'cron expression', 'cron job', 'scheduled task'],
  },
  {
    id: 'crontab-reference',
    name: 'Crontab Reference',
    description: 'Interactive cron syntax guide with examples',
    category: 'datetime',
    keywords: ['crontab', 'cron syntax', 'cron help', 'cron reference', 'cron guide', 'cron examples', 'cron cheat sheet', 'cron fields'],
  },
  {
    id: 'pomodoro-timer',
    name: 'Pomodoro Timer',
    description: 'Focus timer with 25/5 work-break intervals',
    category: 'datetime',
    keywords: ['pomodoro timer', 'pomodoro', 'focus timer', 'work timer', 'productivity timer', 'online timer', 'countdown timer', 'study timer', 'tomato timer', '25 minute timer', 'time management'],
  },

  // ── Network & API (4) ────────────────────────────────────────────────────
  {
    id: 'http-status-codes',
    name: 'HTTP Status Codes',
    description: 'Searchable reference of all HTTP status codes',
    category: 'network',
    keywords: ['http status', 'status codes', '404', '500', '200', '301', 'http codes', 'response codes', 'http error', 'status code reference'],
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Parse URLs into components',
    category: 'network',
    keywords: ['url parse', 'url breakdown', 'url components', 'url parts', 'query string', 'url analyze', 'parse url', 'url dissect'],
  },
  {
    id: 'user-agent-parser',
    name: 'User Agent Parser',
    description: 'Detect browser, OS, and device from UA string',
    category: 'network',
    keywords: ['user agent', 'ua parser', 'browser detect', 'os detect', 'device detect', 'user agent string', 'ua string', 'what browser'],
  },
  {
    id: 'ip-address-info',
    name: 'IP Address Info',
    description: 'Show your public IP address and details',
    category: 'network',
    keywords: ['ip address', 'my ip', 'public ip', 'ip info', 'ip lookup', 'what is my ip', 'ip details', 'ip geolocation'],
  },

  // ── Generators (11) ──────────────────────────────────────────────────────
  {
    id: 'gitignore-generator',
    name: '.gitignore Generator',
    description: 'Generate .gitignore from presets',
    category: 'generators',
    keywords: ['gitignore', 'git ignore', '.gitignore', 'ignore file', 'gitignore template', 'gitignore generator', 'gitignore presets'],
  },
  {
    id: 'fake-data-generator',
    name: 'Fake Data Generator',
    description: 'Generate random names, emails, addresses',
    category: 'generators',
    keywords: ['fake data', 'mock data', 'random data', 'test data', 'faker', 'dummy data', 'sample data', 'random name', 'random email'],
  },
  {
    id: 'emoji-picker',
    name: 'Emoji Picker',
    description: 'Search and copy emojis',
    category: 'generators',
    keywords: ['emoji', 'emoji picker', 'emoji search', 'emoji copy', 'emoticon', 'smiley', 'emoji keyboard', 'unicode emoji'],
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    description: 'Generate Code 128 barcodes',
    category: 'generators',
    keywords: ['barcode', 'code 128', 'barcode generator', 'barcode maker', 'product barcode', 'generate barcode', 'barcode image', 'ean barcode'],
  },

  {
    id: 'htaccess-generator',
    name: '.htaccess Generator',
    description: 'Generate Apache .htaccess rules for redirects, security headers, caching, and more',
    category: 'generators',
    keywords: ['htaccess', 'htaccess generator', 'apache config', 'redirect', 'rewrite rule', 'security headers', 'gzip compression', 'browser caching', 'hotlink protection'],
  },
  {
    id: 'privacy-policy-generator',
    name: 'Privacy Policy Generator',
    description: 'Generate a GDPR and CCPA compliant privacy policy for your website',
    category: 'generators',
    keywords: ['privacy policy', 'privacy policy generator', 'gdpr', 'ccpa', 'cookie policy', 'data protection', 'privacy notice', 'compliance'],
  },
  {
    id: 'terms-generator',
    name: 'Terms & Conditions Generator',
    description: 'Generate terms of service for your website or app',
    category: 'generators',
    keywords: ['terms conditions', 'terms of service', 'tos generator', 'terms generator', 'legal terms', 'website terms', 'user agreement'],
  },
  {
    id: 'resume-builder',
    name: 'Resume / CV Builder',
    description: 'Build a professional resume with live preview and download as PDF — free, no sign-up',
    category: 'generators',
    keywords: ['resume builder', 'cv builder', 'resume maker', 'cv maker', 'resume generator', 'resume template', 'curriculum vitae', 'resume pdf', 'free resume', 'canva resume alternative', 'resume.io alternative', 'zety alternative', 'professional resume'],
  },

  // ── PDF Tools (8) ────────────────────────────────────────────────────────
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert images (JPG, PNG, WebP) to a PDF document with page size and margin options',
    category: 'pdf',
    keywords: ['jpg to pdf', 'image to pdf', 'png to pdf', 'convert image to pdf', 'photo to pdf', 'pictures to pdf', 'webp to pdf', 'jpeg to pdf', 'images to pdf', 'create pdf from images'],
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Extract PDF pages as high-quality JPG or PNG images with DPI control',
    category: 'pdf',
    keywords: ['pdf to jpg', 'pdf to image', 'pdf to png', 'extract pdf pages', 'pdf to jpeg', 'convert pdf to image', 'pdf page to image', 'pdf screenshot', 'pdf to photo', 'pdf extractor'],
  },
  {
    id: 'pdf-merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one document',
    category: 'pdf',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'pdf merger', 'pdf combiner', 'concatenate pdf', 'pdf joiner', 'merge pdfs online'],
  },
  {
    id: 'pdf-compress',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    category: 'pdf',
    keywords: ['compress pdf', 'reduce pdf size', 'pdf compressor', 'shrink pdf', 'pdf optimizer', 'smaller pdf', 'pdf size reducer', 'optimize pdf'],
  },
  {
    id: 'pdf-split',
    name: 'Split PDF',
    description: 'Extract pages from a PDF — specific pages, every N pages, or each page separately',
    category: 'pdf',
    keywords: ['split pdf', 'extract pdf pages', 'pdf splitter', 'separate pdf pages', 'divide pdf', 'pdf page extractor', 'cut pdf', 'pdf cutter'],
  },
  {
    id: 'pdf-unlock',
    name: 'Unlock PDF',
    description: 'Remove password protection from a PDF file',
    category: 'pdf',
    keywords: ['unlock pdf', 'remove pdf password', 'pdf unlocker', 'decrypt pdf', 'pdf password remover', 'unprotect pdf', 'open locked pdf', 'crack pdf password'],
  },
  {
    id: 'pdf-page-numbers',
    name: 'Add Page Numbers to PDF',
    description: 'Insert page numbers on every page of a PDF with customizable position and format',
    category: 'pdf',
    keywords: ['pdf page numbers', 'add page numbers', 'number pdf pages', 'pdf pagination', 'page numbering', 'pdf footer', 'pdf header numbers', 'paginate pdf'],
  },
  {
    id: 'pdf-watermark',
    name: 'Add Watermark to PDF',
    description: 'Stamp custom watermark text on PDF pages with adjustable opacity and rotation',
    category: 'pdf',
    keywords: ['pdf watermark', 'add watermark', 'stamp pdf', 'confidential pdf', 'draft watermark', 'pdf stamp', 'watermark text', 'pdf branding'],
  },
  {
    id: 'pdf-rotate',
    name: 'Rotate PDF',
    description: 'Rotate all or individual PDF pages by 90, 180, or 270 degrees',
    category: 'pdf',
    keywords: ['rotate pdf', 'pdf rotate', 'turn pdf', 'pdf orientation', 'rotate pdf pages', 'flip pdf', 'pdf rotation', 'sideways pdf', 'landscape portrait pdf'],
  },
]

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Get all tools in a given category */
export function getToolsByCategory(categoryId: string): Tool[] {
  return TOOLS.filter(t => t.category === categoryId)
}

/** Look up a single tool by its slug id */
export function getToolById(id: string): Tool | undefined {
  return TOOLS.find(t => t.id === id)
}

/** Get related tools from the same category (excluding self) */
export function getRelatedTools(toolId: string, limit = 4): Tool[] {
  const tool = getToolById(toolId)
  if (!tool) return []
  return TOOLS.filter(t => t.category === tool.category && t.id !== toolId).slice(0, limit)
}

/** Look up a category by id */
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id)
}

/**
 * Get all tools shown on the generators category page (8 tools).
 * Four of them live in crypto/string as their primary category but are
 * cross-listed under generators for discoverability.
 */
export function getGeneratorTools(): Tool[] {
  return [
    ...GENERATOR_CROSS_REFS.map(id => TOOLS.find(t => t.id === id)!),
    ...TOOLS.filter(t => t.category === 'generators'),
  ]
}

/** Search tools by query — matches name, description, and keywords */
export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return TOOLS.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.keywords.some(k => k.includes(q))
  )
}

/** List of popular / featured tool IDs for the homepage (ordered by global search volume) */
export const POPULAR_TOOLS = [
  'percentage-calculator',   // ~1,600,000 monthly searches
  'qr-code-generator',      // ~1,220,000 monthly searches
  'mortgage-calculator',     // ~500,000 monthly searches
  'password-generator',      // ~300,000 monthly searches
  'bmi-calculator',          // ~210,000 monthly searches
  'image-resizer',           // ~200,000 monthly searches
  'word-counter',            // ~200,000 monthly searches
  'age-calculator',          // ~184,000 monthly searches
  'json-formatter',          // ~150,000 monthly searches (developer staple)
  'color-picker',            // ~150,000 monthly searches (designer staple)
  'base64-encoder',          // ~100,000 monthly searches
  'ai-bg-remover',           // AI differentiator, wow factor
]
