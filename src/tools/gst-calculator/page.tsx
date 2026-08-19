'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

type GSTMode = 'exclusive' | 'inclusive'

export default function GSTCalculator() {
  const [amount, setAmount] = useState(10000)
  const [gstRate, setGstRate] = useState(18)
  const [mode, setMode] = useState<GSTMode>('exclusive')

  const result = useMemo(() => {
    if (mode === 'exclusive') {
      // Amount is before GST
      const gstAmount = amount * (gstRate / 100)
      const cgst = gstAmount / 2
      const sgst = gstAmount / 2
      const igst = gstAmount
      const totalWithGST = amount + gstAmount
      return { baseAmount: amount, gstAmount, cgst, sgst, igst, totalWithGST }
    } else {
      // Amount is inclusive of GST
      const baseAmount = amount / (1 + gstRate / 100)
      const gstAmount = amount - baseAmount
      const cgst = gstAmount / 2
      const sgst = gstAmount / 2
      const igst = gstAmount
      return { baseAmount, gstAmount, cgst, sgst, igst, totalWithGST: amount }
    }
  }, [amount, gstRate, mode])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n)

  const gstRates = [5, 12, 18, 28]

  return (
    <ToolPage
      title="GST Calculator"
      description="Calculate GST (Goods & Services Tax) with CGST, SGST, and IGST breakdown. Supports both inclusive and exclusive modes."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>GST Calculator is a free browser-based tool that lets you calculate Goods and Services Tax amounts for inclusive and exclusive pricing with multiple GST slab rates. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when Indian business invoicing, determining pre-tax and post-tax prices, or calculating tax liability for different GST slabs. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this taxation tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is GST and how is it calculated?', answer: 'GST (Goods and Services Tax) is an indirect tax levied on the supply of goods and services. It is calculated as a percentage of the base price, with common rates being 5%, 12%, 18%, and 28%.' },
        { question: 'What is the difference between CGST, SGST, and IGST?', answer: 'CGST (Central GST) and SGST (State GST) are charged equally on intra-state transactions, while IGST (Integrated GST) is charged on inter-state transactions at the full rate.' },
        { question: 'How do I calculate GST from a GST-inclusive price?', answer: 'To find the base price from a GST-inclusive amount, divide the total by (1 + GST rate/100). For example, a price of 1,180 at 18% GST has a base price of 1,000.' },
      ]}
    >
      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode('exclusive')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'exclusive' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}>
          GST Exclusive (Add GST)
        </button>
        <button onClick={() => setMode('inclusive')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'inclusive' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}>
          GST Inclusive (Remove GST)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {mode === 'exclusive' ? 'Amount (Before GST)' : 'Amount (Including GST)'}
            </label>
            <input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={100} max={1000000} step={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">GST Rate (%)</label>
            <div className="flex gap-2 mb-2">
              {gstRates.map((r) => (
                <button key={r} onClick={() => setGstRate(r)} className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${gstRate === r ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}>
                  {r}%
                </button>
              ))}
            </div>
            <input type="number" min={0} max={100} step={0.5} value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Total Amount (with GST)</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.totalWithGST)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Base Amount</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.baseAmount)}</div>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total GST</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{fmt(result.gstAmount)}</div>
            </div>
          </div>

          {/* GST Component Breakdown */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">GST Component Breakdown</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10">
                <div>
                  <div className="text-sm font-medium text-green-700 dark:text-green-400">CGST ({gstRate / 2}%)</div>
                  <div className="text-xs text-muted-foreground">Central GST</div>
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{fmt(result.cgst)}</div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10">
                <div>
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-400">SGST ({gstRate / 2}%)</div>
                  <div className="text-xs text-muted-foreground">State GST</div>
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{fmt(result.sgst)}</div>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-orange-500/10">
                  <div>
                    <div className="text-sm font-medium text-orange-700 dark:text-orange-400">IGST ({gstRate}%)</div>
                    <div className="text-xs text-muted-foreground">Integrated GST (for inter-state)</div>
                  </div>
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{fmt(result.igst)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown Bar */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Price Breakdown</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-blue-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(result.baseAmount / result.totalWithGST) * 100}%` }}>
                {((result.baseAmount / result.totalWithGST) * 100) > 20 && 'Base'}
              </div>
              <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${(result.cgst / result.totalWithGST) * 100}%` }} />
              <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${(result.sgst / result.totalWithGST) * 100}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Base Amount</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> CGST</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> SGST</span>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
