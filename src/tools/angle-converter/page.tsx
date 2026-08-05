'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toDeg: number }[] = [
  { value: 'deg', label: 'Degrees (°)', toDeg: 1 },
  { value: 'rad', label: 'Radians (rad)', toDeg: 180 / Math.PI },
  { value: 'grad', label: 'Gradians (gon)', toDeg: 0.9 },
  { value: 'turn', label: 'Turns', toDeg: 360 },
  { value: 'arcmin', label: 'Arc minutes (\')', toDeg: 1 / 60 },
  { value: 'arcsec', label: 'Arc seconds (")', toDeg: 1 / 3600 },
  { value: 'mrad', label: 'Milliradians (mrad)', toDeg: 180 / (Math.PI * 1000) },
]

export default function AngleConverterTool() {
  const [input, setInput] = useState('180')
  const [fromUnit, setFromUnit] = useState('deg')
  const [toUnit, setToUnit] = useState('rad')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find(u => u.value === fromUnit)!
    const to = units.find(u => u.value === toUnit)!
    const degrees = val * from.toDeg
    const converted = degrees / to.toDeg
    return converted.toLocaleString('en-US', { maximumFractionDigits: 8 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Angle Converter"
      description="Convert between degrees, radians, gradians, turns, arc minutes, and arc seconds."
      category="converters"
      categoryLabel="Unit Converters"
      faqs={[
        { question: 'How many radians are in 180 degrees?', answer: '180 degrees equals exactly pi radians, which is approximately 3.14159 radians. This is one of the most fundamental angle conversions in mathematics.' },
        { question: 'What is a gradian?', answer: 'A gradian (also called a gon) divides a right angle into 100 equal parts, so a full circle is 400 gradians. It is primarily used in surveying and some European countries.' },
        { question: 'How do you convert degrees to arc minutes?', answer: 'Multiply the degree value by 60 to get arc minutes. Each degree contains 60 arc minutes, and each arc minute contains 60 arc seconds.' },
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
              const val = parseFloat(input) * from.toDeg / u.toDeg
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
