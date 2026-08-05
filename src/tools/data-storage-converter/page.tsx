'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toBits: number }[] = [
  { value: 'bit', label: 'Bit (b)', toBits: 1 },
  { value: 'byte', label: 'Byte (B)', toBits: 8 },
  // SI (decimal)
  { value: 'kilobyte', label: 'Kilobyte (KB)', toBits: 8 * 1e3 },
  { value: 'megabyte', label: 'Megabyte (MB)', toBits: 8 * 1e6 },
  { value: 'gigabyte', label: 'Gigabyte (GB)', toBits: 8 * 1e9 },
  { value: 'terabyte', label: 'Terabyte (TB)', toBits: 8 * 1e12 },
  { value: 'petabyte', label: 'Petabyte (PB)', toBits: 8 * 1e15 },
  // Binary (IEC)
  { value: 'kibibyte', label: 'Kibibyte (KiB)', toBits: 8 * 1024 },
  { value: 'mebibyte', label: 'Mebibyte (MiB)', toBits: 8 * Math.pow(1024, 2) },
  { value: 'gibibyte', label: 'Gibibyte (GiB)', toBits: 8 * Math.pow(1024, 3) },
  { value: 'tebibyte', label: 'Tebibyte (TiB)', toBits: 8 * Math.pow(1024, 4) },
  { value: 'pebibyte', label: 'Pebibyte (PiB)', toBits: 8 * Math.pow(1024, 5) },
]

function smartFormat(n: number): string {
  if (n === 0) return '0'
  if (Math.abs(n) >= 1e15) return n.toExponential(4)
  if (Math.abs(n) < 0.0001 && n !== 0) return n.toExponential(4)
  return n.toLocaleString('en-US', { maximumFractionDigits: 6 })
}

export default function DataStorageConverterTool() {
  const [input, setInput] = useState('1')
  const [fromUnit, setFromUnit] = useState('gigabyte')
  const [toUnit, setToUnit] = useState('megabyte')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find((u) => u.value === fromUnit)!
    const to = units.find((u) => u.value === toUnit)!
    const bits = val * from.toBits
    const converted = bits / to.toBits
    return smartFormat(converted)
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Data Storage Converter"
      description="Convert between bits, bytes, KB, MB, GB, TB, PB and their binary equivalents (KiB, MiB, GiB, etc.)."
      category="converters"
      categoryLabel="Unit Converters"
      faqs={[
        { question: 'What is the difference between GB and GiB?', answer: 'A gigabyte (GB) uses the SI standard of 1,000 MB (1 billion bytes), while a gibibyte (GiB) uses the binary standard of 1,024 MiB (1,073,741,824 bytes). This is why a 500 GB drive shows about 465 GiB.' },
        { question: 'How many MB are in a GB?', answer: 'There are 1,000 megabytes (MB) in one gigabyte (GB) using the SI decimal standard. Using binary units, there are 1,024 mebibytes (MiB) in one gibibyte (GiB).' },
        { question: 'How many GB is a TB?', answer: 'One terabyte (TB) equals 1,000 gigabytes (GB) in decimal notation. In binary notation, one tebibyte (TiB) equals 1,024 gibibytes (GiB).' },
        { question: 'Why does my hard drive show less space than advertised?', answer: 'Drive manufacturers use decimal units (1 GB = 1 billion bytes), while operating systems use binary units (1 GiB = 1,073,741,824 bytes). This difference makes drives appear about 7% smaller.' },
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
              <optgroup label="Base">
                {units.slice(0, 2).map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </optgroup>
              <optgroup label="SI (Decimal)">
                {units.slice(2, 7).map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </optgroup>
              <optgroup label="Binary (IEC)">
                {units.slice(7).map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </optgroup>
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
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <optgroup label="Base">
                {units.slice(0, 2).map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </optgroup>
              <optgroup label="SI (Decimal)">
                {units.slice(2, 7).map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </optgroup>
              <optgroup label="Binary (IEC)">
                {units.slice(7).map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </optgroup>
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

      {/* Full conversion table */}
      {input && !isNaN(parseFloat(input)) && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">Conversion Table</h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Unit</th>
                  <th className="text-right p-3 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u, i) => {
                  const from = units.find((x) => x.value === fromUnit)!
                  const val = parseFloat(input) * from.toBits / u.toBits
                  return (
                    <tr key={u.value} className={`${i % 2 === 0 ? 'bg-card' : 'bg-muted/20'} ${u.value === toUnit ? 'ring-1 ring-primary/40' : ''}`}>
                      <td className="p-3">{u.label}</td>
                      <td className="p-3 text-right font-mono">{smartFormat(val)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolPage>
  )
}
