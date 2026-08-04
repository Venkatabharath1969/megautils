'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special chars
    .trim()
    .replace(/\s+/g, '-')           // Spaces to hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-|-$/g, '')          // Trim leading/trailing hyphens
}

export default function TextToSlugTool() {
  const [input, setInput] = useState('')

  const slug = useMemo(() => toSlug(input), [input])

  return (
    <ToolPage title="Text to Slug" description="Convert text to a URL-friendly slug with lowercase letters, hyphens, and no special characters." category="text" categoryLabel="Text Tools">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Input Text</span>
        <ClearButton onClear={() => setInput('')} />
      </div>
      <ToolTextarea value={input} onChange={setInput} placeholder="Enter text to convert to slug..." rows={4} />

      {slug && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Generated Slug</span>
            <CopyButton text={slug} />
          </div>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm break-all">{slug}</div>
        </div>
      )}

      {input && (
        <div className="mt-4">
          <span className="text-sm font-medium block mb-2">Preview URL</span>
          <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground break-all">
            https://example.com/blog/<span className="text-primary font-medium">{slug}</span>
          </div>
        </div>
      )}
    </ToolPage>
  )
}
