import { NextRequest, NextResponse } from 'next/server'

const LIST_UUID = '2d190a10-3c68-44fe-88c5-92ac116ac0ba'

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
