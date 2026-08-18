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
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Percentage Calculator is a free browser-based tool that lets you calculate percentages, percentage changes, percentage of a number, and find what percentage one number is of another. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when tip calculations, grade computations, discount math, tax estimates, or statistical analysis. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this mathematics tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need percentage math.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I calculate what percentage one number is of another?', answer: 'Divide the part by the whole and multiply by 100. For example, 25 is 50% of 50 because (25 / 50) x 100 = 50%.' },
        { question: 'How do I calculate percentage change?', answer: 'Subtract the old value from the new value, divide by the absolute value of the old value, and multiply by 100. A change from 80 to 100 is a 25% increase.' },
        { question: 'What is the formula for percentage of a number?', answer: 'To find X% of Y, multiply Y by X/100. For example, 15% of 200 is 200 x 0.15 = 30.' },
      ]}
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
