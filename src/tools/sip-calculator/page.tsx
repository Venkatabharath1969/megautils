'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'
import { ExportButton } from '@/components/export-button'

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [timePeriod, setTimePeriod] = useState(10)
  const [annualStepUp, setAnnualStepUp] = useState(0)
  const [reverseMode, setReverseMode] = useState(false)
  const [targetAmount, setTargetAmount] = useState(5000000)
  const [targetYears, setTargetYears] = useState(10)

  const reverseResult = useMemo(() => {
    if (!reverseMode) return null
    const r = expectedReturn / 100 / 12
    const n = targetYears * 12
    if (r === 0) return { requiredSIP: Math.round(targetAmount / n) }
    const requiredSIP = (targetAmount * r) / ((Math.pow(1 + r, n) - 1) * (1 + r))
    return { requiredSIP: Math.round(requiredSIP) }
  }, [reverseMode, targetAmount, targetYears, expectedReturn])

  const result = useMemo(() => {
    const months = timePeriod * 12
    const r = expectedReturn / 100 / 12
    const stepUpRate = annualStepUp / 100

    // With step-up: each year the monthly investment increases
    let totalValue = 0
    let investedAmount = 0
    const yearly: { year: number; invested: number; value: number; returns: number; monthlySIP: number }[] = []

    if (r === 0) {
      for (let y = 1; y <= timePeriod; y++) {
        const monthlyForYear = monthlyInvestment * Math.pow(1 + stepUpRate, y - 1)
        investedAmount += monthlyForYear * 12
        totalValue = investedAmount
        yearly.push({ year: y, invested: investedAmount, value: totalValue, returns: 0, monthlySIP: Math.round(monthlyForYear) })
      }
    } else {
      // Simulate month by month for accurate step-up calculation
      let portfolio = 0
      let totalInvested = 0
      for (let y = 1; y <= timePeriod; y++) {
        const monthlyForYear = monthlyInvestment * Math.pow(1 + stepUpRate, y - 1)
        for (let m = 0; m < 12; m++) {
          portfolio = (portfolio + monthlyForYear) * (1 + r)
          totalInvested += monthlyForYear
        }
        yearly.push({
          year: y,
          invested: totalInvested,
          value: portfolio,
          returns: portfolio - totalInvested,
          monthlySIP: Math.round(monthlyForYear),
        })
      }
      totalValue = portfolio
      investedAmount = totalInvested
    }

    const estimatedReturns = totalValue - investedAmount
    const wealthGainRatio = investedAmount > 0 ? (estimatedReturns / investedAmount) * 100 : 0

    return { investedAmount, totalValue, estimatedReturns, wealthGainRatio, yearly }
  }, [monthlyInvestment, expectedReturn, timePeriod, annualStepUp])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="SIP Calculator"
      description="Calculate returns on your Systematic Investment Plan (SIP). Plan your mutual fund investments with ease."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>SIP Calculator is a free browser-based tool that lets you calculate returns from Systematic Investment Plan with monthly contributions, expected returns, and investment duration. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when planning mutual fund SIP investments, comparing lump sum vs SIP returns, or setting monthly investment goals. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this finance tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is a SIP and how does it work?', answer: 'A SIP (Systematic Investment Plan) lets you invest a fixed amount in mutual funds at regular intervals (usually monthly), benefiting from rupee cost averaging and the power of compounding.' },
        { question: 'How much can I earn from a SIP of 10,000 per month?', answer: 'A monthly SIP of Rs 10,000 for 10 years at 12% expected returns would grow to approximately Rs 23.2 lakhs, with Rs 12 lakhs invested and Rs 11.2 lakhs in estimated returns.' },
        { question: 'Is SIP better than lump sum investment?', answer: 'SIP reduces market timing risk through rupee cost averaging, making it ideal for volatile markets. Lump sum can outperform in consistently rising markets, but SIP is generally safer for most investors.' },
        { question: 'Can I stop or modify my SIP anytime?', answer: 'Yes, most mutual fund SIPs are flexible and can be paused, increased, decreased, or stopped at any time without penalties.' },
      ]}
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
          <div>
            <label className="block text-sm font-medium mb-1.5">Annual Step-Up (%)</label>
            <input type="number" min={0} max={100} step={1} value={annualStepUp} onChange={(e) => setAnnualStepUp(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={50} step={1} value={annualStepUp} onChange={(e) => setAnnualStepUp(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            <p className="text-xs text-muted-foreground mt-1">Increase monthly SIP by this % every year</p>
          </div>

          {/* Goal-based reverse calculation toggle */}
          <div className="p-4 rounded-xl border border-border space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={reverseMode}
                onClick={() => setReverseMode(!reverseMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${reverseMode ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform ${reverseMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-medium">Calculate Required SIP</span>
            </label>
            {reverseMode && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Target Amount</label>
                  <input type="number" min={1000} value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Time Period (Years)</label>
                  <input type="number" min={1} max={40} value={targetYears} onChange={(e) => setTargetYears(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                {reverseResult && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-xs text-muted-foreground">Required Monthly SIP</div>
                    <div className="text-xl font-bold text-primary">{fmt(reverseResult.requiredSIP)}</div>
                    <div className="text-xs text-muted-foreground mt-1">to reach {fmt(targetAmount)} in {targetYears} years at {expectedReturn}% p.a.</div>
                  </div>
                )}
              </div>
            )}
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Year-by-Year Growth</h3>
          <ExportButton
            headers={annualStepUp > 0 ? ['Year', 'Monthly SIP', 'Total Invested', 'Returns', 'Total Value'] : ['Year', 'Total Invested', 'Returns', 'Total Value']}
            rows={result.yearly.map((row) => annualStepUp > 0 ? [row.year, row.monthlySIP, Math.round(row.invested), Math.round(row.returns), Math.round(row.value)] : [row.year, Math.round(row.invested), Math.round(row.returns), Math.round(row.value)])}
            filename="sip-growth.csv"
            label="Export CSV"
          />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Year</th>
                {annualStepUp > 0 && <th className="text-right p-3 font-medium">Monthly SIP</th>}
                <th className="text-right p-3 font-medium">Invested</th>
                <th className="text-right p-3 font-medium">Returns</th>
                <th className="text-right p-3 font-medium">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {result.yearly.map((row, i) => (
                <tr key={row.year} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.year}</td>
                  {annualStepUp > 0 && <td className="p-3 text-right text-purple-600 dark:text-purple-400">{fmt(row.monthlySIP)}</td>}
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
