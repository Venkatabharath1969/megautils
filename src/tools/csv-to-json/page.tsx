'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        fields.push(current)
        current = ''
      } else {
        current += ch
      }
    }
  }
  fields.push(current)
  return fields
}

function csvToJson(csv: string): string {
  const lines = csv.split('\n').filter(l => l.trim() !== '')
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row')

  const headers = parseCsvLine(lines[0]).map(h => h.trim())
  const result = lines.slice(1).map(line => {
    const values = parseCsvLine(line)
    const obj: Record<string, unknown> = {}
    headers.forEach((header, i) => {
      const val = (values[i] ?? '').trim()
      if (val === '') { obj[header] = null; return }
      if (/^-?\d+$/.test(val)) { obj[header] = parseInt(val, 10); return }
      if (/^-?\d+\.\d+$/.test(val)) { obj[header] = parseFloat(val); return }
      if (val.toLowerCase() === 'true') { obj[header] = true; return }
      if (val.toLowerCase() === 'false') { obj[header] = false; return }
      obj[header] = val
    })
    return obj
  })

  return JSON.stringify(result, null, 2)
}

export default function CsvToJsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const convert = () => {
    try {
      setOutput(csvToJson(input))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid CSV')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="CSV to JSON Converter" description="Convert CSV data to a JSON array of objects" category="developer" categoryLabel="Developer Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">CSV Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'Paste CSV here...\nname,age,city\nAlice,30,NYC'} rows={14} />
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
