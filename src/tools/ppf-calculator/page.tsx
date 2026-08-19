'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function PPFCalculator() {
  const [annualDeposit, setAnnualDeposit] = useState(150000)
  const [ppfRate, setPpfRate] = useState(7.1)
  const [years, setYears] = useState(15)
  const [taxBracket, setTaxBracket] = useState(30)

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

    // Section 80C tax savings
    const eligible80C = Math.min(annualDeposit, 150000)
    const annualTaxSaved = eligible80C * taxBracket / 100
    const totalTaxSaved = annualTaxSaved * years

    return { maturityValue, totalDeposits, totalInterest, yearly, annualTaxSaved, totalTaxSaved, eligible80C }
  }, [annualDeposit, ppfRate, years, taxBracket])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="PPF Calculator"
      description="Calculate Public Provident Fund maturity value. Plan your long-term tax-saving investments with current PPF interest rates."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>PPF Calculator is a free browser-based tool that lets you calculate Public Provident Fund returns with yearly deposits, compound interest, and maturity values for the 15-year tenure. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when planning PPF investments for tax savings under Section 80C, estimating long-term returns, or retirement planning in India. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this finance tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is the current PPF interest rate?', answer: 'The current PPF interest rate is 7.1% per annum (FY 2024-25), which is set by the Government of India and revised quarterly.' },
        { question: 'What is the lock-in period for PPF?', answer: 'PPF has a mandatory lock-in period of 15 years. After maturity, you can extend it in blocks of 5 years with or without contributions.' },
        { question: 'Is PPF interest taxable?', answer: 'No, PPF enjoys EEE (Exempt-Exempt-Exempt) tax status under Section 80C. The deposits, interest earned, and maturity amount are all completely tax-free.' },
        { question: 'What is the maximum I can invest in PPF per year?', answer: 'The maximum annual contribution to a PPF account is Rs 1,50,000. The minimum deposit required per year is Rs 500.' },
      ]}
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

          <div>
            <label className="block text-sm font-medium mb-1.5">Tax Bracket (%)</label>
            <select value={taxBracket} onChange={e => setTaxBracket(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value={0}>0% (No Tax)</option>
              <option value={10}>10%</option>
              <option value={20}>20%</option>
              <option value={30}>30%</option>
            </select>
            <div className="text-xs text-muted-foreground mt-1">For Section 80C tax savings calculation</div>
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

          {taxBracket > 0 && (
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <div className="text-sm font-medium text-teal-700 dark:text-teal-400 mb-2">Section 80C Tax Savings</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Eligible amount (per year)</span><span className="font-medium">{fmt(result.eligible80C)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Annual tax saved ({taxBracket}%)</span><span className="font-medium text-teal-600 dark:text-teal-400">{fmt(result.annualTaxSaved)}</span></div>
                <div className="flex justify-between border-t border-border pt-1"><span className="font-medium">Total tax saved ({years} yrs)</span><span className="font-bold text-teal-600 dark:text-teal-400">{fmt(result.totalTaxSaved)}</span></div>
              </div>
            </div>
          )}
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
