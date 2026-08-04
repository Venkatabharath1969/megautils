'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function CAGRCalculator() {
  const [beginningValue, setBeginningValue] = useState(50000)
  const [endingValue, setEndingValue] = useState(125000)
  const [years, setYears] = useState(5)

  const result = useMemo(() => {
    let cagr = 0
    if (beginningValue > 0 && years > 0) {
      cagr = (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100
    }
    const absoluteReturn = beginningValue > 0 ? ((endingValue - beginningValue) / beginningValue) * 100 : 0
    const profitLoss = endingValue - beginningValue
    const isProfit = profitLoss >= 0

    // Growth trajectory
    const trajectory: { year: number; value: number }[] = []
    for (let y = 0; y <= years; y++) {
      trajectory.push({
        year: y,
        value: beginningValue * Math.pow(1 + cagr / 100, y),
      })
    }

    return { cagr, absoluteReturn, profitLoss, isProfit, trajectory }
  }, [beginningValue, endingValue, years])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="CAGR Calculator"
      description="Calculate the Compound Annual Growth Rate (CAGR) of your investments. Measure smooth annual growth over time."
      category="financial"
      categoryLabel="Financial Calculators"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Beginning Value ($)</label>
            <input type="number" min={1} value={beginningValue} onChange={(e) => setBeginningValue(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={100} max={1000000} step={100} value={beginningValue} onChange={(e) => setBeginningValue(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Ending Value ($)</label>
            <input type="number" min={0} value={endingValue} onChange={(e) => setEndingValue(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={5000000} step={100} value={endingValue} onChange={(e) => setEndingValue(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Number of Years</label>
            <input type="number" min={1} max={50} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1} max={30} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${result.isProfit ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="text-sm text-muted-foreground mb-1">CAGR</div>
            <div className={`text-4xl font-bold ${result.isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.cagr >= 0 ? '+' : ''}{result.cagr.toFixed(2)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Compound Annual Growth Rate</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Absolute Return</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.absoluteReturn >= 0 ? '+' : ''}{result.absoluteReturn.toFixed(1)}%</div>
            </div>
            <div className={`p-4 rounded-xl border ${result.isProfit ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="text-sm text-muted-foreground mb-1">{result.isProfit ? 'Profit' : 'Loss'}</div>
              <div className={`text-xl font-bold ${result.isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{fmt(result.profitLoss)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-muted-foreground mb-1">Beginning Value</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{fmt(beginningValue)}</div>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">Ending Value</div>
              <div className="text-xl font-bold text-primary">{fmt(endingValue)}</div>
            </div>
          </div>

          {/* Growth trajectory visual */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Growth Trajectory</div>
            <div className="flex items-end gap-1 h-32">
              {result.trajectory.map((point) => {
                const maxVal = Math.max(...result.trajectory.map((p) => p.value), 1)
                const height = (Math.max(0, point.value) / maxVal) * 100
                return (
                  <div key={point.year} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full rounded-t transition-all duration-500 ${result.isProfit ? 'bg-green-500/70' : 'bg-red-500/70'}`} style={{ height: `${height}%`, minHeight: '2px' }} />
                    <span className="text-[10px] text-muted-foreground">Y{point.year}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
