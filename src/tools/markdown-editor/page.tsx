'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function markdownToHtml(md: string): string {
  let html = md

  // Code blocks (``` ... ```) — must come before inline code
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`
  })

  // Tables
  html = html.replace(/^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)*)/gm, (_match, headerRow: string, separatorRow: string, bodyRows: string) => {
    const headers = headerRow.split('|').filter((c: string) => c.trim() !== '')
    const separators = separatorRow.split('|').filter((c: string) => c.trim() !== '')
    const aligns = separators.map((s: string) => {
      const t = s.trim()
      if (t.startsWith(':') && t.endsWith(':')) return 'center'
      if (t.endsWith(':')) return 'right'
      return 'left'
    })
    const rows = bodyRows.trim().split('\n').filter(Boolean)

    let table = '<table><thead><tr>'
    headers.forEach((h: string, i: number) => {
      table += `<th style="text-align:${aligns[i] || 'left'}">${h.trim()}</th>`
    })
    table += '</tr></thead><tbody>'
    rows.forEach((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim() !== '')
      table += '<tr>'
      cells.forEach((c: string, i: number) => {
        table += `<td style="text-align:${aligns[i] || 'left'}">${c.trim()}</td>`
      })
      table += '</tr>'
    })
    table += '</tbody></table>'
    return table
  })

  // Blockquotes
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>')
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n')

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr />')
  html = html.replace(/^\*\*\*+$/gm, '<hr />')

  // Images (before links)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%" />')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // Inline code (after code blocks)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Unordered lists
  html = html.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

  // Ordered lists
  html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>')
  // Wrap consecutive <li> not already in <ul> into <ol>
  html = html.replace(/(?<!<\/ul>)((?:<li>.*<\/li>\n?)+)/g, (match) => {
    if (match.includes('<ul>')) return match
    return `<ol>${match}</ol>`
  })

  // Paragraphs — wrap loose lines
  const lines = html.split('\n')
  const result: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) {
      result.push('')
      continue
    }
    if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|table|thead|tbody|tr|th|td|div)/.test(line)) {
      result.push(line)
    } else {
      result.push(`<p>${line}</p>`)
    }
  }

  return result.join('\n')
}

export default function MarkdownEditorTool() {
  const [markdown, setMarkdown] = useState(`# Welcome to the Markdown Editor

## Getting Started

This is a **live preview** markdown editor. Type on the left and see the rendered output on the right.

### Features

- **Bold** text with \`**bold**\`
- *Italic* text with \`*italic*\`
- ~~Strikethrough~~ with \`~~text~~\`
- \`inline code\` with backticks
- [Links](https://example.com)

### Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

### Blockquote

> This is a blockquote. It can span multiple lines.

### Table

| Name | Age | City |
|------|-----|------|
| Alice | 30 | NYC |
| Bob | 25 | LA |

### Ordered List

1. First item
2. Second item
3. Third item

---

*Happy writing!*
`)

  const renderedHtml = useMemo(() => markdownToHtml(markdown), [markdown])

  return (
    <ToolPage title="Markdown Editor" description="Write Markdown with a live side-by-side preview. Supports headings, bold, italic, code, links, tables, and more." category="markdown" categoryLabel="Markdown Tools">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <CopyButton text={markdown} />
          <DownloadButton content={markdown} filename="document.md" />
        </div>
        <ClearButton onClear={() => setMarkdown('')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '500px' }}>
        {/* Editor */}
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Markdown</div>
          <textarea
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
            className="flex-1 w-full rounded-lg border border-input bg-tool-bg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            style={{ minHeight: '500px' }}
            placeholder="Write your markdown here..."
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Preview</div>
          <div
            className="flex-1 w-full rounded-lg border border-input bg-tool-bg p-4 overflow-auto prose prose-sm dark:prose-invert max-w-none"
            style={{ minHeight: '500px' }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>
    </ToolPage>
  )
}
