/**
 * Generate social media posts from blog data
 *
 * Usage: npx tsx scripts/generate-social-posts.ts
 *
 * Reads published blog posts from PostgreSQL and generates platform-specific
 * social media posts (LinkedIn, Twitter/X, Reddit) using templates.
 * No external AI API required.
 */

import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  database: 'megautils',
  user: 'megautils',
  password: 'megautils_36ed23db45f9cc50',
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  keywords: string[]
  related_tools: string[]
  reading_time: number
  publish_date: Date
}

interface SocialPost {
  blog_post_id: number
  platform: string
  title: string | null
  content: string
  hashtags: string[]
  scheduled_date: string // YYYY-MM-DD
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

/** Strip all HTML tags and decode common entities. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Extract text from all <h2> headings as key points. */
function extractHeadings(html: string): string[] {
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi
  const headings: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    headings.push(stripHtml(match[1]))
  }
  return headings
}

/** Extract the first <p> paragraph as a summary sentence. */
function extractFirstParagraph(html: string): string {
  const match = html.match(/<p[^>]*>(.*?)<\/p>/i)
  return match ? stripHtml(match[1]) : ''
}

/** Extract <li> items from the first <ul> or <ol> as bullet points. */
function extractListItems(html: string): string[] {
  const listMatch = html.match(/<[uo]l[^>]*>([\s\S]*?)<\/[uo]l>/i)
  if (!listMatch) return []
  const items: string[] = []
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let match: RegExpExecArray | null
  while ((match = liRegex.exec(listMatch[1])) !== null) {
    items.push(stripHtml(match[1]))
  }
  return items
}

/** Get first N sentences from plain text. */
function firstSentences(text: string, n: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  return sentences.slice(0, n).join(' ').trim()
}

/** Truncate text to maxLen characters, ending at a word boundary. */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  const truncated = text.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > maxLen * 0.6 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

/** Prettify a slug into a readable tool name. */
function toolName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ---------------------------------------------------------------------------
// Category → hashtag mapping
// ---------------------------------------------------------------------------

const categoryHashtags: Record<string, string[]> = {
  'Developer Tools': ['#WebDevelopment', '#DevTools', '#Coding', '#Programming', '#FreeTools'],
  'CSS Tools': ['#CSS', '#WebDesign', '#Frontend', '#WebDevelopment', '#FreeTools'],
  'Encoders': ['#WebDevelopment', '#DevTools', '#Encoding', '#Programming', '#FreeTools'],
  'Financial': ['#Finance', '#PersonalFinance', '#FinTech', '#Calculator', '#FreeTools'],
  'Text Tools': ['#Productivity', '#TextTools', '#DevTools', '#FreeTools', '#WebDevelopment'],
  'Converters': ['#DevTools', '#DataConversion', '#WebDevelopment', '#FreeTools', '#Coding'],
  'Math Tools': ['#Math', '#Calculator', '#STEM', '#FreeTools', '#WebDevelopment'],
  'SEO Tools': ['#SEO', '#DigitalMarketing', '#WebDevelopment', '#FreeTools', '#Marketing'],
  'Color Tools': ['#Design', '#WebDesign', '#ColorTheory', '#FreeTools', '#UX'],
  'Image Tools': ['#ImageEditing', '#WebDesign', '#FreeTools', '#Design', '#Productivity'],
  'Security Tools': ['#CyberSecurity', '#InfoSec', '#DevTools', '#FreeTools', '#Security'],
  'Date & Time': ['#Productivity', '#DevTools', '#DateTime', '#FreeTools', '#WebDevelopment'],
  'Unit Converters': ['#Conversion', '#FreeTools', '#Utility', '#Productivity', '#WebDevelopment'],
  'Network Tools': ['#Networking', '#DevOps', '#WebDevelopment', '#FreeTools', '#DevTools'],
  'Fun & Misc': ['#WebTools', '#FreeTools', '#Fun', '#Productivity', '#WebDevelopment'],
  'Generators': ['#DevTools', '#WebDevelopment', '#CodeGenerator', '#FreeTools', '#Coding'],
  'Randomizers': ['#DevTools', '#FreeTools', '#Random', '#Utility', '#WebDevelopment'],
}

function getHashtags(category: string, count: number): string[] {
  const tags = categoryHashtags[category] || ['#WebDevelopment', '#DevTools', '#FreeTools', '#Coding', '#Productivity']
  return tags.slice(0, count)
}

// ---------------------------------------------------------------------------
// Hooks / openers for variety
// ---------------------------------------------------------------------------

const linkedInHooks = [
  (title: string) => `Ever spent hours on a task that should take minutes?\n\nI recently wrote about ${title}, and here's what I found:`,
  (title: string) => `Stop doing this the hard way.\n\nI put together a deep dive on ${title}. Here are the key takeaways:`,
  (title: string) => `Developers, let's talk about something most of us get wrong.\n\n${title} — here's what you need to know:`,
  (title: string) => `The difference between a junior and senior developer? Knowing the right tools.\n\nI wrote a guide on ${title}:`,
  (title: string) => `Still doing this manually?\n\nMy latest post covers ${title}. Here's the summary:`,
  (title: string) => `One skill that will save you hours every week:\n\nUnderstanding ${title}. Here's a quick breakdown:`,
]

const linkedInCTAs = [
  'What tools do you use for this? Drop your favorites in the comments.',
  'Have you tried this approach? I would love to hear your experience.',
  'What is your go-to method? Let me know in the comments.',
  'Agree or disagree? Let us discuss below.',
  'What would you add to this list? Share your thoughts.',
  'Which of these was new to you? Let me know!',
]

const twitterTemplates = [
  (title: string, excerpt: string) => `${truncate(title, 80)} — ${truncate(excerpt, 120)}\n\nTry it free → utilsnow.com`,
  (title: string, _excerpt: string, firstPoint: string) => `${truncate(firstPoint, 140)}\n\n${truncate(title, 80)} → utilsnow.com`,
  (title: string, excerpt: string) => `💡 ${truncate(title, 70)}\n\n${truncate(excerpt, 130)}\n\nutilsnow.com`,
]

const redditTitleFormats = [
  (title: string) => `I built a free ${title.replace(/ - .*$/, '').toLowerCase()} tool`,
  (title: string) => `How to ${title.replace(/ - .*$/, '').toLowerCase()} (free browser tool)`,
  (title: string) => `Free tool: ${truncate(title.replace(/ - .*$/, ''), 55)}`,
]

// ---------------------------------------------------------------------------
// Social post generators
// ---------------------------------------------------------------------------

function generateLinkedIn(post: BlogPost, index: number): SocialPost {
  const headings = extractHeadings(post.content)
  const firstPara = extractFirstParagraph(post.content)
  const listItems = extractListItems(post.content)
  const hookFn = linkedInHooks[index % linkedInHooks.length]
  const cta = linkedInCTAs[index % linkedInCTAs.length]
  const hashtags = getHashtags(post.category, 5)

  // Build key points section
  const points = headings.length > 0 ? headings : listItems
  const keyPoints = points
    .slice(0, 5)
    .map((p) => `→ ${p}`)
    .join('\n')

  // Build tool mentions
  const tools = (post.related_tools || []).slice(0, 3)
  const toolMention =
    tools.length > 0
      ? `\n\nI also built free browser-based tools for this: ${tools.map(toolName).join(', ')} — no signup, no data uploaded. Everything runs in your browser.`
      : '\n\nAll tools on UtilsNow are free, browser-based, and require no signup. Your data never leaves your device.'

  // Assemble the body
  const body = [
    hookFn(post.title.replace(/ - .*$/, '')),
    '',
    firstPara ? firstSentences(firstPara, 2) : '',
    '',
    keyPoints ? `Key points:\n${keyPoints}` : '',
    toolMention,
    '',
    cta,
    '',
    'Link in comments',
    '',
    hashtags.join(' '),
  ]
    .filter((line) => line !== undefined)
    .join('\n')

  return {
    blog_post_id: post.id,
    platform: 'linkedin',
    title: null,
    content: body,
    hashtags,
    scheduled_date: '', // filled by scheduler
  }
}

function generateTwitter(post: BlogPost, index: number): SocialPost {
  const firstPara = extractFirstParagraph(post.content)
  const headings = extractHeadings(post.content)
  const firstPoint = headings[0] || firstSentences(stripHtml(post.content), 1)
  const hashtags = getHashtags(post.category, 2)

  const templateFn = twitterTemplates[index % twitterTemplates.length]
  let tweet = templateFn(post.title, post.excerpt || firstPara, firstPoint)

  // Append hashtags if space permits
  const hashStr = '\n' + hashtags.join(' ')
  if (tweet.length + hashStr.length <= 280) {
    tweet += hashStr
  }

  // Final safety truncation
  if (tweet.length > 280) {
    tweet = tweet.slice(0, 277) + '...'
  }

  return {
    blog_post_id: post.id,
    platform: 'twitter',
    title: null,
    content: tweet,
    hashtags,
    scheduled_date: '',
  }
}

function generateReddit(post: BlogPost, index: number): SocialPost {
  const headings = extractHeadings(post.content)
  const firstPara = extractFirstParagraph(post.content)
  const listItems = extractListItems(post.content)
  const hashtags: string[] = [] // Reddit doesn't use hashtags

  const titleFn = redditTitleFormats[index % redditTitleFormats.length]
  let redditTitle = titleFn(post.title)
  // Enforce 60-80 char range
  if (redditTitle.length > 80) {
    redditTitle = truncate(redditTitle, 77)
  }

  // Build body
  const summary = firstPara
    ? firstSentences(firstPara, 3)
    : firstSentences(stripHtml(post.content), 3)

  const points = headings.length >= 2 ? headings : listItems
  const bulletSection =
    points.length > 0
      ? '\n\nKey things covered:\n' +
        points
          .slice(0, 4)
          .map((p) => `- ${p}`)
          .join('\n')
      : ''

  const tools = (post.related_tools || []).slice(0, 2)
  const toolSection =
    tools.length > 0
      ? `\n\nI also built free browser tools for this (${tools.map(toolName).join(', ')}) on utilsnow.com — everything runs client-side, no data uploaded.`
      : '\n\nAll tools are free and run entirely in your browser on utilsnow.com — no signup, no data collection.'

  const body = [summary, bulletSection, toolSection, '\n\nDisclosure: I built this.'].join('')

  return {
    blog_post_id: post.id,
    platform: 'reddit',
    title: redditTitle,
    content: truncate(body, 1200),
    hashtags,
    scheduled_date: '',
  }
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

/** Get tomorrow's date as a starting point. */
function getTomorrow(): Date {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Get the day of week: 0=Sun, 1=Mon, ..., 6=Sat. */
function dayOfWeek(d: Date): number {
  return d.getDay()
}

/** Advance date to the next valid day for the platform. */
function nextValidDay(d: Date, platform: string): Date {
  const validDays: Record<string, number[]> = {
    linkedin: [2, 3, 4, 5], // Tue, Wed, Thu, Fri
    twitter: [1, 2, 3, 4, 5, 6], // Mon–Sat
    reddit: [2, 4], // Tue, Thu
  }

  const valid = validDays[platform] || [1, 2, 3, 4, 5]
  const result = new Date(d)

  // Advance until we hit a valid day
  for (let i = 0; i < 14; i++) {
    if (valid.includes(dayOfWeek(result))) return result
    result.setDate(result.getDate() + 1)
  }
  return result
}

/** Format a Date to YYYY-MM-DD. */
function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Schedule posts so that only 1 social post goes out per day.
 * Walk forward from tomorrow, assigning each post to the next valid day
 * for its platform.
 */
function schedulePosts(posts: SocialPost[]): SocialPost[] {
  const usedDates = new Set<string>()
  let cursor = getTomorrow()

  // Sort: twitter (most days), linkedin, reddit (fewest days)
  const platformOrder: Record<string, number> = { twitter: 0, linkedin: 1, reddit: 2 }
  const sorted = [...posts].sort(
    (a, b) => (platformOrder[a.platform] ?? 3) - (platformOrder[b.platform] ?? 3)
  )

  // Round-robin: interleave platforms
  const byPlatform: Record<string, SocialPost[]> = {}
  for (const p of sorted) {
    if (!byPlatform[p.platform]) byPlatform[p.platform] = []
    byPlatform[p.platform].push(p)
  }

  const queues = Object.entries(byPlatform).map(([platform, items]) => ({
    platform,
    items: [...items],
    idx: 0,
  }))

  const scheduled: SocialPost[] = []

  // Keep going until all queues are drained
  while (queues.some((q) => q.idx < q.items.length)) {
    for (const q of queues) {
      if (q.idx >= q.items.length) continue

      // Find the next valid day for this platform that isn't taken
      let candidate = nextValidDay(new Date(cursor), q.platform)
      while (usedDates.has(formatDate(candidate))) {
        candidate.setDate(candidate.getDate() + 1)
        candidate = nextValidDay(candidate, q.platform)
      }

      const dateStr = formatDate(candidate)
      usedDates.add(dateStr)
      q.items[q.idx].scheduled_date = dateStr
      scheduled.push(q.items[q.idx])
      q.idx++

      // Move cursor just past this date for the next iteration
      const nextDay = new Date(candidate)
      nextDay.setDate(nextDay.getDate() + 1)
      if (nextDay > cursor) cursor = nextDay
    }
  }

  return scheduled
}

// ---------------------------------------------------------------------------
// Database operations
// ---------------------------------------------------------------------------

async function createTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_posts (
      id SERIAL PRIMARY KEY,
      blog_post_id INTEGER REFERENCES blog_posts(id),
      platform VARCHAR(50) NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      hashtags TEXT[],
      scheduled_date DATE,
      is_posted BOOLEAN DEFAULT false,
      posted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('✓ social_posts table ready')
}

async function getPublishedPosts(): Promise<BlogPost[]> {
  const result = await pool.query(
    `SELECT * FROM blog_posts
     WHERE publish_date <= CURRENT_DATE AND is_published = true
     ORDER BY publish_date DESC`
  )
  return result.rows
}

async function getAlreadyGeneratedBlogIds(): Promise<Set<number>> {
  const result = await pool.query(
    `SELECT DISTINCT blog_post_id FROM social_posts`
  )
  return new Set(result.rows.map((r: { blog_post_id: number }) => r.blog_post_id))
}

async function insertSocialPost(post: SocialPost): Promise<void> {
  await pool.query(
    `INSERT INTO social_posts (blog_post_id, platform, title, content, hashtags, scheduled_date)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      post.blog_post_id,
      post.platform,
      post.title,
      post.content,
      post.hashtags,
      post.scheduled_date,
    ]
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Social Post Generator ===\n')

  // 1. Connect & create table
  try {
    const res = await pool.query('SELECT NOW()')
    console.log(`Connected to PostgreSQL at ${res.rows[0].now}\n`)
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err)
    process.exit(1)
  }

  await createTable()

  // 2. Fetch published blog posts
  const blogPosts = await getPublishedPosts()
  console.log(`Found ${blogPosts.length} published blog posts\n`)

  if (blogPosts.length === 0) {
    console.log('No published blog posts found. Nothing to do.')
    await pool.end()
    return
  }

  // 3. Filter out posts that already have social posts
  const alreadyGenerated = await getAlreadyGeneratedBlogIds()
  const newPosts = blogPosts.filter((p) => !alreadyGenerated.has(p.id))

  if (newPosts.length === 0) {
    console.log('All blog posts already have social posts generated. Nothing to do.')
    const existing = await pool.query('SELECT COUNT(*) as total FROM social_posts')
    console.log(`Total social posts in database: ${existing.rows[0].total}`)
    await pool.end()
    return
  }

  console.log(
    `${alreadyGenerated.size} blog post(s) already have social posts — skipping those`
  )
  console.log(`Generating social posts for ${newPosts.length} new blog post(s)\n`)

  // 4. Generate social posts
  const allSocialPosts: SocialPost[] = []

  for (let i = 0; i < newPosts.length; i++) {
    const post = newPosts[i]
    console.log(`  Generating for: "${post.title}" (id=${post.id})`)

    allSocialPosts.push(generateLinkedIn(post, i))
    allSocialPosts.push(generateTwitter(post, i))
    allSocialPosts.push(generateReddit(post, i))
  }

  console.log(`\nGenerated ${allSocialPosts.length} social posts (3 per blog post)`)

  // 5. Schedule posts
  const scheduled = schedulePosts(allSocialPosts)
  console.log(`\nScheduled ${scheduled.length} posts starting from ${formatDate(getTomorrow())}:\n`)

  // 6. Insert into database
  for (const sp of scheduled) {
    await insertSocialPost(sp)
    const label = sp.platform.toUpperCase().padEnd(8)
    const dateStr = sp.scheduled_date
    const preview = sp.title
      ? `[${sp.title}] ${sp.content.slice(0, 60)}...`
      : sp.content.slice(0, 80).replace(/\n/g, ' ') + '...'
    console.log(`  ✓ ${label} ${dateStr}  ${preview}`)
  }

  // 7. Summary
  const countResult = await pool.query('SELECT platform, COUNT(*) as count FROM social_posts GROUP BY platform ORDER BY platform')
  console.log('\n=== Summary ===')
  console.log(`Total social posts generated: ${scheduled.length}`)
  for (const row of countResult.rows) {
    console.log(`  ${row.platform}: ${row.count}`)
  }

  const scheduleRange = await pool.query(
    'SELECT MIN(scheduled_date) as first, MAX(scheduled_date) as last FROM social_posts WHERE is_posted = false'
  )
  if (scheduleRange.rows[0].first) {
    const first = scheduleRange.rows[0].first.toISOString().slice(0, 10)
    const last = scheduleRange.rows[0].last.toISOString().slice(0, 10)
    console.log(`  Schedule range: ${first} → ${last}`)
  }

  await pool.end()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
