'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

export default function JsonFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)

  const format = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  const minify = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="JSON Formatter & Validator"
      description="Format, validate, beautify, and minify JSON data. Supports tree view."
      category="developer"
      categoryLabel="Developer Tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input JSON</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder='Paste your JSON here...\n{"key": "value"}' rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.json" mimeType="application/json" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Formatted JSON will appear here..." rows={14} />
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
          <option value={1}>1 tab (\t)</option>
        </select>
      </div>
    </ToolPage>
  )
}
