'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type FieldMode = 'every' | 'specific' | 'range' | 'interval'

interface FieldConfig {
  mode: FieldMode
  specific: number[]
  rangeStart: number
  rangeEnd: number
  interval: number
}

function fieldToExpression(config: FieldConfig, min: number, max: number): string {
  switch (config.mode) {
    case 'every':
      return '*'
    case 'specific':
      return config.specific.length > 0 ? config.specific.sort((a, b) => a - b).join(',') : '*'
    case 'range': {
      const s = Math.max(min, Math.min(max, config.rangeStart))
      const e = Math.max(min, Math.min(max, config.rangeEnd))
      return `${s}-${e}`
    }
    case 'interval': {
      const step = Math.max(1, config.interval)
      return `*/${step}`
    }
  }
}

function createDefaultField(min: number): FieldConfig {
  return { mode: 'every', specific: [], rangeStart: min, rangeEnd: min, interval: 1 }
}

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

  // Time description
  if (minute === '*' && hour === '*') {
    segments.push('Every minute')
  } else if (minute.startsWith('*/') && hour === '*') {
    segments.push(`Every ${minute.slice(2)} minutes`)
  } else if (minute === '0' && hour === '*') {
    segments.push('Every hour at minute 0')
  } else if (minute === '0' && hour.startsWith('*/')) {
    segments.push(`Every ${hour.slice(2)} hours`)
  } else if (minute !== '*' && hour === '*') {
    segments.push(`At minute ${minute} of every hour`)
  } else if (minute === '0' && hour !== '*') {
    if (hour.includes(',')) {
      segments.push(`At ${hour.split(',').map(h => `${h}:00`).join(', ')}`)
    } else if (hour.includes('-')) {
      const [s, e] = hour.split('-')
      segments.push(`Every hour from ${s}:00 through ${e}:00`)
    } else {
      segments.push(`At ${hour}:00`)
    }
  } else if (minute !== '*' && hour !== '*') {
    const m = minute.padStart(2, '0')
    if (hour.includes(',')) {
      segments.push(`At minute ${m} past hours ${hour}`)
    } else {
      segments.push(`At ${hour}:${m}`)
    }
  } else {
    segments.push(`At minute ${minute}, hour ${hour}`)
  }

  // Day of month
  if (dom !== '*') {
    if (dom.includes(',')) {
      segments.push(`on day ${dom} of the month`)
    } else if (dom.includes('-')) {
      const [s, e] = dom.split('-')
      segments.push(`on days ${s} through ${e} of the month`)
    } else if (dom.startsWith('*/')) {
      segments.push(`every ${dom.slice(2)} days`)
    } else {
      segments.push(`on day ${dom} of the month`)
    }
  }

  // Month
  if (month !== '*') {
    if (month.startsWith('*/')) {
      segments.push(`every ${month.slice(2)} months`)
    } else {
      const monthNames = month.split(',').map((m) => MONTHS[parseInt(m) - 1] || m).join(', ')
      segments.push(`in ${monthNames}`)
    }
  }

  // Day of week
  if (dow !== '*') {
    if (dow.includes('-')) {
      const [s, e] = dow.split('-')
      const startDay = DAYS_OF_WEEK[parseInt(s)] || s
      const endDay = DAYS_OF_WEEK[parseInt(e)] || e
      segments.push(`on ${startDay} through ${endDay}`)
    } else {
      const dayNames = dow.split(',').map((d) => DAYS_OF_WEEK[parseInt(d)] || d).join(', ')
      segments.push(`on ${dayNames}`)
    }
  }

  return segments.join(' ')
}

function FieldSelector({ label, config, onChange, min, max, names }: {
  label: string
  config: FieldConfig
  onChange: (c: FieldConfig) => void
  min: number
  max: number
  names?: string[]
}) {
  const toggleSpecific = (val: number) => {
    const next = config.specific.includes(val)
      ? config.specific.filter(v => v !== val)
      : [...config.specific, val]
    onChange({ ...config, specific: next })
  }

  return (
    <div className="p-3 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{label}</span>
        <select
          value={config.mode}
          onChange={(e) => onChange({ ...config, mode: e.target.value as FieldMode })}
          className="h-8 px-2 rounded-md border border-input bg-tool-bg text-xs"
        >
          <option value="every">Every (*)</option>
          <option value="specific">Specific values</option>
          <option value="range">Range</option>
          <option value="interval">Interval (*/n)</option>
        </select>
      </div>

      {config.mode === 'specific' && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(val => (
            <button
              key={val}
              onClick={() => toggleSpecific(val)}
              className={`min-w-[2rem] px-1.5 py-1 text-xs rounded border transition-colors ${
                config.specific.includes(val)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:bg-muted'
              }`}
              title={names ? names[val - min] || String(val) : String(val)}
            >
              {names ? names[val - min]?.slice(0, 3) || val : val}
            </button>
          ))}
        </div>
      )}

      {config.mode === 'range' && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min={min}
            max={max}
            value={config.rangeStart}
            onChange={(e) => onChange({ ...config, rangeStart: parseInt(e.target.value) || min })}
            className="w-20 h-8 px-2 rounded-md border border-input bg-tool-bg text-xs text-center"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="number"
            min={min}
            max={max}
            value={config.rangeEnd}
            onChange={(e) => onChange({ ...config, rangeEnd: parseInt(e.target.value) || max })}
            className="w-20 h-8 px-2 rounded-md border border-input bg-tool-bg text-xs text-center"
          />
        </div>
      )}

      {config.mode === 'interval' && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Every</span>
          <input
            type="number"
            min={1}
            max={max}
            value={config.interval}
            onChange={(e) => onChange({ ...config, interval: parseInt(e.target.value) || 1 })}
            className="w-20 h-8 px-2 rounded-md border border-input bg-tool-bg text-xs text-center"
          />
          <span className="text-xs text-muted-foreground">{label.toLowerCase()}</span>
        </div>
      )}

      {config.mode === 'every' && (
        <div className="text-xs text-muted-foreground mt-1">Matches every {label.toLowerCase()} value</div>
      )}
    </div>
  )
}

export default function CronExpressionBuilderTool() {
  const [minuteField, setMinuteField] = useState<FieldConfig>({ ...createDefaultField(0), mode: 'specific', specific: [0] })
  const [hourField, setHourField] = useState<FieldConfig>(createDefaultField(0))
  const [domField, setDomField] = useState<FieldConfig>(createDefaultField(1))
  const [monthField, setMonthField] = useState<FieldConfig>(createDefaultField(1))
  const [dowField, setDowField] = useState<FieldConfig>(createDefaultField(0))
  const [customInput, setCustomInput] = useState('')

  const cron = useMemo(() => {
    if (customInput) return customInput
    const min = fieldToExpression(minuteField, 0, 59)
    const hr = fieldToExpression(hourField, 0, 23)
    const d = fieldToExpression(domField, 1, 31)
    const mo = fieldToExpression(monthField, 1, 12)
    const dw = fieldToExpression(dowField, 0, 6)
    return `${min} ${hr} ${d} ${mo} ${dw}`
  }, [customInput, minuteField, hourField, domField, monthField, dowField])

  const description = useMemo(() => describeCron(cron), [cron])
  const nextRuns = useMemo(() => getNextExecutions(cron, 5), [cron])

  const [parseInput, setParseInput] = useState('')

  const parseCronExpression = useCallback((expr: string) => {
    const trimmed = expr.trim()
    const parts = trimmed.split(/\s+/)
    if (parts.length !== 5) return

    const parseFieldConfig = (part: string, min: number, max: number): FieldConfig => {
      if (part === '*') return createDefaultField(min)
      if (part.startsWith('*/')) {
        return { mode: 'interval', specific: [], rangeStart: min, rangeEnd: max, interval: parseInt(part.slice(2)) || 1 }
      }
      if (part.includes('-') && !part.includes(',')) {
        const [s, e] = part.split('-').map(Number)
        return { mode: 'range', specific: [], rangeStart: s, rangeEnd: e, interval: 1 }
      }
      // Specific values (including comma-separated)
      const values = part.split(',').map(Number).filter(v => !isNaN(v) && v >= min && v <= max)
      return { mode: 'specific', specific: values, rangeStart: min, rangeEnd: max, interval: 1 }
    }

    setMinuteField(parseFieldConfig(parts[0], 0, 59))
    setHourField(parseFieldConfig(parts[1], 0, 23))
    setDomField(parseFieldConfig(parts[2], 1, 31))
    setMonthField(parseFieldConfig(parts[3], 1, 12))
    setDowField(parseFieldConfig(parts[4], 0, 6))
    setCustomInput('')
    setParseInput('')
  }, [])

  const applyPreset = useCallback((value: string) => {
    parseCronExpression(value)
  }, [parseCronExpression])

  const presets = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Daily at 3 AM', value: '0 3 * * *' },
    { label: 'Monday at 9 AM', value: '0 9 * * 1' },
    { label: 'Weekdays at 8 AM', value: '0 8 * * 1-5' },
    { label: 'Twice daily (9am, 5pm)', value: '0 9,17 * * *' },
    { label: 'Monthly 1st at midnight', value: '0 0 1 * *' },
    { label: 'Quarterly (Jan, Apr, Jul, Oct)', value: '0 0 1 1,4,7,10 *' },
    { label: 'Yearly Jan 1st', value: '0 0 1 1 *' },
  ]

  return (
    <ToolPage
      title="Cron Expression Builder"
      description="Build cron expressions visually with dropdowns, presets, human-readable descriptions, and next execution times."
      category="datetime"
      categoryLabel="Date & Time"
      helpContent={
        <>
          <h2>What is a Cron Expression?</h2>
          <p>
            A cron expression is a string of five fields separated by spaces that defines a recurring schedule. Cron is used by Unix/Linux systems, CI/CD pipelines, cloud schedulers (AWS CloudWatch, Google Cloud Scheduler), and task automation platforms to trigger jobs at precise intervals. The five fields are: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6, where 0 is Sunday).
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Use the <strong>visual field selectors</strong> to configure each part of the cron schedule. Each field supports four modes: Every (*), Specific values, Range, and Interval (*/n).</li>
            <li>Alternatively, select a <strong>preset</strong> from the common schedules for one-click configuration.</li>
            <li>View the generated <strong>cron expression</strong> and its <strong>human-readable description</strong> in the output panel.</li>
            <li>Check the <strong>Next 5 Execution Times</strong> to verify the schedule is correct.</li>
            <li>Use the <strong>Parse</strong> feature to reverse-engineer an existing cron expression back into the visual builder.</li>
            <li>Click <strong>Copy</strong> to grab the expression for use in your crontab, CI/CD config, or scheduler.</li>
          </ol>

          <h2>Cron Syntax Explained</h2>
          <p>
            Each field can use special characters: <code>*</code> means every value, <code>,</code> separates a list (e.g., <code>1,3,5</code>), <code>-</code> defines a range (e.g., <code>1-5</code> for Monday through Friday), and <code>/</code> sets a step (e.g., <code>*/15</code> means every 15 units). These can be combined for complex schedules.
          </p>

          <h2>When to Use This Tool</h2>
          <p>
            Use this builder when configuring scheduled tasks on Linux servers (crontab), setting up CI/CD pipeline triggers, scheduling database backups, configuring monitoring alerts, or any scenario that needs a cron expression. The visual interface eliminates syntax errors and the preview of upcoming execution times lets you verify the schedule before deploying.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Always verify your expression with the <strong>Next 5 Execution Times</strong> panel before deploying to production.</li>
            <li>Use the <strong>Parse</strong> feature to understand existing cron expressions from documentation or config files.</li>
            <li>Be careful with day-of-month values above 28, as not all months have 29, 30, or 31 days.</li>
            <li>Remember that cron uses a 24-hour clock — <code>13</code> in the hour field means 1 PM.</li>
            <li>Day of week numbering: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.</li>
            <li>All processing runs locally in your browser with no server dependency.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What does a cron expression look like?', answer: 'A standard cron expression has five fields separated by spaces: minute (0-59), hour (0-23), day of month (1-31), month (1-12), and day of week (0-6). For example, "0 9 * * 1" means every Monday at 9:00 AM.' },
        { question: 'What does */5 mean in a cron expression?', answer: 'The */5 syntax means "every 5 units." In the minute field, */5 means every 5 minutes (at 0, 5, 10, 15, ...). In the hour field, it means every 5 hours.' },
        { question: 'How do I schedule a cron job to run every weekday?', answer: 'Use 1-5 in the day-of-week field. For example, "0 8 * * 1-5" runs at 8:00 AM Monday through Friday.' },
        { question: 'What is the difference between * and ? in cron?', answer: 'In standard Unix cron (which this tool builds), * means "every value." The ? character is only used in some extended cron formats like Quartz Scheduler and is not part of standard Unix cron.' },
        { question: 'Can I parse an existing cron expression?', answer: 'Yes. Paste any valid cron expression into the "Parse Cron Expression" field at the top and click Parse. The visual builder fields will update to reflect that expression.' },
        { question: 'Are the next execution times accurate?', answer: 'The tool calculates the next 5 execution times by simulating minute-by-minute from the current time, matching against your cron fields. Times are shown in your local timezone.' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Reverse Parser */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Parse Cron Expression</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={parseInput}
              onChange={(e) => setParseInput(e.target.value)}
              placeholder="Paste a cron expression, e.g. 30 9 * * 1-5"
              className="flex-1 h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              onKeyDown={(e) => { if (e.key === 'Enter') parseCronExpression(parseInput) }}
            />
            <button
              onClick={() => parseCronExpression(parseInput)}
              className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Parse
            </button>
          </div>
        </div>

        {/* Presets */}
        <div>
          <label className="block text-sm font-medium mb-2">Common Presets</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.value + p.label}
                onClick={() => applyPreset(p.value)}
                className="px-3 py-1.5 text-xs rounded-md border border-border bg-card hover:bg-muted transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Field Selectors */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Schedule Builder</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FieldSelector label="Minute" config={minuteField} onChange={setMinuteField} min={0} max={59} />
            <FieldSelector label="Hour" config={hourField} onChange={setHourField} min={0} max={23} />
            <FieldSelector label="Day of Month" config={domField} onChange={setDomField} min={1} max={31} />
            <FieldSelector
              label="Month"
              config={monthField}
              onChange={setMonthField}
              min={1}
              max={12}
              names={MONTHS}
            />
            <FieldSelector
              label="Day of Week"
              config={dowField}
              onChange={setDowField}
              min={0}
              max={6}
              names={DAYS_OF_WEEK}
            />
          </div>
        </div>

        {/* Custom input override */}
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
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground font-mono">
            <p>*&nbsp;&nbsp;&nbsp;&nbsp;any value</p>
            <p>1,3,5&nbsp;&nbsp;value list</p>
            <p>1-5&nbsp;&nbsp;&nbsp;range of values</p>
            <p>*/5&nbsp;&nbsp;&nbsp;step / interval</p>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2 text-[10px] text-muted-foreground text-center border-t border-border pt-2">
            <div><span className="font-semibold block">Minute</span>0-59</div>
            <div><span className="font-semibold block">Hour</span>0-23</div>
            <div><span className="font-semibold block">Day</span>1-31</div>
            <div><span className="font-semibold block">Month</span>1-12</div>
            <div><span className="font-semibold block">Weekday</span>0-6</div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
