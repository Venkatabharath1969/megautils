'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function toYaml(value: unknown, indent: number = 0): string {
  const pad = '  '.repeat(indent)
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    if (
      value === '' ||
      value === 'true' || value === 'false' ||
      value === 'null' || value === 'yes' || value === 'no' ||
      value.includes(':') || value.includes('#') ||
      value.includes('\n') || value.includes('"') ||
      value.includes("'") || value.startsWith(' ') ||
      value.endsWith(' ') || value.startsWith('{') ||
      value.startsWith('[') || /^\d/.test(value)
    ) {
      return JSON.stringify(value)
    }
    return value
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return value.map((item) => {
      if (typeof item === 'object' && item !== null) {
        const inner = toYaml(item, indent + 1)
        const lines = inner.split('\n')
        return `${pad}- ${lines[0]}\n${lines.slice(1).map(l => `${pad}  ${l}`).join('\n')}`.replace(/\n\s*$/,'')
      }
      return `${pad}- ${toYaml(item, indent + 1)}`
    }).join('\n')
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return entries.map(([key, val]) => {
      const safeKey = /[:#\s]/.test(key) || key === '' ? JSON.stringify(key) : key
      if (typeof val === 'object' && val !== null) {
        const inner = toYaml(val, indent + 1)
        return `${pad}${safeKey}:\n${inner}`
      }
      return `${pad}${safeKey}: ${toYaml(val, indent + 1)}`
    }).join('\n')
  }
  return String(value)
}

export default function JsonToYamlTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(toYaml(parsed))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="JSON to YAML Converter"
      description="Convert JSON data to YAML format"
      category="developer"
      categoryLabel="Developer Tools"
      faqs={[
        { question: 'Why convert JSON to YAML?', answer: 'YAML is more human-readable than JSON, supports comments, and uses less syntax, making it preferred for configuration files in tools like Docker Compose, Kubernetes, and Ansible.' },
        { question: 'Does JSON to YAML conversion lose any data?', answer: 'No, YAML is a superset of JSON, so all JSON data types including strings, numbers, booleans, arrays, and nested objects are fully preserved in the YAML output.' },
        { question: 'How are JSON arrays represented in YAML?', answer: 'JSON arrays are converted to YAML sequences using the dash-space prefix (- item) for each element, with nested objects indented under each dash.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">JSON Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder='Paste JSON here...\n{"key": "value"}' rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">YAML Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="output.yaml" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="YAML output will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <button onClick={convert} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Convert to YAML
      </button>
    </ToolPage>
  )
}
