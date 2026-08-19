'use client'

import { useState, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'

type FilingStatus = 'single' | 'married_joint'

const federalBrackets: Record<FilingStatus, { min: number; max: number; rate: number }[]> = {
  single: [
    { min: 0, max: 11600, rate: 10 },
    { min: 11600, max: 47150, rate: 12 },
    { min: 47150, max: 100525, rate: 22 },
    { min: 100525, max: 191950, rate: 24 },
    { min: 191950, max: 243725, rate: 32 },
    { min: 243725, max: 609350, rate: 35 },
    { min: 609350, max: Infinity, rate: 37 },
  ],
  married_joint: [
    { min: 0, max: 23200, rate: 10 },
    { min: 23200, max: 94300, rate: 12 },
    { min: 94300, max: 201050, rate: 22 },
    { min: 201050, max: 383900, rate: 24 },
    { min: 383900, max: 487450, rate: 32 },
    { min: 487450, max: 731200, rate: 35 },
    { min: 731200, max: Infinity, rate: 37 },
  ],
}

const standardDeductions: Record<FilingStatus, number> = {
  single: 14600,
  married_joint: 29200,
}

const SS_RATE = 0.062
const SS_WAGE_BASE = 168600
const MEDICARE_RATE = 0.0145

export default function SalaryCalculator() {
  const [grossSalary, setGrossSalary] = useState(75000)
  const [isAnnual, setIsAnnual] = useState(true)
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('single')
  const [deductions, setDeductions] = useState(500)
  const [retirement, setRetirement] = useState(6)

  const result = useMemo(() => {
    const annualGross = isAnnual ? grossSalary : grossSalary * 12
    const monthlyGross = isAnnual ? grossSalary / 12 : grossSalary

    const annualRetirement = annualGross * (retirement / 100)
    const stdDeduction = standardDeductions[filingStatus]
    const taxableIncome = Math.max(0, annualGross - annualRetirement - stdDeduction)
    const annualDeductions = isAnnual ? deductions : deductions * 12

    // Progressive federal income tax
    let federalTax = 0
    let remaining = taxableIncome
    for (const bracket of federalBrackets[filingStatus]) {
      if (remaining <= 0) break
      const bracketWidth = bracket.max === Infinity ? remaining : bracket.max - bracket.min
      const taxableInBracket = Math.min(remaining, bracketWidth)
      federalTax += taxableInBracket * (bracket.rate / 100)
      remaining -= taxableInBracket
    }

    // FICA taxes
    const socialSecurity = Math.min(annualGross, SS_WAGE_BASE) * SS_RATE
    const medicare = annualGross * MEDICARE_RATE
    const ficaTotal = socialSecurity + medicare

    const totalTax = federalTax + ficaTotal
    const annualNet = annualGross - totalTax - annualRetirement - annualDeductions
    const monthlyNet = annualNet / 12
    const effectiveTaxRate = annualGross > 0 ? (totalTax / annualGross) * 100 : 0
    const takeHomePct = annualGross > 0 ? (annualNet / annualGross) * 100 : 0

    return {
      annualGross,
      monthlyGross,
      federalTax,
      ficaTotal,
      socialSecurity,
      medicare,
      annualTax: totalTax,
      monthlyTax: totalTax / 12,
      annualRetirement,
      monthlyRetirement: annualRetirement / 12,
      annualDeductions,
      monthlyDeductions: annualDeductions / 12,
      annualNet,
      monthlyNet,
      effectiveTaxRate,
      takeHomePct,
      biweeklyNet: annualNet / 26,
      weeklyNet: annualNet / 52,
      dailyNet: annualNet / 260,
      hourlyNet: annualNet / 2080,
      stdDeduction,
      taxableIncome,
    }
  }, [grossSalary, isAnnual, filingStatus, deductions, retirement])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  return (
    <ToolPage
      title="Salary Calculator"
      description="Convert gross salary to net take-home pay. Factor in taxes, retirement contributions, and deductions."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Salary Calculator is a free browser-based tool that lets you calculate take-home pay after deductions including taxes, insurance, and retirement contributions from gross salary. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when understanding net pay from job offers, comparing compensation packages, or budgeting based on actual take-home income. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this employment tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I calculate my net take-home pay?', answer: 'Subtract federal and state taxes, retirement contributions, and other deductions from your gross salary. This calculator automates that process for you.' },
        { question: 'What is the difference between gross and net salary?', answer: 'Gross salary is your total pay before any deductions, while net salary (take-home pay) is what you actually receive after taxes, retirement contributions, and other deductions.' },
        { question: 'How much of my salary goes to taxes?', answer: 'Your effective tax rate depends on your income bracket, filing status, and deductions. Most U.S. workers pay between 15-30% of gross income in federal and state taxes combined.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          {/* Annual/Monthly toggle */}
          <div className="flex gap-2">
            <button onClick={() => setIsAnnual(true)} className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${isAnnual ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}>
              Annual
            </button>
            <button onClick={() => setIsAnnual(false)} className={`flex-1 h-10 rounded-lg text-sm font-medium transition-colors ${!isAnnual ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}>
              Monthly
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Gross Salary ({isAnnual ? 'Annual' : 'Monthly'})</label>
            <input type="number" min={0} value={grossSalary} onChange={(e) => setGrossSalary(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={isAnnual ? 10000 : 1000} max={isAnnual ? 500000 : 50000} step={isAnnual ? 1000 : 100} value={grossSalary} onChange={(e) => setGrossSalary(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Filing Status</label>
            <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value as FilingStatus)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="single">Single</option>
              <option value="married_joint">Married Filing Jointly</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">2024 US progressive brackets + FICA</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Retirement Contribution (%)</label>
            <input type="number" min={0} max={30} step={0.5} value={retirement} onChange={(e) => setRetirement(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={0} max={25} step={0.5} value={retirement} onChange={(e) => setRetirement(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Other Deductions ({isAnnual ? 'Annual' : 'Monthly'})</label>
            <input type="number" min={0} value={deductions} onChange={(e) => setDeductions(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Net Take-Home (Monthly)</div>
            <div className="text-3xl font-bold text-primary">{fmt(result.monthlyNet)}</div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="text-sm text-muted-foreground mb-1">Net Take-Home (Annual)</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{fmt(result.annualNet)}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-sm text-muted-foreground mb-1">Federal Tax</div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">{fmt(result.federalTax)}</div>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="text-sm text-muted-foreground mb-1">FICA (SS + Medicare)</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{fmt(result.ficaTotal)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm text-muted-foreground mb-1">Effective Tax Rate</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.effectiveTaxRate.toFixed(1)}%</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-sm text-muted-foreground mb-1">Std. Deduction</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{fmt(result.stdDeduction)}</div>
            </div>
          </div>

          {/* Breakdown bar */}
          <div className="p-4 rounded-xl border border-border">
            <div className="text-sm font-medium mb-3">Salary Breakdown</div>
            <div className="w-full h-8 rounded-full overflow-hidden flex bg-muted">
              <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${result.takeHomePct}%` }} />
              <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${result.annualGross > 0 ? (result.federalTax / result.annualGross) * 100 : 0}%` }} />
              <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${result.annualGross > 0 ? (result.ficaTotal / result.annualGross) * 100 : 0}%` }} />
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${retirement}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Take-Home</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Federal Tax</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> FICA</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Retirement</span>
            </div>
          </div>

          {/* Pay frequency breakdown */}
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <div className="text-sm font-medium mb-3">Pay Frequency Breakdown</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Bi-Weekly</span><span className="font-semibold">{fmt(result.biweeklyNet)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Weekly</span><span className="font-semibold">{fmt(result.weeklyNet)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Daily</span><span className="font-semibold">{fmt(result.dailyNet)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Hourly</span><span className="font-semibold">{fmt(result.hourlyNet)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
