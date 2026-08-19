'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

type Base = 'binary' | 'octal' | 'decimal' | 'hexadecimal'

const bases: { key: Base; label: string; radix: number; prefix: string; validChars: RegExp }[] = [
  { key: 'binary', label: 'Binary (Base 2)', radix: 2, prefix: '0b', validChars: /^[01]*$/ },
  { key: 'octal', label: 'Octal (Base 8)', radix: 8, prefix: '0o', validChars: /^[0-7]*$/ },
  { key: 'decimal', label: 'Decimal (Base 10)', radix: 10, prefix: '', validChars: /^[0-9]*$/ },
  { key: 'hexadecimal', label: 'Hexadecimal (Base 16)', radix: 16, prefix: '0x', validChars: /^[0-9a-fA-F]*$/ },
]

export default function NumberBaseConverterTool() {
  const [inputBase, setInputBase] = useState<Base>('decimal')
  const [inputValue, setInputValue] = useState('255')
  const [customBase, setCustomBase] = useState('7')

  const conversions = useMemo(() => {
    const base = bases.find((b) => b.key === inputBase)!
    const trimmed = inputValue.trim()
    if (!trimmed) return null

    if (!base.validChars.test(trimmed)) {
      return { error: `Invalid ${base.label} number` }
    }

    const decimalVal = parseInt(trimmed, base.radix)
    if (isNaN(decimalVal) || decimalVal < 0) {
      return { error: 'Invalid number' }
    }

    const customRadix = parseInt(customBase, 10)
    const customResult = customRadix >= 2 && customRadix <= 36
      ? decimalVal.toString(customRadix).toUpperCase()
      : null

    return {
      binary: decimalVal.toString(2),
      octal: decimalVal.toString(8),
      decimal: decimalVal.toString(10),
      hexadecimal: decimalVal.toString(16).toUpperCase(),
      custom: customResult,
      customRadix: customRadix >= 2 && customRadix <= 36 ? customRadix : null,
    }
  }, [inputValue, inputBase, customBase])

  const isError = conversions && 'error' in conversions
  const results = conversions && !isError ? conversions : null

  const handleInputChange = (val: string) => {
    setInputValue(val)
  }

  return (
    <ToolPage
      title="Number Base Converter"
      description="Convert between binary, octal, decimal, and hexadecimal. Enter in any base and see all four simultaneously."
      category="converters"
      categoryLabel="Unit Converters"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Number Base Converter is a free browser-based tool that lets you convert numbers between decimal, binary, octal, and hexadecimal number systems. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Select the <strong>source unit</strong> from the left dropdown or input field.</li>
            <li>Enter the numeric value you want to convert.</li>
            <li>All target unit values update <strong>automatically</strong> as you type.</li>
            <li>Click any result to <strong>copy</strong> it to your clipboard.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when programming tasks involving bitwise operations, understanding memory addresses, debugging binary data, or learning computer science. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this computing tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I convert binary to decimal?', answer: 'Select "Binary (Base 2)" as the input base, enter your binary number, and the decimal equivalent appears instantly alongside octal and hexadecimal values.' },
        { question: 'What is the difference between binary, octal, decimal, and hexadecimal?', answer: 'They are number systems with different bases: binary uses 2 digits (0-1), octal uses 8 (0-7), decimal uses 10 (0-9), and hexadecimal uses 16 (0-9, A-F).' },
        { question: 'How do I convert hex to binary?', answer: 'Select "Hexadecimal (Base 16)" as the input, enter your hex value, and the binary conversion is displayed automatically.' },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Input Base</label>
            <select
              value={inputBase}
              onChange={(e) => {
                setInputBase(e.target.value as Base)
                setInputValue('')
              }}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {bases.map((b) => (
                <option key={b.key} value={b.key}>{b.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Value</label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`Enter ${inputBase} number`}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Validation error */}
        {isError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            {conversions.error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-3">
            {bases.map((b) => {
              const val = results[b.key]
              const displayVal = b.key === 'binary'
                ? val.replace(/(.{4})/g, '$1 ').trim()
                : val
              return (
                <div
                  key={b.key}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    b.key === inputBase
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground mb-1">{b.label}</div>
                    <div className="text-lg font-mono font-semibold break-all">
                      <span className="text-muted-foreground">{b.prefix}</span>
                      {displayVal}
                    </div>
                  </div>
                  <div className="ml-3 shrink-0">
                    <CopyButton text={val} />
                  </div>
                </div>
              )
            })}
            {results.custom !== null && results.custom !== undefined && (
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Custom (Base {results.customRadix})</div>
                  <div className="text-lg font-mono font-semibold break-all">{results.custom}</div>
                </div>
                <div className="ml-3 shrink-0">
                  <CopyButton text={results.custom} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom base input */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <h3 className="text-sm font-semibold mb-2">Custom Base Conversion</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Base (2-36):</label>
            <input
              type="number"
              min={2}
              max={36}
              value={customBase}
              onChange={(e) => setCustomBase(e.target.value)}
              className="w-20 h-9 px-3 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {(parseInt(customBase, 10) < 2 || parseInt(customBase, 10) > 36 || isNaN(parseInt(customBase, 10))) && (
              <span className="text-xs text-red-500">Must be 2-36</span>
            )}
          </div>
        </div>

        {/* Quick reference */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <h3 className="text-sm font-semibold mb-2">Valid Characters</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div><span className="font-medium text-foreground">Binary:</span> 0, 1</div>
            <div><span className="font-medium text-foreground">Octal:</span> 0-7</div>
            <div><span className="font-medium text-foreground">Decimal:</span> 0-9</div>
            <div><span className="font-medium text-foreground">Hexadecimal:</span> 0-9, A-F</div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
