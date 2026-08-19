'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household'

// 2024 US federal tax brackets
const brackets: Record<FilingStatus, { min: number; max: number; rate: number }[]> = {
  single: [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ],
  married_joint: [
    { min: 0, max: 23200, rate: 10 },
    { min: 23200, max: 94300, rate: 12 },
    { min: 94300, max: 201050, rate: 22 },
    { min: 201050, max: 383900, rate: 24 },
    { min: 383900, max: 487450, rate: 32 },
    { min: 487450, max: 731200, rate: 35 },
    { min: 731200, max: Infinity, rate: 37 },
  ],
  married_separate: [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 365600, rate: 35 },
    { min: 365600, max: Infinity, rate: 37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 10 },
    { min: 16550, max: 63100, rate: 12 },
    { min: 63100, max: 100500, rate: 22 },
    { min: 100500, max: 191950, rate: 24 },
    { min: 191950, max: 243700, rate: 32 },
    { min: 243700, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ],
}

const standardDeductions: Record<FilingStatus, number> = {
  single: 14600,
  married_joint: 29200,
  married_separate: 14600,
  head_of_household: 21900,
}

const statusLabels: Record<FilingStatus, string> = {
  single: 'Single',
  married_joint: 'Married Filing Jointly',
  married_separate: 'Married Filing Separately',
  head_of_household: 'Head of Household',
}

// FICA constants (2024)
const SS_RATE = 0.062
const SS_WAGE_BASE = 168600
const MEDICARE_RATE = 0.0145
const ADDITIONAL_MEDICARE_RATE = 0.009
const ADDITIONAL_MEDICARE_THRESHOLD = 200000

export default function TaxCalculator() {
  const [income, setIncome] = useState(85000)
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single')
  const [useStandardDeduction, setUseStandardDeduction] = useState(true)
  const [customDeduction, setCustomDeduction] = useState(0)
  const [stateTaxRate, setStateTaxRate] = useState(0)

  const result = useMemo(() => {
    const deduction = useStandardDeduction ? standardDeductions[filingStatus] : customDeduction
    const taxableIncome = Math.max(0, income - deduction)
    const statusBrackets = brackets[filingStatus]

    // Federal income tax
    const breakdown: { bracket: string; rate: number; taxableAmount: number; tax: number }[] = []
    let federalTax = 0
    let remaining = taxableIncome

    for (const bracket of statusBrackets) {
      if (remaining <= 0) break
      const bracketWidth = bracket.max === Infinity ? remaining : bracket.max - bracket.min
      const taxableInBracket = Math.min(remaining, bracketWidth)
      const taxInBracket = taxableInBracket * (bracket.rate / 100)
      federalTax += taxInBracket
      remaining -= taxableInBracket

      breakdown.push({
        bracket: bracket.max === Infinity ? `$${bracket.min.toLocaleString()}+` : `$${bracket.min.toLocaleString()} - $${bracket.max.toLocaleString()}`,
        rate: bracket.rate,
        taxableAmount: taxableInBracket,
        tax: taxInBracket,
      })
    }

    // FICA taxes (based on gross income, not taxable income)
    const socialSecurity = Math.min(income, SS_WAGE_BASE) * SS_RATE
    const medicareBase = income * MEDICARE_RATE
    const additionalMedicare = income > ADDITIONAL_MEDICARE_THRESHOLD
      ? (income - ADDITIONAL_MEDICARE_THRESHOLD) * ADDITIONAL_MEDICARE_RATE
      : 0
    const medicare = medicareBase + additionalMedicare
    const ficaTotal = socialSecurity + medicare

    // State tax (flat percentage of taxable income)
    const stateTax = taxableIncome * (stateTaxRate / 100)

    // Totals
    const totalTax = federalTax + stateTax + ficaTotal
    const effectiveRate = income > 0 ? (federalTax / income) * 100 : 0
    const combinedEffectiveRate = income > 0 ? (totalTax / income) * 100 : 0
    const marginalRate = statusBrackets.find(b => taxableIncome <= b.max)?.rate ?? 37
    const afterTaxIncome = income - totalTax

    return {
      deduction, taxableIncome, federalTax, stateTax, ficaTotal,
      socialSecurity, medicare, medicareBase, additionalMedicare,
      totalTax, effectiveRate, combinedEffectiveRate, marginalRate,
      afterTaxIncome, breakdown,
    }
  }, [income, filingStatus, useStandardDeduction, customDeduction, stateTaxRate])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="Income Tax Calculator"
      description="Estimate your US federal income tax. See bracket breakdown, effective tax rate, and tax owed by filing status."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Tax Calculator is a free browser-based tool that lets you estimate income tax liability based on income, deductions, and applicable tax brackets for basic tax planning. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when estimating tax payments, understanding marginal tax rates, planning deductions, or comparing tax scenarios. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this taxation tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is the difference between marginal and effective tax rate?', answer: 'Your marginal tax rate is the rate on your last dollar of income, while your effective tax rate is the average rate you pay across all your income after applying bracket thresholds.' },
        { question: 'What is the standard deduction for 2024?', answer: 'For 2024, the standard deduction is $14,600 for single filers, $29,200 for married filing jointly, and $21,900 for head of household.' },
        { question: 'How are federal tax brackets calculated?', answer: 'Tax brackets are progressive, meaning only the income within each bracket range is taxed at that rate. Your total tax is the sum of taxes calculated at each bracket level.' },
        { question: 'Should I itemize or take the standard deduction?', answer: 'Take the standard deduction unless your itemized deductions (mortgage interest, charitable donations, state taxes, etc.) exceed the standard deduction amount for your filing status.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Annual Gross Income</label>
            <input type="number" min={0} value={income} onChange={e => setIncome(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={1000000} step={1000} value={income} onChange={e => setIncome(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Filing Status</label>
            <select value={filingStatus} onChange={e => setFilingStatus(e.target.value as FilingStatus)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {(Object.keys(statusLabels) as FilingStatus[]).map(s => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
              <input type="checkbox" checked={useStandardDeduction} onChange={e => setUseStandardDeduction(e.target.checked)} className="rounded accent-primary" />
              Use Standard Deduction ({fmt(standardDeductions[filingStatus])})
            </label>
            {!useStandardDeduction && (
              <input type="number" min={0} value={customDeduction} onChange={e => setCustomDeduction(Number(e.target.value))} placeholder="Enter itemized deduction" className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring mt-2" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">State Tax Rate (%)</label>
            <input type="number" min={0} max={15} step={0.1} value={stateTaxRate} onChange={e => setStateTaxRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={15} step={0.1} value={stateTaxRate} onChange={e => setStateTaxRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            Based on 2024 US federal tax brackets and FICA rates. FICA includes Social Security (6.2% up to $168,600) and Medicare (1.45% + 0.9% Additional Medicare Tax on income over $200,000).
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-sm text-muted-foreground mb-1">Total Tax Burden</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{fmt(result.totalTax)}</div>
            <div className="text-sm text-muted-foreground mt-1">Combined Effective Rate: {result.combinedEffectiveRate.toFixed(2)}%</div>
          </div>

          {/* Tax Breakdown */}
          <div className="p-4 rounded-xl border border-border space-y-3">
            <div className="text-sm font-medium mb-1">Tax Breakdown</div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Federal Income Tax</span>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">{fmt(result.federalTax)}</span>
            </div>
            {stateTaxRate > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">State Tax ({stateTaxRate}%)</span>
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{fmt(result.stateTax)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">FICA (SS + Medicare)</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{fmt(result.ficaTotal)}</span>
            </div>
            <div className="pl-4 space-y-1 text-xs text-muted-foreground border-l-2 border-blue-500/30">
              <div className="flex justify-between"><span>Social Security (6.2%)</span><span>{fmt(result.socialSecurity)}</span></div>
              <div className="flex justify-between"><span>Medicare (1.45%)</span><span>{fmt(result.medicareBase)}</span></div>
              {result.additionalMedicare > 0 && (
                <div className="flex justify-between"><span>Additional Medicare (0.9%)</span><span>{fmt(result.additionalMedicare)}</span></div>
              )}
            </div>
            <div className="border-t border-border pt-2 flex justify-between items-center font-semibold">
              <span className="text-sm">Total</span>
              <span className="text-sm text-red-600 dark:text-red-400">{fmt(result.totalTax)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Federal Effective Rate</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.effectiveRate.toFixed(2)}%</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-muted-foreground mb-1">Marginal Tax Rate</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{result.marginalRate}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">After-Tax Income</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.afterTaxIncome)}</div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="text-sm text-muted-foreground mb-1">Taxable Income</div>
              <div className="text-xl font-bold">{fmt(result.taxableIncome)}</div>
            </div>
          </div>

          {/* Visual breakdown */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Income Breakdown</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-red-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${income > 0 ? (result.federalTax / income) * 100 : 0}%` }} title="Federal Tax" />
              {stateTaxRate > 0 && (
                <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${income > 0 ? (result.stateTax / income) * 100 : 0}%` }} title="State Tax" />
              )}
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${income > 0 ? (result.ficaTotal / income) * 100 : 0}%` }} title="FICA" />
              <div className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${income > 0 ? (result.afterTaxIncome / income) * 100 : 0}%` }}>
                {income > 0 && (result.afterTaxIncome / income) * 100 > 10 && `${((result.afterTaxIncome / income) * 100).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Federal</span>
              {stateTaxRate > 0 && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> State</span>}
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> FICA</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Take Home</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bracket Breakdown */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Tax Bracket Breakdown</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Bracket</th>
                <th className="text-right p-3 font-medium">Rate</th>
                <th className="text-right p-3 font-medium">Taxable Amount</th>
                <th className="text-right p-3 font-medium">Tax</th>
              </tr>
            </thead>
            <tbody>
              {result.breakdown.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.bracket}</td>
                  <td className="p-3 text-right">{row.rate}%</td>
                  <td className="p-3 text-right">{fmt(row.taxableAmount)}</td>
                  <td className="p-3 text-right text-red-600 dark:text-red-400 font-semibold">{fmt(row.tax)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-semibold">
                <td className="p-3" colSpan={2}>Total</td>
                <td className="p-3 text-right">{fmt(result.taxableIncome)}</td>
                <td className="p-3 text-right text-red-600 dark:text-red-400">{fmt(result.federalTax)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
