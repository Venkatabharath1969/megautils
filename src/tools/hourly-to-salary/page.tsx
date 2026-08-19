'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

export default function HourlyToSalary() {
  const [mode, setMode] = useState<'hourly' | 'salary'>('hourly')
  const [hourlyRate, setHourlyRate] = useState(25)
  const [annualSalary, setAnnualSalary] = useState(52000)
  const [hoursPerWeek, setHoursPerWeek] = useState(40)
  const [weeksPerYear, setWeeksPerYear] = useState(52)

  const result = useMemo(() => {
    if (mode === 'hourly') {
      const annual = hourlyRate * hoursPerWeek * weeksPerYear
      const monthly = annual / 12
      const weekly = hourlyRate * hoursPerWeek
      const daily = weekly / 5
      return {
        hourly: hourlyRate,
        daily,
        weekly,
        biweekly: weekly * 2,
        monthly,
        annual,
      }
    } else {
      const totalHours = hoursPerWeek * weeksPerYear
      const hourly = totalHours > 0 ? annualSalary / totalHours : 0
      const monthly = annualSalary / 12
      const weekly = annualSalary / weeksPerYear
      const daily = weekly / 5
      return {
        hourly,
        daily,
        weekly,
        biweekly: weekly * 2,
        monthly,
        annual: annualSalary,
      }
    }
  }, [mode, hourlyRate, annualSalary, hoursPerWeek, weeksPerYear])

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

  const salaryBreakdown = [
    { label: 'Hourly', value: result.hourly },
    { label: 'Daily (8h)', value: result.daily },
    { label: 'Weekly', value: result.weekly },
    { label: 'Bi-Weekly', value: result.biweekly },
    { label: 'Monthly', value: result.monthly },
    { label: 'Annual', value: result.annual },
  ]

  return (
    <ToolPage
      title="Hourly to Salary Converter"
      description="Convert hourly rate to annual salary and vice versa. See your earnings broken down by hour, day, week, and month."
      category="financial"
      categoryLabel="Financial Calculators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Hourly to Salary Converter is a free browser-based tool that lets you convert between hourly wages and annual salary, factoring in hours per week, weeks per year, and overtime. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required financial values (amount, rate, duration) in the input fields.</li>
            <li>Adjust parameters like compounding frequency or tax rate if available.</li>
            <li>Review the calculated results, charts, and breakdowns displayed below.</li>
            <li>Use the results for planning — consult a financial advisor for important decisions.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when comparing job offers quoted in different formats, calculating freelance rates, or budgeting based on hourly work. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this employment tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I convert hourly wage to annual salary?', answer: 'Multiply your hourly rate by the number of hours you work per week, then multiply by 52 weeks. For example, $25/hour at 40 hours/week equals $52,000 per year.' },
        { question: 'How many work hours are in a year?', answer: 'A standard full-time work year is 2,080 hours (40 hours/week x 52 weeks). With two weeks of vacation, it drops to 2,000 hours.' },
        { question: 'What salary is $20 an hour?', answer: 'At $20 per hour working 40 hours per week for 52 weeks, your annual salary would be $41,600 before taxes.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block">Conversion Mode</label>
            <div className="flex gap-2">
              <button onClick={() => setMode('hourly')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'hourly' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                Hourly to Salary
              </button>
              <button onClick={() => setMode('salary')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'salary' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                Salary to Hourly
              </button>
            </div>
          </div>

          {mode === 'hourly' ? (
            <div>
              <label className="block text-sm font-medium mb-1.5">Hourly Rate ($)</label>
              <input type="number" min={0} step={0.5} value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="range" min={1} max={500} step={0.5} value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1.5">Annual Salary ($)</label>
              <input type="number" min={0} step={1000} value={annualSalary} onChange={e => setAnnualSalary(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="range" min={10000} max={500000} step={1000} value={annualSalary} onChange={e => setAnnualSalary(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Hours per Week</label>
            <input type="number" min={1} max={168} value={hoursPerWeek} onChange={e => setHoursPerWeek(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={1} max={80} value={hoursPerWeek} onChange={e => setHoursPerWeek(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Weeks per Year</label>
            <input type="number" min={1} max={52} value={weeksPerYear} onChange={e => setWeeksPerYear(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="range" min={40} max={52} value={weeksPerYear} onChange={e => setWeeksPerYear(Number(e.target.value))} className="w-full mt-2 accent-primary" />
            <div className="text-xs text-muted-foreground mt-1">Use 50 for 2 weeks vacation, 48 for 4 weeks vacation</div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">{mode === 'hourly' ? 'Annual Salary' : 'Hourly Rate'}</div>
            <div className="text-3xl font-bold text-primary">{mode === 'hourly' ? fmt(result.annual) : fmt(result.hourly)}</div>
          </div>

          <div className="space-y-2">
            {salaryBreakdown.map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-mono">{fmt(item.value)}</span>
                  <CopyButton text={item.value.toFixed(2)} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="text-sm text-muted-foreground mb-1">Total Working Hours/Year</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{(hoursPerWeek * weeksPerYear).toLocaleString()} hours</div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
