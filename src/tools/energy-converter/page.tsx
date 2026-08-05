'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toJoule: number }[] = [
  { value: 'j', label: 'Joule (J)', toJoule: 1 },
  { value: 'kj', label: 'Kilojoule (kJ)', toJoule: 1000 },
  { value: 'mj', label: 'Megajoule (MJ)', toJoule: 1e6 },
  { value: 'cal', label: 'Calorie (cal)', toJoule: 4.184 },
  { value: 'kcal', label: 'Kilocalorie (kcal)', toJoule: 4184 },
  { value: 'kwh', label: 'Kilowatt-hour (kWh)', toJoule: 3.6e6 },
  { value: 'wh', label: 'Watt-hour (Wh)', toJoule: 3600 },
  { value: 'btu', label: 'BTU', toJoule: 1055.06 },
  { value: 'ev', label: 'Electronvolt (eV)', toJoule: 1.602176634e-19 },
  { value: 'ftlbf', label: 'Foot-pound (ft·lbf)', toJoule: 1.35582 },
]

export default function EnergyConverterTool() {
  const [input, setInput] = useState('1')
  const [fromUnit, setFromUnit] = useState('kwh')
  const [toUnit, setToUnit] = useState('kj')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find(u => u.value === fromUnit)!
    const to = units.find(u => u.value === toUnit)!
    const joules = val * from.toJoule
    const converted = joules / to.toJoule
    return converted.toLocaleString('en-US', { maximumFractionDigits: 6 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Energy Converter"
      description="Convert between joule, kilojoule, calorie, kilocalorie, kWh, BTU, electronvolt, and more."
      category="converters"
      categoryLabel="Unit Converters"
      faqs={[
        { question: 'How do I convert kilowatt-hours to joules?', answer: 'Multiply kilowatt-hours by 3,600,000 to get joules. One kWh equals 3.6 megajoules (MJ), which is the energy used by a 1,000-watt appliance running for one hour.' },
        { question: 'What is the difference between a calorie and a kilocalorie?', answer: 'A kilocalorie (kcal) equals 1,000 calories. Food labels list energy in kilocalories, often written as "Calories" with a capital C.' },
        { question: 'How many BTU are in a kWh?', answer: 'One kilowatt-hour equals approximately 3,412 BTU. BTU (British Thermal Units) are commonly used to measure heating and cooling capacity.' },
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
              const val = parseFloat(input) * from.toJoule / u.toJoule
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
