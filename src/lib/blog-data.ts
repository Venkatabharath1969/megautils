export interface BlogPost {
  id: number
  slug: string
  title: string
  description: string
  content: string  // HTML content
  publishDate: string  // YYYY-MM-DD
  category: string
  keywords: string[]
  readingTime: number  // minutes
}

// Pre-loaded blog posts - in production, this would come from PostgreSQL
// Logic: only show posts where publishDate <= today
export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: 'how-to-format-json-online',
    title: 'How to Format JSON Online - Complete Guide 2026',
    description: 'Learn how to format, validate, and beautify JSON data using free online tools. No signup required.',
    content: `<h2>What is JSON Formatting?</h2><p>JSON (JavaScript Object Notation) formatting transforms compact, minified JSON into a human-readable structure with proper indentation and line breaks. This makes it easier to read, debug, and understand complex data structures.</p><h2>How to Format JSON Online</h2><p>To format JSON online, simply paste your JSON into the input field of our <a href="/tools/json-formatter">JSON Formatter</a>, click Format, and copy the beautified output. Our tool processes everything in your browser - no data is ever sent to a server.</p><h2>Common JSON Formatting Options</h2><ul><li><strong>2 spaces</strong> - The most common indentation (used by most JavaScript projects)</li><li><strong>4 spaces</strong> - Popular in Python and Java projects</li><li><strong>Tabs</strong> - Preferred by some developers for smaller file sizes</li></ul><h2>JSON Validation</h2><p>Our formatter also validates your JSON in real-time. Common errors include missing commas, unmatched brackets, and trailing commas (not allowed in standard JSON).</p><h2>Why Use an Online JSON Formatter?</h2><p>Online JSON formatters are useful when you receive minified JSON from APIs, need to quickly inspect data structures, or want to validate JSON before using it in your application. Unlike desktop tools, our browser-based formatter requires no installation and keeps your data private.</p>`,
    publishDate: '2026-08-01',
    category: 'Developer Tools',
    keywords: ['json formatter', 'json beautifier', 'format json online', 'json validator'],
    readingTime: 3,
  },
  {
    id: 2,
    slug: 'json-vs-yaml-comparison',
    title: 'JSON vs YAML - When to Use Which Format',
    description: 'A comprehensive comparison of JSON and YAML data formats. Learn the differences, pros, cons, and when to use each.',
    content: `<h2>JSON vs YAML: Key Differences</h2><p>JSON and YAML are both popular data serialization formats, but they serve different purposes and have distinct advantages.</p><h2>JSON Advantages</h2><ul><li>Native to JavaScript and web APIs</li><li>Strict syntax prevents ambiguity</li><li>Faster to parse programmatically</li><li>Widely supported across all programming languages</li></ul><h2>YAML Advantages</h2><ul><li>More human-readable with indentation-based structure</li><li>Supports comments (JSON does not)</li><li>Less verbose - no quotes for most strings, no commas</li><li>Popular for configuration files (Docker, Kubernetes, CI/CD)</li></ul><h2>When to Use JSON</h2><p>Use JSON for API responses, data exchange between services, and when you need strict parsing. Convert between formats easily with our <a href="/tools/json-to-yaml">JSON to YAML converter</a>.</p><h2>When to Use YAML</h2><p>Use YAML for configuration files, infrastructure-as-code (Terraform, Ansible), and any file that humans will frequently read and edit.</p>`,
    publishDate: '2026-08-02',
    category: 'Developer Tools',
    keywords: ['json vs yaml', 'yaml vs json', 'json comparison', 'yaml comparison'],
    readingTime: 4,
  },
  {
    id: 3,
    slug: 'base64-encoding-explained',
    title: 'Base64 Encoding Explained - What, Why, and How',
    description: 'Understand Base64 encoding: what it is, why it exists, how it works, and when to use it in web development.',
    content: `<h2>What is Base64 Encoding?</h2><p>Base64 is a binary-to-text encoding scheme that converts binary data into a set of 64 ASCII characters. It's used to safely transmit binary data through text-only channels like email, URLs, and JSON.</p><h2>How Base64 Works</h2><p>Base64 takes every 3 bytes (24 bits) of input and splits them into 4 groups of 6 bits each. Each 6-bit group maps to one of 64 characters (A-Z, a-z, 0-9, +, /). If the input isn't divisible by 3, padding (=) is added.</p><h2>Common Use Cases</h2><ul><li><strong>Data URIs</strong> - Embedding images directly in HTML/CSS</li><li><strong>Email attachments</strong> - MIME encoding for binary files</li><li><strong>API authentication</strong> - HTTP Basic Auth uses Base64</li><li><strong>JWT tokens</strong> - Payload is Base64URL encoded</li></ul><h2>Try It Yourself</h2><p>Use our <a href="/tools/base64-encoder">Base64 Encoder/Decoder</a> to encode or decode Base64 strings instantly in your browser.</p><h2>Base64 vs Base64URL</h2><p>Base64URL replaces + with - and / with _ to make the output URL-safe. This is used in JWTs and data URIs.</p>`,
    publishDate: '2026-08-03',
    category: 'Encoders',
    keywords: ['base64 encoding', 'base64 decode', 'what is base64', 'base64 explained'],
    readingTime: 3,
  },
  {
    id: 4,
    slug: 'compound-interest-formula-calculator',
    title: 'Compound Interest Formula & Calculator - Complete Guide',
    description: 'Learn the compound interest formula A = P(1 + r/n)^(nt) with examples. Free online compound interest calculator.',
    content: `<h2>The Compound Interest Formula</h2><p>Compound interest is calculated using: <strong>A = P(1 + r/n)^(nt)</strong></p><ul><li><strong>A</strong> = Final amount</li><li><strong>P</strong> = Principal (initial investment)</li><li><strong>r</strong> = Annual interest rate (decimal)</li><li><strong>n</strong> = Number of times compounded per year</li><li><strong>t</strong> = Number of years</li></ul><h2>Example Calculation</h2><p>$10,000 invested at 8% annual interest, compounded monthly, for 10 years:</p><p>A = 10000(1 + 0.08/12)^(12\u00d710) = 10000(1.00667)^120 = <strong>$22,196.40</strong></p><p>You earned $12,196.40 in interest on a $10,000 investment!</p><h2>Try Our Calculator</h2><p>Use our <a href="/tools/compound-interest-calculator">Compound Interest Calculator</a> to calculate returns with different compounding frequencies and see year-by-year breakdowns.</p><h2>Compounding Frequency Matters</h2><p>Monthly compounding earns more than annual compounding because interest starts earning interest sooner. Daily compounding earns slightly more than monthly.</p>`,
    publishDate: '2026-08-04',
    category: 'Financial',
    keywords: ['compound interest', 'compound interest formula', 'compound interest calculator', 'interest calculator'],
    readingTime: 4,
  },
  {
    id: 5,
    slug: 'regex-cheat-sheet-2026',
    title: 'Regex Cheat Sheet 2026 - Complete Regular Expression Reference',
    description: 'The ultimate regex cheat sheet with examples. Learn regular expression syntax for JavaScript, Python, Go, and more.',
    content: `<h2>Regex Basics</h2><table><tr><th>Pattern</th><th>Meaning</th><th>Example</th></tr><tr><td>.</td><td>Any character (except newline)</td><td>a.c matches "abc", "adc"</td></tr><tr><td>\\d</td><td>Any digit (0-9)</td><td>\\d{3} matches "123"</td></tr><tr><td>\\w</td><td>Word character (a-z, A-Z, 0-9, _)</td><td>\\w+ matches "hello_world"</td></tr><tr><td>\\s</td><td>Whitespace</td><td>\\s+ matches spaces/tabs</td></tr><tr><td>^</td><td>Start of string</td><td>^Hello matches "Hello world"</td></tr><tr><td>$</td><td>End of string</td><td>world$ matches "Hello world"</td></tr></table><h2>Quantifiers</h2><table><tr><th>Pattern</th><th>Meaning</th></tr><tr><td>*</td><td>0 or more</td></tr><tr><td>+</td><td>1 or more</td></tr><tr><td>?</td><td>0 or 1</td></tr><tr><td>{n}</td><td>Exactly n times</td></tr><tr><td>{n,m}</td><td>Between n and m times</td></tr></table><h2>Common Patterns</h2><ul><li><strong>Email:</strong> ^[\\w.-]+@[\\w.-]+\\.\\w{2,}$</li><li><strong>URL:</strong> https?://[\\w.-]+(?:/[\\w.-]*)*</li><li><strong>Phone:</strong> \\+?\\d{1,3}[-.\\s]?\\d{3,4}[-.\\s]?\\d{4}</li></ul><h2>Test Your Regex</h2><p>Use our <a href="/tools/regex-tester">Regex Tester</a> to test patterns with live match highlighting and capture group display.</p>`,
    publishDate: '2026-08-05',
    category: 'Developer Tools',
    keywords: ['regex cheat sheet', 'regular expression', 'regex examples', 'regex reference'],
    readingTime: 5,
  },
  {
    id: 6,
    slug: 'css-flexbox-vs-grid-comparison',
    title: 'CSS Flexbox vs Grid - Complete Comparison Guide',
    description: 'Learn the differences between CSS Flexbox and Grid layout. When to use each, practical examples, and how to combine them for modern web layouts.',
    content: `<h2>Flexbox vs Grid: What's the Difference?</h2><p>CSS Flexbox and Grid are both powerful layout systems, but they solve different problems. Flexbox is designed for one-dimensional layouts (rows OR columns), while Grid handles two-dimensional layouts (rows AND columns simultaneously).</p><h2>When to Use Flexbox</h2><ul><li><strong>Navigation bars</strong> - Aligning items in a single row</li><li><strong>Card footers</strong> - Spacing buttons evenly</li><li><strong>Centering content</strong> - Both vertically and horizontally</li><li><strong>Dynamic sizing</strong> - When items should grow/shrink based on content</li></ul><p>Try building layouts visually with our <a href="/tools/css-flexbox-generator">CSS Flexbox Generator</a> — adjust properties and copy production-ready code instantly.</p><h2>When to Use Grid</h2><ul><li><strong>Page layouts</strong> - Header, sidebar, main, footer arrangements</li><li><strong>Image galleries</strong> - Equal-sized tiles in rows and columns</li><li><strong>Dashboard layouts</strong> - Complex widget arrangements</li><li><strong>Magazine-style layouts</strong> - Items spanning multiple rows/columns</li></ul><p>Our <a href="/tools/css-grid-generator">CSS Grid Generator</a> lets you visually design grid layouts with drag-and-drop simplicity.</p><h2>Combining Flexbox and Grid</h2><p>The best layouts often use both. Use Grid for the overall page structure and Flexbox for aligning items within each grid cell. For example, a Grid-based card layout where each card uses Flexbox internally to align its title, description, and action buttons.</p><h2>Performance Considerations</h2><p>Both Flexbox and Grid are hardware-accelerated in modern browsers with near-identical performance. Choose based on the layout problem you're solving, not performance concerns.</p>`,
    publishDate: '2026-08-06',
    category: 'CSS Tools',
    keywords: ['css flexbox', 'css grid', 'flexbox vs grid', 'css layout', 'web layout'],
    readingTime: 4,
  },
  {
    id: 7,
    slug: 'how-to-calculate-emi-home-loans',
    title: 'How to Calculate EMI for Home Loans',
    description: 'Understand the EMI formula for home loans, factors that affect your monthly payments, and tips to reduce your EMI burden.',
    content: `<h2>What is EMI?</h2><p>EMI (Equated Monthly Installment) is the fixed amount you pay every month to repay a loan. It includes both the principal repayment and the interest charged by the lender. Understanding EMI helps you plan your finances before committing to a home loan.</p><h2>The EMI Formula</h2><p>EMI is calculated using: <strong>EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)</strong></p><ul><li><strong>P</strong> = Loan principal amount</li><li><strong>r</strong> = Monthly interest rate (annual rate / 12)</li><li><strong>n</strong> = Total number of monthly installments</li></ul><h2>Example Calculation</h2><p>For a home loan of $300,000 at 7% annual interest for 20 years: Monthly EMI comes to approximately <strong>$2,326</strong>. Over 20 years, you pay $558,240 total — meaning $258,240 goes toward interest alone.</p><p>Use our <a href="/tools/emi-calculator">EMI Calculator</a> to compute your exact monthly payments with an amortization schedule showing the principal vs interest split for each payment.</p><h2>Tips to Reduce Your EMI</h2><ul><li><strong>Higher down payment</strong> - Reduces the principal, lowering EMI</li><li><strong>Longer tenure</strong> - Spreads payments over more months (but increases total interest)</li><li><strong>Negotiate interest rate</strong> - Even 0.25% lower rate saves thousands</li><li><strong>Prepayments</strong> - Lump sum payments reduce outstanding principal</li></ul><h2>EMI vs Mortgage Payment</h2><p>While EMI covers principal and interest, your total mortgage payment may include property taxes, insurance, and HOA fees. Compare complete costs using our <a href="/tools/mortgage-calculator">Mortgage Calculator</a> for a full picture of homeownership costs.</p>`,
    publishDate: '2026-08-07',
    category: 'Financial',
    keywords: ['emi calculator', 'home loan emi', 'emi formula', 'mortgage emi', 'loan calculator'],
    readingTime: 4,
  },
  {
    id: 8,
    slug: 'color-contrast-web-accessibility-wcag',
    title: 'Understanding Color Contrast for Web Accessibility (WCAG)',
    description: 'Learn WCAG color contrast requirements, why they matter for accessibility, and how to test your website colors for compliance.',
    content: `<h2>Why Color Contrast Matters</h2><p>Color contrast is one of the most important aspects of web accessibility. Poor contrast makes text difficult or impossible to read for people with low vision, color blindness, or those viewing screens in bright sunlight. Approximately 1 in 12 men and 1 in 200 women have some form of color vision deficiency.</p><h2>WCAG Contrast Requirements</h2><ul><li><strong>Level AA (minimum)</strong> - 4.5:1 ratio for normal text, 3:1 for large text (18px+ bold or 24px+ regular)</li><li><strong>Level AAA (enhanced)</strong> - 7:1 ratio for normal text, 4.5:1 for large text</li><li><strong>Non-text elements</strong> - 3:1 ratio for UI components and graphical objects</li></ul><h2>How Contrast Ratio Works</h2><p>Contrast ratio is calculated using the relative luminance of the foreground and background colors. The scale ranges from 1:1 (no contrast, same color) to 21:1 (maximum contrast, black on white). The formula accounts for how the human eye perceives different wavelengths of light.</p><h2>Testing Your Colors</h2><p>Use our <a href="/tools/contrast-checker">Contrast Checker</a> to instantly test any foreground/background color combination. It shows the exact contrast ratio and whether it passes WCAG AA and AAA standards for both normal and large text.</p><h2>Common Mistakes to Avoid</h2><ul><li>Light gray text on white backgrounds (popular but often fails AA)</li><li>Relying solely on color to convey information (use icons or text too)</li><li>Forgetting to test dark mode color combinations</li><li>Placeholder text with insufficient contrast</li></ul>`,
    publishDate: '2026-08-08',
    category: 'Color Tools',
    keywords: ['color contrast', 'wcag contrast', 'web accessibility', 'contrast ratio', 'a11y'],
    readingTime: 4,
  },
  {
    id: 9,
    slug: 'unix-timestamps-explained',
    title: 'Unix Timestamps Explained - Convert Between Formats',
    description: 'Learn what Unix timestamps are, how they work, and how to convert between Unix time and human-readable dates.',
    content: `<h2>What is a Unix Timestamp?</h2><p>A Unix timestamp (also called Epoch time or POSIX time) is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC. This date is known as the Unix Epoch. For example, the timestamp <strong>1700000000</strong> represents November 14, 2023, at 22:13:20 UTC.</p><h2>Why Use Unix Timestamps?</h2><ul><li><strong>Timezone-independent</strong> - A single number represents the same moment worldwide</li><li><strong>Easy to compare</strong> - Simple arithmetic determines which event happened first</li><li><strong>Database-friendly</strong> - Stored as integers, they sort and index efficiently</li><li><strong>Compact</strong> - 10 digits vs lengthy date strings</li></ul><h2>Converting Timestamps</h2><p>Use our <a href="/tools/unix-timestamp-converter">Unix Timestamp Converter</a> to instantly convert between Unix timestamps and human-readable dates. It supports seconds, milliseconds, and shows results in your local timezone and UTC.</p><h2>Timestamps in Programming</h2><p>In JavaScript: <code>Date.now()</code> returns milliseconds. In Python: <code>time.time()</code> returns seconds with decimals. In SQL: <code>UNIX_TIMESTAMP()</code> in MySQL or <code>EXTRACT(EPOCH FROM NOW())</code> in PostgreSQL.</p><h2>The Year 2038 Problem</h2><p>32-bit systems store timestamps as signed integers, maxing out at 2,147,483,647 (January 19, 2038). After this, the value overflows and wraps to a negative number. Most modern systems now use 64-bit timestamps, which won't overflow for 292 billion years.</p>`,
    publishDate: '2026-08-09',
    category: 'Date & Time',
    keywords: ['unix timestamp', 'epoch time', 'timestamp converter', 'unix time', 'epoch converter'],
    readingTime: 3,
  },
  {
    id: 10,
    slug: 'meta-tags-seo-guide-2026',
    title: 'Meta Tags SEO Guide - What Tags Matter in 2026',
    description: 'A complete guide to HTML meta tags for SEO. Learn which meta tags improve search rankings and how to optimize them.',
    content: `<h2>Essential Meta Tags for SEO</h2><p>Meta tags provide search engines with information about your web pages. While not all meta tags affect rankings, several are critical for SEO success in 2026.</p><h2>The Most Important Meta Tags</h2><ul><li><strong>Title tag</strong> - The single most important on-page SEO element. Keep it under 60 characters and include your primary keyword near the beginning.</li><li><strong>Meta description</strong> - Doesn't directly affect rankings but influences click-through rate. Write compelling descriptions under 160 characters that encourage clicks.</li><li><strong>Viewport meta</strong> - Essential for mobile-friendliness: <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code></li><li><strong>Canonical tag</strong> - Prevents duplicate content issues by specifying the preferred URL version.</li></ul><h2>Open Graph & Twitter Cards</h2><p>Social media meta tags control how your pages appear when shared on Facebook, Twitter, LinkedIn, and other platforms. Key tags include og:title, og:description, og:image, and twitter:card. Generate all these tags instantly with our <a href="/tools/meta-tag-generator">Meta Tag Generator</a>.</p><h2>Preview Your Search Results</h2><p>Before publishing, use our <a href="/tools/serp-preview">SERP Preview</a> tool to see exactly how your page will appear in Google search results. Optimize your title and description for maximum click-through rate.</p><h2>Meta Tags That Don't Matter</h2><ul><li><strong>Meta keywords</strong> - Google has ignored this tag since 2009</li><li><strong>Meta author</strong> - No SEO impact, purely informational</li><li><strong>Meta revisit-after</strong> - Search engines set their own crawl schedules</li></ul>`,
    publishDate: '2026-08-10',
    category: 'SEO',
    keywords: ['meta tags', 'seo meta tags', 'meta description', 'open graph tags', 'seo guide'],
    readingTime: 4,
  },
  {
    id: 11,
    slug: 'markdown-cheat-sheet-syntax-reference',
    title: 'Markdown Cheat Sheet - Complete Syntax Reference',
    description: 'The ultimate Markdown syntax reference. Learn headings, lists, links, images, code blocks, tables, and advanced formatting.',
    content: `<h2>What is Markdown?</h2><p>Markdown is a lightweight markup language created by John Gruber in 2004. It lets you write formatted text using plain text syntax that's easy to read and write. Markdown is used everywhere — GitHub, Reddit, Stack Overflow, documentation sites, and note-taking apps like Notion and Obsidian.</p><h2>Basic Syntax</h2><ul><li><strong>Headings</strong> - Use # for h1, ## for h2, ### for h3 (up to ######)</li><li><strong>Bold</strong> - Wrap text with **double asterisks** or __double underscores__</li><li><strong>Italic</strong> - Wrap text with *single asterisks* or _single underscores_</li><li><strong>Links</strong> - [link text](URL) creates a clickable link</li><li><strong>Images</strong> - ![alt text](image-URL) embeds an image</li><li><strong>Code</strong> - Use backticks for inline code, triple backticks for code blocks</li></ul><h2>Lists and Blockquotes</h2><p>Unordered lists use -, *, or + as bullet markers. Ordered lists use numbers followed by periods. Nest lists by indenting with 2-4 spaces. Blockquotes use > at the start of a line and can be nested with >>.</p><h2>Tables</h2><p>Markdown tables use pipes (|) and hyphens (-) to create rows and columns. Align columns with colons in the separator row — :--- for left, :---: for center, ---: for right alignment.</p><h2>Try It Live</h2><p>Practice and preview Markdown in real-time with our <a href="/tools/markdown-editor">Markdown Editor</a>. It features live preview, syntax highlighting, and export to HTML. Perfect for writing documentation, README files, or blog posts.</p>`,
    publishDate: '2026-08-11',
    category: 'Markdown',
    keywords: ['markdown cheat sheet', 'markdown syntax', 'markdown guide', 'markdown reference'],
    readingTime: 4,
  },
  {
    id: 12,
    slug: 'password-security-best-practices-2026',
    title: 'Password Security Best Practices 2026',
    description: 'Learn how to create strong passwords, use password managers, and understand hashing. Stay secure with modern password practices.',
    content: `<h2>Why Password Security Matters</h2><p>In 2026, credential stuffing and brute-force attacks remain among the top cybersecurity threats. Weak passwords are responsible for over 80% of data breaches. Understanding password security is essential for protecting your personal and professional accounts.</p><h2>What Makes a Strong Password?</h2><ul><li><strong>Length over complexity</strong> - A 16+ character passphrase is stronger than an 8-character complex password</li><li><strong>Avoid personal info</strong> - No birthdays, pet names, or dictionary words</li><li><strong>Unique per account</strong> - Never reuse passwords across different services</li><li><strong>Mix character types</strong> - Combine uppercase, lowercase, numbers, and symbols</li></ul><p>Generate strong, random passwords instantly with our <a href="/tools/password-generator">Password Generator</a>. Customize length, character types, and generate multiple passwords at once.</p><h2>Understanding Password Hashing</h2><p>Websites should never store your password in plain text. Instead, they store a hash — a one-way mathematical transformation. Modern algorithms like bcrypt, scrypt, and Argon2 add salt (random data) and are deliberately slow to prevent brute-force attacks. See how hashing works with our <a href="/tools/hash-generator">Hash Generator</a>.</p><h2>Password Manager Tips</h2><ul><li>Use a reputable password manager to store unique passwords for every account</li><li>Set a strong master password (20+ characters) that you can memorize</li><li>Enable two-factor authentication (2FA) wherever available</li><li>Regularly audit and update passwords for critical accounts</li></ul>`,
    publishDate: '2026-08-12',
    category: 'Crypto',
    keywords: ['password security', 'strong passwords', 'password best practices', 'password hashing', 'cybersecurity'],
    readingTime: 4,
  },
  {
    id: 13,
    slug: 'sip-vs-lump-sum-investment',
    title: 'SIP vs Lump Sum Investment - Which is Better?',
    description: 'Compare SIP (Systematic Investment Plan) vs lump sum investing. Learn which strategy works better for different market conditions and goals.',
    content: `<h2>SIP vs Lump Sum: The Basics</h2><p>When investing in mutual funds or ETFs, you have two primary approaches: investing a fixed amount regularly (SIP) or investing a large amount all at once (lump sum). Both strategies have distinct advantages depending on market conditions and your financial situation.</p><h2>What is SIP?</h2><p>A Systematic Investment Plan (SIP) involves investing a fixed amount at regular intervals — typically monthly. This approach leverages rupee/dollar cost averaging, meaning you buy more units when prices are low and fewer when prices are high.</p><ul><li><strong>Pros:</strong> Reduces timing risk, builds discipline, accessible with small amounts</li><li><strong>Cons:</strong> May underperform lump sum in consistently rising markets</li></ul><p>Calculate your SIP returns with our <a href="/tools/sip-calculator">SIP Calculator</a> to see projected wealth accumulation over time.</p><h2>When Lump Sum Works Better</h2><p>Historical data shows lump sum investing outperforms SIP about two-thirds of the time because markets trend upward over long periods. If you have a large sum available and a long investment horizon, lump sum investing statistically yields higher returns.</p><h2>The Hybrid Approach</h2><p>Many financial advisors recommend a hybrid strategy: invest a portion as lump sum and the remainder via SIP over 6-12 months. This balances the statistical advantage of lump sum with the psychological comfort of averaging.</p><p>Compare how compound growth affects both strategies using our <a href="/tools/compound-interest-calculator">Compound Interest Calculator</a> to model different scenarios.</p><h2>Key Takeaway</h2><p>SIP is better for regular earners building wealth over time. Lump sum is better when you have idle capital and a long time horizon. The best strategy is the one you'll consistently follow.</p>`,
    publishDate: '2026-08-13',
    category: 'Financial',
    keywords: ['sip vs lump sum', 'sip calculator', 'systematic investment plan', 'investment strategy', 'mutual funds'],
    readingTime: 5,
  },
  {
    id: 14,
    slug: 'jwt-tokens-explained-structure-security',
    title: 'JWT Tokens Explained - Structure and Security',
    description: 'Understand JSON Web Tokens (JWT): their three-part structure, how signing works, common security pitfalls, and best practices.',
    content: `<h2>What is a JWT?</h2><p>A JSON Web Token (JWT) is a compact, URL-safe token format used for securely transmitting information between parties. JWTs are widely used for authentication and authorization in modern web applications, APIs, and microservices architectures.</p><h2>JWT Structure: Three Parts</h2><p>Every JWT consists of three Base64URL-encoded parts separated by dots: <strong>header.payload.signature</strong></p><ul><li><strong>Header</strong> - Contains the token type (JWT) and signing algorithm (e.g., HS256, RS256)</li><li><strong>Payload</strong> - Contains claims — statements about the user and metadata like expiration time (exp), issued at (iat), and subject (sub)</li><li><strong>Signature</strong> - Created by signing the header and payload with a secret key, ensuring the token hasn't been tampered with</li></ul><p>Inspect and decode any JWT instantly with our <a href="/tools/jwt-decoder">JWT Decoder</a>. It parses the header, payload, and shows expiration status without needing the secret key.</p><h2>How JWT Authentication Works</h2><p>The server creates a signed JWT after login and sends it to the client. The client includes this token in subsequent API requests via the Authorization header. The server verifies the signature to authenticate the request without querying a database.</p><h2>JWT Security Best Practices</h2><ul><li><strong>Set short expiration times</strong> - Use 15-minute access tokens with refresh tokens</li><li><strong>Use strong secrets</strong> - At least 256 bits for HMAC algorithms</li><li><strong>Never store sensitive data</strong> - The payload is encoded, not encrypted</li><li><strong>Validate all claims</strong> - Check exp, iss, aud on every request</li></ul><p>The payload is simply Base64URL-encoded, which is easily reversible. Test this yourself with our <a href="/tools/base64-encoder">Base64 Encoder/Decoder</a> to see that encoding is not encryption.</p>`,
    publishDate: '2026-08-14',
    category: 'Developer',
    keywords: ['jwt token', 'json web token', 'jwt explained', 'jwt authentication', 'jwt security'],
    readingTime: 5,
  },
  {
    id: 15,
    slug: 'bmi-calculator-guide-body-mass-index',
    title: 'BMI Calculator Guide - Understanding Your Body Mass Index',
    description: 'Learn how BMI is calculated, what the categories mean, its limitations, and how to use it as one metric for health assessment.',
    content: `<h2>What is BMI?</h2><p>Body Mass Index (BMI) is a simple numerical value calculated from your weight and height. It provides a quick screening tool to categorize individuals into weight categories that may indicate health risks. While not a direct measure of body fat, BMI correlates with more accurate body composition measurements for most people.</p><h2>How BMI is Calculated</h2><p>The BMI formula is: <strong>BMI = weight (kg) / height (m)²</strong></p><p>For imperial units: <strong>BMI = (weight in pounds × 703) / (height in inches)²</strong></p><p>Calculate your BMI instantly with our <a href="/tools/bmi-calculator">BMI Calculator</a>. It supports both metric and imperial units and shows your category with a visual indicator.</p><h2>BMI Categories</h2><ul><li><strong>Below 18.5</strong> - Underweight</li><li><strong>18.5 to 24.9</strong> - Normal weight</li><li><strong>25.0 to 29.9</strong> - Overweight</li><li><strong>30.0 and above</strong> - Obese (Class I: 30-34.9, Class II: 35-39.9, Class III: 40+)</li></ul><h2>Limitations of BMI</h2><p>BMI has significant limitations that are important to understand:</p><ul><li>Doesn't distinguish between muscle and fat — athletes may be classified as overweight</li><li>Doesn't account for age, sex, ethnicity, or body fat distribution</li><li>Waist circumference and waist-to-hip ratio may better predict health risks</li><li>Not appropriate for children, pregnant women, or elderly individuals without age-adjusted scales</li></ul><h2>Using BMI Wisely</h2><p>Treat BMI as one data point among many. Combine it with waist circumference measurements, blood pressure, blood sugar levels, and other health markers for a comprehensive health assessment. Always consult a healthcare professional for personalized medical advice.</p>`,
    publishDate: '2026-08-15',
    category: 'Math',
    keywords: ['bmi calculator', 'body mass index', 'bmi formula', 'bmi categories', 'health calculator'],
    readingTime: 4,
  },
]

// Import auto-generated posts for 2-year auto-publishing
import { generatedPosts } from './blog-posts-generated'

// Merge all posts (file-based fallback — PostgreSQL is primary in production)
const allPosts: BlogPost[] = [...blogPosts, ...generatedPosts]

// PostgreSQL query for production (used by server components)
export async function getVisiblePostsFromDB(): Promise<BlogPost[]> {
  try {
    const pool = (await import('./db')).default
    const result = await pool.query(
      `SELECT id, slug, title, excerpt AS description, content, 
              TO_CHAR(publish_date, 'YYYY-MM-DD') AS "publishDate",
              category, keywords, reading_time AS "readingTime"
       FROM blog_posts 
       WHERE publish_date <= CURRENT_DATE AND is_published = true 
       ORDER BY publish_date DESC`
    )
    return result.rows
  } catch {
    // Fallback to file-based posts if DB is unavailable
    return getVisiblePosts()
  }
}

export async function getPostBySlugFromDB(slug: string): Promise<BlogPost | undefined> {
  try {
    const pool = (await import('./db')).default
    const result = await pool.query(
      `SELECT id, slug, title, excerpt AS description, content,
              TO_CHAR(publish_date, 'YYYY-MM-DD') AS "publishDate",
              category, keywords, reading_time AS "readingTime"
       FROM blog_posts 
       WHERE slug = $1 AND publish_date <= CURRENT_DATE AND is_published = true`,
      [slug]
    )
    return result.rows[0] || getPostBySlug(slug)
  } catch {
    return getPostBySlug(slug)
  }
}

// File-based fallback functions (always available)
export function getVisiblePosts(): BlogPost[] {
  const today = new Date().toISOString().split('T')[0]
  return allPosts.filter(p => p.publishDate <= today).sort((a, b) => b.publishDate.localeCompare(a.publishDate))
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const today = new Date().toISOString().split('T')[0]
  return allPosts.find(p => p.slug === slug && p.publishDate <= today)
}

export function getAllSlugs(): string[] {
  return allPosts.map(p => p.slug)
}
