'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function ROICalculator() {
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [finalValue, setFinalValue] = useState(15000)
  const [years, setYears] = useState(3)

  const result = useMemo(() => {
    const profitLoss = finalValue - initialInvestment
    const roi = initialInvestment > 0 ? (profitLoss / initialInvestment) * 100 : 0
    const annualizedROI = initialInvestment > 0 && years > 0
      ? (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100
      : 0
    const isProfit = profitLoss >= 0

    return { profitLoss, roi, annualizedROI, isProfit }
  }, [initialInvestment, finalValue, years])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  return (
    <ToolPage
      title="ROI Calculator"
      description="Calculate Return on Investment, annualized ROI, and total profit or loss on your investments."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>ROI Calculator is a free browser-based tool that lets you calculate Return on Investment as a percentage by comparing the gain from an investment to its cost. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when evaluating marketing campaign effectiveness, comparing investment opportunities, or measuring project returns. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this business tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is ROI and how is it calculated?', answer: 'ROI (Return on Investment) measures the percentage gain or loss relative to your initial investment. It is calculated as: ROI = ((Final Value - Initial Investment) / Initial Investment) x 100.' },
        { question: 'What is annualized ROI?', answer: 'Annualized ROI converts total returns into a yearly rate, allowing fair comparison between investments held for different time periods. It uses the formula: ((Final/Initial)^(1/years) - 1) x 100.' },
        { question: 'What is a good ROI percentage?', answer: 'A good ROI depends on the investment type. Stock markets historically average 10-12% annually, while real estate averages 8-10%. Any ROI above the inflation rate is generally considered positive.' },
        { question: 'Does ROI account for risk?', answer: 'No, basic ROI only measures returns and does not factor in risk. Two investments with the same ROI may carry very different levels of risk, so always consider risk-adjusted metrics as well.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Initial Investment ($)</label>
            <input type="number" min={0} value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={100} max={1000000} step={100} value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Final Value ($)</label>
            <input type="number" min={0} value={finalValue} onChange={(e) => setFinalValue(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={2000000} step={100} value={finalValue} onChange={(e) => setFinalValue(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Investment Period (Years)</label>
            <input type="number" min={0.5} max={50} step={0.5} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0.5} max={30} step={0.5} value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className={`p-5 rounded-xl border ${result.isProfit ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="text-sm text-muted-foreground mb-1">Total ROI</div>
            <div className={`text-3xl font-bold ${result.isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(2)}%
            </div>
          </div>
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Annualized ROI</div>
            <div className="text-3xl font-bold text-primary">
              {result.annualizedROI >= 0 ? '+' : ''}{result.annualizedROI.toFixed(2)}%
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${result.isProfit ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="text-sm text-muted-foreground mb-1">{result.isProfit ? 'Profit' : 'Loss'}</div>
            <div className={`text-xl font-bold ${result.isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.isProfit ? '+' : ''}{fmt(result.profitLoss)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Initial Investment</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(initialInvestment)}</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-muted-foreground mb-1">Final Value</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{fmt(finalValue)}</div>
            </div>
          </div>

          {/* Visual comparison */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Investment Growth</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Initial</span>
                  <span>{fmt(initialInvestment)}</span>
                </div>
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, finalValue > 0 ? (initialInvestment / Math.max(initialInvestment, finalValue)) * 100 : 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Final</span>
                  <span>{fmt(finalValue)}</span>
                </div>
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
                  <div className={`${result.isProfit ? 'bg-green-500' : 'bg-red-500'} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, initialInvestment > 0 ? (finalValue / Math.max(initialInvestment, finalValue)) * 100 : 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
