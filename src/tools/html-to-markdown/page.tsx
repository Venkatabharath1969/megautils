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
    <ToolPage title="HTML to Markdown Converter" description="Convert HTML to Markdown. Handles headings, bold, italic, links, lists, code blocks, tables, and more." category="markdown" categoryLabel="Markdown Tools">
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
