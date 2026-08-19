'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toMs: number }[] = [
  { value: 'kmh', label: 'Kilometers per hour (km/h)', toMs: 1 / 3.6 },
  { value: 'mph', label: 'Miles per hour (mph)', toMs: 0.44704 },
  { value: 'ms', label: 'Meters per second (m/s)', toMs: 1 },
  { value: 'knots', label: 'Knots (kn)', toMs: 0.514444 },
  { value: 'mach', label: 'Mach', toMs: 343 },
]

export default function SpeedConverterTool() {
  const [input, setInput] = useState('100')
  const [fromUnit, setFromUnit] = useState('kmh')
  const [toUnit, setToUnit] = useState('mph')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find((u) => u.value === fromUnit)!
    const to = units.find((u) => u.value === toUnit)!
    const ms = val * from.toMs
    const converted = ms / to.toMs
    return converted.toLocaleString('en-US', { maximumFractionDigits: 6 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Speed Converter"
      description="Convert between km/h, mph, m/s, knots, and Mach."
      category="converters"
      categoryLabel="Unit Converters"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Speed Converter is a free browser-based tool that lets you convert between speed units including km/h, mph, m/s, knots, and feet per second. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Select the <strong>source unit</strong> from the left dropdown or input field.</li>
            <li>Enter the numeric value you want to convert.</li>
            <li>All target unit values update <strong>automatically</strong> as you type.</li>
            <li>Click any result to <strong>copy</strong> it to your clipboard.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when comparing vehicle speeds across unit systems, understanding weather wind speeds, or physics calculations. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this measurement tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I convert km/h to mph?', answer: 'Multiply kilometers per hour by 0.6214 to get miles per hour. For example, 100 km/h equals approximately 62.14 mph.' },
        { question: 'What speed is Mach 1?', answer: 'Mach 1 is the speed of sound, approximately 343 m/s (1,235 km/h or 767 mph) at sea level and 20 degrees Celsius.' },
        { question: 'What are knots and who uses them?', answer: 'A knot is one nautical mile per hour (about 1.852 km/h or 1.151 mph). Knots are used in aviation and maritime navigation worldwide.' },
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
              const val = parseFloat(input) * from.toMs / u.toMs
              return (
                <div key={u.value} className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${u.value === toUnit ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'}`}>
                  <span className="text-muted-foreground">{u.label}</span>
                  <span className="font-mono font-medium">{val.toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </ToolPage>
  )
}
