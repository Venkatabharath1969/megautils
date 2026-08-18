'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function stripHtmlTags(html: string, preserveBreaks: boolean): string {
  let result = html
  if (preserveBreaks) {
    result = result.replace(/<br\s*\/?>/gi, '\n')
    result = result.replace(/<\/p>/gi, '\n\n')
    result = result.replace(/<\/div>/gi, '\n')
    result = result.replace(/<\/li>/gi, '\n')
    result = result.replace(/<\/h[1-6]>/gi, '\n\n')
    result = result.replace(/<\/tr>/gi, '\n')
    result = result.replace(/<\/blockquote>/gi, '\n')
  }
  result = result.replace(/<[^>]*>/g, '')
  result = result.replace(/&nbsp;/gi, ' ')
  result = result.replace(/&amp;/gi, '&')
  result = result.replace(/&lt;/gi, '<')
  result = result.replace(/&gt;/gi, '>')
  result = result.replace(/&quot;/gi, '"')
  result = result.replace(/&#39;/gi, "'")
  if (preserveBreaks) {
    result = result.replace(/\n{3,}/g, '\n\n')
  }
  return result.trim()
}

export default function HtmlTagStripperTool() {
  const [input, setInput] = useState('')
  const [preserveBreaks, setPreserveBreaks] = useState(true)

  const output = useMemo(() => {
    if (!input) return ''
    return stripHtmlTags(input, preserveBreaks)
  }, [input, preserveBreaks])

  return (
    <ToolPage title="HTML Tag Stripper" description="Strip all HTML tags from text and keep only the text content." category="text" categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>HTML Tag Stripper is a free browser-based tool that lets you remove all HTML tags from content while preserving the plain text, with options to keep specific tags. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when extracting text from HTML emails, cleaning web-scraped content, or converting HTML to plain text. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text processing tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need html tag removal.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'How do I remove HTML tags from text?', answer: 'Paste your HTML into the input and this tool instantly strips all tags, leaving only the plain text content with optional line break preservation.' },
        { question: 'Does stripping HTML tags also remove HTML entities?', answer: 'Yes, common HTML entities like &amp;, &lt;, &gt;, &quot;, and &nbsp; are automatically decoded back to their plain text equivalents.' },
        { question: 'Can I keep line breaks when removing HTML tags?', answer: 'Yes, enable the "Preserve line breaks" option to convert block-level tags like p, div, br, and headings into newline characters.' },
      ]}>
      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="checkbox" checked={preserveBreaks} onChange={e => setPreserveBreaks(e.target.checked)} className="rounded border-input" />
          Preserve line breaks
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">HTML Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder='<h1>Hello World</h1>\n<p>This is a <strong>paragraph</strong> with <a href="#">links</a>.</p>' rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Plain Text Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Stripped text will appear here..." rows={12} />
        </div>
      </div>
    </ToolPage>
  )
}
