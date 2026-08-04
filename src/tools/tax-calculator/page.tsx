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

export default function TaxCalculator() {
  const [income, setIncome] = useState(85000)
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single')
  const [useStandardDeduction, setUseStandardDeduction] = useState(true)
  const [customDeduction, setCustomDeduction] = useState(0)

  const result = useMemo(() => {
    const deduction = useStandardDeduction ? standardDeductions[filingStatus] : customDeduction
    const taxableIncome = Math.max(0, income - deduction)
    const statusBrackets = brackets[filingStatus]

    const breakdown: { bracket: string; rate: number; taxableAmount: number; tax: number }[] = []
    let totalTax = 0
    let remaining = taxableIncome

    for (const bracket of statusBrackets) {
      if (remaining <= 0) break
      const bracketWidth = bracket.max === Infinity ? remaining : bracket.max - bracket.min
      const taxableInBracket = Math.min(remaining, bracketWidth)
      const taxInBracket = taxableInBracket * (bracket.rate / 100)
      totalTax += taxInBracket
      remaining -= taxableInBracket

      breakdown.push({
        bracket: bracket.max === Infinity ? `$${bracket.min.toLocaleString()}+` : `$${bracket.min.toLocaleString()} - $${bracket.max.toLocaleString()}`,
        rate: bracket.rate,
        taxableAmount: taxableInBracket,
        tax: taxInBracket,
      })
    }

    const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0
    const marginalRate = statusBrackets.find(b => taxableIncome <= b.max)?.rate ?? 37
    const afterTaxIncome = income - totalTax

    return { deduction, taxableIncome, totalTax, effectiveRate, marginalRate, afterTaxIncome, breakdown }
  }, [income, filingStatus, useStandardDeduction, customDeduction])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="Income Tax Calculator"
      description="Estimate your US federal income tax. See bracket breakdown, effective tax rate, and tax owed by filing status."
      category="financial"
      categoryLabel="Financial Calculators"
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

          <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            Based on 2024 US federal tax brackets. This is an estimate and does not include state taxes, credits, or other adjustments.
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-sm text-muted-foreground mb-1">Estimated Federal Tax</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{fmt(result.totalTax)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Effective Tax Rate</div>
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
              <div className="bg-red-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${income > 0 ? (result.totalTax / income) * 100 : 0}%` }}>
                {income > 0 && (result.totalTax / income) * 100 > 10 && `${((result.totalTax / income) * 100).toFixed(0)}%`}
              </div>
              <div className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${income > 0 ? (result.afterTaxIncome / income) * 100 : 0}%` }}>
                {income > 0 && (result.afterTaxIncome / income) * 100 > 10 && `${((result.afterTaxIncome / income) * 100).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Tax</span>
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
                <td className="p-3 text-right text-red-600 dark:text-red-400">{fmt(result.totalTax)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
