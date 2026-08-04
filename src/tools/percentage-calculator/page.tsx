'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

type Mode = 'whatIs' | 'isWhat' | 'change'

export default function PercentageCalculatorTool() {
  const [mode, setMode] = useState<Mode>('whatIs')
  const [a, setA] = useState('')
  const [b, setB] = useState('')

  const result = useMemo(() => {
    const va = parseFloat(a)
    const vb = parseFloat(b)
    if (isNaN(va) || isNaN(vb)) return null

    switch (mode) {
      case 'whatIs':
        return { value: (va / 100) * vb, label: `${va}% of ${vb} is` }
      case 'isWhat':
        if (vb === 0) return { value: 0, label: 'Cannot divide by zero' }
        return { value: (va / vb) * 100, label: `${va} is this % of ${vb}` }
      case 'change':
        if (va === 0) return { value: 0, label: 'Cannot calculate from zero' }
        return { value: ((vb - va) / Math.abs(va)) * 100, label: `Change from ${va} to ${vb}` }
    }
  }, [a, b, mode])

  const modes: { key: Mode; label: string; aLabel: string; bLabel: string; desc: string }[] = [
    { key: 'whatIs', label: 'What is X% of Y?', aLabel: 'Percentage (X%)', bLabel: 'Number (Y)', desc: 'Calculate a percentage of a number' },
    { key: 'isWhat', label: 'X is what % of Y?', aLabel: 'Number (X)', bLabel: 'Total (Y)', desc: 'Find what percentage X is of Y' },
    { key: 'change', label: '% Change from X to Y', aLabel: 'From (X)', bLabel: 'To (Y)', desc: 'Calculate percentage change between two numbers' },
  ]

  const currentMode = modes.find((m) => m.key === mode)!

  return (
    <ToolPage
      title="Percentage Calculator"
      description="Calculate percentages: what is X% of Y, X is what % of Y, and percentage change."
      category="math"
      categoryLabel="Math & Science"
    >
      <div className="max-w-xl mx-auto space-y-6">
        {/* Mode tabs */}
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setA(''); setB('') }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground border border-border'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{currentMode.desc}</p>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{currentMode.aLabel}</label>
            <input
              type="number"
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="Enter value"
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{currentMode.bLabel}</label>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="Enter value"
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">{result.label}</div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-primary">
                {mode === 'whatIs'
                  ? result.value.toLocaleString('en-US', { maximumFractionDigits: 6 })
                  : `${result.value.toLocaleString('en-US', { maximumFractionDigits: 4 })}%`}
              </div>
              <CopyButton text={result.value.toString()} />
            </div>
            {mode === 'change' && (
              <div className={`mt-2 text-sm font-medium ${result.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {result.value >= 0 ? 'Increase' : 'Decrease'}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
