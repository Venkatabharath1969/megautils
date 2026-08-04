'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function ROICalculator() {
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [finalValue, setFinalValue] = useState(15000)
  const [years, setYears] = useState(3)

  const result = useMemo(() => {
    const profitLoss = finalValue - initialInvestment
    const roi = initialInvestment > 0 ? (profitLoss / initialInvestment) * 100 : 0
    const annualizedROI = initialInvestment > 0 && years > 0
      ? (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100
      : 0
    const isProfit = profitLoss >= 0

    return { profitLoss, roi, annualizedROI, isProfit }
  }, [initialInvestment, finalValue, years])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  return (
    <ToolPage
      title="ROI Calculator"
      description="Calculate Return on Investment, annualized ROI, and total profit or loss on your investments."
      category="financial"
      categoryLabel="Financial Calculators"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Initial Investment ($)</label>
            <input type="number" min={0} value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={100} max={1000000} step={100} value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Final Value ($)</label>
            <input type="number" min={0} value={finalValue} onChange={(e) => setFinalValue(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={2000000} step={100} value={finalValue} onChange={(e) => setFinalValue(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Investment Period (Years)</label>
            <input type="number" min={0.5} max={50} step={0.5} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0.5} max={30} step={0.5} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${result.isProfit ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="text-sm text-muted-foreground mb-1">Total ROI</div>
            <div className={`text-3xl font-bold ${result.isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(2)}%
            </div>
          </div>
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Annualized ROI</div>
            <div className="text-3xl font-bold text-primary">
              {result.annualizedROI >= 0 ? '+' : ''}{result.annualizedROI.toFixed(2)}%
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${result.isProfit ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="text-sm text-muted-foreground mb-1">{result.isProfit ? 'Profit' : 'Loss'}</div>
            <div className={`text-xl font-bold ${result.isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.isProfit ? '+' : ''}{fmt(result.profitLoss)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Initial Investment</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(initialInvestment)}</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-muted-foreground mb-1">Final Value</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{fmt(finalValue)}</div>
            </div>
          </div>

          {/* Visual comparison */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Investment Growth</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Initial</span>
                  <span>{fmt(initialInvestment)}</span>
                </div>
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, finalValue > 0 ? (initialInvestment / Math.max(initialInvestment, finalValue)) * 100 : 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Final</span>
                  <span>{fmt(finalValue)}</span>
                </div>
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
                  <div className={`${result.isProfit ? 'bg-green-500' : 'bg-red-500'} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, initialInvestment > 0 ? (finalValue / Math.max(initialInvestment, finalValue)) * 100 : 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
