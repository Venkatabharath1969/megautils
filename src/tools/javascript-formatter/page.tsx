'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function formatJs(js: string, indentSize: number = 2): string {
  const pad = ' '.repeat(indentSize)
  let result = ''
  let indent = 0
  let inString: string | null = null
  let inLineComment = false
  let inBlockComment = false
  let inTemplate = false
  let templateDepth = 0
  let i = 0

  const src = js.trim()

  while (i < src.length) {
    const ch = src[i]
    const next = i + 1 < src.length ? src[i + 1] : ''
    const prev = i > 0 ? src[i - 1] : ''

    // Line comment
    if (inLineComment) {
      result += ch
      if (ch === '\n') inLineComment = false
      i++
      continue
    }

    // Block comment
    if (inBlockComment) {
      result += ch
      if (ch === '*' && next === '/') {
        result += '/'
        inBlockComment = false
        i += 2
        continue
      }
      i++
      continue
    }

    // Template literal
    if (inTemplate) {
      result += ch
      if (ch === '`' && prev !== '\\') {
        inTemplate = false
      } else if (ch === '$' && next === '{') {
        templateDepth++
      } else if (ch === '}' && templateDepth > 0) {
        templateDepth--
      }
      i++
      continue
    }

    // String
    if (inString) {
      result += ch
      if (ch === inString && prev !== '\\') inString = null
      i++
      continue
    }

    // Start string or template
    if (ch === '`') {
      inTemplate = true
      result += ch
      i++
      continue
    }
    if (ch === '"' || ch === "'") {
      inString = ch
      result += ch
      i++
      continue
    }

    // Start comments
    if (ch === '/' && next === '/') {
      inLineComment = true
      result += '//'
      i += 2
      continue
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true
      result += '/*'
      i += 2
      continue
    }

    // Opening braces
    if (ch === '{' || ch === '[') {
      result = result.trimEnd()
      result += ' ' + ch + '\n'
      indent++
      i++
      while (i < src.length && /\s/.test(src[i])) i++
      result += pad.repeat(indent)
      continue
    }

    // Closing braces
    if (ch === '}' || ch === ']') {
      indent = Math.max(0, indent - 1)
      result = result.trimEnd()
      result += '\n' + pad.repeat(indent) + ch
      i++
      // Check for else, catch, finally
      let lookahead = i
      while (lookahead < src.length && /\s/.test(src[lookahead])) lookahead++
      const rest = src.slice(lookahead)
      if (rest.startsWith('else') || rest.startsWith('catch') || rest.startsWith('finally')) {
        result += ' '
      }
      continue
    }

    // Semicolons
    if (ch === ';') {
      result += ';\n'
      i++
      while (i < src.length && /\s/.test(src[i])) i++
      if (i < src.length && src[i] !== '}' && src[i] !== ']') {
        result += pad.repeat(indent)
      }
      continue
    }

    // Opening parens
    if (ch === '(') {
      result += ch
      i++
      continue
    }

    // Closing parens
    if (ch === ')') {
      result += ch
      i++
      continue
    }

    // Comma
    if (ch === ',') {
      result += ', '
      i++
      while (i < src.length && /\s/.test(src[i])) i++
      continue
    }

    // Collapse whitespace
    if (/\s/.test(ch)) {
      if (result.length > 0 && !result.endsWith(' ') && !result.endsWith('\n') && !result.endsWith('(')) {
        result += ' '
      }
      i++
      continue
    }

    // Regular character - ensure indentation at start of new line
    if (result.endsWith('\n')) {
      result += pad.repeat(indent)
    }
    result += ch
    i++
  }

  return result
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n +\n/g, '\n\n')
    .trim()
}

function minifyJs(js: string): string {
  // Remove comments
  let result = ''
  let inString: string | null = null
  let inTemplate = false
  let i = 0

  while (i < js.length) {
    const ch = js[i]
    const next = js[i + 1]
    const prev = i > 0 ? js[i - 1] : ''

    if (inTemplate) {
      result += ch
      if (ch === '`' && prev !== '\\') inTemplate = false
      i++
      continue
    }

    if (inString) {
      result += ch
      if (ch === inString && prev !== '\\') inString = null
      i++
      continue
    }

    if (ch === '`') { inTemplate = true; result += ch; i++; continue }
    if (ch === '"' || ch === "'") { inString = ch; result += ch; i++; continue }

    if (ch === '/' && next === '/') {
      // Skip line comment
      while (i < js.length && js[i] !== '\n') i++
      continue
    }
    if (ch === '/' && next === '*') {
      i += 2
      while (i < js.length && !(js[i] === '*' && js[i + 1] === '/')) i++
      i += 2
      continue
    }

    result += ch
    i++
  }

  return result.replace(/\s+/g, ' ').replace(/\s*([{}();,:<>=+\-*/&|!?])\s*/g, '$1').trim()
}

export default function JavascriptFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)

  const format = () => {
    try {
      if (!input.trim()) throw new Error('Please enter JavaScript code')
      setOutput(formatJs(input, indent))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error formatting JavaScript')
      setOutput('')
    }
  }

  const minify = () => {
    try {
      if (!input.trim()) throw new Error('Please enter JavaScript code')
      setOutput(minifyJs(input))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error minifying JavaScript')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="JavaScript Formatter"
      description="Format, beautify, and minify JavaScript code"
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>JavaScript Formatter is a free browser-based tool that lets you format and beautify JavaScript code with proper indentation, consistent spacing, and clean structure. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when cleaning up minified JS, standardizing code style, or improving readability of unfamiliar JavaScript code. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For large inputs, the tool processes data efficiently in your browser but very large files may take a moment.</li>
            <li>Use keyboard shortcuts like Ctrl+A to select all output text before copying.</li>
            <li>The tool preserves your data types and structure during conversion or formatting.</li>
            <li>Compare the formatted output with the original to verify no data was altered.</li>
            <li>All processing is client-side — safe for use with proprietary or sensitive code.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is the difference between formatting and minifying JavaScript?', answer: 'Formatting (beautifying) adds proper indentation and line breaks to make code readable, while minifying removes all unnecessary whitespace and comments to reduce file size for production.' },
        { question: 'Does this JavaScript formatter modify my code logic?', answer: 'No, the formatter only changes whitespace, indentation, and line breaks. Your code logic, variables, and functionality remain completely unchanged.' },
        { question: 'What indent size should I use for JavaScript?', answer: 'Two spaces is the most common convention in the JavaScript community and is used by most popular style guides like Airbnb and StandardJS, though four spaces is also widely accepted.' },
        { question: 'Can I format minified JavaScript back to readable code?', answer: 'Yes, paste your minified JavaScript into the input and click "Format / Beautify" to restore proper indentation and line breaks for readability.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">JavaScript Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder='Paste JavaScript here...\nfunction hello(){console.log("world")}' rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Formatted Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.js" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Formatted JavaScript will appear here..." rows={14} />
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
