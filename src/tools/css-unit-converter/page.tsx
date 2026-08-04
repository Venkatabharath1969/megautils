'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

type Unit = 'px' | 'rem' | 'em' | 'pt' | '%' | 'vw' | 'vh'

const unitLabels: Record<Unit, string> = {
  px: 'Pixels (px)',
  rem: 'Root Em (rem)',
  em: 'Em (em)',
  pt: 'Points (pt)',
  '%': 'Percent (%)',
  vw: 'Viewport Width (vw)',
  vh: 'Viewport Height (vh)',
}

function convertFromPx(px: number, targetUnit: Unit, baseFontSize: number, viewportWidth: number, viewportHeight: number): number {
  switch (targetUnit) {
    case 'px': return px
    case 'rem': return px / baseFontSize
    case 'em': return px / baseFontSize
    case 'pt': return px * 0.75
    case '%': return (px / baseFontSize) * 100
    case 'vw': return (px / viewportWidth) * 100
    case 'vh': return (px / viewportHeight) * 100
  }
}

function convertToPx(value: number, fromUnit: Unit, baseFontSize: number, viewportWidth: number, viewportHeight: number): number {
  switch (fromUnit) {
    case 'px': return value
    case 'rem': return value * baseFontSize
    case 'em': return value * baseFontSize
    case 'pt': return value / 0.75
    case '%': return (value / 100) * baseFontSize
    case 'vw': return (value / 100) * viewportWidth
    case 'vh': return (value / 100) * viewportHeight
  }
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString()
  return n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
}

export default function CssUnitConverterTool() {
  const [inputValue, setInputValue] = useState('16')
  const [fromUnit, setFromUnit] = useState<Unit>('px')
  const [baseFontSize, setBaseFontSize] = useState(16)
  const [viewportWidth, setViewportWidth] = useState(1920)
  const [viewportHeight, setViewportHeight] = useState(1080)

  const units: Unit[] = ['px', 'rem', 'em', 'pt', '%', 'vw', 'vh']

  const conversions = useMemo(() => {
    const val = parseFloat(inputValue)
    if (isNaN(val)) return null

    const px = convertToPx(val, fromUnit, baseFontSize, viewportWidth, viewportHeight)
    const result: Record<Unit, string> = {} as Record<Unit, string>
    for (const unit of units) {
      result[unit] = formatNumber(convertFromPx(px, unit, baseFontSize, viewportWidth, viewportHeight))
    }
    return result
  }, [inputValue, fromUnit, baseFontSize, viewportWidth, viewportHeight])

  // Common px values table
  const commonPxValues = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96]

  const conversionTable = useMemo(() => {
    return commonPxValues.map(px => ({
      px,
      rem: formatNumber(px / baseFontSize),
      em: formatNumber(px / baseFontSize),
      pt: formatNumber(px * 0.75),
      pct: formatNumber((px / baseFontSize) * 100),
    }))
  }, [baseFontSize])

  return (
    <ToolPage title="CSS Unit Converter" description="Convert between px, rem, em, %, pt, vw, and vh with a customizable base font size." category="css" categoryLabel="CSS Tools">
      <div className="space-y-6">
        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 rounded-lg bg-muted">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Base Font Size (px)</label>
            <input type="number" min={1} value={baseFontSize} onChange={e => setBaseFontSize(Math.max(1, +e.target.value))} className="w-full rounded border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Viewport Width (px)</label>
            <input type="number" min={1} value={viewportWidth} onChange={e => setViewportWidth(Math.max(1, +e.target.value))} className="w-full rounded border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Viewport Height (px)</label>
            <input type="number" min={1} value={viewportHeight} onChange={e => setViewportHeight(Math.max(1, +e.target.value))} className="w-full rounded border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Converter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium block">Input</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter value"
              />
              <select
                value={fromUnit}
                onChange={e => setFromUnit(e.target.value as Unit)}
                className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium block">Results</label>
            {!conversions && <p className="text-sm text-muted-foreground">Enter a valid number to see conversions.</p>}
            {conversions && (
              <div className="grid grid-cols-1 gap-2">
                {units.map(unit => (
                  <div key={unit} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                    <div>
                      <span className="text-xs text-muted-foreground">{unitLabels[unit]}</span>
                      <p className="text-sm font-mono font-semibold">{conversions[unit]}{unit}</p>
                    </div>
                    <CopyButton text={`${conversions[unit]}${unit}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reference Table */}
        <div>
          <label className="text-sm font-medium mb-3 block">Common Values Reference (base: {baseFontSize}px)</label>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-xs font-semibold text-muted-foreground">px</th>
                  <th className="text-left p-2 text-xs font-semibold text-muted-foreground">rem</th>
                  <th className="text-left p-2 text-xs font-semibold text-muted-foreground">em</th>
                  <th className="text-left p-2 text-xs font-semibold text-muted-foreground">pt</th>
                  <th className="text-left p-2 text-xs font-semibold text-muted-foreground">%</th>
                </tr>
              </thead>
              <tbody>
                {conversionTable.map(row => (
                  <tr key={row.px} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-2 font-mono">{row.px}px</td>
                    <td className="p-2 font-mono">{row.rem}rem</td>
                    <td className="p-2 font-mono">{row.em}em</td>
                    <td className="p-2 font-mono">{row.pt}pt</td>
                    <td className="p-2 font-mono">{row.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
