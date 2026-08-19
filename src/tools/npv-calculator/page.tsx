'use client'

import { useState, useMemo, useCallback } from 'react'
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
    const yearlyPV: { year: number; cashFlow: number; pv: number; cumulativeCF: number; cumulativePV: number }[] = []

    let cumulativeCF = -initialInvestment
    let cumulativePV = -initialInvestment

    for (let i = 0; i < cashFlows.length; i++) {
      const pv = cashFlows[i] / Math.pow(1 + r, i + 1)
      pvSum += pv
      cumulativeCF += cashFlows[i]
      cumulativePV += pv
      yearlyPV.push({ year: i + 1, cashFlow: cashFlows[i], pv, cumulativeCF, cumulativePV })
    }

    const npv = pvSum - initialInvestment
    const totalCashFlows = cashFlows.reduce((s, c) => s + c, 0)
    const profitable = npv > 0

    // Profitability Index
    const profitabilityIndex = initialInvestment > 0 ? pvSum / initialInvestment : 0

    // Payback Period (undiscounted)
    let paybackPeriod: number | null = null
    let cumCF = -initialInvestment
    for (let i = 0; i < cashFlows.length; i++) {
      const prevCum = cumCF
      cumCF += cashFlows[i]
      if (cumCF >= 0 && paybackPeriod === null) {
        // Interpolate within the year
        const fraction = cashFlows[i] > 0 ? (-prevCum) / cashFlows[i] : 0
        paybackPeriod = i + fraction
      }
    }

    // Discounted Payback Period
    let discountedPaybackPeriod: number | null = null
    let cumPV = -initialInvestment
    for (let i = 0; i < cashFlows.length; i++) {
      const prevCum = cumPV
      const pv = cashFlows[i] / Math.pow(1 + r, i + 1)
      cumPV += pv
      if (cumPV >= 0 && discountedPaybackPeriod === null) {
        const fraction = pv > 0 ? (-prevCum) / pv : 0
        discountedPaybackPeriod = i + fraction
      }
    }

    return { npv, pvSum, totalCashFlows, profitable, yearlyPV, profitabilityIndex, paybackPeriod, discountedPaybackPeriod }
  }, [discountRate, initialInvestment, cashFlows])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  const formatPeriod = (years: number | null) => {
    if (years === null) return 'Never'
    const wholeYears = Math.floor(years)
    const months = Math.round((years - wholeYears) * 12)
    if (months === 0) return `${wholeYears} year${wholeYears !== 1 ? 's' : ''}`
    return `${wholeYears > 0 ? `${wholeYears} year${wholeYears !== 1 ? 's' : ''} ` : ''}${months} month${months !== 1 ? 's' : ''}`
  }

  const exportCSV = useCallback(() => {
    const headers = ['Year', 'Cash Flow', 'Present Value', 'Discount Factor', 'Cumulative CF', 'Cumulative PV']
    const csvRows = [
      headers.join(','),
      ['0 (Investment)', (-initialInvestment).toFixed(2), (-initialInvestment).toFixed(2), '1.0000', (-initialInvestment).toFixed(2), (-initialInvestment).toFixed(2)].join(','),
      ...result.yearlyPV.map(row =>
        [
          row.year,
          row.cashFlow.toFixed(2),
          row.pv.toFixed(2),
          (1 / Math.pow(1 + discountRate / 100, row.year)).toFixed(4),
          row.cumulativeCF.toFixed(2),
          row.cumulativePV.toFixed(2),
        ].join(',')
      ),
      ['Total', (result.totalCashFlows - initialInvestment).toFixed(2), result.npv.toFixed(2), '', '', ''].join(','),
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'npv-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [result, initialInvestment, discountRate])

  return (
    <ToolPage
      title="NPV Calculator"
      description="Calculate Net Present Value of an investment. Determine if a project is profitable based on discounted cash flows."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>NPV Calculator is a free browser-based tool that lets you calculate Net Present Value for a series of future cash flows discounted at a given rate to evaluate investment worth. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when capital budgeting decisions, evaluating business investments, comparing project alternatives, or financial modeling. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this finance tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Financial calculator results are estimates — always consult a qualified financial advisor before making important decisions.</li>
            <li>Interest rates should be entered as annual percentages (e.g., enter 7 for 7% per year).</li>
            <li>Results account for compounding frequency when applicable — check whether your rate compounds monthly, quarterly, or annually.</li>
            <li>Use the comparison features to evaluate different scenarios side by side.</li>
            <li>All calculations happen locally in your browser — your financial data stays private.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is Net Present Value (NPV)?', answer: 'NPV is the difference between the present value of future cash inflows and the initial investment. A positive NPV means the investment is expected to be profitable.' },
        { question: 'What discount rate should I use for NPV?', answer: 'The discount rate typically reflects your required rate of return or the weighted average cost of capital (WACC). Common rates range from 8% to 15% depending on risk.' },
        { question: 'What does a negative NPV mean?', answer: 'A negative NPV indicates the projected earnings from the investment, discounted to present value, are less than the initial cost, meaning the investment would lose money.' },
      ]}
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

          <div className={`p-4 rounded-xl border ${result.profitabilityIndex >= 1 ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
            <div className="text-sm text-muted-foreground mb-1">Profitability Index (PI)</div>
            <div className={`text-xl font-bold ${result.profitabilityIndex >= 1 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {result.profitabilityIndex.toFixed(3)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {result.profitabilityIndex >= 1 ? 'PI > 1: Accept the project' : 'PI < 1: Reject the project'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-sm text-muted-foreground mb-1">Payback Period</div>
              <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{formatPeriod(result.paybackPeriod)}</div>
            </div>
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="text-sm text-muted-foreground mb-1">Discounted Payback</div>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatPeriod(result.discountedPaybackPeriod)}</div>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Year-by-Year Breakdown</h3>
          <button onClick={exportCSV} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Export CSV</button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Year</th>
                <th className="text-right p-3 font-medium">Cash Flow</th>
                <th className="text-right p-3 font-medium">Present Value</th>
                <th className="text-right p-3 font-medium">Discount Factor</th>
                <th className="text-right p-3 font-medium">Cumulative CF</th>
                <th className="text-right p-3 font-medium">Cumulative PV</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-red-500/5">
                <td className="p-3 font-medium">0 (Investment)</td>
                <td className="p-3 text-right text-red-600 dark:text-red-400">{fmt(-initialInvestment)}</td>
                <td className="p-3 text-right text-red-600 dark:text-red-400">{fmt(-initialInvestment)}</td>
                <td className="p-3 text-right">1.0000</td>
                <td className="p-3 text-right text-red-600 dark:text-red-400">{fmt(-initialInvestment)}</td>
                <td className="p-3 text-right text-red-600 dark:text-red-400">{fmt(-initialInvestment)}</td>
              </tr>
              {result.yearlyPV.map((row, i) => (
                <tr key={row.year} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.year}</td>
                  <td className="p-3 text-right">{fmt(row.cashFlow)}</td>
                  <td className="p-3 text-right text-green-600 dark:text-green-400">{fmt(row.pv)}</td>
                  <td className="p-3 text-right font-mono">{(1 / Math.pow(1 + discountRate / 100, row.year)).toFixed(4)}</td>
                  <td className={`p-3 text-right ${row.cumulativeCF >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{fmt(row.cumulativeCF)}</td>
                  <td className={`p-3 text-right ${row.cumulativePV >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{fmt(row.cumulativePV)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-semibold">
                <td className="p-3">Total</td>
                <td className="p-3 text-right">{fmt(result.totalCashFlows - initialInvestment)}</td>
                <td className="p-3 text-right">{fmt(result.npv)}</td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
