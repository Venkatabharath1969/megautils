'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function StockProfitCalculator() {
  const [buyPrice, setBuyPrice] = useState(150)
  const [sellPrice, setSellPrice] = useState(185)
  const [quantity, setQuantity] = useState(100)
  const [buyCommission, setBuyCommission] = useState(9.99)
  const [sellCommission, setSellCommission] = useState(9.99)
  const [holdingPeriod, setHoldingPeriod] = useState<'short' | 'long'>('long')
  const [taxRate, setTaxRate] = useState(15)
  const [dividendIncome, setDividendIncome] = useState(0)

  const result = useMemo(() => {
    const totalBuyCost = buyPrice * quantity + buyCommission
    const totalSellRevenue = sellPrice * quantity - sellCommission
    const profitLoss = totalSellRevenue - totalBuyCost
    const roi = totalBuyCost > 0 ? (profitLoss / totalBuyCost) * 100 : 0
    const breakEvenPrice = quantity > 0 ? (totalBuyCost + sellCommission) / quantity : 0
    const totalCommissions = buyCommission + sellCommission
    const profitable = profitLoss > 0

    // Capital gains tax
    const taxableGain = Math.max(0, profitLoss)
    const capitalGainsTax = taxableGain * (taxRate / 100)
    const dividendTax = dividendIncome * (taxRate / 100)
    const totalTax = capitalGainsTax + dividendTax
    const netProfitAfterTax = profitLoss + dividendIncome - totalTax
    const totalReturn = profitLoss + dividendIncome

    return { totalBuyCost, totalSellRevenue, profitLoss, roi, breakEvenPrice, totalCommissions, profitable, capitalGainsTax, dividendTax, totalTax, netProfitAfterTax, totalReturn }
  }, [buyPrice, sellPrice, quantity, buyCommission, sellCommission, taxRate, dividendIncome])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  return (
    <ToolPage
      title="Stock Profit Calculator"
      description="Calculate profit or loss on stock trades. Includes commission/brokerage fees, ROI percentage, and break-even price."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Stock Profit Calculator is a free browser-based tool that lets you calculate profit or loss from stock trades including buy price, sell price, quantity, and brokerage fees. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when evaluating trade performance, calculating capital gains, or planning exit strategies for stock investments. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this investing tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I calculate profit on a stock trade?', answer: 'Multiply the number of shares by the difference between sell and buy prices, then subtract any commissions or fees. This gives your net profit or loss.' },
        { question: 'What is the break-even price for a stock?', answer: 'The break-even price accounts for buy and sell commissions. It equals (total buy cost + sell commission) divided by the number of shares.' },
        { question: 'How is ROI calculated on stocks?', answer: 'ROI on stocks is calculated as (net profit / total investment cost) x 100. This includes commissions in both the profit and cost calculations.' },
        { question: 'Do stock commissions affect profit significantly?', answer: 'For small trades, commissions can significantly reduce returns. Many brokers now offer zero-commission trading, but always factor in any fees when calculating actual profit.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Buy Price (per share)</label>
              <input type="number" min={0} step={0.01} value={buyPrice} onChange={e => setBuyPrice(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Sell Price (per share)</label>
              <input type="number" min={0} step={0.01} value={sellPrice} onChange={e => setSellPrice(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Number of Shares</label>
            <input type="number" min={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1} max={10000} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Buy Commission ($)</label>
              <input type="number" min={0} step={0.01} value={buyCommission} onChange={e => setBuyCommission(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Sell Commission ($)</label>
              <input type="number" min={0} step={0.01} value={sellCommission} onChange={e => setSellCommission(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Holding Period</label>
            <select value={holdingPeriod} onChange={e => setHoldingPeriod(e.target.value as 'short' | 'long')} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="short">Short-term (less than 1 year)</option>
              <option value="long">Long-term (1 year or more)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tax Rate (%)</label>
              <input type="number" min={0} max={50} step={0.5} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <p className="text-xs text-muted-foreground mt-1">{holdingPeriod === 'short' ? 'Ordinary income rate' : 'Long-term capital gains rate'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Dividend Income ($)</label>
              <input type="number" min={0} step={0.01} value={dividendIncome} onChange={e => setDividendIncome(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${result.profitable ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="text-sm text-muted-foreground mb-1">Profit / Loss</div>
            <div className={`text-3xl font-bold ${result.profitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.profitLoss >= 0 ? '+' : ''}{fmt(result.profitLoss)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${result.roi >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="text-sm text-muted-foreground mb-1">Return on Investment</div>
              <div className={`text-xl font-bold ${result.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(2)}%
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Break-Even Price</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.breakEvenPrice)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Total Buy Cost</span>
              <span className="font-bold font-mono">{fmt(result.totalBuyCost)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Total Sell Revenue</span>
              <span className="font-bold font-mono">{fmt(result.totalSellRevenue)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Total Commissions</span>
              <span className="font-bold font-mono text-orange-600 dark:text-orange-400">{fmt(result.totalCommissions)}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Price Change</span>
              <span className={`font-bold font-mono ${sellPrice >= buyPrice ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {sellPrice >= buyPrice ? '+' : ''}{fmt(sellPrice - buyPrice)} ({buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice * 100).toFixed(2) : '0.00'}%)
              </span>
            </div>
            {dividendIncome > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Dividend Income</span>
                <span className="font-bold font-mono text-green-600 dark:text-green-400">{fmt(dividendIncome)}</span>
              </div>
            )}
          </div>

          {/* Tax Breakdown */}
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="text-sm font-medium mb-3">Tax & After-Tax Summary ({holdingPeriod === 'short' ? 'Short-term' : 'Long-term'} @ {taxRate}%)</div>
            <div className="space-y-2 text-sm">
              {result.capitalGainsTax > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Capital Gains Tax</span><span className="font-medium text-red-600 dark:text-red-400">-{fmt(result.capitalGainsTax)}</span></div>
              )}
              {dividendIncome > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Dividend Tax</span><span className="font-medium text-red-600 dark:text-red-400">-{fmt(result.dividendTax)}</span></div>
              )}
              {result.totalTax > 0 && (
                <div className="flex justify-between border-t border-border pt-1"><span className="text-muted-foreground">Total Tax</span><span className="font-medium text-red-600 dark:text-red-400">-{fmt(result.totalTax)}</span></div>
              )}
              <div className={`flex justify-between border-t border-border pt-1 ${result.netProfitAfterTax >= 0 ? '' : ''}`}>
                <span className="font-medium">Net Profit After Tax</span>
                <span className={`font-bold ${result.netProfitAfterTax >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{fmt(result.netProfitAfterTax)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
