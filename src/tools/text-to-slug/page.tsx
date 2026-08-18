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
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text to Slug is a free browser-based tool that lets you convert text into URL-friendly slugs by lowercasing, replacing spaces with hyphens, and removing special characters. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating SEO-friendly URLs for blog posts, generating file names from titles, or normalizing user input for URL paths. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need slug generation.</li>
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
