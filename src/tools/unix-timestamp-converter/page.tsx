'use client'

import { useState, useEffect, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

export default function UnixTimestampConverterTool() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'toDate' | 'toTimestamp'>('toDate')
  const [dateInput, setDateInput] = useState('')

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(interval)
  }, [])

  // Convert timestamp -> date
  const timestampResult = useMemo(() => {
    if (!input.trim()) return null
    const val = parseInt(input.trim(), 10)
    if (isNaN(val)) return null

    // Auto-detect seconds vs milliseconds
    const isMs = val > 1e12
    const ms = isMs ? val : val * 1000
    const date = new Date(ms)

    if (isNaN(date.getTime())) return null

    return {
      isMs,
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date),
    }
  }, [input])

  // Convert date -> timestamp
  const dateResult = useMemo(() => {
    if (!dateInput) return null
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return null
    return {
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime(),
    }
  }, [dateInput])

  function getRelativeTime(date: Date): string {
    const diff = Date.now() - date.getTime()
    const absDiff = Math.abs(diff)
    const isFuture = diff < 0

    if (absDiff < 60000) return 'just now'
    if (absDiff < 3600000) {
      const mins = Math.floor(absDiff / 60000)
      return `${mins} minute${mins > 1 ? 's' : ''} ${isFuture ? 'from now' : 'ago'}`
    }
    if (absDiff < 86400000) {
      const hrs = Math.floor(absDiff / 3600000)
      return `${hrs} hour${hrs > 1 ? 's' : ''} ${isFuture ? 'from now' : 'ago'}`
    }
    const days = Math.floor(absDiff / 86400000)
    return `${days} day${days > 1 ? 's' : ''} ${isFuture ? 'from now' : 'ago'}`
  }

  return (
    <ToolPage
      title="Unix Timestamp Converter"
      description="Convert Unix timestamps to human-readable dates and vice versa. Auto-detects seconds vs milliseconds."
      category="datetime"
      categoryLabel="Date & Time"
      faqs={[
        { question: 'What is a Unix timestamp?', answer: 'A Unix timestamp is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC (the Unix epoch). It is widely used in programming to represent dates and times.' },
        { question: 'What is the difference between Unix timestamp in seconds and milliseconds?', answer: 'A Unix timestamp in seconds is typically 10 digits, while milliseconds is 13 digits. JavaScript uses milliseconds (Date.now()), while most Unix systems use seconds.' },
        { question: 'Will Unix timestamps run out?', answer: 'The 32-bit Unix timestamp will overflow on January 19, 2038 (the "Year 2038 problem"). Most modern systems use 64-bit timestamps, which will last billions of years.' },
        { question: 'How do I get the current Unix timestamp in code?', answer: 'In JavaScript use Math.floor(Date.now() / 1000), in Python use int(time.time()), and in PHP use time(). All return the current time as seconds since the Unix epoch.' },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Current timestamp */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Current Unix Timestamp</div>
            <div className="text-2xl font-bold font-mono text-primary">{now}</div>
          </div>
          <CopyButton text={now.toString()} />
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('toDate')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'toDate' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
          >
            Timestamp to Date
          </button>
          <button
            onClick={() => setMode('toTimestamp')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'toTimestamp' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
          >
            Date to Timestamp
          </button>
        </div>

        {mode === 'toDate' ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1.5">Unix Timestamp</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 1700000000 or 1700000000000"
                className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {timestampResult && (
              <div className="space-y-2">
                {timestampResult.isMs && (
                  <div className="text-xs text-muted-foreground p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    Detected as milliseconds
                  </div>
                )}
                {[
                  { label: 'ISO 8601', value: timestampResult.iso },
                  { label: 'UTC', value: timestampResult.utc },
                  { label: 'Local', value: timestampResult.local },
                  { label: 'Date', value: timestampResult.date },
                  { label: 'Time', value: timestampResult.time },
                  { label: 'Relative', value: timestampResult.relative },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <div className="text-xs text-muted-foreground">{row.label}</div>
                      <div className="text-sm font-medium">{row.value}</div>
                    </div>
                    <CopyButton text={row.value} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {dateResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div>
                    <div className="text-xs text-muted-foreground">Seconds</div>
                    <div className="text-xl font-bold font-mono">{dateResult.seconds}</div>
                  </div>
                  <CopyButton text={dateResult.seconds.toString()} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Milliseconds</div>
                    <div className="text-xl font-bold font-mono">{dateResult.milliseconds}</div>
                  </div>
                  <CopyButton text={dateResult.milliseconds.toString()} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolPage>
  )
}
