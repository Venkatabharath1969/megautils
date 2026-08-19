'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

type SepType = '-' | '_' | '.'

function toSlug(text: string, separator: string, maxLength: number): string {
  let slug = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, separator)
    .replace(new RegExp(`[${separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+`, 'g'), separator)
    .replace(new RegExp(`^[${separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]|[${separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]$`, 'g'), '')

  if (maxLength > 0 && slug.length > maxLength) {
    slug = slug.slice(0, maxLength)
    const lastSep = slug.lastIndexOf(separator)
    if (lastSep > 0) slug = slug.slice(0, lastSep)
  }
  return slug
}

export default function TextToSlugTool() {
  const [input, setInput] = useState('')
  const [separator, setSeparator] = useState<SepType>('-')
  const [maxLength, setMaxLength] = useState(0)

  const slug = useMemo(() => toSlug(input, separator, maxLength), [input, separator, maxLength])

  return (
    <ToolPage
      title="Text to Slug"
      description="Convert text to a URL-friendly slug with lowercase letters, hyphens, and no special characters."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text to Slug is a free browser-based tool that lets you convert text into URL-friendly slugs by lowercasing, replacing spaces with hyphens, and removing special characters. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating SEO-friendly URLs for blog posts, generating file names from titles, or normalizing user input for URL paths. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For very long documents, processing is instant but rendering the output may take a brief moment.</li>
            <li>The tool handles Unicode text correctly, including accented characters, CJK scripts, and emoji.</li>
            <li>Use the undo function in your browser (Ctrl+Z) if you need to revert input changes.</li>
            <li>Combine multiple text operations by copying the output of one tool into the input of another.</li>
            <li>No text is stored or transmitted — all processing runs locally in your browser.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is a URL slug?', answer: 'A URL slug is the human-readable part of a URL that identifies a page, like "my-blog-post" in example.com/blog/my-blog-post.' },
        { question: 'How does the text to slug converter work?', answer: 'It converts your text to lowercase, removes special characters and diacritics, and replaces spaces with hyphens to create a URL-friendly string.' },
        { question: 'Does this tool handle accented characters?', answer: 'Yes, accented characters like e with accent or u with umlaut are automatically converted to their plain ASCII equivalents.' },
        { question: 'Why are slugs important for SEO?', answer: 'Clean, descriptive slugs help search engines understand page content and improve click-through rates by making URLs readable to users.' },
      ]}
    >
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Separator:</label>
          <select value={separator} onChange={e => setSeparator(e.target.value as SepType)} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
            <option value="-">Hyphen (-)</option>
            <option value="_">Underscore (_)</option>
            <option value=".">Dot (.)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Max length:</label>
          <input
            type="number"
            min={0}
            max={500}
            value={maxLength || ''}
            onChange={(e) => setMaxLength(parseInt(e.target.value) || 0)}
            placeholder="No limit"
            className="w-24 h-9 px-3 rounded-md border border-input bg-card text-sm"
          />
        </div>
      </div>
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
