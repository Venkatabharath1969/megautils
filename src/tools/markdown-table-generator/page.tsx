'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

type Alignment = 'left' | 'center' | 'right'

export default function MarkdownTableGeneratorTool() {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [cells, setCells] = useState<string[][]>(() =>
    Array.from({ length: 4 }, () => Array.from({ length: 3 }, () => ''))
  )
  const [alignments, setAlignments] = useState<Alignment[]>(() =>
    Array.from({ length: 3 }, () => 'left' as Alignment)
  )

  const adjustGrid = useCallback((newRows: number, newCols: number) => {
    const totalRows = newRows + 1 // +1 for header
    setCells(prev => {
      const newCells = Array.from({ length: totalRows }, (_, r) =>
        Array.from({ length: newCols }, (_, c) =>
          prev[r]?.[c] ?? ''
        )
      )
      return newCells
    })
    setAlignments(prev => {
      return Array.from({ length: newCols }, (_, i) => prev[i] ?? 'left')
    })
    setRows(newRows)
    setCols(newCols)
  }, [])

  const updateCell = (row: number, col: number, value: string) => {
    setCells(prev => {
      const copy = prev.map(r => [...r])
      copy[row][col] = value
      return copy
    })
  }

  const updateAlignment = (col: number, align: Alignment) => {
    setAlignments(prev => {
      const copy = [...prev]
      copy[col] = align
      return copy
    })
  }

  const output = useMemo(() => {
    if (cells.length === 0 || cells[0].length === 0) return ''

    const header = cells[0]
    const dataRows = cells.slice(1)

    // Calculate column widths
    const colWidths = Array.from({ length: cols }, (_, c) => {
      const headerLen = (header[c] || 'Header').length
      const maxDataLen = Math.max(...dataRows.map(r => (r[c] || '').length), 0)
      return Math.max(headerLen, maxDataLen, 3)
    })

    // Header row
    const headerLine = '| ' + header.map((cell, i) =>
      (cell || `Header ${i + 1}`).padEnd(colWidths[i])
    ).join(' | ') + ' |'

    // Separator row with alignment
    const sepLine = '| ' + alignments.map((align, i) => {
      const w = colWidths[i]
      if (align === 'center') return ':' + '-'.repeat(w - 2) + ':'
      if (align === 'right') return '-'.repeat(w - 1) + ':'
      return '-'.repeat(w)
    }).join(' | ') + ' |'

    // Data rows
    const dataLines = dataRows.map(row =>
      '| ' + row.map((cell, i) =>
        (cell || '').padEnd(colWidths[i])
      ).join(' | ') + ' |'
    )

    return [headerLine, sepLine, ...dataLines].join('\n')
  }, [cells, cols, alignments])

  const clear = () => {
    setCells(Array.from({ length: 4 }, () => Array.from({ length: 3 }, () => '')))
    setAlignments(Array.from({ length: 3 }, () => 'left' as Alignment))
    setRows(3)
    setCols(3)
  }

  return (
    <ToolPage title="Markdown Table Generator" description="Build Markdown tables visually with a grid editor. Set alignment, copy, or download." category="markdown" categoryLabel="Markdown Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Markdown Table Generator is a free browser-based tool that lets you create properly formatted Markdown tables with a visual editor supporting alignment and easy cell editing. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating tables for GitHub READMEs, documentation, or any Markdown-based content without manual formatting. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this documentation tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need markdown table creation.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'How do you create a table in Markdown?', answer: 'Markdown tables use pipes (|) to separate columns and hyphens (-) to create the header separator row. This tool generates the correct syntax automatically from your grid input.' },
        { question: 'Can I align columns in Markdown tables?', answer: 'Yes, use colons in the separator row: left-aligned (---), center-aligned (:---:), or right-aligned (---:). This tool lets you set alignment per column with simple buttons.' },
        { question: 'What is the maximum size for a Markdown table?', answer: 'There is no hard limit on Markdown table size, but very large tables become hard to read in plain text. This tool supports up to 20 rows and 10 columns for practical use.' },
      ]}>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Rows:</label>
              <input
                type="number" min="1" max="20" value={rows}
                onChange={e => adjustGrid(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)), cols)}
                className="w-16 rounded-md border border-input bg-tool-bg p-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Columns:</label>
              <input
                type="number" min="1" max="10" value={cols}
                onChange={e => adjustGrid(rows, Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="w-16 rounded-md border border-input bg-tool-bg p-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <ClearButton onClear={clear} />
        </div>

        {/* Alignment controls */}
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Col {i + 1}:</span>
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  onClick={() => updateAlignment(i, align)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${alignments[i] === align ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                  title={`Align ${align}`}
                >
                  {align === 'left' ? 'L' : align === 'center' ? 'C' : 'R'}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Grid editor */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-1 text-xs text-muted-foreground w-8">#</th>
                {Array.from({ length: cols }, (_, c) => (
                  <th key={c} className="p-1 text-xs text-muted-foreground">Col {c + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cells.map((row, r) => (
                <tr key={r}>
                  <td className="p-1 text-xs text-muted-foreground text-center">
                    {r === 0 ? 'H' : r}
                  </td>
                  {row.map((cell, c) => (
                    <td key={c} className="p-1">
                      <input
                        type="text"
                        value={cell}
                        onChange={e => updateCell(r, c, e.target.value)}
                        placeholder={r === 0 ? `Header ${c + 1}` : ''}
                        className={`w-full rounded-md border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${r === 0 ? 'font-semibold' : ''}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Generated Markdown Table</span>
            <div className="flex gap-2">
              <CopyButton text={output} />
              <DownloadButton content={output} filename="table.md" />
            </div>
          </div>
          <ToolTextarea value={output} readOnly rows={Math.min(12, rows + 3)} />
        </div>

        {/* Preview */}
        {output && (
          <div>
            <div className="text-sm font-semibold mb-2">Preview</div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    {cells[0]?.map((cell, i) => (
                      <th key={i} className="p-2.5 font-semibold border-b border-border" style={{ textAlign: alignments[i] }}>
                        {cell || `Header ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cells.slice(1).map((row, r) => (
                    <tr key={r} className="border-b border-border hover:bg-muted/50">
                      {row.map((cell, c) => (
                        <td key={c} className="p-2.5" style={{ textAlign: alignments[c] }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
