'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

type UnitType = 'volume' | 'weight'

const units: { value: string; label: string; toMl: number; type: UnitType }[] = [
  // Volume units (base: mL)
  { value: 'ml', label: 'Milliliter (mL)', toMl: 1, type: 'volume' },
  { value: 'l', label: 'Liter (L)', toMl: 1000, type: 'volume' },
  { value: 'tsp', label: 'Teaspoon (tsp)', toMl: 4.929, type: 'volume' },
  { value: 'tbsp', label: 'Tablespoon (tbsp)', toMl: 14.787, type: 'volume' },
  { value: 'floz', label: 'Fluid ounce (fl oz)', toMl: 29.574, type: 'volume' },
  { value: 'cup', label: 'Cup', toMl: 236.588, type: 'volume' },
  { value: 'pint', label: 'Pint (pt)', toMl: 473.176, type: 'volume' },
  { value: 'quart', label: 'Quart (qt)', toMl: 946.353, type: 'volume' },
  { value: 'gallon', label: 'Gallon (gal)', toMl: 3785.41, type: 'volume' },
  // Weight/mass units (base: grams, using toMl field as toGrams)
  { value: 'g', label: 'Gram (g)', toMl: 1, type: 'weight' },
  { value: 'kg', label: 'Kilogram (kg)', toMl: 1000, type: 'weight' },
  { value: 'oz', label: 'Ounce (oz)', toMl: 28.3495, type: 'weight' },
  { value: 'lb', label: 'Pound (lb)', toMl: 453.592, type: 'weight' },
]

const ingredientDensities = [
  { ingredient: 'All-purpose Flour', cup: '1 cup', grams: '125g' },
  { ingredient: 'Granulated Sugar', cup: '1 cup', grams: '200g' },
  { ingredient: 'Butter', cup: '1 cup', grams: '227g' },
  { ingredient: 'Rice (uncooked)', cup: '1 cup', grams: '185g' },
  { ingredient: 'Milk', cup: '1 cup', grams: '244g' },
  { ingredient: 'Brown Sugar (packed)', cup: '1 cup', grams: '220g' },
  { ingredient: 'Honey', cup: '1 cup', grams: '340g' },
  { ingredient: 'Cocoa Powder', cup: '1 cup', grams: '85g' },
  { ingredient: 'Rolled Oats', cup: '1 cup', grams: '90g' },
  { ingredient: 'Vegetable Oil', cup: '1 cup', grams: '218g' },
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
    if (from.type !== to.type) return 'Cannot convert between volume and weight'
    const base = val * from.toMl
    const converted = base / to.toMl
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
            <li>Select the <strong>source unit</strong> from the left dropdown or input field.</li>
            <li>Enter the numeric value you want to convert.</li>
            <li>All target unit values update <strong>automatically</strong> as you type.</li>
            <li>Click any result to <strong>copy</strong> it to your clipboard.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when following recipes from different countries, scaling recipes up or down, or converting between metric and imperial cooking units. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this cooking tool saves time and eliminates the need for desktop software installation.</p>

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

      {result && (() => {
        const from = units.find(u => u.value === fromUnit)!
        const to = units.find(u => u.value === toUnit)!
        if (from.type !== to.type) return null
        const factor = from.toMl / to.toMl
        return (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border text-sm">
            <span className="font-medium text-muted-foreground">Formula: </span>
            <span className="font-mono">1 {from.label.split(' (')[0]} = {factor.toLocaleString('en-US', { maximumFractionDigits: 6 })} {to.label.split(' (')[0]}</span>
          </div>
        )
      })()}

      {input && !isNaN(parseFloat(input)) && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">All Conversions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {units.filter(u => u.type === units.find(x => x.value === fromUnit)!.type).map(u => {
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
          <div className="p-2.5 rounded-lg bg-muted/50">1 pound = 16 ounces</div>
          <div className="p-2.5 rounded-lg bg-muted/50">1 kilogram = 2.205 pounds</div>
        </div>
      </div>

      {/* Ingredient Density Reference Table */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold mb-3">Common Ingredient Densities</h3>
        <p className="text-xs text-muted-foreground mb-3">Approximate weight of 1 cup of common ingredients (US cup = 236.6 mL)</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Ingredient</th>
                <th className="px-3 py-2 text-left font-medium">Volume</th>
                <th className="px-3 py-2 text-left font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              {ingredientDensities.map((item) => (
                <tr key={item.ingredient} className="border-t border-border">
                  <td className="px-3 py-2">{item.ingredient}</td>
                  <td className="px-3 py-2 text-muted-foreground">{item.cup}</td>
                  <td className="px-3 py-2 font-mono font-medium">{item.grams}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
