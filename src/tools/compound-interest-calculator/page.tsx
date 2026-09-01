'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'
import { ExportButton } from '@/components/export-button'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type Frequency = 1 | 2 | 4 | 12 | 365 | 'continuous'

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(8)
  const [years, setYears] = useState(10)
  const [frequency, setFrequency] = useState<Frequency>(12)
  const [monthlyContribution, setMonthlyContribution] = useState(0)

  const result = useMemo(() => {
    const r = rate / 100
    const t = years
    const pmt = monthlyContribution

    let amount: number
    let totalContributions = principal + pmt * 12 * t

    if (frequency === 'continuous') {
      // Continuous compounding: A = P × e^(rt)
      amount = principal * Math.exp(r * t)
      // For contributions with continuous compounding, integrate: PMT * 12 * (e^(rt) - 1) / r
      if (r > 0 && pmt > 0) {
        amount += pmt * 12 * (Math.exp(r * t) - 1) / r
      } else if (pmt > 0) {
        amount += pmt * 12 * t
      }
    } else {
      const n = frequency
      // FV = P(1 + r/n)^(nt) + PMT_adj × [((1 + r/n)^(nt) - 1) / (r/n)]
      const compoundFactor = Math.pow(1 + r / n, n * t)
      amount = principal * compoundFactor
      if (r > 0 && pmt > 0) {
        // Adjust monthly contribution for compounding frequency
        const pmtAdj = pmt * 12 / n
        amount += pmtAdj * (compoundFactor - 1) / (r / n)
      } else if (pmt > 0) {
        amount += pmt * 12 * t
      }
    }

    const totalInterest = amount - totalContributions

    const breakdown: { year: number; balance: number; interest: number; contributions: number }[] = []
    for (let y = 1; y <= t; y++) {
      let bal: number
      const yearContributions = principal + pmt * 12 * y
      if (frequency === 'continuous') {
        bal = principal * Math.exp(r * y)
        if (r > 0 && pmt > 0) {
          bal += pmt * 12 * (Math.exp(r * y) - 1) / r
        } else if (pmt > 0) {
          bal += pmt * 12 * y
        }
      } else {
        const n = frequency
        const cf = Math.pow(1 + r / n, n * y)
        bal = principal * cf
        if (r > 0 && pmt > 0) {
          const pmtAdj = pmt * 12 / n
          bal += pmtAdj * (cf - 1) / (r / n)
        } else if (pmt > 0) {
          bal += pmt * 12 * y
        }
      }
      breakdown.push({
        year: y,
        balance: bal,
        interest: bal - yearContributions,
        contributions: yearContributions,
      })
    }

    return { amount, totalInterest, totalContributions, breakdown }
  }, [principal, rate, years, frequency, monthlyContribution])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  const frequencyOptions: { value: Frequency; label: string }[] = [
    { value: 1, label: 'Annually' },
    { value: 2, label: 'Semi-Annually' },
    { value: 4, label: 'Quarterly' },
    { value: 12, label: 'Monthly' },
    { value: 365, label: 'Daily' },
    { value: 'continuous', label: 'Continuous' },
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
      helpContent={
        <>
          <h2>What is Compound Interest?</h2>
          <p>
            Compound interest is the process of earning interest not only on your original principal but also on the interest
            that has already been added to your balance. Unlike simple interest, which is calculated solely on the initial
            deposit, compound interest causes your money to grow exponentially over time. The standard formula is
            A&nbsp;=&nbsp;P(1&nbsp;+&nbsp;r/n)^(nt), where P is the principal amount, r is the annual interest rate expressed
            as a decimal, n is the number of times interest compounds per year, and t is the number of years. This calculator
            lets you experiment with each of those variables and immediately see how they affect your final balance. A
            year-by-year breakdown table and a visual bar chart show exactly how much of your ending balance comes from the
            original deposit versus accumulated interest, making it easy to appreciate the power of compounding over long
            time horizons.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your starting principal amount in dollars using the text field or the slider.</li>
            <li>Set the annual interest rate as a percentage. For savings accounts this might be 4-5%; for stock market returns a common long-term average is 7-10%.</li>
            <li>Choose the investment time period in years — the longer the horizon, the more dramatic the compounding effect becomes.</li>
            <li>Select a compounding frequency: annually, semi-annually, quarterly, monthly, or daily. Monthly compounding is the most common for bank accounts and loans.</li>
            <li>Review the results panel on the right, which shows the final amount, total interest earned, and a proportional bar comparing principal to interest.</li>
            <li>Scroll down to the year-by-year breakdown table to see how your balance grows each year and what percentage gain each year contributes.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Start investing as early as possible — time is the most powerful variable in the compound interest formula, and even modest returns compound into large sums over decades.</li>
            <li>Compare compounding frequencies to understand their impact. Daily compounding yields slightly more than annual compounding, but the difference narrows at higher frequencies.</li>
            <li>Use this calculator to evaluate loan costs as well. The same formula applies to debt: a higher compounding frequency on a loan means you pay more interest over time.</li>
            <li>Adjust the interest rate to model different scenarios — optimistic, expected, and pessimistic — to build a realistic range of outcomes for your financial planning.</li>
            <li>Remember that this calculator shows nominal growth. In real-world planning, factor in inflation, taxes, and fees, which reduce the effective return on your investment.</li>
          </ul>
        </>
      }
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
              onChange={(e) => {
                const val = e.target.value
                setFrequency(val === 'continuous' ? 'continuous' : (Number(val) as Frequency))
              }}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {frequencyOptions.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Monthly Contribution ($)</label>
            <input
              type="number"
              min={0}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="range"
              min={0}
              max={50000}
              step={100}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full mt-2 accent-primary"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Final Amount</div>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-primary">{fmt(result.amount)}</div>
              <CopyButton text={`Final Amount: ${fmt(result.amount)}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Interest Earned</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.totalInterest)}</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Contributions</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.totalContributions)}</div>
            </div>
          </div>

          {/* Visual breakdown bar */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Contributions vs Interest</div>
            <div className="w-full h-6 rounded-full overflow-hidden flex bg-muted">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${(result.totalContributions / result.amount) * 100}%` }}
              />
              <div
                className="bg-green-500 h-full transition-all duration-500"
                style={{ width: `${(result.totalInterest / result.amount) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Contributions ({((result.totalContributions / result.amount) * 100).toFixed(1)}%)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Interest ({((result.totalInterest / result.amount) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Growth Area Chart */}
      {result.breakdown.length > 0 && (
        <div className="mt-8 p-4 rounded-xl border border-border">
          <h3 className="text-sm font-medium mb-3">Balance Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={result.breakdown.map(row => ({
              year: `Year ${row.year}`,
              Contributions: row.contributions,
              Interest: row.interest,
            }))}>
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => fmt(Number(value))} />
              <Area type="monotone" dataKey="Contributions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Interest" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Contributions</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Interest</span>
          </div>
        </div>
      )}

      {/* Year-by-Year Breakdown Table */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Year-by-Year Breakdown</h3>
          <ExportButton
            headers={['Year', 'Balance', 'Total Contributions', 'Interest Earned', 'Year Growth']}
            rows={result.breakdown.map((row, i) => [
              row.year,
              row.balance.toFixed(2),
              row.contributions.toFixed(2),
              row.interest.toFixed(2),
              i === 0
                ? (row.balance - principal).toFixed(2)
                : (row.balance - result.breakdown[i - 1].balance).toFixed(2),
            ])}
            filename="compound-interest-breakdown.csv"
            label="Export CSV"
          />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Year</th>
                <th className="text-right p-3 font-medium">Balance</th>
                <th className="text-right p-3 font-medium">Total Contributions</th>
                <th className="text-right p-3 font-medium">Interest Earned</th>
                <th className="text-right p-3 font-medium">Year Growth</th>
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map((row, i) => (
                <tr key={row.year} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.year}</td>
                  <td className="p-3 text-right">{fmt(row.balance)}</td>
                  <td className="p-3 text-right text-blue-600 dark:text-blue-400">{fmt(row.contributions)}</td>
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
