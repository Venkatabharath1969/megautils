'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [timePeriod, setTimePeriod] = useState(10)

  const result = useMemo(() => {
    const months = timePeriod * 12
    const r = expectedReturn / 100 / 12
    const investedAmount = monthlyInvestment * months

    let totalValue: number
    if (r === 0) {
      totalValue = investedAmount
    } else {
      totalValue = monthlyInvestment * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
    }

    const estimatedReturns = totalValue - investedAmount
    const wealthGainRatio = investedAmount > 0 ? (estimatedReturns / investedAmount) * 100 : 0

    // Yearly breakdown
    const yearly: { year: number; invested: number; value: number; returns: number }[] = []
    for (let y = 1; y <= timePeriod; y++) {
      const m = y * 12
      const inv = monthlyInvestment * m
      const val = r === 0 ? inv : monthlyInvestment * ((Math.pow(1 + r, m) - 1) / r) * (1 + r)
      yearly.push({ year: y, invested: inv, value: val, returns: val - inv })
    }

    return { investedAmount, totalValue, estimatedReturns, wealthGainRatio, yearly }
  }, [monthlyInvestment, expectedReturn, timePeriod])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="SIP Calculator"
      description="Calculate returns on your Systematic Investment Plan (SIP). Plan your mutual fund investments with ease."
      category="financial"
      categoryLabel="Financial Calculators"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Monthly Investment</label>
            <input type="number" min={500} value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={500} max={500000} step={500} value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Expected Return Rate (% per annum)</label>
            <input type="number" min={1} max={50} step={0.5} value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1} max={30} step={0.5} value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Time Period (Years)</label>
            <input type="number" min={1} max={40} value={timePeriod} onChange={(e) => setTimePeriod(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1} max={40} value={timePeriod} onChange={(e) => setTimePeriod(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Total Value</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.totalValue)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Invested Amount</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.investedAmount)}</div>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">Estimated Returns</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.estimatedReturns)}</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="text-sm text-muted-foreground mb-1">Wealth Gain</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{result.wealthGainRatio.toFixed(1)}% return on invested amount</div>
          </div>

          {/* Visual breakdown */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Investment vs Returns</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-blue-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(result.investedAmount / result.totalValue) * 100}%` }}>
                {((result.investedAmount / result.totalValue) * 100) > 15 && `${((result.investedAmount / result.totalValue) * 100).toFixed(0)}%`}
              </div>
              <div className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(result.estimatedReturns / result.totalValue) * 100}%` }}>
                {((result.estimatedReturns / result.totalValue) * 100) > 15 && `${((result.estimatedReturns / result.totalValue) * 100).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Invested</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Breakdown */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Year-by-Year Growth</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Year</th>
                <th className="text-right p-3 font-medium">Invested</th>
                <th className="text-right p-3 font-medium">Returns</th>
                <th className="text-right p-3 font-medium">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {result.yearly.map((row, i) => (
                <tr key={row.year} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.year}</td>
                  <td className="p-3 text-right text-blue-600 dark:text-blue-400">{fmt(row.invested)}</td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">{fmt(row.returns)}</td>
                  <td className="p-3 text-right font-semibold">{fmt(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
