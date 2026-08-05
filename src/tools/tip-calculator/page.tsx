'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function TipCalculator() {
  const [billAmount, setBillAmount] = useState(85)
  const [tipPct, setTipPct] = useState(18)
  const [splitCount, setSplitCount] = useState(2)

  const result = useMemo(() => {
    const tipAmount = billAmount * (tipPct / 100)
    const totalBill = billAmount + tipAmount
    const totalPerPerson = splitCount > 0 ? totalBill / splitCount : totalBill
    const tipPerPerson = splitCount > 0 ? tipAmount / splitCount : tipAmount
    const billPerPerson = splitCount > 0 ? billAmount / splitCount : billAmount

    return { tipAmount, totalBill, totalPerPerson, tipPerPerson, billPerPerson }
  }, [billAmount, tipPct, splitCount])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  const presetTips = [10, 15, 18, 20, 25]

  return (
    <ToolPage
      title="Tip Calculator"
      description="Calculate tips, split bills between friends, and find the total cost per person."
      category="financial"
      categoryLabel="Financial Calculators"
      faqs={[
        { question: 'How much should I tip at a restaurant?', answer: 'In the US, 15-20% is standard for sit-down restaurants. Tip 15% for adequate service, 18% for good service, and 20% or more for excellent service.' },
        { question: 'How do I calculate a tip quickly?', answer: 'For a quick 20% tip, move the decimal one place left (to get 10%) and double it. For 15%, calculate 10% and add half of that amount.' },
        { question: 'Should I tip on the pre-tax or post-tax amount?', answer: 'Etiquette experts generally recommend tipping on the pre-tax subtotal, though tipping on the total including tax is also common and more generous.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Bill Amount ($)</label>
            <input type="number" min={0} step={0.01} value={billAmount} onChange={(e) => setBillAmount(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tip Percentage (%)</label>
            <div className="flex gap-2 mb-2">
              {presetTips.map((t) => (
                <button key={t} onClick={() => setTipPct(t)} className={`flex-1 h-9 rounded-lg text-sm font-medium transition-colors ${tipPct === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}>
                  {t}%
                </button>
              ))}
            </div>
            <input type="number" min={0} max={100} step={0.5} value={tipPct} onChange={(e) => setTipPct(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={50} step={1} value={tipPct} onChange={(e) => setTipPct(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Split Between</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))} className="w-10 h-10 rounded-lg border border-border bg-secondary hover:bg-muted flex items-center justify-center text-lg font-medium transition-colors">-</button>
              <input type="number" min={1} max={100} value={splitCount} onChange={(e) => setSplitCount(Math.max(1, Number(e.target.value)))} className="flex-1 h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={() => setSplitCount(splitCount + 1)} className="w-10 h-10 rounded-lg border border-border bg-secondary hover:bg-muted flex items-center justify-center text-lg font-medium transition-colors">+</button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{splitCount} {splitCount === 1 ? 'person' : 'people'}</p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Total Per Person</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.totalPerPerson)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">Tip Amount</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.tipAmount)}</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Bill</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.totalBill)}</div>
            </div>
          </div>

          {splitCount > 1 && (
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <div className="text-sm font-medium mb-3">Per Person Breakdown</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Bill share</span><span className="font-medium">{fmt(result.billPerPerson)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tip share</span><span className="font-medium">{fmt(result.tipPerPerson)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between"><span className="font-medium">Total each</span><span className="font-bold text-primary">{fmt(result.totalPerPerson)}</span></div>
              </div>
            </div>
          )}

          {/* Bill + Tip bar */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Bill Breakdown</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-blue-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(billAmount / result.totalBill) * 100}%` }}>
                {((billAmount / result.totalBill) * 100) > 20 && 'Bill'}
              </div>
              <div className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${(result.tipAmount / result.totalBill) * 100}%` }}>
                {((result.tipAmount / result.totalBill) * 100) > 10 && 'Tip'}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Bill ({fmt(billAmount)})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Tip ({fmt(result.tipAmount)})</span>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
