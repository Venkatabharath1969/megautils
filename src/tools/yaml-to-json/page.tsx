'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

interface YamlLine {
  indent: number
  key: string
  value: string
  raw: string
}

function parseYamlValue(val: string): unknown {
  const trimmed = val.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === '~') return null
  if (trimmed === 'true' || trimmed === 'yes') return true
  if (trimmed === 'false' || trimmed === 'no') return false
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10)
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed)
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try { return JSON.parse(trimmed) } catch { return trimmed }
  }
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try { return JSON.parse(trimmed) } catch { return trimmed }
  }
  return trimmed
}

function parseYaml(input: string): unknown {
  const rawLines = input.split('\n')
  const lines: YamlLine[] = []

  for (const raw of rawLines) {
    if (raw.trim() === '' || raw.trim().startsWith('#')) continue
    const indent = raw.search(/\S/)
    const content = raw.trim()
    const colonIdx = content.indexOf(':')

    if (content.startsWith('- ')) {
      lines.push({ indent, key: '-', value: content.slice(2).trim(), raw: content })
    } else if (content === '-') {
      lines.push({ indent, key: '-', value: '', raw: content })
    } else if (colonIdx > 0) {
      const key = content.slice(0, colonIdx).trim()
      const value = content.slice(colonIdx + 1).trim()
      lines.push({ indent, key, value, raw: content })
    } else {
      lines.push({ indent, key: '', value: content, raw: content })
    }
  }

  function buildValue(start: number, end: number, baseIndent: number): unknown {
    if (start >= end) return null

    // Check if this block is an array (starts with -)
    if (lines[start].key === '-') {
      const arr: unknown[] = []
      let i = start
      while (i < end) {
        if (lines[i].key !== '-' || lines[i].indent !== baseIndent) break
        const itemValue = lines[i].value
        // Find children of this array item
        let childEnd = i + 1
        while (childEnd < end && lines[childEnd].indent > baseIndent) childEnd++

        if (childEnd > i + 1) {
          // Has children - could be object under array item
          const childIndent = lines[i + 1].indent
          if (itemValue && lines[i + 1].key !== '-') {
            // The dash line has a key:value, treat children as object mixed in
            const obj = buildValue(i + 1, childEnd, childIndent) as Record<string, unknown>
            const colonIdx = itemValue.indexOf(':')
            if (colonIdx > 0) {
              const k = itemValue.slice(0, colonIdx).trim()
              const v = itemValue.slice(colonIdx + 1).trim()
              const baseObj: Record<string, unknown> = {}
              if (v) {
                baseObj[k] = parseYamlValue(v)
              } else {
                baseObj[k] = buildValue(i + 1, childEnd, childIndent)
                arr.push(baseObj)
                i = childEnd
                continue
              }
              arr.push({ ...baseObj, ...(typeof obj === 'object' && obj !== null ? obj : {}) })
            } else {
              const result = buildValue(i + 1, childEnd, childIndent)
              if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
                const firstKey = itemValue.includes(':') ? itemValue.split(':')[0].trim() : itemValue
                const firstVal = itemValue.includes(':') ? itemValue.split(':').slice(1).join(':').trim() : undefined
                if (firstVal !== undefined) {
                  arr.push({ [firstKey]: parseYamlValue(firstVal), ...result as Record<string, unknown> })
                } else {
                  arr.push(result)
                }
              } else {
                arr.push(result)
              }
            }
          } else if (itemValue) {
            // Dash line has a simple value plus children
            arr.push(parseYamlValue(itemValue))
          } else {
            arr.push(buildValue(i + 1, childEnd, childIndent))
          }
        } else if (itemValue) {
          // Check if inline key: value on the dash line
          const colonIdx = itemValue.indexOf(':')
          if (colonIdx > 0 && !itemValue.startsWith('"') && !itemValue.startsWith("'")) {
            const k = itemValue.slice(0, colonIdx).trim()
            const v = itemValue.slice(colonIdx + 1).trim()
            arr.push({ [k]: parseYamlValue(v) })
          } else {
            arr.push(parseYamlValue(itemValue))
          }
        } else {
          arr.push(null)
        }
        i = childEnd
      }
      return arr
    }

    // Otherwise it's an object
    const obj: Record<string, unknown> = {}
    let i = start
    while (i < end) {
      if (lines[i].indent !== baseIndent) { i++; continue }
      const { key, value } = lines[i]
      if (!key || key === '-') { i++; continue }

      let childEnd = i + 1
      while (childEnd < end && lines[childEnd].indent > baseIndent) childEnd++

      if (value) {
        obj[key] = parseYamlValue(value)
      } else if (childEnd > i + 1) {
        const childIndent = lines[i + 1].indent
        obj[key] = buildValue(i + 1, childEnd, childIndent)
      } else {
        obj[key] = null
      }
      i = childEnd
    }
    return obj
  }

  if (lines.length === 0) return {}
  const baseIndent = lines[0].indent
  return buildValue(0, lines.length, baseIndent)
}

export default function YamlToJsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = () => {
    try {
      const result = parseYaml(input)
      setOutput(JSON.stringify(result, null, 2))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid YAML')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="YAML to JSON Converter" description="Convert YAML data to JSON format" category="developer" categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>YAML to JSON Converter is a free browser-based tool that lets you convert YAML documents to JSON format for use in APIs, databases, or applications expecting JSON input. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when converting configuration files to JSON for programmatic processing, migrating YAML configs to JSON-based systems. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this data conversion tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need yaml to json.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'How do I convert YAML to JSON?', answer: 'Paste your YAML content into the input and click Convert to get formatted JSON output. The tool handles nested objects, arrays, and all standard YAML data types.' },
        { question: 'What YAML features are supported?', answer: 'The converter supports key-value pairs, nested objects, arrays (dash lists), inline arrays/objects, comments, quoted strings, booleans, numbers, and null values.' },
        { question: 'Why convert YAML to JSON?', answer: 'JSON is more widely supported by APIs and programming languages, so converting YAML config files to JSON is useful for debugging, API testing, and data interchange.' },
        { question: 'Is my YAML data sent to a server?', answer: 'No, all conversion happens entirely in your browser. Your data never leaves your device, making it safe for sensitive configuration files.' },
      ]}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">YAML Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'Paste YAML here...\nname: John\nage: 30'} rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">JSON Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="output.json" mimeType="application/json" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="JSON output will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <button onClick={convert} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Convert to JSON
      </button>
    </ToolPage>
  )
}
