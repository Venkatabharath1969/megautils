'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

function calculateIRR(initialInvestment: number, cashFlows: number[]): number | null {
  // Bisection method to find IRR
  let low = -0.99
  let high = 10.0 // 1000%
  const maxIterations = 1000
  const tolerance = 0.00001

  const npv = (rate: number) => {
    let sum = -initialInvestment
    for (let i = 0; i < cashFlows.length; i++) {
      sum += cashFlows[i] / Math.pow(1 + rate, i + 1)
    }
    return sum
  }

  // Check if IRR exists
  const npvLow = npv(low)
  const npvHigh = npv(high)
  if (npvLow * npvHigh > 0) return null

  for (let iter = 0; iter < maxIterations; iter++) {
    const mid = (low + high) / 2
    const npvMid = npv(mid)

    if (Math.abs(npvMid) < tolerance) return mid
    if (npvMid * npv(low) < 0) {
      high = mid
    } else {
      low = mid
    }
  }

  return (low + high) / 2
}

export default function IRRCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(100000)
  const [cashFlows, setCashFlows] = useState<number[]>([30000, 35000, 40000, 45000, 50000])

  const addYear = () => setCashFlows(prev => [...prev, 0])
  const removeYear = (idx: number) => setCashFlows(prev => prev.filter((_, i) => i !== idx))
  const updateCashFlow = (idx: number, val: number) =>
    setCashFlows(prev => prev.map((cf, i) => (i === idx ? val : cf)))

  const result = useMemo(() => {
    const irr = calculateIRR(initialInvestment, cashFlows)
    const totalCashFlows = cashFlows.reduce((s, c) => s + c, 0)
    const totalProfit = totalCashFlows - initialInvestment

    // Calculate NPV at different rates for context
    const ratesNPV: { rate: number; npv: number }[] = []
    for (let r = 0; r <= 50; r += 5) {
      let npv = -initialInvestment
      for (let i = 0; i < cashFlows.length; i++) {
        npv += cashFlows[i] / Math.pow(1 + r / 100, i + 1)
      }
      ratesNPV.push({ rate: r, npv })
    }

    return { irr, totalCashFlows, totalProfit, ratesNPV }
  }, [initialInvestment, cashFlows])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  return (
    <ToolPage
      title="IRR Calculator"
      description="Calculate Internal Rate of Return for your investment. Uses the bisection method to find the discount rate that makes NPV zero."
      category="financial"
      categoryLabel="Financial Calculators"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Initial Investment</label>
            <input type="number" min={0} value={initialInvestment} onChange={e => setInitialInvestment(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Cash Flows by Year</label>
              <button onClick={addYear} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">+ Add Year</button>
            </div>
            <div className="space-y-2">
              {cashFlows.map((cf, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-16 shrink-0">Year {i + 1}</span>
                  <input type="number" value={cf} onChange={e => updateCashFlow(i, Number(e.target.value))} className="flex-1 h-9 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  {cashFlows.length > 1 && (
                    <button onClick={() => removeYear(i)} className="text-red-500 hover:text-red-700 text-sm font-bold px-2">X</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${result.irr !== null && result.irr > 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="text-sm text-muted-foreground mb-1">Internal Rate of Return (IRR)</div>
            <div className={`text-3xl font-bold ${result.irr !== null && result.irr > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.irr !== null ? `${(result.irr * 100).toFixed(2)}%` : 'Cannot calculate'}
            </div>
            {result.irr !== null && (
              <div className="text-sm mt-2 text-muted-foreground">
                The discount rate at which the NPV equals zero
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Initial Investment</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(initialInvestment)}</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Cash Flows</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{fmt(result.totalCashFlows)}</div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${result.totalProfit >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="text-sm text-muted-foreground mb-1">Total Undiscounted Profit</div>
            <div className={`text-xl font-bold ${result.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{fmt(result.totalProfit)}</div>
          </div>
        </div>
      </div>

      {/* NPV at Different Rates */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">NPV at Different Discount Rates</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Discount Rate</th>
                <th className="text-right p-3 font-medium">NPV</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.ratesNPV.map((row, i) => (
                <tr key={row.rate} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.rate}%</td>
                  <td className={`p-3 text-right font-mono ${row.npv >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{fmt(row.npv)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.npv >= 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                      {row.npv >= 0 ? 'Profitable' : 'Not Profitable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
