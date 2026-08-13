import { NextRequest, NextResponse } from 'next/server'

const LIST_UUID = 'a41f23f8-9c36-4b73-ba93-9faae56e4367'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const listmonkUrl = process.env.LISTMONK_URL || 'http://localhost:9000'

    // Use the public subscription form endpoint (no auth needed)
    const res = await fetch(`${listmonkUrl}/subscription/form`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}&l=${LIST_UUID}`,
    })

    if (res.ok) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
