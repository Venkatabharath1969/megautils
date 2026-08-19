'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

export default function DateCalculatorTool() {
  const [mode, setMode] = useState<'addSub' | 'between'>('addSub')

  // Add/Subtract mode
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')
  const [days, setDays] = useState('0')
  const [weeks, setWeeks] = useState('0')
  const [months, setMonths] = useState('0')
  const [years, setYears] = useState('1')

  // Between mode
  const [dateA, setDateA] = useState(() => new Date().toISOString().split('T')[0])
  const [dateB, setDateB] = useState(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().split('T')[0]
  })

  const addSubResult = useMemo(() => {
    const date = new Date(startDate)
    if (isNaN(date.getTime())) return null

    const d = parseInt(days) || 0
    const w = parseInt(weeks) || 0
    const m = parseInt(months) || 0
    const y = parseInt(years) || 0
    const multiplier = operation === 'add' ? 1 : -1

    const result = new Date(date)
    result.setFullYear(result.getFullYear() + y * multiplier)
    result.setMonth(result.getMonth() + m * multiplier)
    result.setDate(result.getDate() + (d + w * 7) * multiplier)

    return result
  }, [startDate, operation, days, weeks, months, years])

  const betweenResult = useMemo(() => {
    const a = new Date(dateA)
    const b = new Date(dateB)
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return null

    const diffMs = Math.abs(b.getTime() - a.getTime())
    const totalDays = Math.floor(diffMs / 86400000)
    const totalWeeks = Math.floor(totalDays / 7)
    const totalMonths = Math.round(totalDays / 30.44)
    const totalYears = (totalDays / 365.25).toFixed(2)

    // Exact breakdown
    let eYears = 0, eMonths = 0, eDays = 0
    const start = a < b ? new Date(a) : new Date(b)
    const end = a < b ? new Date(b) : new Date(a)

    eYears = end.getFullYear() - start.getFullYear()
    eMonths = end.getMonth() - start.getMonth()
    eDays = end.getDate() - start.getDate()

    if (eDays < 0) {
      eMonths--
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
      eDays += prevMonth.getDate()
    }
    if (eMonths < 0) {
      eYears--
      eMonths += 12
    }

    return {
      totalDays,
      totalWeeks,
      totalMonths,
      totalYears,
      years: eYears,
      months: eMonths,
      days: eDays,
      totalHours: totalDays * 24,
      totalMinutes: totalDays * 24 * 60,
    }
  }, [dateA, dateB])

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <ToolPage
      title="Date Calculator"
      description="Add or subtract days, weeks, months, and years from a date. Calculate the difference between two dates."
      category="datetime"
      categoryLabel="Date & Time"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Date Calculator is a free browser-based tool that lets you calculate the number of days between two dates, or add/subtract days from a date to find a target date. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter a date, time, or timestamp value in the input field.</li>
            <li>Select your target format or calculation type.</li>
            <li>View the converted or calculated result instantly.</li>
            <li>Copy the result for use in your code, logs, or scheduling systems.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when counting days until deadlines, calculating project durations, determining delivery dates, or finding future/past dates. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this planning tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Unix timestamps are always in UTC — local time zone conversions are applied automatically when relevant.</li>
            <li>Be careful with time zone differences when converting between formats for international applications.</li>
            <li>The tool handles leap years, daylight saving time transitions, and month-length variations correctly.</li>
            <li>For programming, remember that JavaScript uses millisecond timestamps while Unix traditionally uses seconds.</li>
            <li>All date calculations run locally with no server dependency.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I calculate the number of days between two dates?', answer: 'Select the "Days Between" tab, enter your start and end dates, and the calculator instantly shows the exact difference in days, weeks, months, and years.' },
        { question: 'How do I find a date 90 days from today?', answer: 'Use the "Add / Subtract" tab, set today as the start date, enter 90 in the Days field with the Add operation, and the result date will be displayed immediately.' },
        { question: 'Does the date calculator account for leap years?', answer: 'Yes. The calculator uses JavaScript Date objects which correctly handle leap years, varying month lengths, and daylight saving time transitions.' },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Mode tabs */}
        <div className="flex gap-2">
          <button onClick={() => setMode('addSub')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'addSub' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
            Add / Subtract
          </button>
          <button onClick={() => setMode('between')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'between' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
            Days Between
          </button>
        </div>

        {mode === 'addSub' ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setOperation('add')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${operation === 'add' ? 'bg-green-600 text-white' : 'bg-secondary text-secondary-foreground border border-border'}`}>+ Add</button>
              <button onClick={() => setOperation('subtract')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${operation === 'subtract' ? 'bg-red-600 text-white' : 'bg-secondary text-secondary-foreground border border-border'}`}>- Subtract</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Years', value: years, setter: setYears },
                { label: 'Months', value: months, setter: setMonths },
                { label: 'Weeks', value: weeks, setter: setWeeks },
                { label: 'Days', value: days, setter: setDays },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-medium mb-1">{f.label}</label>
                  <input type="number" min={0} value={f.value} onChange={(e) => f.setter(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              ))}
            </div>

            {addSubResult && (
              <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">Result</div>
                <div className="text-xl font-bold text-primary">{formatDate(addSubResult)}</div>
                <div className="text-sm text-muted-foreground mt-1 font-mono">{addSubResult.toISOString().split('T')[0]}</div>
                <div className="mt-2"><CopyButton text={addSubResult.toISOString().split('T')[0]} /></div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Start Date</label>
                <input type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">End Date</label>
                <input type="date" value={dateB} onChange={(e) => setDateB(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {betweenResult && (
              <>
                <div className="p-5 rounded-xl bg-primary/10 border border-primary/20 text-center">
                  <div className="text-sm text-muted-foreground mb-1">Exact Difference</div>
                  <div className="text-2xl font-bold text-primary">
                    {betweenResult.years > 0 && `${betweenResult.years} year${betweenResult.years > 1 ? 's' : ''}, `}
                    {betweenResult.months > 0 && `${betweenResult.months} month${betweenResult.months > 1 ? 's' : ''}, `}
                    {betweenResult.days} day{betweenResult.days !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Total Days', value: betweenResult.totalDays.toLocaleString() },
                    { label: 'Total Weeks', value: betweenResult.totalWeeks.toLocaleString() },
                    { label: 'Total Months', value: `~${betweenResult.totalMonths}` },
                    { label: 'Total Years', value: betweenResult.totalYears },
                    { label: 'Total Hours', value: betweenResult.totalHours.toLocaleString() },
                    { label: 'Total Minutes', value: betweenResult.totalMinutes.toLocaleString() },
                  ].map((s) => (
                    <div key={s.label} className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="text-lg font-bold">{s.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
