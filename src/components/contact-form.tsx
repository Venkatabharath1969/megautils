'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // No backend needed - just show thank you message
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8">
        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <CheckCircle className="h-6 w-6 text-green-500" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Thank You!</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your message has been received. We typically respond within 48 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setName('')
            setEmail('')
            setMessage('')
          }}
          className="mt-6 text-sm text-primary hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1.5">
          Name
        </label>
        <input
          type="text"
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1.5">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-vertical"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Send className="h-4 w-4" />
        Send Message
      </button>
    </form>
  )
}
