'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return '"' + field.replace(/"/g, '""') + '"'
  }
  return field
}

function jsonToCsv(jsonStr: string): string {
  const data = JSON.parse(jsonStr)
  if (!Array.isArray(data)) throw new Error('Input must be a JSON array of objects')
  if (data.length === 0) return ''

  // Collect all unique keys
  const keys = new Set<string>()
  for (const item of data) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error('Each item in the array must be a flat object')
    }
    Object.keys(item).forEach(k => keys.add(k))
  }

  const headers = Array.from(keys)
  const headerRow = headers.map(h => escapeCsvField(h)).join(',')

  const rows = data.map(item => {
    return headers.map(h => {
      const val = item[h]
      if (val === null || val === undefined) return ''
      if (typeof val === 'object') return escapeCsvField(JSON.stringify(val))
      return escapeCsvField(String(val))
    }).join(',')
  })

  return [headerRow, ...rows].join('\n')
}

export default function JsonToCsvTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = () => {
    try {
      setOutput(jsonToCsv(input))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="JSON to CSV Converter"
      description="Convert a JSON array of objects to CSV format"
      category="developer"
      categoryLabel="Developer Tools"
      faqs={[
        { question: 'What JSON format does this converter expect?', answer: 'It expects a JSON array of flat objects, e.g., [{"name": "Alice", "age": 30}]. Each object becomes a row, and all unique keys become CSV column headers.' },
        { question: 'How does the converter handle nested JSON objects?', answer: 'Nested objects and arrays are serialized as JSON strings within the CSV cell. For deeply nested data, consider flattening your JSON first for a cleaner CSV output.' },
        { question: 'Are special characters like commas and quotes handled correctly?', answer: 'Yes. Fields containing commas, double quotes, or newlines are automatically wrapped in quotes and escaped according to the RFC 4180 CSV standard.' },
        { question: 'Can I open the downloaded CSV in Excel or Google Sheets?', answer: 'Yes. The output is a standard CSV file that opens correctly in Microsoft Excel, Google Sheets, LibreOffice Calc, and any other spreadsheet application.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">JSON Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'Paste JSON array here...\n[{"name": "Alice", "age": 30}]'} rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">CSV Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="output.csv" mimeType="text/csv" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="CSV output will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <button onClick={convert} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Convert to CSV
      </button>
    </ToolPage>
  )
}
