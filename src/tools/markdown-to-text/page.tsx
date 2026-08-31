'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'
import { PdfDownloadButton } from '@/components/pdf-download-button'
import { CopyRichTextButton } from '@/components/copy-rich-text-button'
import { ClipboardPaste, Upload, FileText, ChevronDown } from 'lucide-react'

// ─── Unicode character maps ───────────────────────────────────────────────────

const BOLD_MAP: Record<string, string> = {
  A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',
  K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',
  U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
  a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',
  k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',
  u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
  '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵',
}

const ITALIC_MAP: Record<string, string> = {
  A:'𝘈',B:'𝘉',C:'𝘊',D:'𝘋',E:'𝘌',F:'𝘍',G:'𝘎',H:'𝘏',I:'𝘐',J:'𝘑',
  K:'𝘒',L:'𝘓',M:'𝘔',N:'𝘕',O:'𝘖',P:'𝘗',Q:'𝘘',R:'𝘙',S:'𝘚',T:'𝘛',
  U:'𝘜',V:'𝘝',W:'𝘞',X:'𝘟',Y:'𝘠',Z:'𝘡',
  a:'𝘢',b:'𝘣',c:'𝘤',d:'𝘥',e:'𝘦',f:'𝘧',g:'𝘨',h:'𝘩',i:'𝘪',j:'𝘫',
  k:'𝘬',l:'𝘭',m:'𝘮',n:'𝘯',o:'𝘰',p:'𝘱',q:'𝘲',r:'𝘳',s:'𝘴',t:'𝘵',
  u:'𝘶',v:'𝘷',w:'𝘸',x:'𝘹',y:'𝘺',z:'𝘻',
}

const BOLD_ITALIC_MAP: Record<string, string> = {
  A:'𝘼',B:'𝘽',C:'𝘾',D:'𝘿',E:'𝙀',F:'𝙁',G:'𝙂',H:'𝙃',I:'𝙄',J:'𝙅',
  K:'𝙆',L:'𝙇',M:'𝙈',N:'𝙉',O:'𝙊',P:'𝙋',Q:'𝙌',R:'𝙍',S:'𝙎',T:'𝙏',
  U:'𝙐',V:'𝙑',W:'𝙒',X:'𝙓',Y:'𝙔',Z:'𝙕',
  a:'𝙖',b:'𝙗',c:'𝙘',d:'𝙙',e:'𝙚',f:'𝙛',g:'𝙜',h:'𝙝',i:'𝙞',j:'𝙟',
  k:'𝙠',l:'𝙡',m:'𝙢',n:'𝙣',o:'𝙤',p:'𝙥',q:'𝙦',r:'𝙧',s:'𝙨',t:'𝙩',
  u:'𝙪',v:'𝙫',w:'𝙬',x:'𝙭',y:'𝙮',z:'𝙯',
}

const MONO_MAP: Record<string, string> = {
  A:'𝙰',B:'𝙱',C:'𝙲',D:'𝙳',E:'𝙴',F:'𝙵',G:'𝙶',H:'𝙷',I:'𝙸',J:'𝙹',
  K:'𝙺',L:'𝙻',M:'𝙼',N:'𝙽',O:'𝙾',P:'𝙿',Q:'𝚀',R:'𝚁',S:'𝚂',T:'𝚃',
  U:'𝚄',V:'𝚅',W:'𝚆',X:'𝚇',Y:'𝚈',Z:'𝚉',
  a:'𝚊',b:'𝚋',c:'𝚌',d:'𝚍',e:'𝚎',f:'𝚏',g:'𝚐',h:'𝚑',i:'𝚒',j:'𝚓',
  k:'𝚔',l:'𝚕',m:'𝚖',n:'𝚗',o:'𝚘',p:'𝚙',q:'𝚚',r:'𝚛',s:'𝚜',t:'𝚝',
  u:'𝚞',v:'𝚟',w:'𝚠',x:'𝚡',y:'𝚢',z:'𝚣',
  '0':'𝟶','1':'𝟷','2':'𝟸','3':'𝟹','4':'𝟺','5':'𝟻','6':'𝟼','7':'𝟽','8':'𝟾','9':'𝟿',
}

const toBold = (s: string) => s.split('').map(c => BOLD_MAP[c] || c).join('')
const toItalic = (s: string) => s.split('').map(c => ITALIC_MAP[c] || c).join('')
const toBoldItalic = (s: string) => s.split('').map(c => BOLD_ITALIC_MAP[c] || c).join('')
const toMono = (s: string) => s.split('').map(c => MONO_MAP[c] || c).join('')

// ─── Example markdown document ───────────────────────────────────────────────

const EXAMPLE_MARKDOWN = `# Markdown Converter Demo

This document demonstrates **every** Markdown feature supported by this converter.

## Text Formatting

You can write **bold text**, *italic text*, and ***bold italic text*** together.
Use ~~strikethrough~~ to indicate deleted content, and \`inline code\` for technical terms.

## Links & Images

Visit [OpenAI](https://openai.com) for more info.
Here's an image: ![Placeholder](https://via.placeholder.com/150)

## Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

## Lists

### Unordered List
- First item
- Second item
  - Nested item A
  - Nested item B
- Third item

### Ordered List
1. Step one
2. Step two
3. Step three

### Task List
- [x] Write the converter
- [x] Add rich text output
- [ ] Ship to production

## Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));
\`\`\`

## Table

| Feature        | Plain Text | Rich Text | HTML   |
|:---------------|:----------:|:---------:|-------:|
| Headings       | ✓          | ✓         | ✓      |
| Bold / Italic  | ✓          | ✓         | ✓      |
| Tables         | ✓          | ✓         | ✓      |
| Task Lists     | ✓          | ✓         | ✓      |

## Footnotes

Markdown is widely used[^1] in documentation and blogging[^2].

[^1]: Markdown was created by John Gruber in 2004.
[^2]: Most static site generators support Markdown natively.

---

## Horizontal Rule

The line above is a horizontal rule. Below is another one:

***

That's everything! Try editing this document to see the live conversion.
`

// ─── Shared preprocessing: handle escape sequences & normalize ─────────────

function preprocess(md: string): string {
  // Normalize line endings
  let text = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  return text
}

// Placeholder system for escaped characters
const ESC_PLACEHOLDER = '\u0000ESC'
function handleEscapes(text: string): { text: string; restore: (s: string) => string } {
  const escaped: string[] = []
  const processed = text.replace(/\\([\\`*_{}[\]()#+\-.!~|>])/g, (_, ch) => {
    escaped.push(ch)
    return `${ESC_PLACEHOLDER}${escaped.length - 1}\u0000`
  })
  const restore = (s: string) => s.replace(new RegExp(`${ESC_PLACEHOLDER}(\\d+)\u0000`, 'g'), (_, idx) => escaped[parseInt(idx)])
  return { text: processed, restore }
}

// ─── Collect footnotes from source ────────────────────────────────────────────

function extractFootnotes(text: string): { cleaned: string; footnotes: Map<string, string> } {
  const footnotes = new Map<string, string>()
  const cleaned = text.replace(/^\[\^(\w+)\]:\s*(.+)$/gm, (_, id, content) => {
    footnotes.set(id, content)
    return ''
  })
  return { cleaned, footnotes }
}

// ─── Plain Text conversion ────────────────────────────────────────────────────

function mdToPlainText(md: string): string {
  let text = preprocess(md)
  const { text: escaped, restore } = handleEscapes(text)
  text = escaped

  const { cleaned, footnotes } = extractFootnotes(text)
  text = cleaned

  // Code blocks → extract content only
  text = text.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) => code.trim())

  // Inline code → keep content
  text = text.replace(/`([^`]+)`/g, '$1')

  // Images → alt text or remove
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt) => alt || '')

  // Links → keep text, append URL
  text = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '$1 ($2)')

  // Auto-links
  text = text.replace(/<(https?:\/\/[^>]+)>/g, '$1')

  // Footnote references → [n]
  text = text.replace(/\[\^(\w+)\]/g, (_, id) => {
    const keys = Array.from(footnotes.keys())
    const idx = keys.indexOf(id)
    return idx >= 0 ? `[${idx + 1}]` : ''
  })

  // Headings → remove markers, keep text
  text = text.replace(/^#{1,6}\s+(.*)$/gm, '$1')

  // Bold + italic
  text = text.replace(/(\*\*\*|___)(.*?)\1/g, '$2')
  // Bold
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2')
  // Italic
  text = text.replace(/(\*|_)(.*?)\1/g, '$2')
  // Strikethrough
  text = text.replace(/~~(.*?)~~/g, '$1')

  // Blockquotes
  text = text.replace(/^>\s?/gm, '')

  // Task lists
  text = text.replace(/^(\s*)[-*+]\s+\[x\]\s+/gm, '$1[done] ')
  text = text.replace(/^(\s*)[-*+]\s+\[\s\]\s+/gm, '$1[todo] ')

  // Unordered list markers
  text = text.replace(/^(\s*)[-*+]\s+/gm, '$1• ')

  // Ordered list markers → keep number
  text = text.replace(/^(\s*)\d+\.\s+/gm, (match, indent) => match)

  // Tables → aligned plain text
  text = text.replace(/^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)*)/gm, (_, headerRow: string, _sep: string, bodyRows: string) => {
    const parseRow = (row: string) => row.split('|').slice(1, -1).map(c => c.trim())
    const headers = parseRow(headerRow)
    const rows = bodyRows.trim().split('\n').filter(Boolean).map(parseRow)
    const allRows = [headers, ...rows]
    const colWidths = headers.map((_, i) => Math.max(...allRows.map(r => (r[i] || '').length)))
    const formatRow = (r: string[]) => r.map((c, i) => (c || '').padEnd(colWidths[i])).join('  ')
    const headerLine = formatRow(headers)
    const separator = colWidths.map(w => '-'.repeat(w)).join('  ')
    const bodyLines = rows.map(formatRow)
    return [headerLine, separator, ...bodyLines].join('\n')
  })

  // Horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '────────────────────────────────────────')

  // HTML tags
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<[^>]*>/g, '')

  // Line breaks (trailing double space or backslash)
  text = text.replace(/ {2,}\n/g, '\n')
  text = text.replace(/\\\n/g, '\n')

  // Add footnote references at the end
  if (footnotes.size > 0) {
    const fnLines: string[] = ['\n']
    let i = 1
    for (const [, content] of footnotes) {
      fnLines.push(`[${i}] ${content}`)
      i++
    }
    text += fnLines.join('\n')
  }

  // Collapse blank lines
  text = text.replace(/\n{3,}/g, '\n\n')

  return restore(text).trim()
}

// ─── Rich Text conversion (Unicode formatting) ───────────────────────────────

function mdToRichText(md: string): string {
  let text = preprocess(md)
  const { text: escaped, restore } = handleEscapes(text)
  text = escaped

  const { cleaned, footnotes } = extractFootnotes(text)
  text = cleaned

  // Code blocks → monospace unicode
  text = text.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code: string) => {
    return code.trim().split('\n').map((line: string) => '  ' + toMono(line)).join('\n')
  })

  // Inline code → monospace
  text = text.replace(/`([^`]+)`/g, (_, code) => toMono(code))

  // Images → alt text in italic
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt) => alt ? toItalic(`[Image: ${alt}]`) : '')

  // Links → text with URL
  text = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, t, url) => `${t} (${url})`)

  // Auto-links
  text = text.replace(/<(https?:\/\/[^>]+)>/g, '$1')

  // Footnote references
  text = text.replace(/\[\^(\w+)\]/g, (_, id) => {
    const keys = Array.from(footnotes.keys())
    const idx = keys.indexOf(id)
    return idx >= 0 ? `[${idx + 1}]` : ''
  })

  // Headings → bold unicode with decorative markers
  text = text.replace(/^(#{1,6})\s+(.*)$/gm, (_, hashes: string, content: string) => {
    const level = hashes.length
    if (level === 1) return '━━━ ' + toBold(content.toUpperCase()) + ' ━━━'
    if (level === 2) return '── ' + toBold(content) + ' ──'
    return toBold(content)
  })

  // Bold + italic → bold-italic unicode
  text = text.replace(/(\*\*\*|___)(.*?)\1/g, (_, __, content) => toBoldItalic(content))
  // Bold → bold unicode
  text = text.replace(/(\*\*|__)(.*?)\1/g, (_, __, content) => toBold(content))
  // Italic → italic unicode
  text = text.replace(/(\*|_)(.*?)\1/g, (_, __, content) => toItalic(content))

  // Strikethrough → use combining strikethrough
  text = text.replace(/~~(.*?)~~/g, (_, content: string) =>
    content.split('').map(c => c + '\u0336').join('')
  )

  // Blockquotes
  text = text.replace(/^>\s?(.*)$/gm, '┃ $1')

  // Task lists
  text = text.replace(/^(\s*)[-*+]\s+\[x\]\s+/gm, '$1☑ ')
  text = text.replace(/^(\s*)[-*+]\s+\[\s\]\s+/gm, '$1☐ ')

  // Unordered lists
  text = text.replace(/^(\s*)[-*+]\s+/gm, '$1• ')

  // Ordered lists → keep numbers
  text = text.replace(/^(\s*)(\d+)\.\s+/gm, '$1$2. ')

  // Tables → box-drawing characters
  text = text.replace(/^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)*)/gm, (_, headerRow: string, _sep: string, bodyRows: string) => {
    const parseRow = (row: string) => row.split('|').slice(1, -1).map(c => c.trim())
    const headers = parseRow(headerRow)
    const rows = bodyRows.trim().split('\n').filter(Boolean).map(parseRow)
    const allRows = [headers, ...rows]
    const colWidths = headers.map((_, i) => Math.max(...allRows.map(r => (r[i] || '').length), 3))

    const topBorder = '┌' + colWidths.map(w => '─'.repeat(w + 2)).join('┬') + '┐'
    const midBorder = '├' + colWidths.map(w => '─'.repeat(w + 2)).join('┼') + '┤'
    const botBorder = '└' + colWidths.map(w => '─'.repeat(w + 2)).join('┴') + '┘'
    const fmtRow = (r: string[]) => '│' + r.map((c, i) => ' ' + (c || '').padEnd(colWidths[i]) + ' ').join('│') + '│'

    const headerLine = fmtRow(headers.map(h => toBold(h)))
    const bodyLines = rows.map(r => fmtRow(r))
    return [topBorder, headerLine, midBorder, ...bodyLines, botBorder].join('\n')
  })

  // Horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '━'.repeat(40))

  // HTML tags
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<[^>]*>/g, '')

  // Line breaks
  text = text.replace(/ {2,}\n/g, '\n')
  text = text.replace(/\\\n/g, '\n')

  // Footnotes at end
  if (footnotes.size > 0) {
    const fnLines: string[] = ['\n']
    let i = 1
    for (const [, content] of footnotes) {
      fnLines.push(`[${i}] ${toItalic(content)}`)
      i++
    }
    text += fnLines.join('\n')
  }

  text = text.replace(/\n{3,}/g, '\n\n')

  return restore(text).trim()
}

// ─── HTML conversion ──────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function mdToHtml(md: string): string {
  let html = preprocess(md)
  const { text: escaped, restore } = handleEscapes(html)
  html = escaped

  const { cleaned, footnotes } = extractFootnotes(html)
  html = cleaned

  // Code blocks with optional language
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langAttr = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${langAttr}>${escapeHtml(code.trim())}</code></pre>`
  })

  // Inline code (must come before other inline formatting)
  // Temporarily protect inline code
  const inlineCodes: string[] = []
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`)
    return `\u0001IC${inlineCodes.length - 1}\u0001`
  })

  // Tables
  html = html.replace(/^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)*)/gm, (_, headerRow: string, separatorRow: string, bodyRows: string) => {
    const headers = headerRow.split('|').filter((c: string) => c.trim() !== '').map((c: string) => c.trim())
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
      table += `  <th style="text-align:${aligns[i] || 'left'}">${h}</th>\n`
    })
    table += '</tr>\n</thead>\n<tbody>\n'
    rows.forEach((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim() !== '').map((c: string) => c.trim())
      table += '<tr>\n'
      cells.forEach((c: string, i: number) => {
        table += `  <td style="text-align:${aligns[i] || 'left'}">${c}</td>\n`
      })
      table += '</tr>\n'
    })
    table += '</tbody>\n</table>'
    return table
  })

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

  // Links
  html = html.replace(/\[([^\]]*)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Auto-links
  html = html.replace(/<(https?:\/\/[^>]+)>/g, '<a href="$1">$1</a>')

  // Footnote references
  html = html.replace(/\[\^(\w+)\]/g, (_, id) => {
    const keys = Array.from(footnotes.keys())
    const idx = keys.indexOf(id)
    return idx >= 0 ? `<sup><a href="#fn-${id}" id="fnref-${id}">[${idx + 1}]</a></sup>` : ''
  })

  // Headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  // Horizontal rules
  html = html.replace(/^[-]{3,}\s*$/gm, '<hr />')
  html = html.replace(/^[*]{3,}\s*$/gm, '<hr />')
  html = html.replace(/^[_]{3,}\s*$/gm, '<hr />')

  // Bold + italic
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

  // Blockquotes (merge consecutive)
  html = html.replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n')

  // Task list items
  html = html.replace(/^(\s*)[-*+]\s+\[x\]\s+(.+)$/gm, '$1<li class="task-done"><input type="checkbox" checked disabled /> $2</li>')
  html = html.replace(/^(\s*)[-*+]\s+\[\s\]\s+(.+)$/gm, '$1<li class="task-todo"><input type="checkbox" disabled /> $2</li>')

  // Unordered list items
  html = html.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li>$1</li>')

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[\s>].*<\/li>\n?)+)/g, '<ul>\n$1</ul>')

  // Ordered list items
  html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li>$1</li>')
  // Wrap remaining consecutive <li> not inside <ul> as <ol>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, (match) => {
    if (match.includes('<ul>')) return match
    return `<ol>\n${match}</ol>`
  })

  // Line breaks
  html = html.replace(/ {2,}\n/g, '<br />\n')
  html = html.replace(/\\\n/g, '<br />\n')

  // Paragraphs for remaining lines
  const lines = html.split('\n')
  const result: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { result.push(''); continue }
    if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|table|thead|tbody|tr|th|td|div|img|input|sup)/.test(trimmed)) {
      result.push(trimmed)
    } else if (trimmed.startsWith('<')) {
      result.push(trimmed)
    } else {
      result.push(`<p>${trimmed}</p>`)
    }
  }
  html = result.join('\n')

  // Add footnote section
  if (footnotes.size > 0) {
    html += '\n<hr />\n<section class="footnotes">\n<ol>\n'
    for (const [id, content] of footnotes) {
      html += `  <li id="fn-${id}">${content} <a href="#fnref-${id}">↩</a></li>\n`
    }
    html += '</ol>\n</section>'
  }

  // Restore inline codes
  html = html.replace(/\u0001IC(\d+)\u0001/g, (_, idx) => inlineCodes[parseInt(idx)])

  html = html.replace(/\n{3,}/g, '\n\n')

  return restore(html).trim()
}

// ─── Stats helpers ────────────────────────────────────────────────────────────

function countWords(text: string): number {
  const t = text.trim()
  if (!t) return 0
  return t.split(/\s+/).filter(Boolean).length
}

function countLines(text: string): number {
  if (!text) return 0
  return text.split('\n').length
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

// ─── Component ────────────────────────────────────────────────────────────────

type OutputMode = 'plain' | 'rich' | 'html'

const MODE_LABELS: Record<OutputMode, string> = {
  plain: 'Plain Text',
  rich: 'Rich Text',
  html: 'HTML',
}

export default function MarkdownToTextTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<OutputMode>('plain')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Reactive conversion
  const outputs = useMemo(() => ({
    plain: input ? mdToPlainText(input) : '',
    rich: input ? mdToRichText(input) : '',
    html: input ? mdToHtml(input) : '',
  }), [input])

  const current = outputs[mode]

  // Stats
  const inputWords = useMemo(() => countWords(input), [input])
  const inputChars = input.length
  const inputLines = useMemo(() => countLines(input), [input])
  const outputWords = useMemo(() => countWords(current), [current])
  const outputChars = current.length
  const reductionPct = inputChars > 0 ? Math.round(((inputChars - outputChars) / inputChars) * 100) : 0

  // File download settings
  const downloadExt = mode === 'html' ? 'html' : mode === 'rich' ? 'rtf' : 'txt'
  const downloadMime = mode === 'html' ? 'text/html' : 'text/plain'
  const downloadFilename = `converted.${downloadExt}`

  // Paste from clipboard
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) setInput(text)
    } catch {
      // Clipboard API may fail silently in some browsers
    }
  }, [])

  // File upload
  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') setInput(text)
    }
    reader.readAsText(file)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [handleFile])

  // Drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  // Load example
  const handleLoadExample = useCallback(() => {
    setInput(EXAMPLE_MARKDOWN)
  }, [])

  // Clear
  const handleClear = useCallback(() => {
    setInput('')
  }, [])

  // Close dropdown on outside click
  const handleDropdownBlur = useCallback(() => {
    setTimeout(() => setDropdownOpen(false), 150)
  }, [])

  return (
    <ToolPage
      title="Markdown Converter"
      description="Convert Markdown to plain text, rich text, or HTML instantly. Perfect for cleaning up AI-generated content — runs entirely in your browser."
      category="markdown"
      categoryLabel="Markdown Tools"
      slug="markdown-to-text"
      helpContent={
        <>
          <h2>What is Markdown Converter?</h2>
          <p>
            Markdown Converter is a free, browser-based tool that transforms Markdown-formatted text into three distinct output formats: plain text, rich text with Unicode formatting, and clean HTML. Whether you are working with AI-generated responses, GitHub README files, technical documentation, or blog drafts, this converter strips away or transforms the Markdown syntax so your content is ready for any destination — emails, presentations, CMS platforms, or plain text editors.
          </p>
          <p>
            Unlike basic converters that only handle headings and bold text, this tool supports the full Markdown specification including fenced code blocks with language hints, tables with column alignment, task lists with checkboxes, footnotes with back-references, blockquotes, nested lists, images, links, strikethrough, and horizontal rules. The plain text mode produces clean, readable output with aligned tables and numbered footnotes. The rich text mode uses Unicode mathematical symbols to preserve bold, italic, and monospace formatting in environments that do not support Markdown. The HTML mode generates semantic, standards-compliant markup ready for web publishing.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste your Markdown content into the input area on the left, use the Paste from Clipboard button, upload a .md or .txt file, or click Load Example to see a sample document.</li>
            <li>The output updates instantly in real time as you type or paste. No button click is required.</li>
            <li>Use the output format dropdown above the output panel to switch between Plain Text, Rich Text, and HTML modes.</li>
            <li>Review the stats bar between the panels to see word counts, character counts, and the size reduction percentage.</li>
            <li>Copy the output to your clipboard with the Copy button, download it as a file with the Download button, or clear everything to start fresh.</li>
          </ol>

          <h2>Tips for Best Results</h2>
          <ul>
            <li>Use Plain Text mode when pasting into emails, Slack messages, or any system that does not render formatting. Tables are converted to aligned columns, and footnotes appear as numbered references at the bottom.</li>
            <li>Use Rich Text mode for social media posts, messaging apps, or anywhere Unicode characters are supported. Bold and italic formatting is preserved visually without any Markdown syntax.</li>
            <li>Use HTML mode when you need the content for a web page, blog post, or CMS. The output includes proper semantic tags with class attributes for code blocks and table alignment styles.</li>
            <li>The Load Example button demonstrates every supported Markdown feature — try it to understand what each output mode produces.</li>
            <li>All processing happens entirely in your browser. No data is sent to any server, making this tool safe for confidential documents, internal wikis, and private notes.</li>
          </ul>
        </>
      }
      faqs={[
        {
          question: 'What Markdown features does this converter support?',
          answer: 'This converter supports the complete Markdown specification including headings (h1-h6), bold, italic, bold-italic, strikethrough, inline code, fenced code blocks with language hints, links, images, blockquotes, ordered and unordered lists, task lists with checkboxes, tables with column alignment, horizontal rules, footnotes with back-references, auto-links, escaped characters, and HTML tag stripping.',
        },
        {
          question: 'What is the difference between Plain Text, Rich Text, and HTML output?',
          answer: 'Plain Text strips all formatting syntax and produces clean readable text suitable for emails and plain text editors. Rich Text preserves visual formatting using Unicode mathematical symbols (bold, italic, monospace) that work in social media and messaging apps. HTML converts Markdown into proper semantic HTML tags ready for web pages and CMS platforms.',
        },
        {
          question: 'Is my data private when using this tool?',
          answer: 'Yes. All Markdown processing happens entirely in your browser using JavaScript. Your content is never uploaded to any server, making this tool completely safe for sensitive documents, internal documentation, and private notes.',
        },
        {
          question: 'Can I upload a Markdown file instead of pasting text?',
          answer: 'Yes. Click the Upload .md button or drag and drop any .md, .txt, or .markdown file onto the input area. The file contents will be loaded into the editor and converted instantly. You can also use the Paste from Clipboard button to paste content directly from your clipboard.',
        },
      ]}
    >
      {/* ── Action Bar ── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={handlePasteFromClipboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Paste from Clipboard
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload .md
        </button>
        <button
          onClick={handleLoadExample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          Load Example
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt,.markdown"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* ── Main Panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Markdown Input</span>
          </div>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative rounded-lg transition-colors ${dragOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
          >
            {dragOver && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5">
                <div className="text-sm font-medium text-primary">Drop your file here</div>
              </div>
            )}
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder="Paste your Markdown here, or drag & drop a .md file..."
              rows={16}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div>
          <div className="flex items-center justify-between mb-2">
            {/* Dropdown selector */}
            <div className="relative" ref={dropdownRef} onBlur={handleDropdownBlur}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-border bg-card hover:bg-muted transition-colors"
              >
                {MODE_LABELS[mode]}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 z-20 min-w-[140px] rounded-md border border-border bg-card shadow-lg">
                  {(['plain', 'rich', 'html'] as OutputMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); setDropdownOpen(false) }}
                      className={`block w-full text-left px-3 py-2 text-xs font-medium hover:bg-muted transition-colors ${mode === m ? 'text-primary bg-muted/50' : 'text-foreground'}`}
                    >
                      {MODE_LABELS[m]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-1.5">
              {current && <CopyButton text={current} />}
              {outputs.html && <CopyRichTextButton html={outputs.html} />}
              {current && <DownloadButton content={current} filename={downloadFilename} mimeType={downloadMime} />}
            </div>
          </div>
          <ToolTextarea
            value={current}
            readOnly
            placeholder="Output will appear here..."
            rows={16}
          />
        </div>
      </div>

      {/* ── Stats Bar ── */}
      {input && (
        <div className="mt-4 px-4 py-2.5 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            <span className="font-medium text-foreground">Input:</span>{' '}
            {formatNumber(inputWords)} words, {formatNumber(inputChars)} chars, {formatNumber(inputLines)} lines
          </span>
          <span className="hidden sm:inline text-muted-foreground/50">→</span>
          <span>
            <span className="font-medium text-foreground">Output:</span>{' '}
            {formatNumber(outputWords)} words, {formatNumber(outputChars)} chars
            {reductionPct > 0 && (
              <span className="ml-1.5 text-green-600 dark:text-green-400">({reductionPct}% reduction)</span>
            )}
            {reductionPct < 0 && (
              <span className="ml-1.5 text-yellow-600 dark:text-yellow-400">({Math.abs(reductionPct)}% larger)</span>
            )}
          </span>
        </div>
      )}

      {/* ── Bottom Action Bar ── */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {current && <CopyButton text={current} />}
        {outputs.html && <CopyRichTextButton html={outputs.html} />}
        {current && <DownloadButton content={current} filename={downloadFilename} mimeType={downloadMime} />}
        {current && mode === 'html' && <PdfDownloadButton contentHtml={current} filename="markdown-converted.pdf" />}
        {input && <ClearButton onClear={handleClear} />}
      </div>
    </ToolPage>
  )
}
