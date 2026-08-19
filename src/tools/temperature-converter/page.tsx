'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

type TempUnit = 'celsius' | 'fahrenheit' | 'kelvin'

function convert(value: number, from: TempUnit): { celsius: number; fahrenheit: number; kelvin: number } {
  let c: number
  switch (from) {
    case 'celsius':
      c = value
      break
    case 'fahrenheit':
      c = (value - 32) * 5 / 9
      break
    case 'kelvin':
      c = value - 273.15
      break
  }
  return {
    celsius: c,
    fahrenheit: c * 9 / 5 + 32,
    kelvin: c + 273.15,
  }
}

export default function TemperatureConverterTool() {
  const [input, setInput] = useState('100')
  const [fromUnit, setFromUnit] = useState<TempUnit>('celsius')

  const results = useMemo(() => {
    const val = parseFloat(input)
    if (isNaN(val)) return null
    return convert(val, fromUnit)
  }, [input, fromUnit])

  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 4 })

  const unitInfo: { key: TempUnit; label: string; symbol: string; color: string }[] = [
    { key: 'celsius', label: 'Celsius', symbol: '\u00B0C', color: 'text-blue-600 dark:text-blue-400' },
    { key: 'fahrenheit', label: 'Fahrenheit', symbol: '\u00B0F', color: 'text-orange-600 dark:text-orange-400' },
    { key: 'kelvin', label: 'Kelvin', symbol: 'K', color: 'text-purple-600 dark:text-purple-400' },
  ]

  return (
    <ToolPage
      title="Temperature Converter"
      description="Convert between Celsius, Fahrenheit, and Kelvin. See all three values simultaneously."
      category="converters"
      categoryLabel="Unit Converters"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Temperature Converter is a free browser-based tool that lets you convert between Celsius, Fahrenheit, and Kelvin temperature scales with instant results. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Select the <strong>source unit</strong> from the left dropdown or input field.</li>
            <li>Enter the numeric value you want to convert.</li>
            <li>All target unit values update <strong>automatically</strong> as you type.</li>
            <li>Click any result to <strong>copy</strong> it to your clipboard.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when cooking temperature conversions, understanding weather forecasts in different scales, or scientific calculations. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this measurement tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is the formula to convert Celsius to Fahrenheit?', answer: 'Multiply the Celsius temperature by 9/5 and add 32. For example, 100°C equals (100 × 9/5) + 32 = 212°F.' },
        { question: 'What is absolute zero in each temperature scale?', answer: 'Absolute zero is 0 K (Kelvin), which equals -273.15°C and -459.67°F. It is the lowest theoretically possible temperature where molecular motion stops.' },
        { question: 'When should I use Kelvin instead of Celsius?', answer: 'Kelvin is used in scientific calculations, especially in physics and chemistry, because it starts at absolute zero and has no negative values, simplifying thermodynamic equations.' },
      ]}
    >
      <div className="max-w-xl mx-auto space-y-6">
        {/* Input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Temperature</label>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter temperature"
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Scale</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value as TempUnit)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {unitInfo.map((u) => (
                <option key={u.key} value={u.key}>{u.label} ({u.symbol})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-3">
            {unitInfo.map((u) => {
              const val = results[u.key]
              return (
                <div
                  key={u.key}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    u.key === fromUnit ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'
                  }`}
                >
                  <div>
                    <div className="text-sm text-muted-foreground">{u.label}</div>
                    <div className={`text-2xl font-bold ${u.color}`}>
                      {fmt(val)} {u.symbol}
                    </div>
                  </div>
                  <CopyButton text={fmt(val)} />
                </div>
              )
            })}
          </div>
        )}

        {/* Formulas */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <h3 className="text-sm font-semibold mb-2">Conversion Formulas</h3>
          <div className="space-y-1 text-xs text-muted-foreground font-mono">
            <p>&deg;F = &deg;C &times; 9/5 + 32</p>
            <p>&deg;C = (&deg;F &minus; 32) &times; 5/9</p>
            <p>K = &deg;C + 273.15</p>
            <p>&deg;C = K &minus; 273.15</p>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
