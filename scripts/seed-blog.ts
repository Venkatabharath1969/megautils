/**
 * Seed blog posts into PostgreSQL
 * 
 * Usage: npx tsx scripts/seed-blog.ts
 * 
 * Reads all blog posts from:
 *   - src/lib/blog-data.ts       (blogPosts, ids 1-15)
 *   - src/lib/blog-posts-generated.ts (generatedPosts, ids 100-174)
 * 
 * Inserts them into the blog_posts table with ON CONFLICT (slug) DO UPDATE
 * so it's safe to run multiple times (idempotent).
 */

import { blogPosts } from '../src/lib/blog-data'
import { generatedPosts } from '../src/lib/blog-posts-generated'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  database: 'megautils',
  user: 'megautils',
  password: 'megautils_36ed23db45f9cc50',
})

interface BlogPost {
  id: number
  slug: string
  title: string
  description: string
  content: string
  publishDate: string
  category: string
  keywords: string[]
  readingTime: number
}

/**
 * Extract tool slugs from HTML content by finding all href="/tools/xxx" patterns.
 */
function extractRelatedTools(content: string): string[] {
  const regex = /href="\/tools\/([a-z0-9-]+)"/g
  const tools: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    if (!tools.includes(match[1])) {
      tools.push(match[1])
    }
  }
  return tools
}

async function seedPosts(posts: BlogPost[], label: string): Promise<number> {
  let inserted = 0

  for (const post of posts) {
    const relatedTools = extractRelatedTools(post.content)

    try {
      await pool.query(
        `INSERT INTO blog_posts (id, slug, title, excerpt, content, category, keywords, related_tools, reading_time, publish_date, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           excerpt = EXCLUDED.excerpt,
           content = EXCLUDED.content,
           category = EXCLUDED.category,
           keywords = EXCLUDED.keywords,
           related_tools = EXCLUDED.related_tools,
           reading_time = EXCLUDED.reading_time,
           publish_date = EXCLUDED.publish_date,
           updated_at = CURRENT_TIMESTAMP`,
        [
          post.id,
          post.slug,
          post.title,
          post.description,    // maps to excerpt
          post.content,
          post.category,
          post.keywords,       // TEXT[] — pg driver handles string[] natively
          relatedTools,        // TEXT[]
          post.readingTime,    // maps to reading_time
          post.publishDate,    // maps to publish_date (YYYY-MM-DD)
        ]
      )
      inserted++
      console.log(`  ✓ [${label}] ${post.id}: ${post.slug}`)
    } catch (err) {
      console.error(`  ✗ [${label}] ${post.id}: ${post.slug} — ${err}`)
    }
  }

  return inserted
}

async function main() {
  console.log('=== Blog Post Seeder ===\n')

  // Test connection
  try {
    const res = await pool.query('SELECT NOW()')
    console.log(`Connected to PostgreSQL at ${res.rows[0].now}\n`)
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err)
    process.exit(1)
  }

  console.log(`Found ${blogPosts.length} original posts (blog-data.ts)`)
  console.log(`Found ${generatedPosts.length} generated posts (blog-posts-generated.ts)`)
  console.log(`Total: ${blogPosts.length + generatedPosts.length} posts\n`)

  console.log('--- Inserting original posts ---')
  const count1 = await seedPosts(blogPosts, 'original')

  console.log('\n--- Inserting generated posts ---')
  const count2 = await seedPosts(generatedPosts as BlogPost[], 'generated')

  // Verify final count
  const countResult = await pool.query('SELECT COUNT(*) AS total FROM blog_posts')
  const dbCount = parseInt(countResult.rows[0].total, 10)

  console.log(`\n=== Summary ===`)
  console.log(`Original posts inserted/updated: ${count1}`)
  console.log(`Generated posts inserted/updated: ${count2}`)
  console.log(`Total processed: ${count1 + count2}`)
  console.log(`Total rows in blog_posts table: ${dbCount}`)

  // Reset the sequence to max id + 1 so future INSERTs without explicit id work
  await pool.query(`SELECT setval('blog_posts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM blog_posts))`)
  console.log(`\nSequence blog_posts_id_seq reset to max(id).`)

  await pool.end()
  console.log('Done.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
