'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState(400000)
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [rate, setRate] = useState(6.5)
  const [termYears, setTermYears] = useState(30)

  const result = useMemo(() => {
    const downPayment = homePrice * (downPaymentPct / 100)
    const loanAmount = homePrice - downPayment
    const months = termYears * 12
    const r = rate / 100 / 12

    let monthlyPayment: number
    if (r === 0) {
      monthlyPayment = loanAmount / months
    } else {
      monthlyPayment = (loanAmount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
    }

    const totalPayment = monthlyPayment * months
    const totalInterest = totalPayment - loanAmount

    // Amortization schedule (yearly summary)
    const amortization: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = []
    let balance = loanAmount
    for (let y = 1; y <= termYears; y++) {
      let yearPrincipal = 0
      let yearInterest = 0
      for (let m = 0; m < 12; m++) {
        const interestPayment = balance * r
        const principalPayment = monthlyPayment - interestPayment
        yearPrincipal += principalPayment
        yearInterest += interestPayment
        balance -= principalPayment
      }
      amortization.push({
        year: y,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        balance: Math.max(0, balance),
      })
    }

    return { downPayment, loanAmount, monthlyPayment, totalPayment, totalInterest, amortization }
  }, [homePrice, downPaymentPct, rate, termYears])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const termOptions = [10, 15, 20, 25, 30]

  return (
    <ToolPage
      title="Mortgage Calculator"
      description="Calculate monthly mortgage payments, total interest, and view a complete amortization schedule."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is a Mortgage Calculator?</h2>
          <p>
            A mortgage calculator is a financial planning tool that estimates your monthly home-loan payment based on the property price, down payment, interest rate, and loan term. It applies the standard amortization formula used by banks and lenders worldwide: <code>M&nbsp;=&nbsp;P[r(1+r)^n]/[(1+r)^n−1]</code>, where <strong>P</strong> is the loan principal, <strong>r</strong> is the monthly interest rate, and <strong>n</strong> is the total number of payments. Beyond the headline monthly figure, this calculator also shows total interest paid over the life of the loan and a full year-by-year amortization schedule so you can see exactly how each payment is split between principal and interest.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the <strong>Home Price</strong> — either type the amount or drag the slider.</li>
            <li>Set your <strong>Down Payment</strong> percentage. The tool instantly shows the dollar equivalent so you can plan your savings target.</li>
            <li>Enter the annual <strong>Interest Rate</strong>. Check current rates from your lender or a financial news site for the most accurate estimate.</li>
            <li>Choose a <strong>Loan Term</strong> — common options are 15, 20, or 30 years. Shorter terms mean higher monthly payments but substantially less total interest.</li>
            <li>Review the results panel: your <strong>monthly payment</strong>, total interest, total cost, a colour-coded cost breakdown bar, and a scrollable <strong>amortization schedule</strong>.</li>
          </ol>

          <h2>When to Use a Mortgage Calculator</h2>
          <p>
            Use this calculator when you are house-hunting and need to determine how much home you can afford, when comparing fixed-rate offers from different lenders, or when deciding between a 15-year and 30-year term. It is also useful for evaluating the impact of making a larger down payment — even a few percentage points can save tens of thousands of dollars in interest. The mortgage calculator on utilsnow.com runs entirely in your browser, so your financial details remain private.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>A <strong>20 % down payment</strong> is the traditional threshold to avoid Private Mortgage Insurance (PMI), which adds to your monthly cost.</li>
            <li>This calculator covers <strong>principal and interest only</strong>. Budget separately for property taxes, homeowner's insurance, HOA fees, and maintenance — these can add 30–50 % on top of your base payment.</li>
            <li>Look at the <strong>amortization schedule</strong> to understand how early payments are mostly interest. Making extra principal payments in the first few years can dramatically shorten your loan.</li>
            <li>Compare the <strong>total interest</strong> across different term lengths. A 30-year loan at 6.5 % costs roughly twice as much in total interest as a 15-year loan at the same rate.</li>
            <li>Re-run the calculator periodically as rates change — even a 0.25 % rate drop can save thousands over the life of a loan.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How is the monthly mortgage payment calculated?', answer: 'It uses the standard amortization formula: M = P[r(1+r)^n]/[(1+r)^n-1], where P is the loan principal, r is the monthly interest rate, and n is the total number of monthly payments.' },
        { question: 'What is an amortization schedule?', answer: 'An amortization schedule shows how each payment is split between principal and interest over the life of the loan. Early payments are mostly interest, while later payments go primarily toward principal.' },
        { question: 'Does this calculator include taxes and insurance?', answer: 'No. This calculator shows principal and interest only. Your actual monthly payment may be higher when property taxes, homeowners insurance, and PMI are included.' },
        { question: 'How does the down payment affect my mortgage?', answer: 'A larger down payment reduces your loan amount, resulting in lower monthly payments and less total interest paid. Putting down 20% or more also typically eliminates the need for private mortgage insurance (PMI).' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Home Price ($)</label>
            <input type="number" min={0} value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={50000} max={2000000} step={5000} value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Down Payment (%)</label>
            <div className="flex items-center gap-3">
              <input type="number" min={0} max={100} step={1} value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))} className="flex-1 h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">{fmt(homePrice * (downPaymentPct / 100))}</span>
            </div>
            <input type="range" min={0} max={50} step={1} value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Interest Rate (%)</label>
            <input type="number" min={0} max={25} step={0.125} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1} max={15} step={0.125} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Loan Term</label>
            <div className="flex gap-2">
              {termOptions.map((t) => (
                <button key={t} onClick={() => setTermYears(t)} className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${termYears === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}>
                  {t} yr
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Monthly Payment</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.monthlyPayment)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Loan Amount</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.loanAmount)}</div>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="text-sm text-muted-foreground mb-1">Down Payment</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{fmt(result.downPayment)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Interest</div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">{fmt(result.totalInterest)}</div>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Cost</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.totalPayment + result.downPayment)}</div>
            </div>
          </div>
          {/* Breakdown bar */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Cost Breakdown</div>
            <div className="w-full h-6 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${(result.downPayment / (result.totalPayment + result.downPayment)) * 100}%` }} />
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${(result.loanAmount / (result.totalPayment + result.downPayment)) * 100}%` }} />
              <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${(result.totalInterest / (result.totalPayment + result.downPayment)) * 100}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Down Payment</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Principal</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Interest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Amortization Schedule (Yearly)</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Year</th>
                <th className="text-right p-3 font-medium">Principal Paid</th>
                <th className="text-right p-3 font-medium">Interest Paid</th>
                <th className="text-right p-3 font-medium">Remaining Balance</th>
              </tr>
            </thead>
            <tbody>
              {result.amortization.map((row, i) => (
                <tr key={row.year} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                  <td className="p-3 font-medium">{row.year}</td>
                  <td className="p-3 text-right text-blue-600 dark:text-blue-400">{fmt(row.principalPaid)}</td>
                  <td className="p-3 text-right text-red-600 dark:text-red-400">{fmt(row.interestPaid)}</td>
                  <td className="p-3 text-right">{fmt(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolPage>
  )
}
