'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

type Frequency = 1 | 2 | 4 | 12 | 365

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(8)
  const [years, setYears] = useState(10)
  const [frequency, setFrequency] = useState<Frequency>(12)

  const result = useMemo(() => {
    const r = rate / 100
    const n = frequency
    const t = years
    const amount = principal * Math.pow(1 + r / n, n * t)
    const totalInterest = amount - principal

    const breakdown: { year: number; balance: number; interest: number }[] = []
    for (let y = 1; y <= t; y++) {
      const bal = principal * Math.pow(1 + r / n, n * y)
      breakdown.push({
        year: y,
        balance: bal,
        interest: bal - principal,
      })
    }

    return { amount, totalInterest, breakdown }
  }, [principal, rate, years, frequency])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  const frequencyOptions: { value: Frequency; label: string }[] = [
    { value: 1, label: 'Annually' },
    { value: 2, label: 'Semi-Annually' },
    { value: 4, label: 'Quarterly' },
    { value: 12, label: 'Monthly' },
    { value: 365, label: 'Daily' },
  ]

  return (
    <ToolPage
      title="Compound Interest Calculator"
      description="Calculate compound interest with different compounding frequencies and view a year-by-year breakdown."
      category="financial"
      categoryLabel="Financial Calculators"
      faqs={[
        { question: 'What is the compound interest formula?', answer: 'The formula is A = P(1 + r/n)^(nt), where P is the principal, r is the annual interest rate, n is the number of times interest compounds per year, and t is the number of years.' },
        { question: 'What is the difference between simple and compound interest?', answer: 'Simple interest is calculated only on the principal, while compound interest is calculated on the principal plus all previously earned interest — causing your money to grow exponentially over time.' },
        { question: 'How does compounding frequency affect returns?', answer: 'More frequent compounding (e.g., daily vs. annually) yields slightly higher returns because interest is reinvested sooner. However, the difference shrinks as frequency increases.' },
        { question: 'Why is compound interest called the eighth wonder of the world?', answer: 'This quote, often attributed to Einstein, highlights how compound interest accelerates wealth growth over long periods — small, consistent returns can produce dramatically large results given enough time.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Principal Amount ($)</label>
            <input
              type="number"
              min={0}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="range"
              min={1000}
              max={10000000}
              step={1000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full mt-2 accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Annual Interest Rate (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="range"
              min={0.1}
              max={30}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full mt-2 accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Time Period (Years)</label>
            <input
              type="number"
              min={1}
              max={50}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="range"
              min={1}
              max={50}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full mt-2 accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Compounding Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value) as Frequency)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {frequencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Final Amount</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.amount)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Interest Earned</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.totalInterest)}</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Principal Amount</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(principal)}</div>
            </div>
          </div>

          {/* Visual breakdown bar */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Principal vs Interest</div>
            <div className="w-full h-6 rounded-full overflow-hidden flex bg-muted">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${(principal / result.amount) * 100}%` }}
              />
              <div
                className="bg-green-500 h-full transition-all duration-500"
                style={{ width: `${(result.totalInterest / result.amount) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Principal ({((principal / result.amount) * 100).toFixed(1)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Interest ({((result.totalInterest / result.amount) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Year-by-Year Breakdown Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Year-by-Year Breakdown</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Year</th>
                <th className="text-right p-3 font-medium">Balance</th>
                <th className="text-right p-3 font-medium">Interest Earned</th>
                <th className="text-right p-3 font-medium">Year Growth</th>
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map((row, i) => (
                <tr key={row.year} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.year}</td>
                  <td className="p-3 text-right">{fmt(row.balance)}</td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">{fmt(row.interest)}</td>
                  <td className="p-3 text-right text-muted-foreground">
                    {i === 0 ? fmt(row.balance - principal) : fmt(row.balance - result.breakdown[i - 1].balance)}
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
