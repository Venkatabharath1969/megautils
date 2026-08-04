'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function FDCalculator() {
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(7)
  const [tenure, setTenure] = useState(12)
  const [tenureType, setTenureType] = useState<'months' | 'years'>('months')
  const [compounding, setCompounding] = useState<'monthly' | 'quarterly' | 'halfyearly' | 'yearly'>('quarterly')

  const result = useMemo(() => {
    const compoundingMap = { monthly: 12, quarterly: 4, halfyearly: 2, yearly: 1 }
    const n = compoundingMap[compounding]
    const tenureYears = tenureType === 'years' ? tenure : tenure / 12
    const r = rate / 100

    // A = P(1 + r/n)^(nt)
    const maturityAmount = principal * Math.pow(1 + r / n, n * tenureYears)
    const interestEarned = maturityAmount - principal

    // Quarterly breakdown (up to 20 rows)
    const periods = Math.min(Math.ceil(tenureYears * 4), 80)
    const quarterly: { quarter: number; value: number }[] = []
    for (let q = 1; q <= periods; q++) {
      const t = q / 4
      const val = principal * Math.pow(1 + r / n, n * t)
      quarterly.push({ quarter: q, value: val })
    }

    return { maturityAmount, interestEarned, tenureYears, quarterly }
  }, [principal, rate, tenure, tenureType, compounding])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="FD Calculator"
      description="Calculate Fixed Deposit maturity amount and interest earned. Supports different compounding frequencies."
      category="financial"
      categoryLabel="Financial Calculators"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Principal Amount</label>
            <input type="number" min={1000} value={principal} onChange={e => setPrincipal(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1000} max={10000000} step={1000} value={principal} onChange={e => setPrincipal(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Interest Rate (% per annum)</label>
            <input type="number" min={1} max={20} step={0.1} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1} max={15} step={0.1} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tenure</label>
            <div className="flex gap-2">
              <input type="number" min={1} value={tenure} onChange={e => setTenure(Number(e.target.value))} className="flex-1 h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <select value={tenureType} onChange={e => setTenureType(e.target.value as 'months' | 'years')} className="h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Compounding Frequency</label>
            <select value={compounding} onChange={e => setCompounding(e.target.value as typeof compounding)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="halfyearly">Half-Yearly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Maturity Amount</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.maturityAmount)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Principal</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(principal)}</div>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">Interest Earned</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.interestEarned)}</div>
            </div>
          </div>

          {/* Visual breakdown */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Principal vs Interest</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-blue-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(principal / result.maturityAmount) * 100}%` }}>
                {((principal / result.maturityAmount) * 100) > 15 && `${((principal / result.maturityAmount) * 100).toFixed(0)}%`}
              </div>
              <div className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(result.interestEarned / result.maturityAmount) * 100}%` }}>
                {((result.interestEarned / result.maturityAmount) * 100) > 15 && `${((result.interestEarned / result.maturityAmount) * 100).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Principal</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Interest</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="text-sm text-muted-foreground mb-1">Effective Duration</div>
            <div className="text-lg font-bold">{result.tenureYears.toFixed(1)} years ({Math.round(result.tenureYears * 12)} months)</div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
