'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

export default function CssGridGeneratorTool() {
  const [columns, setColumns] = useState(3)
  const [rows, setRows] = useState(3)
  const [colGap, setColGap] = useState(10)
  const [rowGap, setRowGap] = useState(10)
  const [colUnit, setColUnit] = useState('1fr')
  const [rowUnit, setRowUnit] = useState('auto')
  const [colSizes, setColSizes] = useState<string[]>(['1fr', '1fr', '1fr'])
  const [rowSizes, setRowSizes] = useState<string[]>(['auto', 'auto', 'auto'])
  const [useCustomSizes, setUseCustomSizes] = useState(false)

  // Sync sizes when column/row count changes
  const handleColumnsChange = (val: number) => {
    setColumns(val)
    setColSizes(prev => {
      const next = [...prev]
      while (next.length < val) next.push(colUnit)
      return next.slice(0, val)
    })
  }

  const handleRowsChange = (val: number) => {
    setRows(val)
    setRowSizes(prev => {
      const next = [...prev]
      while (next.length < val) next.push(rowUnit)
      return next.slice(0, val)
    })
  }

  const updateColSize = (i: number, val: string) => {
    setColSizes(prev => { const n = [...prev]; n[i] = val; return n })
  }

  const updateRowSize = (i: number, val: string) => {
    setRowSizes(prev => { const n = [...prev]; n[i] = val; return n })
  }

  const gridTemplateColumns = useCustomSizes
    ? colSizes.slice(0, columns).join(' ')
    : `repeat(${columns}, ${colUnit})`

  const gridTemplateRows = useCustomSizes
    ? rowSizes.slice(0, rows).join(' ')
    : `repeat(${rows}, ${rowUnit})`

  const cssCode = useMemo(() => [
    'display: grid;',
    `grid-template-columns: ${gridTemplateColumns};`,
    `grid-template-rows: ${gridTemplateRows};`,
    `column-gap: ${colGap}px;`,
    `row-gap: ${rowGap}px;`,
  ].join('\n'), [gridTemplateColumns, gridTemplateRows, colGap, rowGap])

  const cellCount = columns * rows
  const cellColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7']

  const sizeOptions = ['auto', '1fr', '2fr', 'minmax(100px, 1fr)', '100px', '150px', '200px']

  return (
    <ToolPage
      title="CSS Grid Generator"
      description="Build CSS Grid layouts visually with customizable columns, rows, and gaps."
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSS Grid Generator is a free browser-based tool that lets you design CSS Grid layouts visually with drag-and-drop, configuring rows, columns, gaps, and template areas. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Use the visual controls (sliders, color pickers, toggles) to design your effect.</li>
            <li>See the <strong>live preview</strong> update in real time as you adjust settings.</li>
            <li>Review the generated <strong>CSS code</strong> in the code panel below.</li>
            <li>Click <strong>Copy CSS</strong> to paste the code directly into your stylesheet.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating complex page layouts, dashboard grids, image galleries, and responsive grid structures. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Copy the generated CSS directly into your project stylesheet — it is production-ready.</li>
            <li>Test the effect in multiple browsers since some CSS properties have varying support.</li>
            <li>Combine multiple generators (e.g., gradient + box-shadow) for layered visual effects.</li>
            <li>Use CSS custom properties (variables) to make generated values easy to update later.</li>
            <li>All code generation happens in your browser — no external dependencies required.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is CSS Grid Layout?', answer: 'CSS Grid is a two-dimensional layout system that lets you define rows and columns simultaneously, making it ideal for building complex page layouts.' },
        { question: 'What does the fr unit mean in CSS Grid?', answer: 'The fr (fraction) unit represents a fraction of the available space in the grid container. For example, 1fr 2fr creates two columns where the second is twice as wide as the first.' },
        { question: 'How do I set gaps between grid items?', answer: 'Use the column-gap and row-gap properties (or the shorthand gap) to add spacing between grid cells without affecting the outer edges.' },
        { question: 'Can I mix fr units with fixed sizes in CSS Grid?', answer: 'Yes, you can freely combine fr units with px, %, em, or minmax() values in grid-template-columns and grid-template-rows for flexible yet controlled layouts.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Columns: {columns}</label>
              <input type="range" min={1} max={8} value={columns} onChange={e => handleColumnsChange(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rows: {rows}</label>
              <input type="range" min={1} max={8} value={rows} onChange={e => handleRowsChange(+e.target.value)} className="w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Column Gap: {colGap}px</label>
              <input type="range" min={0} max={40} value={colGap} onChange={e => setColGap(+e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Row Gap: {rowGap}px</label>
              <input type="range" min={0} max={40} value={rowGap} onChange={e => setRowGap(+e.target.value)} className="w-full" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useCustomSizes} onChange={e => setUseCustomSizes(e.target.checked)} className="rounded" />
              Custom column/row sizes
            </label>
          </div>

          {!useCustomSizes ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Column Size</label>
                <select value={colUnit} onChange={e => setColUnit(e.target.value)} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Row Size</label>
                <select value={rowUnit} onChange={e => setRowUnit(e.target.value)} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Column Sizes</label>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: columns }, (_, i) => (
                    <input key={`col-${i}`} type="text" value={colSizes[i] || '1fr'} onChange={e => updateColSize(i, e.target.value)} className="w-24 rounded border border-input bg-transparent px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring" placeholder="1fr" />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Row Sizes</label>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: rows }, (_, i) => (
                    <input key={`row-${i}`} type="text" value={rowSizes[i] || 'auto'} onChange={e => updateRowSize(i, e.target.value)} className="w-24 rounded border border-input bg-transparent px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring" placeholder="auto" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div
              className="rounded-lg border border-border p-4 bg-muted"
              style={{
                display: 'grid',
                gridTemplateColumns,
                gridTemplateRows,
                columnGap: `${colGap}px`,
                rowGap: `${rowGap}px`,
              }}
            >
              {Array.from({ length: cellCount }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center text-white text-sm font-bold rounded"
                  style={{
                    backgroundColor: cellColors[i % cellColors.length],
                    padding: '16px 8px',
                    minHeight: 50,
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">CSS Code</label>
              <CopyButton text={cssCode} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre">{cssCode}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
