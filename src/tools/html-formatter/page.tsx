'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

const INLINE_ELEMENTS = new Set([
  'a', 'abbr', 'b', 'bdo', 'br', 'cite', 'code', 'dfn', 'em', 'i',
  'img', 'input', 'kbd', 'label', 'mark', 'q', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'var'
])

function formatHtml(html: string, indentStr: string = '  '): string {
  // Normalize whitespace between tags but preserve text
  const stripped = html.replace(/>\s+</g, '><').trim()
  const tokens = stripped.match(/<[^>]+>|[^<]+/g)
  if (!tokens) throw new Error('Could not parse HTML')

  let indent = 0
  const pad = indentStr
  const lines: string[] = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.startsWith('<!')) {
      // Doctype or comment
      lines.push(pad.repeat(indent) + token)
    } else if (token.startsWith('</')) {
      // Closing tag
      indent = Math.max(0, indent - 1)
      const tagName = (token.match(/^<\/(\S+)/) || [])[1]?.toLowerCase() || ''
      if (lines.length > 0 && INLINE_ELEMENTS.has(tagName)) {
        const prev = lines[lines.length - 1]
        if (!prev.trimEnd().endsWith('>') || prev.trim().startsWith('<' + tagName)) {
          lines[lines.length - 1] = prev + token
          continue
        }
      }
      lines.push(pad.repeat(indent) + token)
    } else if (token.startsWith('<')) {
      const tagName = (token.match(/^<(\S+)/) || [])[1]?.toLowerCase() || ''
      if (token.endsWith('/>') || VOID_ELEMENTS.has(tagName)) {
        lines.push(pad.repeat(indent) + token)
      } else {
        lines.push(pad.repeat(indent) + token)
        indent++
      }
    } else {
      // Text content
      const text = token.trim()
      if (text) {
        if (lines.length > 0) {
          lines[lines.length - 1] += text
        } else {
          lines.push(text)
        }
      }
    }
  }

  // Merge text + closing tag onto same line
  const merged: string[] = []
  for (const line of lines) {
    if (merged.length > 0) {
      const prev = merged[merged.length - 1]
      if (!prev.trimEnd().endsWith('>') && line.trim().startsWith('</')) {
        merged[merged.length - 1] = prev + line.trim()
        continue
      }
    }
    merged.push(line)
  }

  return merged.join('\n')
}

function minifyHtml(html: string): string {
  return html
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

export default function HtmlFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState('2')

  const format = () => {
    try {
      const indentStr = indent === 'tab' ? '\t' : ' '.repeat(Number(indent))
      setOutput(formatHtml(input, indentStr))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid HTML')
      setOutput('')
    }
  }

  const minify = () => {
    try {
      setOutput(minifyHtml(input))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error minifying HTML')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="HTML Formatter"
      description="Format, beautify, and minify HTML markup"
      category="developer"
      categoryLabel="Developer Tools"
      faqs={[
        { question: 'What does an HTML formatter do?', answer: 'An HTML formatter adds proper indentation and line breaks to your HTML code, making it easier to read, debug, and maintain without changing how it renders in the browser.' },
        { question: 'Will formatting change how my HTML looks in the browser?', answer: 'No. Formatting only adjusts whitespace and indentation — the visual output in the browser stays identical.' },
        { question: 'What is the difference between beautifying and minifying HTML?', answer: 'Beautifying adds indentation and line breaks for readability, while minifying strips all unnecessary whitespace to reduce file size for faster page loads.' },
        { question: 'Is my HTML data safe when using this tool?', answer: 'Yes. All processing happens locally in your browser. Nothing is uploaded to any server.' },
      ]}
      helpContent={
        <>
          <h2>What is an HTML Formatter?</h2>
          <p>
            An HTML formatter is a tool that takes raw or minified HTML markup and restructures it with consistent indentation,
            proper line breaks, and clean nesting so the code is easy to read and maintain. Whether you are working with a
            single snippet pasted from a CMS or an entire page exported from a build pipeline, formatting reveals the document
            structure at a glance. This is especially valuable when debugging layout issues, reviewing pull requests, or
            onboarding new team members who need to understand a template quickly. The formatter can also work in reverse:
            minifying already-beautified HTML by stripping unnecessary whitespace and line breaks, which reduces file size and
            can improve page-load performance in production environments.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste your raw, minified, or poorly indented HTML into the input panel on the left side of the screen.</li>
            <li>Choose your preferred indentation width from the dropdown — two spaces is the most common convention, but four spaces is also popular.</li>
            <li>Click <strong>Format / Beautify</strong> to produce cleanly indented output, or click <strong>Minify</strong> to collapse everything onto as few characters as possible.</li>
            <li>Review the result in the output panel. Use the <strong>Copy</strong> button to send it to your clipboard or <strong>Download</strong> to save it as a file.</li>
            <li>If you need to start over, click <strong>Clear</strong> to reset both panels.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Always beautify HTML before committing it to version control so that diffs are meaningful and reviewable line by line.</li>
            <li>Use minified HTML in production to reduce bandwidth — even a few kilobytes can matter on high-traffic pages or slow mobile connections.</li>
            <li>When pasting HTML from email builders or WYSIWYG editors, format it first to locate redundant wrapper elements and inline styles that can be cleaned up.</li>
            <li>Pair this formatter with a linter like HTMLHint to catch structural errors such as unclosed tags or missing attributes after formatting.</li>
            <li>If the formatter output looks unexpected, check that your original markup does not contain broken tags or unescaped special characters, which can confuse any parser.</li>
            <li>For templating languages like EJS, Handlebars, or Jinja, format only the static HTML portions — template expressions inside double braces may not parse correctly.</li>
          </ul>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">HTML Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder='Paste HTML here...\n<div><p>Hello</p></div>' rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Formatted Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.html" mimeType="text/html" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Formatted HTML will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button onClick={format} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Format / Beautify
        </button>
        <button onClick={minify} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors border border-border">
          Minify
        </button>
        <select value={indent} onChange={(e) => setIndent(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="tab">Tab</option>
        </select>
      </div>
    </ToolPage>
  )
}
