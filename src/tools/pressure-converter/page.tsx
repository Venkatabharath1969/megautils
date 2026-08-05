'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toPascal: number }[] = [
  { value: 'pa', label: 'Pascal (Pa)', toPascal: 1 },
  { value: 'kpa', label: 'Kilopascal (kPa)', toPascal: 1000 },
  { value: 'bar', label: 'Bar', toPascal: 100000 },
  { value: 'psi', label: 'PSI (lbf/in²)', toPascal: 6894.757 },
  { value: 'atm', label: 'Atmosphere (atm)', toPascal: 101325 },
  { value: 'mmhg', label: 'mmHg (Torr)', toPascal: 133.322 },
  { value: 'torr', label: 'Torr', toPascal: 133.322 },
  { value: 'mbar', label: 'Millibar (mbar)', toPascal: 100 },
]

export default function PressureConverterTool() {
  const [input, setInput] = useState('1')
  const [fromUnit, setFromUnit] = useState('atm')
  const [toUnit, setToUnit] = useState('psi')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find(u => u.value === fromUnit)!
    const to = units.find(u => u.value === toUnit)!
    const pascal = val * from.toPascal
    const converted = pascal / to.toPascal
    return converted.toLocaleString('en-US', { maximumFractionDigits: 6 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Pressure Converter"
      description="Convert between Pascal, bar, PSI, atmosphere, mmHg, torr, and more."
      category="converters"
      categoryLabel="Unit Converters"
      faqs={[
        { question: 'How many PSI is 1 bar?', answer: 'One bar is approximately 14.5038 PSI. Bar is commonly used in Europe while PSI is the standard unit in the United States.' },
        { question: 'What is the difference between atm and bar?', answer: 'One standard atmosphere (atm) equals 1.01325 bar. They are very close in value, but atm is defined by the average sea-level atmospheric pressure while bar is a metric unit.' },
        { question: 'How do you convert mmHg to Pascal?', answer: 'Multiply the mmHg value by 133.322 to get Pascals. For example, standard atmospheric pressure of 760 mmHg equals approximately 101,325 Pa.' },
        { question: 'What is a Torr vs mmHg?', answer: 'Torr and mmHg are nearly identical units of pressure. One Torr is defined as exactly 1/760 of a standard atmosphere, which is approximately equal to 1 mmHg.' },
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
              const val = parseFloat(input) * from.toPascal / u.toPascal
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
