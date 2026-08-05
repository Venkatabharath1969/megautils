'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toKg: number }[] = [
  { value: 'kilogram', label: 'Kilogram (kg)', toKg: 1 },
  { value: 'gram', label: 'Gram (g)', toKg: 0.001 },
  { value: 'milligram', label: 'Milligram (mg)', toKg: 0.000001 },
  { value: 'pound', label: 'Pound (lb)', toKg: 0.45359237 },
  { value: 'ounce', label: 'Ounce (oz)', toKg: 0.028349523125 },
  { value: 'ton', label: 'Metric Ton (t)', toKg: 1000 },
  { value: 'stone', label: 'Stone (st)', toKg: 6.35029318 },
  { value: 'grain', label: 'Grain (gr)', toKg: 0.00006479891 },
]

export default function WeightConverterTool() {
  const [input, setInput] = useState('1')
  const [fromUnit, setFromUnit] = useState('kilogram')
  const [toUnit, setToUnit] = useState('pound')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find((u) => u.value === fromUnit)!
    const to = units.find((u) => u.value === toUnit)!
    const kg = val * from.toKg
    const converted = kg / to.toKg
    return converted.toLocaleString('en-US', { maximumFractionDigits: 10 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Weight Converter"
      description="Convert between kilograms, grams, pounds, ounces, tons, stones, and more."
      category="converters"
      categoryLabel="Unit Converters"
      faqs={[
        { question: 'How many pounds are in a kilogram?', answer: 'One kilogram equals approximately 2.20462 pounds. Conversely, one pound equals exactly 0.45359237 kilograms.' },
        { question: 'What is a stone and where is it used?', answer: 'A stone equals 14 pounds (approximately 6.35 kg) and is commonly used in the United Kingdom and Ireland to measure body weight.' },
        { question: 'What is the difference between a metric ton and a short ton?', answer: 'A metric ton (tonne) equals 1,000 kilograms or about 2,204.6 pounds, while a US short ton equals 2,000 pounds or about 907.2 kilograms.' },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
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

        <div className="flex justify-center pb-1">
          <button onClick={swap} className="p-2.5 rounded-full border border-border bg-card hover:bg-muted transition-colors" title="Swap units">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4" /><path d="M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
          </button>
        </div>

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
              <input type="text" value={result} readOnly className="w-full h-10 px-3 rounded-lg border border-input bg-muted/50 text-sm focus:outline-none" />
              {result && <CopyButton text={result} />}
            </div>
          </div>
        </div>
      </div>

      {input && !isNaN(parseFloat(input)) && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">All Conversions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {units.map((u) => {
              const from = units.find((x) => x.value === fromUnit)!
              const val = parseFloat(input) * from.toKg / u.toKg
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
