'use client'

import { useState } from 'react'
import { Code, Check, Copy } from 'lucide-react'

export function EmbedCode({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const embedCode = `<iframe src="https://utilsnow.com/embed/${slug}" width="100%" height="500" frameborder="0" style="border:1px solid #e5e7eb;border-radius:8px;" loading="lazy" title="${title} — UtilsNow"></iframe>`

  const copy = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <button
        onClick={() => setShowCode(!showCode)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Code className="h-3.5 w-3.5" />
        {showCode ? 'Hide embed code' : 'Embed this tool'}
      </button>
      {showCode && (
        <div className="mt-2 relative">
          <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
            <code>{embedCode}</code>
          </pre>
          <button
            onClick={copy}
            className="absolute top-2 right-2 p-1.5 rounded bg-card border border-border hover:bg-muted"
            aria-label="Copy embed code"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
