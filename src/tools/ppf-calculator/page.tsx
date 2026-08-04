'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function PPFCalculator() {
  const [annualDeposit, setAnnualDeposit] = useState(150000)
  const [ppfRate, setPpfRate] = useState(7.1)
  const [years, setYears] = useState(15)

  const result = useMemo(() => {
    const r = ppfRate / 100
    let balance = 0
    const yearly: { year: number; deposit: number; interest: number; balance: number }[] = []

    for (let y = 1; y <= years; y++) {
      balance += annualDeposit
      const interest = balance * r
      balance += interest
      yearly.push({ year: y, deposit: annualDeposit, interest, balance })
    }

    const totalDeposits = annualDeposit * years
    const maturityValue = balance
    const totalInterest = maturityValue - totalDeposits

    return { maturityValue, totalDeposits, totalInterest, yearly }
  }, [annualDeposit, ppfRate, years])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="PPF Calculator"
      description="Calculate Public Provident Fund maturity value. Plan your long-term tax-saving investments with current PPF interest rates."
      category="financial"
      categoryLabel="Financial Calculators"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Annual Deposit</label>
            <input type="number" min={500} max={150000} value={annualDeposit} onChange={e => setAnnualDeposit(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={500} max={150000} step={500} value={annualDeposit} onChange={e => setAnnualDeposit(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            <div className="text-xs text-muted-foreground mt-1">Max PPF contribution: 1,50,000/year</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">PPF Interest Rate (% per annum)</label>
            <input type="number" min={1} max={15} step={0.1} value={ppfRate} onChange={e => setPpfRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={5} max={10} step={0.1} value={ppfRate} onChange={e => setPpfRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            <div className="text-xs text-muted-foreground mt-1">Current PPF rate: 7.1% (FY 2024-25)</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Investment Period (Years)</label>
            <input type="number" min={15} max={50} value={years} onChange={e => setYears(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={15} max={50} value={years} onChange={e => setYears(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            <div className="text-xs text-muted-foreground mt-1">Min lock-in: 15 years. Can extend in 5-year blocks.</div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Maturity Value</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.maturityValue)}</div>
            <div className="text-xs text-muted-foreground mt-1">Tax-free under Section 80C</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Deposits</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.totalDeposits)}</div>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Interest</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.totalInterest)}</div>
            </div>
          </div>

          {/* Visual breakdown */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Deposits vs Interest Earned</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-blue-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(result.totalDeposits / result.maturityValue) * 100}%` }}>
                {((result.totalDeposits / result.maturityValue) * 100) > 15 && `${((result.totalDeposits / result.maturityValue) * 100).toFixed(0)}%`}
              </div>
              <div className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(result.totalInterest / result.maturityValue) * 100}%` }}>
                {((result.totalInterest / result.maturityValue) * 100) > 15 && `${((result.totalInterest / result.maturityValue) * 100).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Deposits</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Interest</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="text-sm text-muted-foreground mb-1">Wealth Multiplier</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{(result.maturityValue / result.totalDeposits).toFixed(2)}x your investment</div>
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
                <th className="text-right p-3 font-medium">Deposit</th>
                <th className="text-right p-3 font-medium">Interest</th>
                <th className="text-right p-3 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {result.yearly.map((row, i) => (
                <tr key={row.year} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.year}</td>
                  <td className="p-3 text-right text-blue-600 dark:text-blue-400">{fmt(row.deposit)}</td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">{fmt(row.interest)}</td>
                  <td className="p-3 text-right font-semibold">{fmt(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
