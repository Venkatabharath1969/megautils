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
    <ToolPage title="JSON Validator" description="Validate JSON with detailed error messages and statistics" category="developer" categoryLabel="Developer Tools">
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
