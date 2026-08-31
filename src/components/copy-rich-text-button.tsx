'use client'
import { useState } from 'react'
import { ClipboardCopy, Check } from 'lucide-react'

export function CopyRichTextButton({ html, label = 'Copy Rich Text' }: { html: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      const blob = new Blob([html], { type: 'text/html' })
      const textBlob = new Blob([html.replace(/<[^>]*>/g, '')], { type: 'text/plain' })
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blob,
          'text/plain': textBlob,
        })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback to plain text
      await navigator.clipboard.writeText(html.replace(/<[^>]*>/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
      {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><ClipboardCopy className="h-3.5 w-3.5" /> {label}</>}
    </button>
  )
}
