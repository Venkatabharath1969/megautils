'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function FDCalculator() {
  const [principal, setPrincipal] = useState(100000)
  const [rate, setRate] = useState(7)
  const [tenure, setTenure] = useState(12)
  const [tenureType, setTenureType] = useState<'months' | 'years'>('months')
  const [compounding, setCompounding] = useState<'monthly' | 'quarterly' | 'halfyearly' | 'yearly'>('quarterly')

  const result = useMemo(() => {
    const compoundingMap = { monthly: 12, quarterly: 4, halfyearly: 2, yearly: 1 }
    const n = compoundingMap[compounding]
    const tenureYears = tenureType === 'years' ? tenure : tenure / 12
    const r = rate / 100

    // A = P(1 + r/n)^(nt)
    const maturityAmount = principal * Math.pow(1 + r / n, n * tenureYears)
    const interestEarned = maturityAmount - principal

    // Quarterly breakdown (up to 20 rows)
    const periods = Math.min(Math.ceil(tenureYears * 4), 80)
    const quarterly: { quarter: number; value: number }[] = []
    for (let q = 1; q <= periods; q++) {
      const t = q / 4
      const val = principal * Math.pow(1 + r / n, n * t)
      quarterly.push({ quarter: q, value: val })
    }

    return { maturityAmount, interestEarned, tenureYears, quarterly }
  }, [principal, rate, tenure, tenureType, compounding])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="FD Calculator"
      description="Calculate Fixed Deposit maturity amount and interest earned. Supports different compounding frequencies."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>FD Calculator is a free browser-based tool that lets you calculate Fixed Deposit maturity amounts and interest earned with support for simple and compound interest options. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when planning fixed deposit investments, comparing bank FD rates, or estimating returns on term deposits. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this finance tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need fixed deposit calculation.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How is FD interest calculated?', answer: 'FD interest is calculated using compound interest: A = P(1 + r/n)^(nt), where P is principal, r is annual rate, n is compounding frequency, and t is tenure in years.' },
        { question: 'Which compounding frequency gives the highest FD returns?', answer: 'Monthly compounding yields the highest returns, followed by quarterly, half-yearly, and yearly. The difference is small but adds up on larger deposits and longer tenures.' },
        { question: 'Is FD interest taxable in India?', answer: 'Yes, FD interest is taxable as per your income tax slab. TDS of 10% is deducted by banks if annual interest exceeds Rs 40,000 (Rs 50,000 for senior citizens).' },
        { question: 'Can I withdraw my FD before maturity?', answer: 'Yes, most banks allow premature withdrawal of FDs, but a penalty of 0.5-1% is typically deducted from the applicable interest rate.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Principal Amount</label>
            <input type="number" min={1000} value={principal} onChange={e => setPrincipal(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1000} max={10000000} step={1000} value={principal} onChange={e => setPrincipal(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Interest Rate (% per annum)</label>
            <input type="number" min={1} max={20} step={0.1} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1} max={15} step={0.1} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tenure</label>
            <div className="flex gap-2">
              <input type="number" min={1} value={tenure} onChange={e => setTenure(Number(e.target.value))} className="flex-1 h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <select value={tenureType} onChange={e => setTenureType(e.target.value as 'months' | 'years')} className="h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Compounding Frequency</label>
            <select value={compounding} onChange={e => setCompounding(e.target.value as typeof compounding)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="halfyearly">Half-Yearly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Maturity Amount</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.maturityAmount)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Principal</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(principal)}</div>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">Interest Earned</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.interestEarned)}</div>
            </div>
          </div>

          {/* Visual breakdown */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Principal vs Interest</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-blue-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(principal / result.maturityAmount) * 100}%` }}>
                {((principal / result.maturityAmount) * 100) > 15 && `${((principal / result.maturityAmount) * 100).toFixed(0)}%`}
              </div>
              <div className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(result.interestEarned / result.maturityAmount) * 100}%` }}>
                {((result.interestEarned / result.maturityAmount) * 100) > 15 && `${((result.interestEarned / result.maturityAmount) * 100).toFixed(0)}%`}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Principal</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Interest</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="text-sm text-muted-foreground mb-1">Effective Duration</div>
            <div className="text-lg font-bold">{result.tenureYears.toFixed(1)} years ({Math.round(result.tenureYears * 12)} months)</div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
