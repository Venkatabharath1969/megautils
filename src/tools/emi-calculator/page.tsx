'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(2500000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(20)
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years')

  const result = useMemo(() => {
    const months = tenureUnit === 'years' ? tenure * 12 : tenure
    const r = rate / 100 / 12
    if (r === 0) {
      const emi = loanAmount / months
      return { emi, totalPayment: loanAmount, totalInterest: 0, months }
    }
    const emi = (loanAmount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
    const totalPayment = emi * months
    const totalInterest = totalPayment - loanAmount
    return { emi, totalPayment, totalInterest, months }
  }, [loanAmount, rate, tenure, tenureUnit])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const principalPct = (loanAmount / result.totalPayment) * 100
  const interestPct = (result.totalInterest / result.totalPayment) * 100

  return (
    <ToolPage
      title="EMI Calculator"
      description="Calculate your Equated Monthly Installment (EMI) for home loans, car loans, and personal loans."
      category="financial"
      categoryLabel="Financial Calculators"
      faqs={[
        { question: 'What is EMI and how is it calculated?', answer: 'EMI (Equated Monthly Installment) is a fixed monthly payment combining principal and interest. It is calculated using the formula: EMI = P x r x (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly interest rate, and n is total months.' },
        { question: 'Does a higher tenure reduce EMI?', answer: 'Yes, a longer tenure reduces the monthly EMI amount, but you end up paying significantly more total interest over the life of the loan.' },
        { question: 'How does prepayment affect my loan EMI?', answer: 'Prepaying part of the principal reduces either your remaining tenure or your EMI amount, saving you money on total interest paid over the loan period.' },
        { question: 'What is a good EMI-to-income ratio?', answer: 'Financial advisors recommend keeping your total EMI obligations below 40-50% of your monthly income to maintain a healthy financial balance.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Loan Amount</label>
            <input
              type="number"
              min={0}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input type="range" min={50000} max={50000000} step={50000} value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Interest Rate (% per annum)</label>
            <input
              type="number"
              min={0}
              max={50}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input type="range" min={1} max={30} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Loan Tenure</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={tenureUnit === 'years' ? 40 : 480}
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="flex-1 h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                value={tenureUnit}
                onChange={(e) => setTenureUnit(e.target.value as 'years' | 'months')}
                className="h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
            <input type="range" min={1} max={tenureUnit === 'years' ? 40 : 480} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Monthly EMI</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.emi)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Principal Amount</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(loanAmount)}</div>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Interest</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{fmt(result.totalInterest)}</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="text-sm text-muted-foreground mb-1">Total Payment</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.totalPayment)}</div>
          </div>

          {/* Principal vs Interest Breakdown */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Payment Breakdown</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-blue-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${principalPct}%` }}>
                {principalPct > 15 && `${principalPct.toFixed(1)}%`}
              </div>
              <div className="bg-orange-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${interestPct}%` }}>
                {interestPct > 15 && `${interestPct.toFixed(1)}%`}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Principal</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Interest</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="text-sm text-muted-foreground">Loan Duration: <span className="font-semibold text-foreground">{result.months} months ({(result.months / 12).toFixed(1)} years)</span></div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
