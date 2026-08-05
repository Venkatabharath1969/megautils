'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getNextExecutions(cron: string, count: number): Date[] {
  const parts = cron.split(' ')
  if (parts.length !== 5) return []

  const parseField = (field: string, min: number, max: number): number[] => {
    if (field === '*') {
      const arr: number[] = []
      for (let i = min; i <= max; i++) arr.push(i)
      return arr
    }
    const values = new Set<number>()
    field.split(',').forEach((part) => {
      if (part.includes('/')) {
        const [range, step] = part.split('/')
        const s = parseInt(step)
        const start = range === '*' ? min : parseInt(range)
        for (let i = start; i <= max; i += s) values.add(i)
      } else if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number)
        for (let i = a; i <= b; i++) values.add(i)
      } else {
        values.add(parseInt(part))
      }
    })
    return Array.from(values).filter((v) => v >= min && v <= max).sort((a, b) => a - b)
  }

  const minutes = parseField(parts[0], 0, 59)
  const hours = parseField(parts[1], 0, 23)
  const daysOfMonth = parseField(parts[2], 1, 31)
  const monthsField = parseField(parts[3], 1, 12)
  const daysOfWeek = parseField(parts[4], 0, 6)

  const results: Date[] = []
  const now = new Date()
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0)

  for (let i = 0; i < 366 * 24 * 60 && results.length < count; i++) {
    const d = new Date(cursor.getTime() + i * 60000)
    if (
      minutes.includes(d.getMinutes()) &&
      hours.includes(d.getHours()) &&
      monthsField.includes(d.getMonth() + 1) &&
      (parts[2] === '*' || daysOfMonth.includes(d.getDate())) &&
      (parts[4] === '*' || daysOfWeek.includes(d.getDay()))
    ) {
      results.push(d)
    }
  }
  return results
}

function describeCron(cron: string): string {
  const parts = cron.split(' ')
  if (parts.length !== 5) return 'Invalid cron expression'

  const [minute, hour, dom, month, dow] = parts
  const segments: string[] = []

  if (minute === '*' && hour === '*') {
    segments.push('Every minute')
  } else if (minute === '0' && hour === '*') {
    segments.push('Every hour')
  } else if (minute !== '*' && hour === '*') {
    segments.push(`At minute ${minute} of every hour`)
  } else if (minute === '0' && hour !== '*') {
    segments.push(`At ${hour}:00`)
  } else if (minute !== '*' && hour !== '*') {
    segments.push(`At ${hour}:${minute.padStart(2, '0')}`)
  } else {
    segments.push(`At minute ${minute}, hour ${hour}`)
  }

  if (dom !== '*') segments.push(`on day ${dom} of the month`)
  if (month !== '*') {
    const monthNames = month.split(',').map((m) => MONTHS[parseInt(m) - 1] || m).join(', ')
    segments.push(`in ${monthNames}`)
  }
  if (dow !== '*') {
    const dayNames = dow.split(',').map((d) => DAYS_OF_WEEK[parseInt(d)] || d).join(', ')
    segments.push(`on ${dayNames}`)
  }

  return segments.join(' ')
}

export default function CronExpressionBuilderTool() {
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('*')
  const [dom, setDom] = useState('*')
  const [month, setMonth] = useState('*')
  const [dow, setDow] = useState('*')
  const [customInput, setCustomInput] = useState('')

  const cron = customInput || `${minute} ${hour} ${dom} ${month} ${dow}`
  const description = useMemo(() => describeCron(cron), [cron])
  const nextRuns = useMemo(() => getNextExecutions(cron, 5), [cron])

  const presets = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every day at midnight', value: '0 0 * * *' },
    { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
    { label: 'Every 1st of month', value: '0 0 1 * *' },
    { label: 'Every weekday at 8 AM', value: '0 8 * * 1-5' },
  ]

  return (
    <ToolPage
      title="Cron Expression Builder"
      description="Build cron expressions visually. See plain English descriptions and next execution times."
      category="datetime"
      categoryLabel="Date & Time"
      faqs={[
        { question: 'What does a cron expression look like?', answer: 'A standard cron expression has five fields separated by spaces: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6). For example, "0 9 * * 1" means every Monday at 9:00 AM.' },
        { question: 'What does */5 mean in a cron expression?', answer: 'The */5 syntax means "every 5 units." In the minute field, */5 means every 5 minutes. In the hour field, it means every 5 hours.' },
        { question: 'How do I schedule a cron job to run every weekday?', answer: 'Use 1-5 in the day-of-week field. For example, "0 8 * * 1-5" runs at 8:00 AM Monday through Friday.' },
        { question: 'What is the difference between * and ? in cron?', answer: 'In standard Unix cron, * means "every value." The ? character is used in some extended cron formats (like Quartz) to mean "no specific value" and is not part of standard Unix cron.' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Presets */}
        <div>
          <label className="block text-sm font-medium mb-2">Presets</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  const parts = p.value.split(' ')
                  setMinute(parts[0]); setHour(parts[1]); setDom(parts[2]); setMonth(parts[3]); setDow(parts[4])
                  setCustomInput('')
                }}
                className="px-3 py-1.5 text-xs rounded-md border border-border bg-card hover:bg-muted transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Builder fields */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Minute', value: minute, setter: setMinute, placeholder: '0-59 or *', help: '0-59' },
            { label: 'Hour', value: hour, setter: setHour, placeholder: '0-23 or *', help: '0-23' },
            { label: 'Day (Month)', value: dom, setter: setDom, placeholder: '1-31 or *', help: '1-31' },
            { label: 'Month', value: month, setter: setMonth, placeholder: '1-12 or *', help: '1-12' },
            { label: 'Day (Week)', value: dow, setter: setDow, placeholder: '0-6 or *', help: '0=Sun' },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-medium mb-1">{f.label}</label>
              <input
                type="text"
                value={f.value}
                onChange={(e) => { f.setter(e.target.value); setCustomInput('') }}
                placeholder={f.placeholder}
                className="w-full h-10 px-2 rounded-lg border border-input bg-tool-bg text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="text-[10px] text-muted-foreground mt-0.5 text-center">{f.help}</div>
            </div>
          ))}
        </div>

        {/* Custom input */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Or enter custom cron expression</label>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g. */5 * * * *"
            className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Generated expression */}
        <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Cron Expression</div>
            <CopyButton text={cron} />
          </div>
          <div className="text-2xl font-bold font-mono text-primary tracking-wider">{cron}</div>
          <div className="text-sm text-muted-foreground mt-2">{description}</div>
        </div>

        {/* Next 5 executions */}
        {nextRuns.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Next 5 Execution Times</h3>
            <div className="space-y-1.5">
              {nextRuns.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border text-sm">
                  <span className="text-muted-foreground">#{i + 1}</span>
                  <span className="font-medium">
                    {d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}{' '}
                    {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border">
          <h3 className="text-sm font-semibold mb-2">Cron Syntax Reference</h3>
          <div className="text-xs text-muted-foreground font-mono space-y-1">
            <p>*&nbsp;&nbsp;&nbsp;&nbsp;any value</p>
            <p>,&nbsp;&nbsp;&nbsp;&nbsp;value list separator (1,3,5)</p>
            <p>-&nbsp;&nbsp;&nbsp;&nbsp;range of values (1-5)</p>
            <p>/&nbsp;&nbsp;&nbsp;&nbsp;step values (*/5 = every 5)</p>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
