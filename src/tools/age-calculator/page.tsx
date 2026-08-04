'use client'

import { useState, useMemo, useEffect } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function AgeCalculatorTool() {
  const [dob, setDob] = useState('')
  const [, setTick] = useState(0)

  // Re-render every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const result = useMemo(() => {
    if (!dob) return null
    const birthDate = new Date(dob)
    const now = new Date()

    if (isNaN(birthDate.getTime()) || birthDate > now) return null

    // Exact age
    let years = now.getFullYear() - birthDate.getFullYear()
    let months = now.getMonth() - birthDate.getMonth()
    let days = now.getDate() - birthDate.getDate()

    if (days < 0) {
      months--
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      days += prevMonth.getDate()
    }
    if (months < 0) {
      years--
      months += 12
    }

    // Total days alive
    const totalMs = now.getTime() - birthDate.getTime()
    const totalDays = Math.floor(totalMs / 86400000)
    const totalWeeks = Math.floor(totalDays / 7)
    const totalMonths = years * 12 + months
    const totalHours = Math.floor(totalMs / 3600000)
    const totalMinutes = Math.floor(totalMs / 60000)

    // Next birthday
    const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    if (nextBirthday <= now) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1)
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / 86400000)
    const turningAge = nextBirthday.getFullYear() - birthDate.getFullYear()

    // Day of week born
    const bornDay = birthDate.toLocaleDateString('en-US', { weekday: 'long' })

    return {
      years, months, days,
      totalDays, totalWeeks, totalMonths, totalHours, totalMinutes,
      daysUntilBirthday, turningAge,
      bornDay,
      nextBirthdayDate: nextBirthday,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dob, Math.floor(Date.now() / 1000)])

  return (
    <ToolPage
      title="Age Calculator"
      description="Calculate your exact age in years, months, and days. See your next birthday countdown and total days alive."
      category="datetime"
      categoryLabel="Date & Time"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {result && (
          <>
            {/* Main age display */}
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <div className="text-sm text-muted-foreground mb-2">Your Age</div>
              <div className="flex items-center justify-center gap-4">
                <div>
                  <div className="text-4xl font-bold text-primary">{result.years}</div>
                  <div className="text-xs text-muted-foreground">Years</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">{result.months}</div>
                  <div className="text-xs text-muted-foreground">Months</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">{result.days}</div>
                  <div className="text-xs text-muted-foreground">Days</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-3">Born on a {result.bornDay}</div>
            </div>

            {/* Birthday countdown */}
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Next Birthday</div>
                  <div className="text-xs text-muted-foreground">
                    {result.nextBirthdayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {result.daysUntilBirthday}
                  </div>
                  <div className="text-xs text-muted-foreground">days away (turning {result.turningAge})</div>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Total Days', value: result.totalDays.toLocaleString() },
                { label: 'Total Weeks', value: result.totalWeeks.toLocaleString() },
                { label: 'Total Months', value: result.totalMonths.toLocaleString() },
                { label: 'Total Hours', value: result.totalHours.toLocaleString() },
                { label: 'Total Minutes', value: result.totalMinutes.toLocaleString() },
                { label: 'Next Birthday In', value: `${result.daysUntilBirthday} days` },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-lg font-bold">{s.value}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {!result && dob && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            Please enter a valid date of birth in the past.
          </div>
        )}
      </div>
    </ToolPage>
  )
}
