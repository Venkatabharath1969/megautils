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
  const [salesTaxRate, setSalesTaxRate] = useState(0)

  const result = useMemo(() => {
    if (mode === 'discount') {
      const discountAmount = originalPrice * (discountPct / 100)
      const priceAfterFirst = originalPrice - discountAmount
      const secondDiscountAmount = priceAfterFirst * (secondDiscount / 100)
      const final = priceAfterFirst - secondDiscountAmount
      const totalSaved = originalPrice - final
      const effectiveDiscount = originalPrice > 0 ? (totalSaved / originalPrice) * 100 : 0
      const taxAmount = final * (salesTaxRate / 100)
      const finalWithTax = final + taxAmount

      return {
        discountAmount,
        finalPrice: final,
        totalSaved,
        effectiveDiscount,
        secondDiscountAmount,
        originalPrice,
        taxAmount,
        finalWithTax,
      }
    } else {
      const original = discountPct < 100 ? finalPrice / (1 - discountPct / 100) : 0
      const discountAmount = original - finalPrice
      const taxAmount = finalPrice * (salesTaxRate / 100)
      const finalWithTax = finalPrice + taxAmount
      return {
        discountAmount,
        finalPrice,
        totalSaved: discountAmount,
        effectiveDiscount: discountPct,
        secondDiscountAmount: 0,
        originalPrice: original,
        taxAmount,
        finalWithTax,
      }
    }
  }, [mode, originalPrice, discountPct, finalPrice, secondDiscount, salesTaxRate])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  return (
    <ToolPage
      title="Discount Calculator"
      description="Calculate discount amounts, final prices, and find original prices from discounted values."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Discount Calculator is a free browser-based tool that lets you calculate discount amounts, sale prices, and savings percentages for single or stacked discounts. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when shopping, comparing deals, calculating markdown prices, or determining wholesale-to-retail pricing. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this shopping tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I calculate a discount percentage?', answer: 'Multiply the original price by the discount percentage divided by 100, then subtract from the original price. For example, 25% off $200 = $200 - $50 = $150.' },
        { question: 'How do stacked discounts work?', answer: 'Stacked discounts are applied sequentially, not added together. A 20% discount followed by a 10% discount equals a 28% total discount, not 30%.' },
        { question: 'How do I find the original price from a sale price?', answer: 'Divide the sale price by (1 minus the discount rate). For example, if an item is $75 after a 25% discount, the original price is $75 / 0.75 = $100.' },
      ]}
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
              <div>
                <label className="block text-sm font-medium mb-1.5">Sales Tax (%) <span className="text-muted-foreground">- optional</span></label>
                <input type="number" min={0} max={30} step={0.25} value={salesTaxRate} onChange={(e) => setSalesTaxRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input type="range" min={0} max={15} step={0.25} value={salesTaxRate} onChange={(e) => setSalesTaxRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
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
              <div>
                <label className="block text-sm font-medium mb-1.5">Sales Tax (%) <span className="text-muted-foreground">- optional</span></label>
                <input type="number" min={0} max={30} step={0.25} value={salesTaxRate} onChange={(e) => setSalesTaxRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
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
            <div className="text-sm text-muted-foreground mb-1">You Pay {salesTaxRate > 0 ? '(before tax)' : ''}</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.finalPrice)}</div>
          </div>
          {salesTaxRate > 0 && (
            <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-muted-foreground mb-1">Final Price (with {salesTaxRate}% tax)</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{fmt(result.finalWithTax)}</div>
              <div className="text-xs text-muted-foreground mt-1">Tax: {fmt(result.taxAmount)}</div>
            </div>
          )}
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
