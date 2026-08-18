'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const units: { value: string; label: string; toMl: number }[] = [
  { value: 'ml', label: 'Milliliter (mL)', toMl: 1 },
  { value: 'l', label: 'Liter (L)', toMl: 1000 },
  { value: 'tsp', label: 'Teaspoon (tsp)', toMl: 4.929 },
  { value: 'tbsp', label: 'Tablespoon (tbsp)', toMl: 14.787 },
  { value: 'floz', label: 'Fluid ounce (fl oz)', toMl: 29.574 },
  { value: 'cup', label: 'Cup', toMl: 236.588 },
  { value: 'pint', label: 'Pint (pt)', toMl: 473.176 },
  { value: 'quart', label: 'Quart (qt)', toMl: 946.353 },
  { value: 'gallon', label: 'Gallon (gal)', toMl: 3785.41 },
]

export default function CookingConverterTool() {
  const [input, setInput] = useState('1')
  const [fromUnit, setFromUnit] = useState('cup')
  const [toUnit, setToUnit] = useState('ml')

  const result = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return ''
    const from = units.find(u => u.value === fromUnit)!
    const to = units.find(u => u.value === toUnit)!
    const ml = val * from.toMl
    const converted = ml / to.toMl
    return converted.toLocaleString('en-US', { maximumFractionDigits: 4 })
  }, [input, fromUnit, toUnit])

  const swap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <ToolPage
      title="Cooking Converter"
      description="Convert between cups, tablespoons, teaspoons, mL, fluid ounces, liters, pints, quarts, and gallons."
      category="converters"
      categoryLabel="Unit Converters"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Cooking Converter is a free browser-based tool that lets you convert between cooking measurements including cups, tablespoons, teaspoons, milliliters, liters, ounces, grams, and pounds. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when following recipes from different countries, scaling recipes up or down, or converting between metric and imperial cooking units. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this cooking tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need cooking unit conversion.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How many tablespoons are in a cup?', answer: 'There are 16 tablespoons in one US cup. This is one of the most common cooking measurement conversions.' },
        { question: 'How many mL is one cup?', answer: 'One US cup equals approximately 236.6 milliliters. Note that metric, US, and imperial cups differ slightly in volume.' },
        { question: 'How many teaspoons are in a tablespoon?', answer: 'There are 3 teaspoons in one tablespoon. So one tablespoon equals approximately 14.8 mL.' },
        { question: 'How do I convert fluid ounces to mL?', answer: 'Multiply the number of US fluid ounces by 29.574 to get milliliters. For example, 8 fl oz equals approximately 236.6 mL, which is one cup.' },
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
              const val = parseFloat(input) * from.toMl / u.toMl
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

      {/* Quick reference */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold mb-3">Quick Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="p-2.5 rounded-lg bg-muted/50">1 cup = 16 tablespoons</div>
          <div className="p-2.5 rounded-lg bg-muted/50">1 tablespoon = 3 teaspoons</div>
          <div className="p-2.5 rounded-lg bg-muted/50">1 cup = 236.6 mL</div>
          <div className="p-2.5 rounded-lg bg-muted/50">1 gallon = 4 quarts = 16 cups</div>
          <div className="p-2.5 rounded-lg bg-muted/50">1 pint = 2 cups</div>
          <div className="p-2.5 rounded-lg bg-muted/50">1 quart = 4 cups</div>
        </div>
      </div>
    </ToolPage>
  )
}
