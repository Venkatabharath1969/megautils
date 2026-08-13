'use client'

import { useState } from 'react'
import { Mail, Check, Loader2 } from 'lucide-react'

export function EmailSubscribe() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 5000)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Get Tool Tips & Updates</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Weekly tips, new tools, and productivity hacks. No spam.
      </p>
      <form onSubmit={subscribe} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {status === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {status === 'success' && <Check className="h-3.5 w-3.5" />}
          {status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-xs text-red-500 mt-2">Something went wrong. Please try again.</p>
      )}
    </div>
  )
}
