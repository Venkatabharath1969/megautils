'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState(50000)
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(25)
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState(50)

  const result = useMemo(() => {
    const contributionMargin = sellingPricePerUnit - variableCostPerUnit
    const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : Infinity
    const breakEvenRevenue = breakEvenUnits * sellingPricePerUnit
    const contributionMarginPct = sellingPricePerUnit > 0 ? (contributionMargin / sellingPricePerUnit) * 100 : 0
    const isValid = contributionMargin > 0

    // Profit/Loss at different unit counts
    const scenarios: { units: number; revenue: number; totalCost: number; profitLoss: number }[] = []
    if (isValid && isFinite(breakEvenUnits)) {
      const points = [
        Math.round(breakEvenUnits * 0.25),
        Math.round(breakEvenUnits * 0.5),
        Math.round(breakEvenUnits * 0.75),
        breakEvenUnits,
        Math.round(breakEvenUnits * 1.25),
        Math.round(breakEvenUnits * 1.5),
        Math.round(breakEvenUnits * 2),
      ]
      for (const units of points) {
        const revenue = units * sellingPricePerUnit
        const totalCost = fixedCosts + units * variableCostPerUnit
        scenarios.push({ units, revenue, totalCost, profitLoss: revenue - totalCost })
      }
    }

    return { breakEvenUnits, breakEvenRevenue, contributionMargin, contributionMarginPct, isValid, scenarios }
  }, [fixedCosts, variableCostPerUnit, sellingPricePerUnit])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <ToolPage
      title="Break-Even Calculator"
      description="Calculate the break-even point for your business. Find out how many units you need to sell to cover costs."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Break-Even Calculator is a free browser-based tool that lets you calculate the point at which total revenue equals total costs, determining how many units you need to sell to cover your expenses. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when business planning, pricing strategy, startup financial modeling, or evaluating product viability. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this finance tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is a break-even point?', answer: 'The break-even point is the number of units you must sell so that total revenue equals total costs (fixed + variable). Beyond this point, every additional unit sold generates profit.' },
        { question: 'How do I calculate break-even units?', answer: 'Divide your total fixed costs by the contribution margin per unit (selling price minus variable cost per unit). For example, $50,000 fixed costs with a $25 margin = 2,000 units.' },
        { question: 'What is contribution margin?', answer: 'Contribution margin is the selling price per unit minus the variable cost per unit. It represents how much each unit sold contributes toward covering fixed costs and generating profit.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">Fixed Costs ($)</label>
            <input type="number" min={0} value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1000} max={1000000} step={1000} value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            <p className="text-xs text-muted-foreground mt-1">Rent, salaries, insurance, etc.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Variable Cost Per Unit ($)</label>
            <input type="number" min={0} step={0.01} value={variableCostPerUnit} onChange={(e) => setVariableCostPerUnit(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={500} step={0.5} value={variableCostPerUnit} onChange={(e) => setVariableCostPerUnit(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            <p className="text-xs text-muted-foreground mt-1">Materials, labor, shipping per unit</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Selling Price Per Unit ($)</label>
            <input type="number" min={0} step={0.01} value={sellingPricePerUnit} onChange={(e) => setSellingPricePerUnit(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={1000} step={0.5} value={sellingPricePerUnit} onChange={(e) => setSellingPricePerUnit(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          {!result.isValid && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              Selling price must be higher than variable cost per unit to calculate break-even point.
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Break-Even Point</div>
            <div className="text-3xl font-bold text-primary">
              {result.isValid && isFinite(result.breakEvenUnits) ? result.breakEvenUnits.toLocaleString() : '--'} units
            </div>
          </div>
          <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="text-sm text-muted-foreground mb-1">Break-Even Revenue</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {result.isValid && isFinite(result.breakEvenRevenue) ? fmt(result.breakEvenRevenue) : '--'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Contribution Margin</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{fmt(result.contributionMargin)}</div>
              <div className="text-xs text-muted-foreground">per unit</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-muted-foreground mb-1">Contribution Margin %</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{result.contributionMarginPct.toFixed(1)}%</div>
            </div>
          </div>

          {/* Per unit breakdown */}
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="text-sm font-medium mb-3">Per Unit Breakdown</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-orange-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${sellingPricePerUnit > 0 ? (variableCostPerUnit / sellingPricePerUnit) * 100 : 0}%` }}>
                {sellingPricePerUnit > 0 && (variableCostPerUnit / sellingPricePerUnit) * 100 > 15 && 'Cost'}
              </div>
              <div className="bg-green-500 h-full transition-all duration-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: `${result.contributionMarginPct}%` }}>
                {result.contributionMarginPct > 15 && 'Margin'}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Variable Cost ({fmt(variableCostPerUnit)})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Margin ({fmt(result.contributionMargin)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Table */}
      {result.scenarios.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Profit/Loss at Different Sales Volumes</h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Units Sold</th>
                  <th className="text-right p-3 font-medium">Revenue</th>
                  <th className="text-right p-3 font-medium">Total Cost</th>
                  <th className="text-right p-3 font-medium">Profit / Loss</th>
                </tr>
              </thead>
              <tbody>
                {result.scenarios.map((row, i) => {
                  const isBreakEven = row.units === result.breakEvenUnits
                  return (
                    <tr key={i} className={`${isBreakEven ? 'bg-primary/10 font-semibold' : i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}>
                      <td className="p-3 font-medium">
                        {row.units.toLocaleString()}
                        {isBreakEven && <span className="ml-2 text-xs text-primary">(Break-Even)</span>}
                      </td>
                      <td className="p-3 text-right">{fmt(row.revenue)}</td>
                      <td className="p-3 text-right">{fmt(row.totalCost)}</td>
                      <td className={`p-3 text-right font-medium ${row.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {row.profitLoss >= 0 ? '+' : ''}{fmt(row.profitLoss)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolPage>
  )
}
