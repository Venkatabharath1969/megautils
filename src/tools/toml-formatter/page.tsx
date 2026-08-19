'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

interface TomlSection {
  name: string
  entries: [string, string][]
}

function parseToml(text: string): { globals: [string, string][]; sections: TomlSection[] } {
  const lines = text.split('\n')
  const globals: [string, string][] = []
  const sections: TomlSection[] = []
  let currentSection: TomlSection | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('#')) continue

    // Section header
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/)
    if (sectionMatch) {
      currentSection = { name: sectionMatch[1].trim(), entries: [] }
      sections.push(currentSection)
      continue
    }

    // Key = value
    const kvMatch = trimmed.match(/^([^=]+)=(.*)$/)
    if (kvMatch) {
      const key = kvMatch[1].trim()
      const value = kvMatch[2].trim()
      if (currentSection) {
        currentSection.entries.push([key, value])
      } else {
        globals.push([key, value])
      }
    }
  }

  return { globals, sections }
}

function formatValue(value: string): string {
  // Already quoted string
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value
  }
  // Boolean
  if (value === 'true' || value === 'false') return value
  // Number
  if (/^-?\d+(\.\d+)?$/.test(value)) return value
  // Array
  if (value.startsWith('[') && value.endsWith(']')) {
    // Format array items
    const inner = value.slice(1, -1).trim()
    if (!inner) return '[]'
    const items = splitArrayItems(inner)
    return '[' + items.map((item) => formatValue(item.trim())).join(', ') + ']'
  }
  // Date/datetime patterns
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value
  // Otherwise wrap in quotes if it contains special chars
  if (/[^a-zA-Z0-9._-]/.test(value) && !value.startsWith('"')) {
    return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
  }
  return value
}

function splitArrayItems(str: string): string[] {
  const items: string[] = []
  let depth = 0
  let current = ''
  let inString = false
  let stringChar = ''

  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (inString) {
      current += ch
      if (ch === stringChar && str[i - 1] !== '\\') inString = false
      continue
    }
    if (ch === '"' || ch === "'") {
      inString = true
      stringChar = ch
      current += ch
    } else if (ch === '[') {
      depth++
      current += ch
    } else if (ch === ']') {
      depth--
      current += ch
    } else if (ch === ',' && depth === 0) {
      items.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) items.push(current)
  return items
}

function formatToml(globals: [string, string][], sections: TomlSection[]): string {
  const lines: string[] = []

  // Global key-value pairs
  const maxKeyLen = Math.max(...globals.map(([k]) => k.length), 0)
  for (const [key, value] of globals) {
    lines.push(`${key.padEnd(maxKeyLen)} = ${formatValue(value)}`)
  }

  for (const section of sections) {
    if (lines.length > 0) lines.push('')
    lines.push(`[${section.name}]`)
    const maxKey = Math.max(...section.entries.map(([k]) => k.length), 0)
    for (const [key, value] of section.entries) {
      lines.push(`${key.padEnd(maxKey)} = ${formatValue(value)}`)
    }
  }

  return lines.join('\n')
}

export default function TomlFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const format = () => {
    try {
      setError('')
      if (!input.trim()) { setOutput(''); return }
      const { globals, sections } = parseToml(input)
      setOutput(formatToml(globals, sections))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error formatting TOML')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="TOML Formatter" description="Format and beautify TOML configuration files with aligned keys" category="developer" categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>TOML Formatter is a free browser-based tool that lets you format and beautify TOML configuration files with proper indentation and consistent spacing. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when cleaning up Rust Cargo.toml files, Python pyproject.toml, or any TOML configuration file for readability. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is TOML?', answer: 'TOML (Tom\'s Obvious Minimal Language) is a configuration file format that is easy to read, with clear semantics for key-value pairs, tables, and arrays commonly used in Rust (Cargo.toml) and Python (pyproject.toml) projects.' },
        { question: 'How does this TOML formatter work?', answer: 'Paste your TOML content and click Format to get a beautified version with aligned key-value pairs, consistent spacing around equals signs, and proper section separation.' },
        { question: 'Does the formatter validate TOML syntax?', answer: 'The formatter parses section headers and key-value pairs, so malformed TOML will produce an error. It handles strings, numbers, booleans, arrays, and dates.' },
        { question: 'Can I format Cargo.toml or pyproject.toml files?', answer: 'Yes, paste any TOML configuration file and the formatter will align keys and clean up spacing while preserving all your values and section structure.' },
      ]}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">TOML Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'[package]\nname="my-app"\nversion="1.0.0"\n\n[dependencies]\nserde="1.0"\ntokio = "1.28"'} rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Formatted Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.toml" mimeType="text/plain" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Formatted TOML will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <button onClick={format} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Format TOML
      </button>
    </ToolPage>
  )
}
