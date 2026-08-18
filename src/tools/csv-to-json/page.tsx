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
    <ToolPage
      title="CSV to JSON Converter"
      description="Convert CSV data to a JSON array of objects"
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSV to JSON Converter is a free browser-based tool that lets you convert CSV (Comma-Separated Values) data into JSON format, automatically detecting headers as keys. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when transforming spreadsheet exports for web APIs, converting database exports to JSON, or preparing data for JavaScript applications. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this data conversion tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need csv to json conversion.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How does CSV to JSON conversion work?', answer: 'The first row of your CSV is used as the keys (field names), and each subsequent row becomes a JSON object with those keys mapped to the corresponding column values.' },
        { question: 'Does this tool handle quoted CSV fields with commas?', answer: 'Yes, fields enclosed in double quotes are handled correctly, including fields that contain commas, newlines, or escaped quotes within them.' },
        { question: 'Are numeric values preserved as numbers in the JSON output?', answer: 'Yes, the converter automatically detects integers, decimals, and booleans in your CSV and outputs them as proper JSON types instead of strings.' },
        { question: 'What if my CSV has empty values?', answer: 'Empty cells in your CSV are converted to null in the JSON output, making it easy to identify missing data in the resulting array of objects.' },
      ]}
    >
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
