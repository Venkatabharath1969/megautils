'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'
import { ExportButton } from '@/components/export-button'
import { Upload } from 'lucide-react'

const ROWS_PER_PAGE = 100

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

interface ColumnStats {
  type: 'numeric' | 'text'
  // numeric
  min?: number
  max?: number
  avg?: number
  sum?: number
  // text
  uniqueCount?: number
  mostCommon?: string
  mostCommonCount?: number
}

function computeColumnStats(rows: string[][], colIndex: number): ColumnStats {
  const values = rows.map((r) => r[colIndex] || '').filter((v) => v.trim() !== '')
  if (values.length === 0) return { type: 'text', uniqueCount: 0 }

  const nums = values.map((v) => parseFloat(v)).filter((n) => !isNaN(n))
  const isNumeric = nums.length > values.length * 0.8 && nums.length > 0

  if (isNumeric) {
    const sum = nums.reduce((a, b) => a + b, 0)
    return {
      type: 'numeric',
      min: Math.min(...nums),
      max: Math.max(...nums),
      avg: sum / nums.length,
      sum,
    }
  }

  const freq: Record<string, number> = {}
  for (const v of values) {
    freq[v] = (freq[v] || 0) + 1
  }
  let mostCommon = ''
  let mostCommonCount = 0
  for (const [val, count] of Object.entries(freq)) {
    if (count > mostCommonCount) {
      mostCommon = val
      mostCommonCount = count
    }
  }

  return {
    type: 'text',
    uniqueCount: Object.keys(freq).length,
    mostCommon,
    mostCommonCount,
  }
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString()
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function CsvViewerTool() {
  const [input, setInput] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [sortCol, setSortCol] = useState<number | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [hasHeader, setHasHeader] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [columnFilters, setColumnFilters] = useState<Record<number, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const filteredRows = useMemo(() => {
    const activeFilters = Object.entries(columnFilters).filter(([, v]) => v.trim() !== '')
    if (activeFilters.length === 0) return sortedRows
    return sortedRows.filter((row) =>
      activeFilters.every(([colStr, filterVal]) => {
        const col = parseInt(colStr)
        const cellVal = (row[col] || '').toLowerCase()
        return cellVal.includes(filterVal.toLowerCase())
      })
    )
  }, [sortedRows, columnFilters])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages - 1)
  const paginatedRows = filteredRows.slice(safePage * ROWS_PER_PAGE, (safePage + 1) * ROWS_PER_PAGE)

  const handleSort = useCallback((colIdx: number) => {
    if (sortCol === colIdx) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(colIdx)
      setSortDir('asc')
    }
  }, [sortCol])

  const handleFilterChange = useCallback((colIdx: number, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [colIdx]: value }))
    setCurrentPage(0)
  }, [])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result
      if (typeof text === 'string') {
        setInput(text)
        setCurrentPage(0)
        setColumnFilters({})
        setSortCol(null)
      }
    }
    reader.readAsText(file)
    // Reset the file input so the same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const clear = () => {
    setInput('')
    setSortCol(null)
    setCurrentPage(0)
    setColumnFilters({})
  }

  const columnStats = useMemo(() => {
    if (parsed.headers.length === 0 || filteredRows.length === 0) return []
    return parsed.headers.map((_, i) => computeColumnStats(filteredRows, i))
  }, [parsed.headers, filteredRows])

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
        {/* File Upload */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-muted/30">
          <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">Upload a file:</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleFileUpload}
            className="text-sm file:mr-2 file:px-3 file:py-1 file:rounded-md file:border file:border-border file:bg-card file:text-xs file:font-medium file:cursor-pointer hover:file:bg-muted file:transition-colors"
          />
        </div>

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

        {/* Stats bar */}
        {parsed.rows.length > 0 && (
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {filteredRows.length}{filteredRows.length !== parsed.rows.length ? ` / ${parsed.rows.length}` : ''} rows
            </span>
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {parsed.headers.length} columns
            </span>
            <ExportButton
              headers={parsed.headers}
              rows={filteredRows.map((r) => parsed.headers.map((_, ci) => r[ci] || ''))}
              filename="csv-viewer-export.csv"
              label="Download CSV"
            />
          </div>
        )}

        {/* Table */}
        {parsed.headers.length > 0 && (
          <div className="overflow-auto rounded-lg border border-border max-h-[600px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground border-r border-border w-10">#</th>
                  {parsed.headers.map((h, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-left text-xs font-medium border-r border-border last:border-r-0"
                    >
                      <div
                        className="flex items-center gap-1 cursor-pointer select-none hover:text-primary transition-colors"
                        onClick={() => handleSort(i)}
                      >
                        {h}
                        {sortCol === i && (
                          <span className="text-primary">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={columnFilters[i] || ''}
                        onChange={(e) => handleFilterChange(i, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-full px-1.5 py-0.5 text-xs rounded border border-border bg-card placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, ri) => (
                  <tr key={ri} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="px-3 py-1.5 text-xs text-muted-foreground border-r border-border">
                      {safePage * ROWS_PER_PAGE + ri + 1}
                    </td>
                    {parsed.headers.map((_, ci) => (
                      <td key={ci} className="px-3 py-1.5 border-r border-border last:border-r-0 font-mono text-xs">
                        {row[ci] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
                {paginatedRows.length === 0 && (
                  <tr>
                    <td colSpan={parsed.headers.length + 1} className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No rows match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredRows.length > ROWS_PER_PAGE && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {safePage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        )}

        {/* Column Statistics */}
        {columnStats.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Column Statistics</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {parsed.headers.map((header, i) => {
                const stats = columnStats[i]
                if (!stats) return null
                return (
                  <div key={i} className="rounded-lg border border-border p-3 bg-card">
                    <div className="text-xs font-medium mb-1.5 truncate" title={header}>{header}</div>
                    <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground mb-2">
                      {stats.type === 'numeric' ? 'Numeric' : 'Text'}
                    </span>
                    {stats.type === 'numeric' ? (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <span className="text-muted-foreground">Min</span>
                        <span className="font-mono text-right">{formatNum(stats.min!)}</span>
                        <span className="text-muted-foreground">Max</span>
                        <span className="font-mono text-right">{formatNum(stats.max!)}</span>
                        <span className="text-muted-foreground">Average</span>
                        <span className="font-mono text-right">{formatNum(stats.avg!)}</span>
                        <span className="text-muted-foreground">Sum</span>
                        <span className="font-mono text-right">{formatNum(stats.sum!)}</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <span className="text-muted-foreground">Unique values</span>
                        <span className="font-mono text-right">{stats.uniqueCount?.toLocaleString()}</span>
                        {stats.mostCommon && (
                          <>
                            <span className="text-muted-foreground">Most common</span>
                            <span className="font-mono text-right truncate" title={`${stats.mostCommon} (${stats.mostCommonCount})`}>
                              {stats.mostCommon} ({stats.mostCommonCount})
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
