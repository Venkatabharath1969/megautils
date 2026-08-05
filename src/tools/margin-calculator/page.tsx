'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

type CalcMode = 'costSelling' | 'costMargin' | 'sellingMargin'

export default function MarginCalculator() {
  const [mode, setMode] = useState<CalcMode>('costSelling')
  const [costPrice, setCostPrice] = useState(60)
  const [sellingPrice, setSellingPrice] = useState(100)
  const [marginPct, setMarginPct] = useState(40)

  const result = useMemo(() => {
    let cost = costPrice
    let selling = sellingPrice
    let margin = marginPct

    if (mode === 'costSelling') {
      // Calculate margin from cost and selling price
      const grossProfit = selling - cost
      margin = selling > 0 ? (grossProfit / selling) * 100 : 0
      const markup = cost > 0 ? (grossProfit / cost) * 100 : 0
      return { cost, selling, grossProfit, margin, markup }
    } else if (mode === 'costMargin') {
      // Calculate selling price from cost and desired margin
      selling = margin < 100 ? cost / (1 - margin / 100) : 0
      const grossProfit = selling - cost
      const markup = cost > 0 ? (grossProfit / cost) * 100 : 0
      return { cost, selling, grossProfit, margin, markup }
    } else {
      // Calculate cost from selling price and margin
      cost = selling * (1 - margin / 100)
      const grossProfit = selling - cost
      const markup = cost > 0 ? (grossProfit / cost) * 100 : 0
      return { cost, selling, grossProfit, margin, markup }
    }
  }, [mode, costPrice, sellingPrice, marginPct])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  const modes: { value: CalcMode; label: string; desc: string }[] = [
    { value: 'costSelling', label: 'Cost + Selling', desc: 'Know cost & selling price' },
    { value: 'costMargin', label: 'Cost + Margin', desc: 'Know cost & desired margin' },
    { value: 'sellingMargin', label: 'Selling + Margin', desc: 'Know selling price & margin' },
  ]

  return (
    <ToolPage
      title="Margin Calculator"
      description="Calculate profit margin, markup percentage, and gross profit. Supports multiple calculation modes."
      category="financial"
      categoryLabel="Financial Calculators"
      faqs={[
        { question: 'What is the difference between margin and markup?', answer: 'Margin is profit as a percentage of the selling price, while markup is profit as a percentage of the cost price. A 50% markup equals a 33.3% margin.' },
        { question: 'How do I calculate profit margin?', answer: 'Profit margin = (Selling Price - Cost Price) / Selling Price x 100. For example, selling at $100 with a $60 cost gives a 40% margin.' },
        { question: 'What is a good profit margin?', answer: 'Good margins vary by industry. Retail averages 2-5%, software 70-90%, and restaurants 3-9%. Compare your margin to industry benchmarks for a meaningful assessment.' },
      ]}
    >
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {modes.map((m) => (
          <button key={m.value} onClick={() => setMode(m.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            {modes.find((m) => m.value === mode)?.desc}
          </div>

          {(mode === 'costSelling' || mode === 'costMargin') && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Cost Price ($)</label>
              <input type="number" min={0} step={0.01} value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="range" min={0} max={10000} step={1} value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            </div>
          )}

          {(mode === 'costSelling' || mode === 'sellingMargin') && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Selling Price ($)</label>
              <input type="number" min={0} step={0.01} value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="range" min={0} max={10000} step={1} value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            </div>
          )}

          {(mode === 'costMargin' || mode === 'sellingMargin') && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Profit Margin (%)</label>
              <input type="number" min={0} max={99.99} step={0.5} value={marginPct} onChange={(e) => setMarginPct(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="range" min={0} max={95} step={0.5} value={marginPct} onChange={(e) => setMarginPct(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Profit Margin</div>
            <div className="text-3xl font-bold text-primary">{result.margin.toFixed(2)}%</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">Gross Profit</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.grossProfit)}</div>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="text-sm text-muted-foreground mb-1">Markup</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{result.markup.toFixed(2)}%</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-sm text-muted-foreground mb-1">Cost Price</div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">{fmt(result.cost)}</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Selling Price</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.selling)}</div>
            </div>
          </div>

          {/* Price breakdown bar */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Selling Price Breakdown</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-red-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${result.selling > 0 ? (result.cost / result.selling) * 100 : 0}%` }}>
                {result.selling > 0 && (result.cost / result.selling) * 100 > 15 && 'Cost'}
              </div>
              <div className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${result.margin}%` }}>
                {result.margin > 15 && 'Profit'}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Cost ({fmt(result.cost)})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Profit ({fmt(result.grossProfit)})</span>
            </div>
          </div>

          {/* Margin vs Markup explainer */}
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="text-sm font-medium mb-2">Margin vs Markup</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Margin</strong> = Profit / Selling Price = {result.margin.toFixed(2)}%</p>
              <p><strong>Markup</strong> = Profit / Cost Price = {result.markup.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
