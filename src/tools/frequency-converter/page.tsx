'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toHz: number }[] = [
  { value: 'hz', label: 'Hertz (Hz)', toHz: 1 },
  { value: 'khz', label: 'Kilohertz (kHz)', toHz: 1000 },
  { value: 'mhz', label: 'Megahertz (MHz)', toHz: 1e6 },
  { value: 'ghz', label: 'Gigahertz (GHz)', toHz: 1e9 },
  { value: 'thz', label: 'Terahertz (THz)', toHz: 1e12 },
  { value: 'rpm', label: 'RPM (rev/min)', toHz: 1 / 60 },
  { value: 'rads', label: 'Radians/second', toHz: 1 / (2 * Math.PI) },
]

export default function FrequencyConverterTool() {
  const [input, setInput] = useState('1')
  const [fromUnit, setFromUnit] = useState('ghz')
  const [toUnit, setToUnit] = useState('mhz')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find(u => u.value === fromUnit)!
    const to = units.find(u => u.value === toUnit)!
    const hz = val * from.toHz
    const converted = hz / to.toHz
    return converted.toLocaleString('en-US', { maximumFractionDigits: 6 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Frequency Converter"
      description="Convert between Hz, kHz, MHz, GHz, THz, RPM, and radians/second."
      category="converters"
      categoryLabel="Unit Converters"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Frequency Converter is a free browser-based tool that lets you convert between frequency units including hertz, kilohertz, megahertz, gigahertz, and RPM. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when electronics calculations, understanding wireless specifications, audio engineering, or motor speed conversions. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this engineering tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need frequency conversion.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How many MHz are in 1 GHz?', answer: 'One gigahertz (GHz) equals 1,000 megahertz (MHz). For example, a 2.4 GHz Wi-Fi signal operates at 2,400 MHz.' },
        { question: 'How do you convert RPM to Hz?', answer: 'Divide the RPM value by 60 to get hertz. For example, a motor spinning at 3,600 RPM has a frequency of 60 Hz.' },
        { question: 'What is the difference between Hz and radians per second?', answer: 'Hertz measures cycles per second while radians per second measures angular velocity. One Hz equals 2*pi (approximately 6.2832) radians per second.' },
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
              const val = parseFloat(input) * from.toHz / u.toHz
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
