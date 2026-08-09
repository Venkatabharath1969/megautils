'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function markdownToHtml(md: string): string {
  let html = md

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const langAttr = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${langAttr}>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre>`
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

    let table = '<table>\n<thead>\n<tr>\n'
    headers.forEach((h: string, i: number) => {
      table += `  <th style="text-align:${aligns[i] || 'left'}">${h.trim()}</th>\n`
    })
    table += '</tr>\n</thead>\n<tbody>\n'
    rows.forEach((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim() !== '')
      table += '<tr>\n'
      cells.forEach((c: string, i: number) => {
        table += `  <td style="text-align:${aligns[i] || 'left'}">${c.trim()}</td>\n`
      })
      table += '</tr>\n'
    })
    table += '</tbody>\n</table>'
    return table
  })

  // Blockquotes
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>')
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

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

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

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Unordered lists
  html = html.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>\n$1</ul>')

  // Ordered lists
  html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>')
  html = html.replace(/(?<!<\/ul>)((?:<li>.*<\/li>\n?)+)/g, (match) => {
    if (match.includes('<ul>')) return match
    return `<ol>\n${match}</ol>`
  })

  // Paragraphs
  const lines = html.split('\n')
  const result: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { result.push(''); continue }
    if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|table|thead|tbody|tr|th|td|div|img)/.test(trimmed)) {
      result.push(trimmed)
    } else {
      result.push(`<p>${trimmed}</p>`)
    }
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export default function MarkdownToHtmlTool() {
  const [input, setInput] = useState('')

  const output = useMemo(() => {
    if (!input.trim()) return ''
    return markdownToHtml(input)
  }, [input])

  const fullHtml = useMemo(() => {
    if (!output) return ''
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n</head>\n<body>\n${output}\n</body>\n</html>`
  }, [output])

  return (
    <ToolPage
      title="Markdown to HTML Converter"
      description="Convert Markdown to clean HTML. Copy or download the generated HTML file."
      category="markdown"
      categoryLabel="Markdown Tools"
      helpContent={
        <>
          <h2>What is Markdown to HTML Converter?</h2>
          <p>
            Markdown to HTML Converter is a free online tool that transforms Markdown-formatted text into clean, semantic HTML code in real time. Markdown is a lightweight markup language widely used by developers, technical writers, and content creators because of its simple, readable syntax. However, web browsers render HTML, not Markdown, so converting between the two formats is a frequent need. This tool handles the conversion instantly as you type, showing both the raw HTML output and a live preview of how the content will look in a browser.
          </p>
          <p>
            The converter supports a comprehensive set of Markdown features including headings (h1 through h6), bold, italic, and strikethrough text, inline code and fenced code blocks with language hints, links, images, blockquotes, ordered and unordered lists, tables with alignment, and horizontal rules. It also supports the most commonly used GitHub Flavored Markdown extensions. The generated HTML is clean and standards-compliant, ready to be pasted into any website, content management system, blog platform, or email template. You can also download a complete HTML file with proper doctype and meta tags.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Type or paste your Markdown content into the input area on the left side of the screen.</li>
            <li>The tool converts your Markdown to HTML in real time. The generated HTML code appears instantly in the output panel on the right.</li>
            <li>Scroll down to see the live preview section, which renders the HTML as it would appear in a browser.</li>
            <li>Use the copy button to copy the raw HTML to your clipboard for pasting into your website or CMS.</li>
            <li>Click the download button to save a complete HTML file with doctype, head, and body tags included.</li>
            <li>Use the clear button to reset the input and start converting a new document.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Use the live preview to verify that your Markdown is rendering as expected before copying the HTML output.</li>
            <li>For code blocks, use triple backticks with a language name (e.g., ```javascript) to generate HTML with language-specific class attributes for syntax highlighting.</li>
            <li>Tables require a header row, a separator row with dashes and optional colons for alignment, and one or more body rows. Missing separators will prevent table recognition.</li>
            <li>The downloaded HTML file includes a complete document structure with charset and viewport meta tags, making it ready to open directly in any browser.</li>
            <li>If you are pasting the output into a CMS like WordPress or Ghost, use just the body HTML (the copy button output) rather than the full downloaded file.</li>
            <li>All conversion happens locally in your browser. No data is uploaded or stored, so the tool is safe for private documentation, internal wikis, and confidential content.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What Markdown syntax is supported?', answer: 'This converter supports headings, bold, italic, strikethrough, links, images, code blocks, blockquotes, ordered and unordered lists, tables, and horizontal rules.' },
        { question: 'Can I use the generated HTML directly on my website?', answer: 'Yes. The output is clean, semantic HTML that can be pasted into any web page, CMS, or email template. You can also download a complete HTML file with proper doctype and meta tags.' },
        { question: 'Does this tool support GitHub Flavored Markdown?', answer: 'It supports the most commonly used GFM features including tables, strikethrough (~~text~~), and fenced code blocks with language hints.' },
        { question: 'Is the conversion done on a server?', answer: 'No. All Markdown-to-HTML conversion happens entirely in your browser in your browser. Nothing is uploaded or stored.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Markdown Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Paste your Markdown here..." rows={18} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">HTML Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={fullHtml} filename="document.html" mimeType="text/html" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly rows={18} placeholder="HTML output will appear here..." />
        </div>
      </div>

      {output && (
        <div className="mt-4">
          <div className="text-sm font-semibold mb-2">Preview</div>
          <div
            className="rounded-lg border border-input bg-white dark:bg-gray-950 p-4 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: output }}
          />
        </div>
      )}
    </ToolPage>
  )
}
