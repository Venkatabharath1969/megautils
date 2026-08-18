'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function htmlToMarkdown(html: string): string {
  let md = html

  // Remove script and style tags
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '')
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '')

  // Pre/code blocks — must come first
  md = md.replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_match, code) => {
    const decoded = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim()
    return '\n```\n' + decoded + '\n```\n'
  })
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_match, code) => {
    const decoded = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim()
    return '\n```\n' + decoded + '\n```\n'
  })

  // Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n')
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n')

  // Bold
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**')

  // Italic
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*')

  // Strikethrough
  md = md.replace(/<(del|s|strike)[^>]*>([\s\S]*?)<\/(del|s|strike)>/gi, '~~$2~~')

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)')
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n')

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, content) => {
    const lines = content.trim().replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1').split('\n')
    return '\n' + lines.map((l: string) => `> ${l.trim()}`).filter((l: string) => l.trim() !== '>').join('\n') + '\n'
  })

  // Ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_match, content) => {
    let idx = 0
    const result = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m: string, text: string) => {
      idx++
      return `${idx}. ${text.trim()}\n`
    })
    return '\n' + result.trim() + '\n'
  })

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_match, content) => {
    const result = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m: string, text: string) => {
      return `- ${text.trim()}\n`
    })
    return '\n' + result.trim() + '\n'
  })

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n')

  // Tables
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_match, content) => {
    const headerMatch = content.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i)
    const bodyMatch = content.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)
    if (!headerMatch) return content

    const headerCells: string[] = []
    const headerContent = headerMatch[1]
    headerContent.replace(/<th[^>]*>([\s\S]*?)<\/th>/gi, (_m: string, cell: string) => {
      headerCells.push(cell.trim())
      return ''
    })

    const rows: string[][] = []
    if (bodyMatch) {
      const rowMatches = bodyMatch[1].match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || []
      for (const row of rowMatches) {
        const cells: string[] = []
        row.replace(/<td[^>]*>([\s\S]*?)<\/td>/gi, (_m: string, cell: string) => {
          cells.push(cell.trim())
          return ''
        })
        rows.push(cells)
      }
    }

    const header = '| ' + headerCells.join(' | ') + ' |'
    const separator = '| ' + headerCells.map(() => '---').join(' | ') + ' |'
    const body = rows.map(r => '| ' + r.join(' | ') + ' |').join('\n')

    return '\n' + header + '\n' + separator + '\n' + body + '\n'
  })

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '')

  // Decode HTML entities
  md = md.replace(/&amp;/g, '&')
  md = md.replace(/&lt;/g, '<')
  md = md.replace(/&gt;/g, '>')
  md = md.replace(/&quot;/g, '"')
  md = md.replace(/&#39;/g, "'")
  md = md.replace(/&nbsp;/g, ' ')

  // Clean up extra newlines
  md = md.replace(/\n{3,}/g, '\n\n')

  return md.trim()
}

export default function HtmlToMarkdownTool() {
  const [input, setInput] = useState('')

  const output = useMemo(() => {
    if (!input.trim()) return ''
    return htmlToMarkdown(input)
  }, [input])

  return (
    <ToolPage title="HTML to Markdown Converter" description="Convert HTML to Markdown. Handles headings, bold, italic, links, lists, code blocks, tables, and more." category="markdown" categoryLabel="Markdown Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>HTML to Markdown Converter is a free browser-based tool that lets you convert HTML content to Markdown format, preserving headings, links, lists, bold, italic, and code formatting. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when migrating web content to Markdown-based systems, converting blog posts for static site generators, or creating documentation. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this content conversion tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need html to markdown.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'How do I convert HTML to Markdown?', answer: 'Paste your HTML into the input field and the tool instantly converts it to clean Markdown syntax, handling headings, bold, italic, links, lists, code blocks, and tables.' },
        { question: 'Does this tool preserve HTML tables in Markdown?', answer: 'Yes, HTML tables with thead and tbody are converted to proper Markdown table syntax with header separators and aligned columns.' },
        { question: 'Can I convert HTML emails to Markdown?', answer: 'Yes, paste the HTML source of any email and the converter will strip styling and produce readable Markdown text.' },
        { question: 'What HTML elements are supported?', answer: 'The converter supports headings (h1-h6), bold, italic, strikethrough, links, images, lists, blockquotes, code blocks, tables, and horizontal rules.' },
      ]}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">HTML Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Paste your HTML here..." rows={18} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Markdown Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="document.md" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly rows={18} placeholder="Markdown output will appear here..." />
        </div>
      </div>
    </ToolPage>
  )
}
