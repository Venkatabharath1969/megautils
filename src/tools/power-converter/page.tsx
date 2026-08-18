'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toWatt: number }[] = [
  { value: 'w', label: 'Watt (W)', toWatt: 1 },
  { value: 'kw', label: 'Kilowatt (kW)', toWatt: 1000 },
  { value: 'mw', label: 'Megawatt (MW)', toWatt: 1e6 },
  { value: 'gw', label: 'Gigawatt (GW)', toWatt: 1e9 },
  { value: 'hp', label: 'Horsepower (hp)', toWatt: 745.7 },
  { value: 'btuh', label: 'BTU/hour', toWatt: 0.29307107 },
  { value: 'ftlbs', label: 'Foot-pound/second', toWatt: 1.35582 },
  { value: 'dbm', label: 'Milliwatt (mW)', toWatt: 0.001 },
]

export default function PowerConverterTool() {
  const [input, setInput] = useState('1')
  const [fromUnit, setFromUnit] = useState('kw')
  const [toUnit, setToUnit] = useState('hp')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find(u => u.value === fromUnit)!
    const to = units.find(u => u.value === toUnit)!
    const watts = val * from.toWatt
    const converted = watts / to.toWatt
    return converted.toLocaleString('en-US', { maximumFractionDigits: 6 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Power Converter"
      description="Convert between watt, kilowatt, megawatt, horsepower, BTU/hour, and more."
      category="converters"
      categoryLabel="Unit Converters"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Power Converter is a free browser-based tool that lets you convert between power units including watts, kilowatts, horsepower, BTU/hour, and foot-pounds per second. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when comparing engine specifications, understanding appliance power consumption, or engineering calculations. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this engineering tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need power conversion.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How many watts are in one horsepower?', answer: 'One mechanical horsepower equals approximately 745.7 watts. This is the standard conversion used in automotive and industrial contexts.' },
        { question: 'What is the difference between kW and kWh?', answer: 'A kilowatt (kW) measures power, which is the rate of energy use at a given moment. A kilowatt-hour (kWh) measures energy, which is the total amount consumed over time.' },
        { question: 'How do I convert BTU/hour to watts?', answer: 'Multiply the BTU/hour value by 0.29307 to get the equivalent in watts. For example, 10,000 BTU/hr is approximately 2,930.7 watts.' },
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

      {input && !isNaN(parseFloat(input)) && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">All Conversions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {units.map(u => {
              const from = units.find(x => x.value === fromUnit)!
              const val = parseFloat(input) * from.toWatt / u.toWatt
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
