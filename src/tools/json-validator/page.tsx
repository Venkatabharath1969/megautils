'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

interface ValidationResult {
  valid: boolean
  error?: string
  errorLine?: number
  errorCol?: number
  stats?: {
    keys: number
    depth: number
    arrays: number
    objects: number
    strings: number
    numbers: number
    booleans: number
    nulls: number
    totalSize: number
  }
}

function countStats(value: unknown, depth: number = 0): { keys: number; depth: number; arrays: number; objects: number; strings: number; numbers: number; booleans: number; nulls: number } {
  let result = { keys: 0, depth, arrays: 0, objects: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0 }

  if (value === null) {
    result.nulls = 1
    return result
  }
  if (typeof value === 'string') {
    result.strings = 1
    return result
  }
  if (typeof value === 'number') {
    result.numbers = 1
    return result
  }
  if (typeof value === 'boolean') {
    result.booleans = 1
    return result
  }
  if (Array.isArray(value)) {
    result.arrays = 1
    for (const item of value) {
      const sub = countStats(item, depth + 1)
      result.keys += sub.keys
      result.depth = Math.max(result.depth, sub.depth)
      result.arrays += sub.arrays
      result.objects += sub.objects
      result.strings += sub.strings
      result.numbers += sub.numbers
      result.booleans += sub.booleans
      result.nulls += sub.nulls
    }
    return result
  }
  if (typeof value === 'object') {
    result.objects = 1
    const entries = Object.entries(value as Record<string, unknown>)
    result.keys = entries.length
    for (const [, val] of entries) {
      const sub = countStats(val, depth + 1)
      result.keys += sub.keys
      result.depth = Math.max(result.depth, sub.depth)
      result.arrays += sub.arrays
      result.objects += sub.objects
      result.strings += sub.strings
      result.numbers += sub.numbers
      result.booleans += sub.booleans
      result.nulls += sub.nulls
    }
    return result
  }
  return result
}

function getErrorPosition(input: string, errorMsg: string): { line: number; col: number } | null {
  // Try to extract position from JSON.parse error messages
  const posMatch = errorMsg.match(/position\s+(\d+)/i)
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10)
    let line = 1
    let col = 1
    for (let i = 0; i < pos && i < input.length; i++) {
      if (input[i] === '\n') { line++; col = 1 }
      else col++
    }
    return { line, col }
  }

  const lineMatch = errorMsg.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  if (lineMatch) {
    return { line: parseInt(lineMatch[1], 10), col: parseInt(lineMatch[2], 10) }
  }

  return null
}

function validateJson(input: string): ValidationResult {
  if (!input.trim()) {
    return { valid: false, error: 'Input is empty' }
  }

  try {
    const parsed = JSON.parse(input)
    const stats = countStats(parsed)

    return {
      valid: true,
      stats: {
        ...stats,
        totalSize: new Blob([input]).size,
      },
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON'
    const pos = getErrorPosition(input, message)
    return {
      valid: false,
      error: message,
      errorLine: pos?.line,
      errorCol: pos?.col,
    }
  }
}

export default function JsonValidatorTool() {
  const [input, setInput] = useState('')
  const [hasValidated, setHasValidated] = useState(false)

  const result = useMemo(() => {
    if (!hasValidated) return null
    return validateJson(input)
  }, [input, hasValidated])

  const clear = () => { setInput(''); setHasValidated(false) }

  return (
    <ToolPage
      title="JSON Validator"
      description="Validate JSON with detailed error messages and statistics"
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>JSON Validator is a free browser-based tool that lets you validate JSON syntax and highlight errors with line numbers and descriptive messages. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when checking JSON before sending to APIs, debugging malformed data, or verifying configuration files. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need json validation.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What are the most common JSON syntax errors?', answer: 'The most common errors are trailing commas after the last item, using single quotes instead of double quotes, missing commas between items, and unquoted keys.' },
        { question: 'Does this validator show where the JSON error is?', answer: 'Yes, when your JSON is invalid, the validator pinpoints the exact line and column number where the parsing error occurred so you can fix it quickly.' },
        { question: 'What statistics does the JSON validator provide?', answer: 'For valid JSON, it shows total keys, max nesting depth, counts of objects, arrays, strings, numbers, booleans, and the overall file size in KB.' },
        { question: 'Can I validate JSON with comments?', answer: 'No, the JSON specification does not allow comments. If your data contains comments, you need to remove them first or use a format like JSONC or JSON5 that supports them.' },
      ]}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">JSON Input</span>
          <ClearButton onClear={clear} />
        </div>
        <ToolTextarea
          value={input}
          onChange={(v) => { setInput(v); setHasValidated(false) }}
          placeholder='Paste JSON to validate...\n{"key": "value"}'
          rows={14}
        />
      </div>

      <button
        onClick={() => setHasValidated(true)}
        className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Validate JSON
      </button>

      {result && (
        <div className="mt-4">
          {result.valid ? (
            <>
              <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
                Valid JSON
              </div>

              {result.stats && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold">{result.stats.keys}</div>
                    <div className="text-xs text-muted-foreground">Total Keys</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold">{result.stats.depth}</div>
                    <div className="text-xs text-muted-foreground">Max Depth</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold">{result.stats.objects}</div>
                    <div className="text-xs text-muted-foreground">Objects</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold">{result.stats.arrays}</div>
                    <div className="text-xs text-muted-foreground">Arrays</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold">{result.stats.strings}</div>
                    <div className="text-xs text-muted-foreground">Strings</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold">{result.stats.numbers}</div>
                    <div className="text-xs text-muted-foreground">Numbers</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold">{result.stats.booleans}</div>
                    <div className="text-xs text-muted-foreground">Booleans</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold">{(result.stats.totalSize / 1024).toFixed(1)} KB</div>
                    <div className="text-xs text-muted-foreground">Size</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">Invalid JSON</div>
              <div className="text-red-600 dark:text-red-400 text-sm font-mono">{result.error}</div>
              {result.errorLine && (
                <div className="text-red-500/70 text-xs mt-2">
                  Error at line {result.errorLine}{result.errorCol ? `, column ${result.errorCol}` : ''}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </ToolPage>
  )
}
