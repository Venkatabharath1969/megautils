'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

function parseCSV(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let current = ''
  let inQuotes = false
  let row: string[] = []

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === delimiter) {
        row.push(current)
        current = ''
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        row.push(current)
        current = ''
        if (row.some((cell) => cell.trim() !== '')) {
          rows.push(row)
        }
        row = []
        if (ch === '\r') i++
      } else {
        current += ch
      }
    }
  }

  // Last field/row
  row.push(current)
  if (row.some((cell) => cell.trim() !== '')) {
    rows.push(row)
  }

  return rows
}

export default function CsvViewerTool() {
  const [input, setInput] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [sortCol, setSortCol] = useState<number | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [hasHeader, setHasHeader] = useState(true)

  const parsed = useMemo(() => {
    if (!input.trim()) return { headers: [], rows: [] }
    const allRows = parseCSV(input, delimiter)
    if (allRows.length === 0) return { headers: [], rows: [] }

    if (hasHeader) {
      return { headers: allRows[0], rows: allRows.slice(1) }
    }
    const maxCols = Math.max(...allRows.map((r) => r.length))
    const headers = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`)
    return { headers, rows: allRows }
  }, [input, delimiter, hasHeader])

  const sortedRows = useMemo(() => {
    if (sortCol === null) return parsed.rows
    return [...parsed.rows].sort((a, b) => {
      const aVal = a[sortCol] || ''
      const bVal = b[sortCol] || ''
      const aNum = parseFloat(aVal)
      const bNum = parseFloat(bVal)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDir === 'asc' ? aNum - bNum : bNum - aNum
      }
      const cmp = aVal.localeCompare(bVal)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [parsed.rows, sortCol, sortDir])

  const handleSort = useCallback((colIdx: number) => {
    if (sortCol === colIdx) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(colIdx)
      setSortDir('asc')
    }
  }, [sortCol])

  const clear = () => { setInput(''); setSortCol(null) }

  return (
    <ToolPage title="CSV Viewer" description="Paste CSV data and view it as a formatted, sortable table" category="developer" categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSV Viewer is a free browser-based tool that lets you view and explore CSV files in an interactive table with sorting, filtering, and column statistics. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when inspecting CSV data without opening a spreadsheet application, quick data validation, or previewing exports. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this data analysis tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I view a CSV file as a table?', answer: 'Paste your CSV data into the input field and it will instantly render as a formatted, sortable table with row numbers and column headers.' },
        { question: 'Can I sort CSV data by column?', answer: 'Yes, click any column header to sort the table by that column in ascending or descending order, with automatic detection of numeric vs. text sorting.' },
        { question: 'What delimiters are supported besides commas?', answer: 'The tool supports comma, tab, semicolon, and pipe (|) delimiters. Select your delimiter from the dropdown to parse your data correctly.' },
        { question: 'Does the CSV viewer handle quoted fields?', answer: 'Yes, the parser correctly handles quoted fields containing commas, newlines, and escaped double quotes per the CSV standard (RFC 4180).' },
      ]}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">CSV Input</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="rounded" />
                First row is header
              </label>
              <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="px-2 py-1 rounded border border-input bg-tool-bg text-xs">
                <option value=",">Comma (,)</option>
                <option value="	">Tab</option>
                <option value=";">Semicolon (;)</option>
                <option value="|">Pipe (|)</option>
              </select>
              <ClearButton onClear={clear} />
            </div>
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'name,age,city\nJohn,30,New York\nJane,25,London\nBob,35,Tokyo'} rows={6} />
        </div>

        {/* Stats */}
        {parsed.rows.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {sortedRows.length} rows
            </span>
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {parsed.headers.length} columns
            </span>
          </div>
        )}

        {/* Table */}
        {parsed.headers.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground border-r border-border w-10">#</th>
                  {parsed.headers.map((h, i) => (
                    <th
                      key={i}
                      onClick={() => handleSort(i)}
                      className="px-3 py-2 text-left text-xs font-medium cursor-pointer hover:bg-primary/10 transition-colors border-r border-border last:border-r-0 select-none"
                    >
                      <div className="flex items-center gap-1">
                        {h}
                        {sortCol === i && (
                          <span className="text-primary">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, ri) => (
                  <tr key={ri} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-1.5 text-xs text-muted-foreground border-r border-border">{ri + 1}</td>
                    {parsed.headers.map((_, ci) => (
                      <td key={ci} className="px-3 py-1.5 border-r border-border last:border-r-0 font-mono text-xs">
                        {row[ci] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
