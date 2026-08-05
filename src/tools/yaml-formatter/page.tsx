'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function parseYaml(text: string): unknown {
  const lines = text.split('\n')
  return parseYamlLines(lines, 0, 0).value
}

function parseYamlLines(lines: string[], startIdx: number, baseIndent: number): { value: unknown; nextIdx: number } {
  const result: Record<string, unknown> = {}
  let i = startIdx
  let isArray = false
  const arrayResult: unknown[] = []

  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue }

    const indent = line.search(/\S/)
    if (indent < baseIndent) break

    if (indent > baseIndent && i === startIdx) {
      // Skip lines that don't match expected indent
    }

    const trimmed = line.trim()

    // Array item
    if (trimmed.startsWith('- ')) {
      isArray = true
      const content = trimmed.slice(2).trim()
      if (content.includes(': ')) {
        const colonIdx = content.indexOf(': ')
        const key = content.slice(0, colonIdx).trim()
        const val = content.slice(colonIdx + 2).trim()
        const obj: Record<string, unknown> = {}
        obj[key] = parseScalar(val)
        // Check for more keys at deeper indent
        let j = i + 1
        while (j < lines.length) {
          const nextLine = lines[j]
          if (nextLine.trim() === '' || nextLine.trim().startsWith('#')) { j++; continue }
          const nextIndent = nextLine.search(/\S/)
          if (nextIndent <= indent) break
          const nextTrimmed = nextLine.trim()
          if (nextTrimmed.includes(': ')) {
            const ci = nextTrimmed.indexOf(': ')
            obj[nextTrimmed.slice(0, ci).trim()] = parseScalar(nextTrimmed.slice(ci + 2).trim())
          }
          j++
        }
        arrayResult.push(Object.keys(obj).length === 1 && !lines[i + 1]?.trim().match(/^\w/) ? obj : obj)
        i = j
        continue
      }
      arrayResult.push(parseScalar(content))
      i++
      continue
    }

    // Key-value pair
    const colonMatch = trimmed.match(/^([^:]+):\s*(.*)$/)
    if (colonMatch) {
      const key = colonMatch[1].trim()
      const val = colonMatch[2].trim()

      if (val === '' || val === '|' || val === '>') {
        // Nested block
        const nextNonEmpty = findNextNonEmptyLine(lines, i + 1)
        if (nextNonEmpty < lines.length) {
          const nextIndent = lines[nextNonEmpty].search(/\S/)
          if (nextIndent > indent) {
            if (val === '|' || val === '>') {
              // Multiline string
              let str = ''
              let j = i + 1
              while (j < lines.length) {
                const nl = lines[j]
                if (nl.trim() === '') { str += '\n'; j++; continue }
                if (nl.search(/\S/) <= indent) break
                str += (str && val === '|' ? '\n' : str ? ' ' : '') + nl.trim()
                j++
              }
              result[key] = str
              i = j
            } else {
              const nested = parseYamlLines(lines, nextNonEmpty, nextIndent)
              result[key] = nested.value
              i = nested.nextIdx
            }
            continue
          }
        }
        result[key] = null
        i++
      } else {
        result[key] = parseScalar(val)
        i++
      }
      continue
    }

    i++
  }

  return { value: isArray ? arrayResult : result, nextIdx: i }
}

function findNextNonEmptyLine(lines: string[], start: number): number {
  for (let i = start; i < lines.length; i++) {
    if (lines[i].trim() !== '' && !lines[i].trim().startsWith('#')) return i
  }
  return lines.length
}

function parseScalar(val: string): unknown {
  if (val === 'true' || val === 'True' || val === 'TRUE') return true
  if (val === 'false' || val === 'False' || val === 'FALSE') return false
  if (val === 'null' || val === 'Null' || val === 'NULL' || val === '~') return null
  if (/^-?\d+$/.test(val)) return parseInt(val, 10)
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val)
  // Remove quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1)
  }
  return val
}

function toYaml(value: unknown, indent: number = 0): string {
  const prefix = '  '.repeat(indent)

  if (value === null || value === undefined) return prefix + 'null\n'
  if (typeof value === 'boolean') return prefix + (value ? 'true' : 'false') + '\n'
  if (typeof value === 'number') return prefix + String(value) + '\n'
  if (typeof value === 'string') {
    if (value.includes('\n') || value.includes(': ') || value.includes('#') || /^[\[\]{}&*!|>'"%@`]/.test(value)) {
      return prefix + JSON.stringify(value) + '\n'
    }
    return prefix + value + '\n'
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return prefix + '[]\n'
    let out = ''
    for (const item of value) {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const entries = Object.entries(item as Record<string, unknown>)
        if (entries.length > 0) {
          const [firstKey, firstVal] = entries[0]
          out += prefix + '- ' + firstKey + ': '
          if (typeof firstVal === 'object' && firstVal !== null) {
            out += '\n' + toYaml(firstVal, indent + 2)
          } else {
            out += formatScalar(firstVal) + '\n'
          }
          for (let i = 1; i < entries.length; i++) {
            const [k, v] = entries[i]
            out += prefix + '  ' + k + ': '
            if (typeof v === 'object' && v !== null) {
              out += '\n' + toYaml(v, indent + 2)
            } else {
              out += formatScalar(v) + '\n'
            }
          }
        } else {
          out += prefix + '- {}\n'
        }
      } else {
        out += prefix + '- ' + formatScalar(item) + '\n'
      }
    }
    return out
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return prefix + '{}\n'
    let out = ''
    for (const [key, val] of entries) {
      if (typeof val === 'object' && val !== null) {
        out += prefix + key + ':\n' + toYaml(val, indent + 1)
      } else {
        out += prefix + key + ': ' + formatScalar(val) + '\n'
      }
    }
    return out
  }

  return prefix + String(value) + '\n'
}

function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    if (value.includes(': ') || value.includes('#') || /^[\[\]{}&*!|>'"%@`]/.test(value) || value === '') {
      return JSON.stringify(value)
    }
    return value
  }
  return String(value)
}

export default function YamlFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const format = () => {
    try {
      setError('')
      if (!input.trim()) { setOutput(''); return }
      const parsed = parseYaml(input)
      setOutput(toYaml(parsed).trimEnd())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid YAML input')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="YAML Formatter"
      description="Format and beautify YAML with consistent indentation"
      category="developer"
      categoryLabel="Developer Tools"
      faqs={[
        { question: 'Why is indentation so important in YAML?', answer: 'YAML uses indentation to define structure and hierarchy instead of brackets or tags, so incorrect indentation will change the meaning of your data or cause parsing errors.' },
        { question: 'How many spaces should I use for YAML indentation?', answer: 'Two spaces per level is the most common convention in YAML files. Tabs are not allowed in YAML, so spaces must be used for indentation.' },
        { question: 'Can this tool fix broken YAML indentation?', answer: 'Yes, paste your YAML and click "Format" to parse it and regenerate it with clean, consistent two-space indentation throughout the document.' },
        { question: 'What is the difference between YAML and JSON?', answer: 'YAML is a superset of JSON that uses indentation instead of braces, supports comments, and is generally more human-readable, making it popular for configuration files.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">YAML Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'name: John\nage: 30\nhobbies:\n  - reading\n  - coding'} rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Formatted Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.yaml" mimeType="text/yaml" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Formatted YAML will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <button onClick={format} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Format YAML
      </button>
    </ToolPage>
  )
}
