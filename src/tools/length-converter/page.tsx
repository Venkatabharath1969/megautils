'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toMeters: number }[] = [
  { value: 'meter', label: 'Meter (m)', toMeters: 1 },
  { value: 'kilometer', label: 'Kilometer (km)', toMeters: 1000 },
  { value: 'centimeter', label: 'Centimeter (cm)', toMeters: 0.01 },
  { value: 'millimeter', label: 'Millimeter (mm)', toMeters: 0.001 },
  { value: 'mile', label: 'Mile (mi)', toMeters: 1609.344 },
  { value: 'yard', label: 'Yard (yd)', toMeters: 0.9144 },
  { value: 'foot', label: 'Foot (ft)', toMeters: 0.3048 },
  { value: 'inch', label: 'Inch (in)', toMeters: 0.0254 },
  { value: 'nautical_mile', label: 'Nautical Mile (nmi)', toMeters: 1852 },
]

export default function LengthConverterTool() {
  const [input, setInput] = useState('1')
  const [fromUnit, setFromUnit] = useState('meter')
  const [toUnit, setToUnit] = useState('foot')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find((u) => u.value === fromUnit)!
    const to = units.find((u) => u.value === toUnit)!
    const meters = val * from.toMeters
    const converted = meters / to.toMeters
    return converted.toLocaleString('en-US', { maximumFractionDigits: 10 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Length Converter"
      description="Convert between meters, kilometers, miles, feet, inches, and more length units."
      category="converters"
      categoryLabel="Unit Converters"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        {/* From */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">From</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {units.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Value</label>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter value"
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center pb-1">
          <button
            onClick={swap}
            className="p-2.5 rounded-full border border-border bg-card hover:bg-muted transition-colors"
            title="Swap units"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
          </button>
        </div>

        {/* To */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">To</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {units.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Result</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={result}
                readOnly
                className="w-full h-10 px-3 rounded-lg border border-input bg-muted/50 text-sm focus:outline-none"
              />
              {result && <CopyButton text={result} />}
            </div>
          </div>
        </div>
      </div>

      {/* Quick reference table */}
      {input && !isNaN(parseFloat(input)) && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">All Conversions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {units.map((u) => {
              const from = units.find((x) => x.value === fromUnit)!
              const val = parseFloat(input) * from.toMeters / u.toMeters
              return (
                <div key={u.value} className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${u.value === toUnit ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'}`}>
                  <span className="text-muted-foreground">{u.label}</span>
                  <span className="font-mono font-medium">{val.toLocaleString('en-US', { maximumFractionDigits: 8 })}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </ToolPage>
  )
}
