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

    return {
      binary: decimalVal.toString(2),
      octal: decimalVal.toString(8),
      decimal: decimalVal.toString(10),
      hexadecimal: decimalVal.toString(16).toUpperCase(),
    }
  }, [inputValue, inputBase])

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
          </div>
        )}

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
