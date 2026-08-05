'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function RDCalculator() {
  const [monthlyDeposit, setMonthlyDeposit] = useState(5000)
  const [rate, setRate] = useState(7)
  const [tenureMonths, setTenureMonths] = useState(24)

  const result = useMemo(() => {
    // RD formula: M = P * [(1+r/n)^(nt) - 1] / (1 - (1+r/n)^(-1/3))
    // Simplified quarterly compounding method used in India
    const r = rate / 100
    const n = 4 // quarterly compounding
    const totalDeposits = monthlyDeposit * tenureMonths

    // Calculate using standard RD formula (each monthly installment earns compound interest)
    let maturityAmount = 0
    for (let m = 1; m <= tenureMonths; m++) {
      const remainingMonths = tenureMonths - m + 1
      const years = remainingMonths / 12
      maturityAmount += monthlyDeposit * Math.pow(1 + r / n, n * years)
    }

    const interestEarned = maturityAmount - totalDeposits

    // Monthly growth
    const monthly: { month: number; deposited: number; value: number }[] = []
    for (let month = 1; month <= tenureMonths; month++) {
      let val = 0
      for (let m = 1; m <= month; m++) {
        const rem = month - m + 1
        const yrs = rem / 12
        val += monthlyDeposit * Math.pow(1 + r / n, n * yrs)
      }
      monthly.push({ month, deposited: monthlyDeposit * month, value: val })
    }

    return { maturityAmount, totalDeposits, interestEarned, monthly }
  }, [monthlyDeposit, rate, tenureMonths])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="RD Calculator"
      description="Calculate Recurring Deposit maturity amount. Plan your monthly savings with estimated returns."
      category="financial"
      categoryLabel="Financial Calculators"
      faqs={[
        { question: 'What is a Recurring Deposit (RD)?', answer: 'A Recurring Deposit is a savings scheme where you deposit a fixed amount every month for a set period and earn compound interest, similar to an FD but with monthly installments.' },
        { question: 'How is RD maturity amount calculated?', answer: 'Each monthly installment earns compound interest (typically quarterly compounding) for its remaining tenure. The maturity amount is the sum of all installments plus their accumulated interest.' },
        { question: 'What is the minimum tenure for an RD?', answer: 'Most banks offer RD tenures starting from 6 months and going up to 10 years. The most common tenure options are 6 months, 1 year, 2 years, 3 years, and 5 years.' },
        { question: 'Is RD better than SIP for savings?', answer: 'RD offers guaranteed fixed returns with zero risk, while SIP invests in mutual funds with potentially higher but market-linked returns. RD is better for capital preservation, SIP for wealth creation.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Monthly Deposit</label>
            <input type="number" min={100} value={monthlyDeposit} onChange={e => setMonthlyDeposit(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={500} max={100000} step={500} value={monthlyDeposit} onChange={e => setMonthlyDeposit(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Interest Rate (% per annum)</label>
            <input type="number" min={1} max={15} step={0.1} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1} max={15} step={0.1} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tenure (Months)</label>
            <input type="number" min={6} max={120} value={tenureMonths} onChange={e => setTenureMonths(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={6} max={120} value={tenureMonths} onChange={e => setTenureMonths(Number(e.target.value))} className="w-full mt-2 accent-primary" />
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
              <div className="text-sm text-muted-foreground mb-1">Total Deposits</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.totalDeposits)}</div>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">Interest Earned</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.interestEarned)}</div>
            </div>
          </div>

          {/* Visual breakdown */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Deposits vs Interest</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-blue-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(result.totalDeposits / result.maturityAmount) * 100}%` }}>
                {((result.totalDeposits / result.maturityAmount) * 100) > 15 && `${((result.totalDeposits / result.maturityAmount) * 100).toFixed(0)}%`}
              </div>
              <div className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(result.interestEarned / result.maturityAmount) * 100}%` }}>
                {((result.interestEarned / result.maturityAmount) * 100) > 15 && `${((result.interestEarned / result.maturityAmount) * 100).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Deposits</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Interest</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="text-sm text-muted-foreground mb-1">Monthly Deposit</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{fmt(monthlyDeposit)} x {tenureMonths} months</div>
          </div>
        </div>
      </div>

      {/* Quarterly Breakdown */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Growth Over Time</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Month</th>
                <th className="text-right p-3 font-medium">Total Deposited</th>
                <th className="text-right p-3 font-medium">Accumulated Value</th>
                <th className="text-right p-3 font-medium">Interest Earned</th>
              </tr>
            </thead>
            <tbody>
              {result.monthly.filter((_, i) => i % 3 === 2 || i === result.monthly.length - 1).map((row, i) => (
                <tr key={row.month} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.month}</td>
                  <td className="p-3 text-right text-blue-600 dark:text-blue-400">{fmt(row.deposited)}</td>
                  <td className="p-3 text-right font-semibold">{fmt(row.value)}</td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">{fmt(row.value - row.deposited)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
