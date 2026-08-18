'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function formatCss(css: string, indentSize: number = 2): string {
  const pad = ' '.repeat(indentSize)
  let result = ''
  let indent = 0
  let inString: string | null = null
  let inComment = false
  let i = 0

  // Strip existing excessive whitespace
  const src = css.trim()

  while (i < src.length) {
    const ch = src[i]
    const next = src[i + 1]

    // Handle strings
    if (inString) {
      result += ch
      if (ch === inString && src[i - 1] !== '\\') inString = null
      i++
      continue
    }

    // Handle block comments
    if (inComment) {
      result += ch
      if (ch === '*' && next === '/') {
        result += '/'
        inComment = false
        i += 2
        continue
      }
      i++
      continue
    }

    // Start comment
    if (ch === '/' && next === '*') {
      result += '\n' + pad.repeat(indent) + '/*'
      inComment = true
      i += 2
      continue
    }

    // Start string
    if (ch === '"' || ch === "'") {
      result += ch
      inString = ch
      i++
      continue
    }

    // Opening brace
    if (ch === '{') {
      result = result.trimEnd()
      result += ' {\n'
      indent++
      i++
      // Skip whitespace after brace
      while (i < src.length && /\s/.test(src[i])) i++
      continue
    }

    // Closing brace
    if (ch === '}') {
      indent = Math.max(0, indent - 1)
      result = result.trimEnd()
      result += '\n' + pad.repeat(indent) + '}\n\n'
      i++
      // Skip whitespace after brace
      while (i < src.length && /\s/.test(src[i])) i++
      continue
    }

    // Semicolon
    if (ch === ';') {
      result = result.trimEnd()
      result += ';\n'
      i++
      // Skip whitespace after semicolon
      while (i < src.length && /\s/.test(src[i])) i++
      // Add indent for next property
      if (i < src.length && src[i] !== '}') {
        result += pad.repeat(indent)
      }
      continue
    }

    // Whitespace
    if (/\s/.test(ch)) {
      // Collapse whitespace
      if (result.length > 0 && !result.endsWith(' ') && !result.endsWith('\n')) {
        result += ' '
      }
      i++
      continue
    }

    // Regular character: ensure indentation at start of new line
    if (result.endsWith('\n') || result === '') {
      result += pad.repeat(indent)
    }
    result += ch
    i++
  }

  // Clean up extra blank lines
  return result.replace(/\n{3,}/g, '\n\n').trim()
}

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ')             // Collapse whitespace
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*,\s*/g, ',')
    .replace(/;}/g, '}')
    .trim()
}

export default function CssFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)

  const format = () => {
    try {
      setOutput(formatCss(input, indent))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error formatting CSS')
      setOutput('')
    }
  }

  const minify = () => {
    try {
      setOutput(minifyCss(input))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error minifying CSS')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="CSS Formatter"
      description="Format, beautify, and minify CSS stylesheets"
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSS Formatter is a free browser-based tool that lets you format and beautify CSS code with proper indentation, consistent spacing, and organized property ordering. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when cleaning up minified CSS, standardizing code style across teams, or improving CSS readability. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need css formatting.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What does a CSS formatter do?', answer: 'A CSS formatter restructures your stylesheet with consistent indentation, spacing, and line breaks so properties and selectors are easy to scan and edit.' },
        { question: 'Does minifying CSS affect how my website looks?', answer: 'No. Minifying only removes whitespace and comments — the styles applied to your page remain exactly the same.' },
        { question: 'Should I use 2-space or 4-space indentation for CSS?', answer: 'Both are widely used. Two spaces is the most common convention in modern front-end projects, but four spaces can improve readability in deeply nested selectors.' },
        { question: 'Can I format CSS with vendor prefixes and media queries?', answer: 'Yes. This formatter handles all standard CSS syntax including vendor prefixes, media queries, keyframes, and nested rules.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">CSS Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'Paste CSS here...\nbody{color:red;margin:0}'} rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Formatted Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.css" mimeType="text/css" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Formatted CSS will appear here..." rows={14} />
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
        <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
      </div>
    </ToolPage>
  )
}
