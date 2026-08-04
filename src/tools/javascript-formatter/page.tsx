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
    <ToolPage title="JavaScript Formatter" description="Format, beautify, and minify JavaScript code" category="developer" categoryLabel="Developer Tools">
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
