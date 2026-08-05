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
    <ToolPage
      title="Text to Slug"
      description="Convert text to a URL-friendly slug with lowercase letters, hyphens, and no special characters."
      category="text"
      categoryLabel="Text Tools"
      faqs={[
        { question: 'What is a URL slug?', answer: 'A URL slug is the human-readable part of a URL that identifies a page, like "my-blog-post" in example.com/blog/my-blog-post.' },
        { question: 'How does the text to slug converter work?', answer: 'It converts your text to lowercase, removes special characters and diacritics, and replaces spaces with hyphens to create a URL-friendly string.' },
        { question: 'Does this tool handle accented characters?', answer: 'Yes, accented characters like e with accent or u with umlaut are automatically converted to their plain ASCII equivalents.' },
        { question: 'Why are slugs important for SEO?', answer: 'Clean, descriptive slugs help search engines understand page content and improve click-through rates by making URLs readable to users.' },
      ]}
    >
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
