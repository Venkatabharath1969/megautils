'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function InflationCalculator() {
  const [currentAmount, setCurrentAmount] = useState(100000)
  const [inflationRate, setInflationRate] = useState(6)
  const [years, setYears] = useState(10)

  const result = useMemo(() => {
    const futureValue = currentAmount * Math.pow(1 + inflationRate / 100, years)
    const purchasingPower = currentAmount / Math.pow(1 + inflationRate / 100, years)
    const purchasingPowerLoss = currentAmount - purchasingPower
    const purchasingPowerLossPct = currentAmount > 0 ? (purchasingPowerLoss / currentAmount) * 100 : 0
    const costMultiplier = futureValue / currentAmount

    // Yearly breakdown
    const breakdown: { year: number; futurePrice: number; purchasingPower: number; lostValue: number }[] = []
    for (let y = 1; y <= years; y++) {
      const fp = currentAmount * Math.pow(1 + inflationRate / 100, y)
      const pp = currentAmount / Math.pow(1 + inflationRate / 100, y)
      breakdown.push({ year: y, futurePrice: fp, purchasingPower: pp, lostValue: currentAmount - pp })
    }

    return { futureValue, purchasingPower, purchasingPowerLoss, purchasingPowerLossPct, costMultiplier, breakdown }
  }, [currentAmount, inflationRate, years])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="Inflation Calculator"
      description="Calculate the impact of inflation on your money. See future costs and purchasing power erosion over time."
      category="financial"
      categoryLabel="Financial Calculators"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Current Amount ($)</label>
            <input type="number" min={0} value={currentAmount} onChange={(e) => setCurrentAmount(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1000} max={10000000} step={1000} value={currentAmount} onChange={(e) => setCurrentAmount(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Annual Inflation Rate (%)</label>
            <input type="number" min={0} max={50} step={0.1} value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0.5} max={20} step={0.1} value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Time Period (Years)</label>
            <input type="number" min={1} max={50} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1} max={50} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-sm text-muted-foreground mb-1">Future Cost of Today&apos;s {fmt(currentAmount)}</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{fmt(result.futureValue)}</div>
            <div className="text-xs text-muted-foreground mt-1">What costs {fmt(currentAmount)} today will cost {fmt(result.futureValue)} in {years} years</div>
          </div>
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Future Purchasing Power</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.purchasingPower)}</div>
            <div className="text-xs text-muted-foreground mt-1">{fmt(currentAmount)} today will only buy {fmt(result.purchasingPower)} worth of goods in {years} years</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="text-sm text-muted-foreground mb-1">Value Lost</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{fmt(result.purchasingPowerLoss)}</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-muted-foreground mb-1">Purchasing Power Loss</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{result.purchasingPowerLossPct.toFixed(1)}%</div>
            </div>
          </div>

          {/* Visual */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Purchasing Power Erosion</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Today</span><span>{fmt(currentAmount)}</span></div>
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>In {years} years</span><span>{fmt(result.purchasingPower)}</span></div>
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
                  <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${(result.purchasingPower / currentAmount) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">Cost multiplier: {result.costMultiplier.toFixed(2)}x</div>
          </div>
        </div>
      </div>

      {/* Yearly Breakdown */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Year-by-Year Impact</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Year</th>
                <th className="text-right p-3 font-medium">Future Price</th>
                <th className="text-right p-3 font-medium">Purchasing Power</th>
                <th className="text-right p-3 font-medium">Value Lost</th>
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map((row, i) => (
                <tr key={row.year} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.year}</td>
                  <td className="p-3 text-right text-red-600 dark:text-red-400">{fmt(row.futurePrice)}</td>
                  <td className="p-3 text-right text-blue-600 dark:text-blue-400">{fmt(row.purchasingPower)}</td>
                  <td className="p-3 text-right text-orange-600 dark:text-orange-400">{fmt(row.lostValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
