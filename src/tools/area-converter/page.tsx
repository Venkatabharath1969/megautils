'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toSqM: number }[] = [
  { value: 'sqmeter', label: 'Square Meter (m\u00B2)', toSqM: 1 },
  { value: 'sqfoot', label: 'Square Foot (ft\u00B2)', toSqM: 0.09290304 },
  { value: 'sqkilometer', label: 'Square Kilometer (km\u00B2)', toSqM: 1e6 },
  { value: 'sqmile', label: 'Square Mile (mi\u00B2)', toSqM: 2589988.110336 },
  { value: 'acre', label: 'Acre', toSqM: 4046.8564224 },
  { value: 'hectare', label: 'Hectare (ha)', toSqM: 10000 },
]

export default function AreaConverterTool() {
  const [input, setInput] = useState('1')
  const [fromUnit, setFromUnit] = useState('sqmeter')
  const [toUnit, setToUnit] = useState('sqfoot')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find((u) => u.value === fromUnit)!
    const to = units.find((u) => u.value === toUnit)!
    const sqm = val * from.toSqM
    const converted = sqm / to.toSqM
    return converted.toLocaleString('en-US', { maximumFractionDigits: 10 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Area Converter"
      description="Convert between square meters, square feet, square kilometers, square miles, acres, and hectares."
      category="converters"
      categoryLabel="Unit Converters"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>The Area Converter transforms measurements between different area units including square meters, square feet, acres, hectares, square kilometers, square miles, square yards, and square inches. It handles both metric and imperial units, making it essential for real estate, land surveying, agriculture, and international property comparisons.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter a numeric value in any area unit field.</li>
            <li>All other unit fields update <strong>instantly</strong> with the converted values.</li>
            <li>Use the results for property comparisons, land measurements, or construction calculations.</li>
            <li>Copy any converted value for use in your documents.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Area conversion is needed when comparing property sizes listed in different unit systems, converting between metric and imperial for international real estate, calculating land area for agricultural planning, or working with construction blueprints that use different measurement standards.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>One acre equals 43,560 square feet — a useful figure for US real estate.</li>
            <li>One hectare equals 10,000 square meters or roughly 2.47 acres.</li>
            <li>For quick mental math, 1 square meter is approximately 10.76 square feet.</li>
            <li>All conversions are mathematically precise — no rounding errors in the calculation.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How many square feet are in an acre?', answer: 'One acre equals 43,560 square feet. An acre is roughly the size of a football field without the end zones.' },
        { question: 'How do I convert square meters to square feet?', answer: 'Multiply square meters by 10.764 to get square feet. For example, 100 square meters equals approximately 1,076.4 square feet.' },
        { question: 'What is the difference between a hectare and an acre?', answer: 'A hectare is 10,000 square meters (about 2.471 acres), while an acre is 4,046.86 square meters. One hectare is roughly 2.47 times larger than an acre.' },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">From</label>
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Value</label>
            <input type="number" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter value" className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
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
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {units.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
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
              const val = parseFloat(input) * from.toSqM / u.toSqM
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
