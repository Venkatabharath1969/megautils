'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

interface LoanInputs {
  amount: number
  rate: number
  tenure: number
}

function calcLoan(loan: LoanInputs) {
  const r = loan.rate / 100 / 12
  const n = loan.tenure * 12
  if (r === 0) {
    const emi = loan.amount / n
    return { emi, totalPayment: loan.amount, totalInterest: 0, months: n }
  }
  const emi = (loan.amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const totalPayment = emi * n
  const totalInterest = totalPayment - loan.amount
  return { emi, totalPayment, totalInterest, months: n }
}

export default function LoanComparisonCalculator() {
  const [loan1, setLoan1] = useState<LoanInputs>({ amount: 300000, rate: 6.5, tenure: 30 })
  const [loan2, setLoan2] = useState<LoanInputs>({ amount: 300000, rate: 5.75, tenure: 15 })

  const result = useMemo(() => {
    const r1 = calcLoan(loan1)
    const r2 = calcLoan(loan2)

    const emiDiff = r1.emi - r2.emi
    const interestDiff = r1.totalInterest - r2.totalInterest
    const totalDiff = r1.totalPayment - r2.totalPayment
    const betterLoan = r1.totalPayment <= r2.totalPayment ? 1 : 2

    return { r1, r2, emiDiff, interestDiff, totalDiff, betterLoan }
  }, [loan1, loan2])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const inputCls = 'w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage
      title="Loan Comparison Calculator"
      description="Compare two loan options side by side. See which loan saves you more in interest and total cost."
      category="financial"
      categoryLabel="Financial Calculators"
    >
      {/* Two loan inputs side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Loan 1 */}
        <div className="space-y-4 p-5 rounded-xl border-2 border-blue-500/30 bg-blue-500/5">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Loan A</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">Loan Amount ($)</label>
            <input type="number" min={0} value={loan1.amount} onChange={(e) => setLoan1({ ...loan1, amount: Number(e.target.value) })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Interest Rate (% per year)</label>
            <input type="number" min={0} max={30} step={0.125} value={loan1.rate} onChange={(e) => setLoan1({ ...loan1, rate: Number(e.target.value) })} className={inputCls} />
            <input type="range" min={1} max={20} step={0.125} value={loan1.rate} onChange={(e) => setLoan1({ ...loan1, rate: Number(e.target.value) })} className="w-full mt-2 accent-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Loan Term (Years)</label>
            <input type="number" min={1} max={40} value={loan1.tenure} onChange={(e) => setLoan1({ ...loan1, tenure: Number(e.target.value) })} className={inputCls} />
            <input type="range" min={1} max={40} value={loan1.tenure} onChange={(e) => setLoan1({ ...loan1, tenure: Number(e.target.value) })} className="w-full mt-2 accent-blue-500" />
          </div>
        </div>

        {/* Loan 2 */}
        <div className="space-y-4 p-5 rounded-xl border-2 border-orange-500/30 bg-orange-500/5">
          <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400">Loan B</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">Loan Amount ($)</label>
            <input type="number" min={0} value={loan2.amount} onChange={(e) => setLoan2({ ...loan2, amount: Number(e.target.value) })} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Interest Rate (% per year)</label>
            <input type="number" min={0} max={30} step={0.125} value={loan2.rate} onChange={(e) => setLoan2({ ...loan2, rate: Number(e.target.value) })} className={inputCls} />
            <input type="range" min={1} max={20} step={0.125} value={loan2.rate} onChange={(e) => setLoan2({ ...loan2, rate: Number(e.target.value) })} className="w-full mt-2 accent-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Loan Term (Years)</label>
            <input type="number" min={1} max={40} value={loan2.tenure} onChange={(e) => setLoan2({ ...loan2, tenure: Number(e.target.value) })} className={inputCls} />
            <input type="range" min={1} max={40} value={loan2.tenure} onChange={(e) => setLoan2({ ...loan2, tenure: Number(e.target.value) })} className="w-full mt-2 accent-orange-500" />
          </div>
        </div>
      </div>

      {/* Winner banner */}
      <div className={`p-4 rounded-xl border-2 mb-6 text-center ${result.betterLoan === 1 ? 'border-blue-500/50 bg-blue-500/10' : 'border-orange-500/50 bg-orange-500/10'}`}>
        <div className="text-sm text-muted-foreground mb-1">Better Option (Lower Total Cost)</div>
        <div className={`text-2xl font-bold ${result.betterLoan === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
          Loan {result.betterLoan === 1 ? 'A' : 'B'} saves you {fmt(Math.abs(result.totalDiff))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-medium">Metric</th>
              <th className="text-right p-3 font-medium text-blue-600 dark:text-blue-400">Loan A</th>
              <th className="text-right p-3 font-medium text-orange-600 dark:text-orange-400">Loan B</th>
              <th className="text-right p-3 font-medium">Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-card">
              <td className="p-3 font-medium">Monthly EMI</td>
              <td className="p-3 text-right">{fmt(result.r1.emi)}</td>
              <td className="p-3 text-right">{fmt(result.r2.emi)}</td>
              <td className={`p-3 text-right font-medium ${result.emiDiff > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {result.emiDiff > 0 ? '+' : ''}{fmt(result.emiDiff)}
              </td>
            </tr>
            <tr className="bg-muted/20">
              <td className="p-3 font-medium">Total Interest</td>
              <td className="p-3 text-right">{fmt(result.r1.totalInterest)}</td>
              <td className="p-3 text-right">{fmt(result.r2.totalInterest)}</td>
              <td className={`p-3 text-right font-medium ${result.interestDiff > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {result.interestDiff > 0 ? '+' : ''}{fmt(result.interestDiff)}
              </td>
            </tr>
            <tr className="bg-card">
              <td className="p-3 font-medium">Total Payment</td>
              <td className="p-3 text-right">{fmt(result.r1.totalPayment)}</td>
              <td className="p-3 text-right">{fmt(result.r2.totalPayment)}</td>
              <td className={`p-3 text-right font-medium ${result.totalDiff > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {result.totalDiff > 0 ? '+' : ''}{fmt(result.totalDiff)}
              </td>
            </tr>
            <tr className="bg-muted/20">
              <td className="p-3 font-medium">Loan Duration</td>
              <td className="p-3 text-right">{result.r1.months} months</td>
              <td className="p-3 text-right">{result.r2.months} months</td>
              <td className="p-3 text-right font-medium">{Math.abs(result.r1.months - result.r2.months)} months</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Visual comparison bars */}
      <div className="mt-6 space-y-4">
        <div className="p-4 rounded-xl border border-border">
          <div className="text-sm font-medium mb-3">Total Interest Comparison</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1"><span className="text-blue-600 dark:text-blue-400 font-medium">Loan A</span><span>{fmt(result.r1.totalInterest)}</span></div>
              <div className="w-full h-5 rounded-full bg-muted overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(result.r1.totalInterest, result.r2.totalInterest) > 0 ? (result.r1.totalInterest / Math.max(result.r1.totalInterest, result.r2.totalInterest)) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1"><span className="text-orange-600 dark:text-orange-400 font-medium">Loan B</span><span>{fmt(result.r2.totalInterest)}</span></div>
              <div className="w-full h-5 rounded-full bg-muted overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(result.r1.totalInterest, result.r2.totalInterest) > 0 ? (result.r2.totalInterest / Math.max(result.r1.totalInterest, result.r2.totalInterest)) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border">
          <div className="text-sm font-medium mb-3">Total Cost Comparison</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1"><span className="text-blue-600 dark:text-blue-400 font-medium">Loan A</span><span>{fmt(result.r1.totalPayment)}</span></div>
              <div className="w-full h-5 rounded-full bg-muted overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(result.r1.totalPayment, result.r2.totalPayment) > 0 ? (result.r1.totalPayment / Math.max(result.r1.totalPayment, result.r2.totalPayment)) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1"><span className="text-orange-600 dark:text-orange-400 font-medium">Loan B</span><span>{fmt(result.r2.totalPayment)}</span></div>
              <div className="w-full h-5 rounded-full bg-muted overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(result.r1.totalPayment, result.r2.totalPayment) > 0 ? (result.r2.totalPayment / Math.max(result.r1.totalPayment, result.r2.totalPayment)) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
