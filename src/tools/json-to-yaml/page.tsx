'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function toYaml(value: unknown, indent: number = 0, indentSize: number = 2): string {
  const pad = ' '.repeat(indentSize).repeat(indent)
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
    const childPad = ' '.repeat(indentSize)
    return value.map((item) => {
      if (typeof item === 'object' && item !== null) {
        const inner = toYaml(item, indent + 1, indentSize)
        const lines = inner.split('\n')
        return `${pad}- ${lines[0]}\n${lines.slice(1).map(l => `${pad}${childPad}${l}`).join('\n')}`.replace(/\n\s*$/,'')
      }
      return `${pad}- ${toYaml(item, indent + 1, indentSize)}`
    }).join('\n')
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return entries.map(([key, val]) => {
      const safeKey = /[:#\s]/.test(key) || key === '' ? JSON.stringify(key) : key
      if (typeof val === 'object' && val !== null) {
        const inner = toYaml(val, indent + 1, indentSize)
        return `${pad}${safeKey}:\n${inner}`
      }
      return `${pad}${safeKey}: ${toYaml(val, indent + 1, indentSize)}`
    }).join('\n')
  }
  return String(value)
}

export default function JsonToYamlTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState(2)

  const convert = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(toYaml(parsed, 0, indentSize))
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
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>JSON to YAML Converter is a free browser-based tool that lets you convert JSON data to YAML format for human-readable configuration files. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating Docker Compose files, Kubernetes manifests, CI/CD configs, or any YAML-based configuration from JSON data. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this DevOps tool saves time and eliminates the need for desktop software installation.</p>

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
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button onClick={convert} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Convert to YAML
        </button>
        <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
      </div>
    </ToolPage>
  )
}
