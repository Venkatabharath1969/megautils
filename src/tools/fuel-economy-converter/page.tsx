'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

// All units stored as conversion factor to km/L
// L/100km is inverse, handled specially
const units: { value: string; label: string; type: 'direct' | 'inverse'; factor: number }[] = [
  { value: 'kml', label: 'Kilometers per liter (km/L)', type: 'direct', factor: 1 },
  { value: 'mpg_us', label: 'Miles per gallon (US)', type: 'direct', factor: 0.425144 },
  { value: 'mpg_uk', label: 'Miles per gallon (UK)', type: 'direct', factor: 0.354006 },
  { value: 'l100km', label: 'Liters per 100km (L/100km)', type: 'inverse', factor: 100 },
]

function toKmL(value: number, unit: typeof units[number]): number {
  if (unit.type === 'inverse') return value > 0 ? unit.factor / value : 0
  return value * unit.factor
}

function fromKmL(kml: number, unit: typeof units[number]): number {
  if (unit.type === 'inverse') return kml > 0 ? unit.factor / kml : 0
  return unit.factor > 0 ? kml / unit.factor : 0
}

export default function FuelEconomyConverterTool() {
  const [input, setInput] = useState('30')
  const [fromUnit, setFromUnit] = useState('mpg_us')
  const [toUnit, setToUnit] = useState('l100km')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val) || val <= 0) return ''
    const from = units.find(u => u.value === fromUnit)!
    const to = units.find(u => u.value === toUnit)!
    const kml = toKmL(val, from)
    const converted = fromKmL(kml, to)
    return converted.toLocaleString('en-US', { maximumFractionDigits: 4 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Fuel Economy Converter"
      description="Convert between km/L, mpg (US), mpg (UK), and L/100km fuel consumption units."
      category="converters"
      categoryLabel="Unit Converters"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Fuel Economy Converter is a free browser-based tool that lets you convert between fuel economy units including MPG (US), MPG (UK), km/L, and L/100km. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Select the <strong>source unit</strong> from the left dropdown or input field.</li>
            <li>Enter the numeric value you want to convert.</li>
            <li>All target unit values update <strong>automatically</strong> as you type.</li>
            <li>Click any result to <strong>copy</strong> it to your clipboard.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when comparing vehicle fuel efficiency across different measurement systems used in various countries. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this automotive tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All conversions use mathematically precise formulas with no rounding until the final display.</li>
            <li>Metric and imperial units are both supported — the tool automatically handles the conversion factors.</li>
            <li>Results update in real time as you type, so you can quickly compare different values.</li>
            <li>Bookmark specific conversions you use frequently for instant access.</li>
            <li>All calculations run in your browser — no data is sent to any server.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I convert MPG to L/100km?', answer: 'Divide 235.215 by the MPG (US) value to get L/100km. For example, 30 MPG equals approximately 7.84 L/100km.' },
        { question: 'What is the difference between US MPG and UK MPG?', answer: 'US MPG uses the US gallon (3.785 liters) while UK MPG uses the imperial gallon (4.546 liters). A UK MPG value will always be higher than US MPG for the same vehicle.' },
        { question: 'What is a good fuel economy in L/100km?', answer: 'A fuel economy of 6-8 L/100km is considered good for a gasoline car. Hybrid vehicles typically achieve 4-5 L/100km, while large SUVs may use 10-15 L/100km.' },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5">From</label>
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Value</label>
            <input type="number" value={input} onChange={e => setInput(e.target.value)} placeholder="Enter value" className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
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
            <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
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

      {result && (() => {
        const from = units.find(u => u.value === fromUnit)!
        const to = units.find(u => u.value === toUnit)!
        const oneKml = toKmL(1, from)
        const converted = fromKmL(oneKml, to)
        return (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border text-sm">
            <span className="font-medium text-muted-foreground">Formula: </span>
            <span className="font-mono">1 {from.label.split(' (')[0]} = {converted.toLocaleString('en-US', { maximumFractionDigits: 6 })} {to.label.split(' (')[0]}</span>
          </div>
        )
      })()}

      {input && !isNaN(parseFloat(input)) && parseFloat(input) > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">All Conversions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {units.map(u => {
              const from = units.find(x => x.value === fromUnit)!
              const kml = toKmL(parseFloat(input), from)
              const val = fromKmL(kml, u)
              return (
                <div key={u.value} className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${u.value === toUnit ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'}`}>
                  <span className="text-muted-foreground">{u.label}</span>
                  <span className="font-mono font-medium">{val.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </ToolPage>
  )
}
