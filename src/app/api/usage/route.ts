import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Ensure the tool_usage table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tool_usage (
      slug TEXT PRIMARY KEY,
      count BIGINT DEFAULT 0,
      last_used TIMESTAMP DEFAULT NOW()
    )
  `)
}

let tableReady = false

async function initTable() {
  if (!tableReady) {
    await ensureTable()
    tableReady = true
  }
}

// GET /api/usage — get usage counts
// ?slug=json-formatter  → { slug, count }
// ?total=true           → { total }
// no params             → { counts: { slug: count, ... } }
export async function GET(req: NextRequest) {
  try {
    await initTable()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const total = searchParams.get('total')

    if (slug) {
      const result = await pool.query(
        'SELECT count FROM tool_usage WHERE slug = $1',
        [slug]
      )
      const count = result.rows[0]?.count || 0
      return NextResponse.json({ slug, count: Number(count) })
    }

    if (total === 'true') {
      const result = await pool.query(
        'SELECT COALESCE(SUM(count), 0) AS total FROM tool_usage'
      )
      return NextResponse.json({ total: Number(result.rows[0].total) })
    }

    // Return all counts
    const result = await pool.query('SELECT slug, count FROM tool_usage ORDER BY count DESC')
    const counts: Record<string, number> = {}
    for (const row of result.rows) {
      counts[row.slug] = Number(row.count)
    }
    return NextResponse.json({ counts })
  } catch (error) {
    console.error('Usage GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
  }
}

// POST /api/usage — increment counter for a tool
// Body: { slug: "json-formatter" }
export async function POST(req: NextRequest) {
  try {
    await initTable()
    const { slug } = await req.json()

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO tool_usage (slug, count, last_used)
       VALUES ($1, 1, NOW())
       ON CONFLICT (slug)
       DO UPDATE SET count = tool_usage.count + 1, last_used = NOW()
       RETURNING count`,
      [slug]
    )

    return NextResponse.json({
      slug,
      count: Number(result.rows[0].count),
    })
  } catch (error) {
    console.error('Usage POST error:', error)
    return NextResponse.json({ error: 'Failed to increment usage' }, { status: 500 })
  }
}
