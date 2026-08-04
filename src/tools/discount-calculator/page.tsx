'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

type Mode = 'discount' | 'reverse'

export default function DiscountCalculator() {
  const [mode, setMode] = useState<Mode>('discount')
  const [originalPrice, setOriginalPrice] = useState(200)
  const [discountPct, setDiscountPct] = useState(25)
  const [finalPrice, setFinalPrice] = useState(150)
  const [secondDiscount, setSecondDiscount] = useState(0)

  const result = useMemo(() => {
    if (mode === 'discount') {
      const discountAmount = originalPrice * (discountPct / 100)
      const priceAfterFirst = originalPrice - discountAmount
      const secondDiscountAmount = priceAfterFirst * (secondDiscount / 100)
      const final = priceAfterFirst - secondDiscountAmount
      const totalSaved = originalPrice - final
      const effectiveDiscount = originalPrice > 0 ? (totalSaved / originalPrice) * 100 : 0

      return {
        discountAmount,
        finalPrice: final,
        totalSaved,
        effectiveDiscount,
        secondDiscountAmount,
        originalPrice,
      }
    } else {
      const original = discountPct < 100 ? finalPrice / (1 - discountPct / 100) : 0
      const discountAmount = original - finalPrice
      return {
        discountAmount,
        finalPrice,
        totalSaved: discountAmount,
        effectiveDiscount: discountPct,
        secondDiscountAmount: 0,
        originalPrice: original,
      }
    }
  }, [mode, originalPrice, discountPct, finalPrice, secondDiscount])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  return (
    <ToolPage
      title="Discount Calculator"
      description="Calculate discount amounts, final prices, and find original prices from discounted values."
      category="financial"
      categoryLabel="Financial Calculators"
    >
      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode('discount')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'discount' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}>
          Calculate Discount
        </button>
        <button onClick={() => setMode('reverse')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'reverse' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}>
          Find Original Price
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          {mode === 'discount' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Original Price ($)</label>
                <input type="number" min={0} value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Discount (%)</label>
                <input type="number" min={0} max={100} step={0.5} value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input type="range" min={0} max={100} step={1} value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} className="w-full mt-2 accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Additional Discount (%) <span className="text-muted-foreground">- optional</span></label>
                <input type="number" min={0} max={100} step={0.5} value={secondDiscount} onChange={(e) => setSecondDiscount(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input type="range" min={0} max={100} step={1} value={secondDiscount} onChange={(e) => setSecondDiscount(Number(e.target.value))} className="w-full mt-2 accent-primary" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5">Final / Sale Price ($)</label>
                <input type="number" min={0} value={finalPrice} onChange={(e) => setFinalPrice(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Discount That Was Applied (%)</label>
                <input type="number" min={0} max={99.99} step={0.5} value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input type="range" min={0} max={99} step={1} value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} className="w-full mt-2 accent-primary" />
              </div>
            </>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {mode === 'reverse' && (
            <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Original Price</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.originalPrice)}</div>
            </div>
          )}
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">You Pay</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.finalPrice)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="text-sm text-muted-foreground mb-1">You Save</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.totalSaved)}</div>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="text-sm text-muted-foreground mb-1">Effective Discount</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{result.effectiveDiscount.toFixed(1)}%</div>
            </div>
          </div>

          {mode === 'discount' && secondDiscount > 0 && (
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <div className="text-sm font-medium mb-2">Stacked Discount Breakdown</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">First discount ({discountPct}%)</span><span className="font-medium">-{fmt(result.discountAmount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Second discount ({secondDiscount}%)</span><span className="font-medium">-{fmt(result.secondDiscountAmount)}</span></div>
                <div className="border-t border-border pt-1 mt-1 flex justify-between"><span className="text-muted-foreground">Effective combined</span><span className="font-semibold">{result.effectiveDiscount.toFixed(1)}%</span></div>
              </div>
            </div>
          )}

          {/* Price comparison bar */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Price Comparison</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Original</span><span>{fmt(result.originalPrice)}</span></div>
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
                  <div className="bg-red-400 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>After Discount</span><span>{fmt(result.finalPrice)}</span></div>
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${result.originalPrice > 0 ? (result.finalPrice / result.originalPrice) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
