'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

export default function NPVCalculator() {
  const [discountRate, setDiscountRate] = useState(10)
  const [initialInvestment, setInitialInvestment] = useState(100000)
  const [cashFlows, setCashFlows] = useState<number[]>([30000, 35000, 40000, 45000, 50000])

  const addYear = () => setCashFlows(prev => [...prev, 0])
  const removeYear = (idx: number) => setCashFlows(prev => prev.filter((_, i) => i !== idx))
  const updateCashFlow = (idx: number, val: number) =>
    setCashFlows(prev => prev.map((cf, i) => (i === idx ? val : cf)))

  const result = useMemo(() => {
    const r = discountRate / 100
    let pvSum = 0
    const yearlyPV: { year: number; cashFlow: number; pv: number }[] = []

    for (let i = 0; i < cashFlows.length; i++) {
      const pv = cashFlows[i] / Math.pow(1 + r, i + 1)
      pvSum += pv
      yearlyPV.push({ year: i + 1, cashFlow: cashFlows[i], pv })
    }

    const npv = pvSum - initialInvestment
    const totalCashFlows = cashFlows.reduce((s, c) => s + c, 0)
    const profitable = npv > 0

    return { npv, pvSum, totalCashFlows, profitable, yearlyPV }
  }, [discountRate, initialInvestment, cashFlows])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  return (
    <ToolPage
      title="NPV Calculator"
      description="Calculate Net Present Value of an investment. Determine if a project is profitable based on discounted cash flows."
      category="financial"
      categoryLabel="Financial Calculators"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Discount Rate (% per year)</label>
            <input type="number" min={0} max={100} step={0.5} value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={50} step={0.5} value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
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
          <div className={`p-5 rounded-xl border ${result.profitable ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="text-sm text-muted-foreground mb-1">Net Present Value (NPV)</div>
            <div className={`text-3xl font-bold ${result.profitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{fmt(result.npv)}</div>
            <div className={`text-sm mt-2 font-medium ${result.profitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.profitable ? 'Investment is profitable' : 'Investment is not profitable'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Initial Investment</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(initialInvestment)}</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-muted-foreground mb-1">PV of Cash Flows</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{fmt(result.pvSum)}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="text-sm text-muted-foreground mb-1">Total Undiscounted Cash Flows</div>
            <div className="text-xl font-bold">{fmt(result.totalCashFlows)}</div>
          </div>
        </div>
      </div>

      {/* Yearly Breakdown */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Year-by-Year Breakdown</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Year</th>
                <th className="text-right p-3 font-medium">Cash Flow</th>
                <th className="text-right p-3 font-medium">Present Value</th>
                <th className="text-right p-3 font-medium">Discount Factor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-red-500/5">
                <td className="p-3 font-medium">0 (Investment)</td>
                <td className="p-3 text-right text-red-600 dark:text-red-400">{fmt(-initialInvestment)}</td>
                <td className="p-3 text-right text-red-600 dark:text-red-400">{fmt(-initialInvestment)}</td>
                <td className="p-3 text-right">1.0000</td>
              </tr>
              {result.yearlyPV.map((row, i) => (
                <tr key={row.year} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.year}</td>
                  <td className="p-3 text-right">{fmt(row.cashFlow)}</td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">{fmt(row.pv)}</td>
                  <td className="p-3 text-right font-mono">{(1 / Math.pow(1 + discountRate / 100, row.year)).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-semibold">
                <td className="p-3">Total</td>
                <td className="p-3 text-right">{fmt(result.totalCashFlows - initialInvestment)}</td>
                <td className="p-3 text-right">{fmt(result.npv)}</td>
                <td className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
