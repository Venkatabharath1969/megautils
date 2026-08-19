'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flatten(val as Record<string, unknown>, newKey))
    } else {
      result[newKey] = val
    }
  }
  return result
}

function escapeCsvField(field: string, delimiter: string): string {
  if (field.includes(delimiter) || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return '"' + field.replace(/"/g, '""') + '"'
  }
  return field
}

function jsonToCsv(jsonStr: string, delimiter: string, flattenNested: boolean): string {
  let data = JSON.parse(jsonStr)

  // Single-object auto-wrap
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    data = [data]
  }

  if (!Array.isArray(data)) throw new Error('Input must be a JSON object or array of objects')
  if (data.length === 0) return ''

  // Optionally flatten nested objects
  const processed = data.map((item: unknown) => {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error('Each item in the array must be an object')
    }
    return flattenNested ? flatten(item as Record<string, unknown>) : item as Record<string, unknown>
  })

  // Collect all unique keys
  const keys = new Set<string>()
  for (const item of processed) {
    Object.keys(item).forEach(k => keys.add(k))
  }

  const headers = Array.from(keys)
  const headerRow = headers.map(h => escapeCsvField(h, delimiter)).join(delimiter)

  const rows = processed.map(item => {
    return headers.map(h => {
      const val = item[h]
      if (val === null || val === undefined) return ''
      if (typeof val === 'object') return escapeCsvField(JSON.stringify(val), delimiter)
      return escapeCsvField(String(val), delimiter)
    }).join(delimiter)
  })

  return [headerRow, ...rows].join('\n')
}

const DELIMITERS = [
  { label: 'Comma (,)', value: ',' },
  { label: 'Tab (\\t)', value: '\t' },
  { label: 'Semicolon (;)', value: ';' },
  { label: 'Pipe (|)', value: '|' },
]

export default function JsonToCsvTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [flattenNested, setFlattenNested] = useState(false)

  const convert = () => {
    try {
      setOutput(jsonToCsv(input, delimiter, flattenNested))
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
      helpContent={
        <>
          <h2>What is JSON to CSV Converter?</h2>
          <p>
            JSON to CSV Converter is a free online tool that transforms a JSON array of objects into a clean, standards-compliant CSV file ready for use in spreadsheets, databases, and data analysis workflows. JSON (JavaScript Object Notation) is the most common data interchange format on the web, but many business tools and reporting systems still rely on CSV (Comma-Separated Values) for data import and analysis. This converter bridges that gap by automatically extracting all unique keys from your JSON objects as column headers and mapping each object to a corresponding CSV row.
          </p>
          <p>
            The converter follows the RFC 4180 CSV standard, which means fields containing commas, double quotes, or newlines are properly escaped and wrapped in quotes. Nested objects and arrays within your JSON are serialized as JSON strings inside the CSV cell so that no data is lost during conversion. All processing happens entirely in your browser — nothing is uploaded to any server, making the tool safe for sensitive or proprietary datasets.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste your JSON data into the input area on the left. The data must be a JSON array of objects, for example: <code>[&#123;&quot;name&quot;: &quot;Alice&quot;, &quot;age&quot;: 30&#125;]</code>.</li>
            <li>Click the Convert to CSV button to run the conversion.</li>
            <li>The resulting CSV output appears in the right panel, with column headers derived from all unique keys found across your JSON objects.</li>
            <li>Use the copy button to copy the CSV text to your clipboard, or click download to save it as a .csv file.</li>
            <li>Open the downloaded file in Microsoft Excel, Google Sheets, LibreOffice Calc, or any other spreadsheet application.</li>
            <li>Use the clear button to reset both panels and convert a different dataset.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Ensure your JSON input is a valid array of objects. A single object or a primitive value will produce an error. Wrap single objects in square brackets to create a one-row CSV.</li>
            <li>Flatten deeply nested JSON structures before converting for cleaner, more readable CSV output. Nested objects are serialized as JSON strings, which can be hard to work with in spreadsheets.</li>
            <li>If your objects have different keys, the converter merges all keys into a single header row and fills missing values with empty cells, so inconsistent data is handled gracefully.</li>
            <li>The converter handles large datasets efficiently since it runs in your browser with no server round-trips. However, extremely large files may take a moment to process.</li>
            <li>Validate your JSON syntax before pasting. Common issues include trailing commas, unquoted keys, and single quotes instead of double quotes.</li>
            <li>The downloaded CSV uses UTF-8 encoding, which is universally supported by modern spreadsheet applications.</li>
          </ul>
        </>
      }
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
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Delimiter:</label>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-card text-sm"
          >
            {DELIMITERS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={flattenNested}
            onChange={(e) => setFlattenNested(e.target.checked)}
            className="rounded border-input"
          />
          Flatten nested objects
        </label>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <button onClick={convert} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Convert to CSV
      </button>
    </ToolPage>
  )
}
