'use client'

import { useState, useMemo, useRef, useEffect, useCallback, type KeyboardEvent, type DragEvent, type ChangeEvent } from 'react'
import { ToolPage, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  Link2, ImageIcon, Code, CodeSquare, Quote, List, ListOrdered,
  ListChecks, Table, Minus, Upload, FileDown, Copy, Check, FileText
} from 'lucide-react'

// ─── localStorage key ───────────────────────────────────────────────
const STORAGE_KEY = 'utilsnow-md-editor'

// ─── Default content ────────────────────────────────────────────────
const DEFAULT_MD = `# Welcome to the Markdown Editor

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
`

// ─── markdownToHtml (unchanged) ─────────────────────────────────────
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

  // Task lists (before regular lists)
  html = html.replace(/^[\s]*-\s+\[x\]\s+(.+)$/gm, '<li><input type="checkbox" checked disabled /> $1</li>')
  html = html.replace(/^[\s]*-\s+\[\s\]\s+(.+)$/gm, '<li><input type="checkbox" disabled /> $1</li>')

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

// ─── Stats helper ───────────────────────────────────────────────────
function getStats(text: string) {
  const chars = text.length
  const lines = text ? text.split('\n').length : 0
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  return { words, chars, lines }
}

// ─── Component ──────────────────────────────────────────────────────
export default function MarkdownEditorTool() {
  const [markdown, setMarkdown] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [copiedMd, setCopiedMd] = useState(false)
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Hydrate from localStorage on mount ────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      setMarkdown(saved !== null ? saved : DEFAULT_MD)
    } catch {
      setMarkdown(DEFAULT_MD)
    }
    setHydrated(true)
  }, [])

  // ── Auto-save to localStorage every 2 seconds ────────────────────
  useEffect(() => {
    if (!hydrated) return
    const timer = setInterval(() => {
      try {
        localStorage.setItem(STORAGE_KEY, markdown)
      } catch { /* quota exceeded – silently skip */ }
    }, 2000)
    return () => clearInterval(timer)
  }, [markdown, hydrated])

  const renderedHtml = useMemo(() => markdownToHtml(markdown), [markdown])
  const stats = useMemo(() => getStats(markdown), [markdown])

  // ── Cursor helpers ────────────────────────────────────────────────
  const getTextarea = useCallback(() => textareaRef.current, [])

  /** Replace the textarea value, set cursor, and keep React in sync */
  const applyEdit = useCallback((newValue: string, cursorPos: number) => {
    setMarkdown(newValue)
    // Restore cursor after React re-renders
    requestAnimationFrame(() => {
      const ta = getTextarea()
      if (!ta) return
      ta.focus()
      ta.setSelectionRange(cursorPos, cursorPos)
    })
  }, [getTextarea])

  /** Wrap the current selection (or insert placeholder) with prefix/suffix */
  const wrapSelection = useCallback((prefix: string, suffix: string, placeholder: string) => {
    const ta = getTextarea()
    if (!ta) return
    const { selectionStart: start, selectionEnd: end, value } = ta
    const selected = value.slice(start, end)
    const text = selected || placeholder
    const before = value.slice(0, start)
    const after = value.slice(end)
    const newValue = before + prefix + text + suffix + after
    const cursorEnd = start + prefix.length + text.length
    setMarkdown(newValue)
    requestAnimationFrame(() => {
      ta.focus()
      if (selected) {
        ta.setSelectionRange(start + prefix.length, cursorEnd)
      } else {
        ta.setSelectionRange(start + prefix.length, cursorEnd)
      }
    })
  }, [getTextarea])

  /** Insert text at cursor position */
  const insertAtCursor = useCallback((text: string) => {
    const ta = getTextarea()
    if (!ta) return
    const { selectionStart: start, value } = ta
    const before = value.slice(0, start)
    const after = value.slice(ta.selectionEnd)
    const newValue = before + text + after
    const cursorPos = start + text.length
    applyEdit(newValue, cursorPos)
  }, [getTextarea, applyEdit])

  /** Prefix the current line(s) with a string (for headings, quotes, lists) */
  const prefixLine = useCallback((prefix: string) => {
    const ta = getTextarea()
    if (!ta) return
    const { selectionStart: start, selectionEnd: end, value } = ta
    // Find the start of the current line
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineEnd = value.indexOf('\n', end)
    const actualEnd = lineEnd === -1 ? value.length : lineEnd
    const lineContent = value.slice(lineStart, actualEnd)

    // If the line already has a heading prefix, remove it first
    const stripped = lineContent.replace(/^#{1,6}\s*/, '')
    const newLine = prefix + stripped
    const before = value.slice(0, lineStart)
    const after = value.slice(actualEnd)
    const newValue = before + newLine + after
    const cursorPos = lineStart + newLine.length
    applyEdit(newValue, cursorPos)
  }, [getTextarea, applyEdit])

  // ── Toolbar actions ───────────────────────────────────────────────
  const doBold = useCallback(() => wrapSelection('**', '**', 'bold'), [wrapSelection])
  const doItalic = useCallback(() => wrapSelection('*', '*', 'italic'), [wrapSelection])
  const doStrikethrough = useCallback(() => wrapSelection('~~', '~~', 'strikethrough'), [wrapSelection])
  const doInlineCode = useCallback(() => wrapSelection('`', '`', 'code'), [wrapSelection])
  const doLink = useCallback(() => wrapSelection('[', '](url)', 'text'), [wrapSelection])
  const doImage = useCallback(() => insertAtCursor('![alt text](image-url)'), [insertAtCursor])
  const doCodeBlock = useCallback(() => insertAtCursor('\n```\ncode here\n```\n'), [insertAtCursor])
  const doQuote = useCallback(() => prefixLine('> '), [prefixLine])
  const doBullet = useCallback(() => prefixLine('- '), [prefixLine])
  const doNumbered = useCallback(() => prefixLine('1. '), [prefixLine])
  const doTask = useCallback(() => prefixLine('- [ ] '), [prefixLine])
  const doH1 = useCallback(() => prefixLine('# '), [prefixLine])
  const doH2 = useCallback(() => prefixLine('## '), [prefixLine])
  const doH3 = useCallback(() => prefixLine('### '), [prefixLine])
  const doHR = useCallback(() => insertAtCursor('\n---\n'), [insertAtCursor])
  const doTable = useCallback(() => insertAtCursor('\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n| Cell 7   | Cell 8   | Cell 9   |\n'), [insertAtCursor])

  // ── Keyboard shortcuts ────────────────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    const ctrl = e.ctrlKey || e.metaKey

    if (ctrl && !e.shiftKey && e.key === 'b') {
      e.preventDefault(); doBold()
    } else if (ctrl && !e.shiftKey && e.key === 'i') {
      e.preventDefault(); doItalic()
    } else if (ctrl && !e.shiftKey && e.key === 'k') {
      e.preventDefault(); doLink()
    } else if (ctrl && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
      e.preventDefault(); doCodeBlock()
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Indent
      e.preventDefault()
      const ta = e.currentTarget
      const { selectionStart: start, selectionEnd: end, value } = ta
      const newValue = value.slice(0, start) + '  ' + value.slice(end)
      setMarkdown(newValue)
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(start + 2, start + 2) })
    } else if (e.key === 'Tab' && e.shiftKey) {
      // Unindent — remove up to 2 leading spaces from the current line
      e.preventDefault()
      const ta = e.currentTarget
      const { selectionStart: start, value } = ta
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const linePrefix = value.slice(lineStart, start)
      const spacesToRemove = linePrefix.endsWith('  ') ? 2 : linePrefix.endsWith(' ') ? 1 : 0
      if (spacesToRemove > 0) {
        const newValue = value.slice(0, start - spacesToRemove) + value.slice(start)
        setMarkdown(newValue)
        requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(start - spacesToRemove, start - spacesToRemove) })
      }
    }
  }, [doBold, doItalic, doLink, doCodeBlock])

  // ── File upload ───────────────────────────────────────────────────
  const loadFile = useCallback((file: File) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown') && !file.name.endsWith('.txt') && file.type !== 'text/plain' && file.type !== 'text/markdown') return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      if (typeof text === 'string') setMarkdown(text)
    }
    reader.readAsText(file)
  }, [])

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
    e.target.value = '' // reset so same file can be re-selected
  }, [loadFile])

  // ── Drag & drop ───────────────────────────────────────────────────
  const handleDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) loadFile(file)
  }, [loadFile])

  // ── Export helpers ────────────────────────────────────────────────
  const downloadMd = useCallback(() => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'document.md'; a.click()
    URL.revokeObjectURL(url)
  }, [markdown])

  const downloadHtml = useCallback(() => {
    const fullHtml = `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><title>Document</title></head>\n<body>\n${renderedHtml}\n</body>\n</html>`
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'document.html'; a.click()
    URL.revokeObjectURL(url)
  }, [renderedHtml])

  const copyMarkdown = useCallback(async () => {
    await navigator.clipboard.writeText(markdown)
    setCopiedMd(true); setTimeout(() => setCopiedMd(false), 2000)
  }, [markdown])

  const copyHtml = useCallback(async () => {
    await navigator.clipboard.writeText(renderedHtml)
    setCopiedHtml(true); setTimeout(() => setCopiedHtml(false), 2000)
  }, [renderedHtml])

  // ── Toolbar button component ──────────────────────────────────────
  const ToolbarBtn = ({ onClick, title, children, className }: { onClick: () => void; title: string; children: React.ReactNode; className?: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center h-7 w-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className || ''}`}
    >
      {children}
    </button>
  )

  const ToolbarSep = () => <div className="w-px h-5 bg-border mx-0.5 shrink-0" />

  // Don't render until hydrated (avoids SSR mismatch for localStorage content)
  if (!hydrated) return null

  return (
    <ToolPage
      title="Markdown Editor"
      slug="markdown-editor"
      description="Write Markdown with a live side-by-side preview. Supports headings, bold, italic, code, links, tables, and more."
      category="markdown"
      categoryLabel="Markdown Tools"
      helpContent={
        <div>
          <h2>Online Markdown Editor &mdash; Complete Guide</h2>
          <p>
            This free online Markdown editor gives you a full-featured writing environment with a real-time
            side-by-side preview. Markdown is a lightweight markup language created by John Gruber that lets you
            format text using simple, readable syntax instead of complex HTML tags. It has become the standard
            for writing on the web &mdash; from GitHub README files and developer documentation to blog posts and
            technical wikis.
          </p>
          <h3>Key Features</h3>
          <p>
            <strong>Formatting toolbar:</strong> Click any toolbar button to instantly insert Markdown syntax for
            bold, italic, strikethrough, headings, links, images, inline code, fenced code blocks, block quotes,
            bullet lists, numbered lists, task/checkbox lists, tables, and horizontal rules. The toolbar wraps or
            prefixes your current selection so you never need to remember the exact syntax.
          </p>
          <p>
            <strong>Keyboard shortcuts:</strong> Power users can press <kbd>Ctrl+B</kbd> for bold, <kbd>Ctrl+I</kbd> for
            italic, <kbd>Ctrl+K</kbd> to insert a link, <kbd>Ctrl+Shift+K</kbd> for a fenced code block, <kbd>Tab</kbd>
            to indent by two spaces, and <kbd>Shift+Tab</kbd> to unindent.
          </p>
          <p>
            <strong>Live statistics:</strong> A word, character, and line counter updates in real time as you type,
            helping you stay within word limits for essays, posts, or commit messages.
          </p>
          <p>
            <strong>File import and drag-and-drop:</strong> Open any existing <code>.md</code> or <code>.txt</code> file
            from your computer or simply drag it onto the editor to load its contents instantly.
          </p>
          <p>
            <strong>Export options:</strong> Download your work as a <code>.md</code> Markdown file or as a rendered
            <code>.html</code> file. You can also copy either the raw Markdown or the generated HTML directly to your
            clipboard with a single click.
          </p>
          <p>
            <strong>Auto-save:</strong> Your content is automatically saved to your browser&apos;s local storage every two
            seconds. If you close the tab and come back later, your draft will be right where you left it. No data
            is ever sent to a server &mdash; everything runs 100% in your browser.
          </p>
          <p>
            Whether you are a developer writing documentation, a student drafting notes, or a blogger composing
            a post, this Markdown editor provides all the tools you need in a clean, distraction-free interface.
          </p>
        </div>
      }
      faqs={[
        { question: 'What is Markdown?', answer: 'Markdown is a lightweight markup language that uses simple syntax like # for headings, ** for bold, and * for italic to format plain text into structured documents.' },
        { question: 'What Markdown features does this editor support?', answer: 'This editor supports headings, bold, italic, strikethrough, links, images, code blocks, inline code, blockquotes, ordered and unordered lists, task lists, tables, and horizontal rules. It also offers a formatting toolbar, keyboard shortcuts, and live word/character counts.' },
        { question: 'Where is Markdown commonly used?', answer: 'Markdown is widely used on GitHub, GitLab, Reddit, Stack Overflow, documentation platforms, static site generators, and note-taking apps like Obsidian and Notion.' },
        { question: 'Is my content saved in this editor?', answer: 'Your content is auto-saved to your browser\'s local storage every two seconds, so it persists across page reloads. No data is ever sent to a server. You can also download your work as a .md or .html file at any time.' },
        { question: 'What keyboard shortcuts are available?', answer: 'Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for link, Ctrl+Shift+K for code block, Tab to indent, and Shift+Tab to unindent. On Mac, use Cmd instead of Ctrl.' },
        { question: 'Can I import an existing Markdown file?', answer: 'Yes! Click the "Open File" button to select a .md or .txt file from your computer, or drag and drop a file directly onto the editor area.' },
      ]}
    >
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt,text/plain,text/markdown" className="hidden" onChange={handleFileInput} />

      {/* ── Top action row ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
            <Upload className="h-3.5 w-3.5" /> Open File
          </button>
          <CopyButton text={markdown} />
          <DownloadButton content={markdown} filename="document.md" />
        </div>
        <ClearButton onClear={() => setMarkdown('')} />
      </div>

      {/* ── Formatting Toolbar ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 mb-3 rounded-lg border border-border bg-muted/40">
        <ToolbarBtn onClick={doBold} title="Bold (Ctrl+B)"><Bold className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={doItalic} title="Italic (Ctrl+I)"><Italic className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={doStrikethrough} title="Strikethrough"><Strikethrough className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarSep />
        <ToolbarBtn onClick={doH1} title="Heading 1"><Heading1 className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={doH2} title="Heading 2"><Heading2 className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={doH3} title="Heading 3"><Heading3 className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarSep />
        <ToolbarBtn onClick={doLink} title="Link (Ctrl+K)"><Link2 className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={doImage} title="Image"><ImageIcon className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarSep />
        <ToolbarBtn onClick={doInlineCode} title="Inline Code"><Code className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={doCodeBlock} title="Code Block (Ctrl+Shift+K)"><CodeSquare className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarSep />
        <ToolbarBtn onClick={doQuote} title="Blockquote"><Quote className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={doBullet} title="Bullet List"><List className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={doNumbered} title="Numbered List"><ListOrdered className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={doTask} title="Task List"><ListChecks className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarSep />
        <ToolbarBtn onClick={doTable} title="Table"><Table className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={doHR} title="Horizontal Rule"><Minus className="h-3.5 w-3.5" /></ToolbarBtn>
      </div>

      {/* ── Editor + Preview ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '500px' }}>
        {/* Editor */}
        <div
          className="flex flex-col"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Markdown</div>
          <div className={`relative flex-1 ${isDragging ? 'ring-2 ring-primary rounded-lg' : ''}`}>
            {isDragging && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-primary/5 border-2 border-dashed border-primary pointer-events-none">
                <span className="text-sm font-medium text-primary">Drop .md file here</span>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 w-full h-full rounded-lg border border-input bg-tool-bg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              style={{ minHeight: '500px' }}
              placeholder="Write your markdown here..."
              spellCheck={false}
            />
          </div>
          {/* Stats bar */}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground px-1">
            <span>{stats.words} words</span>
            <span className="text-border">&middot;</span>
            <span>{stats.chars} characters</span>
            <span className="text-border">&middot;</span>
            <span>{stats.lines} lines</span>
          </div>
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

      {/* ── Export bar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-2">Export</span>
        <button onClick={downloadMd} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
          <FileDown className="h-3.5 w-3.5" /> Download .md
        </button>
        <button onClick={downloadHtml} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
          <FileText className="h-3.5 w-3.5" /> Download .html
        </button>
        <button onClick={copyMarkdown} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
          {copiedMd ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy Markdown</>}
        </button>
        <button onClick={copyHtml} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
          {copiedHtml ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy HTML</>}
        </button>
      </div>
    </ToolPage>
  )
}
