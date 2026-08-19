'use client'

import { useState } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

interface CronExample {
  expression: string
  description: string
  category: string
}

const CRON_EXAMPLES: CronExample[] = [
  // Every minute/second
  { expression: '* * * * *', description: 'Every minute', category: 'Frequent' },
  { expression: '*/5 * * * *', description: 'Every 5 minutes', category: 'Frequent' },
  { expression: '*/10 * * * *', description: 'Every 10 minutes', category: 'Frequent' },
  { expression: '*/15 * * * *', description: 'Every 15 minutes', category: 'Frequent' },
  { expression: '*/30 * * * *', description: 'Every 30 minutes', category: 'Frequent' },
  // Hourly
  { expression: '0 * * * *', description: 'Every hour (at minute 0)', category: 'Hourly' },
  { expression: '0 */2 * * *', description: 'Every 2 hours', category: 'Hourly' },
  { expression: '0 */6 * * *', description: 'Every 6 hours', category: 'Hourly' },
  { expression: '30 * * * *', description: 'Every hour at minute 30', category: 'Hourly' },
  // Daily
  { expression: '0 0 * * *', description: 'Daily at midnight', category: 'Daily' },
  { expression: '0 6 * * *', description: 'Daily at 6:00 AM', category: 'Daily' },
  { expression: '0 12 * * *', description: 'Daily at noon', category: 'Daily' },
  { expression: '0 18 * * *', description: 'Daily at 6:00 PM', category: 'Daily' },
  { expression: '0 0,12 * * *', description: 'Twice a day (midnight & noon)', category: 'Daily' },
  // Weekly
  { expression: '0 0 * * 0', description: 'Every Sunday at midnight', category: 'Weekly' },
  { expression: '0 0 * * 1', description: 'Every Monday at midnight', category: 'Weekly' },
  { expression: '0 0 * * 5', description: 'Every Friday at midnight', category: 'Weekly' },
  { expression: '0 0 * * 1-5', description: 'Weekdays at midnight', category: 'Weekly' },
  { expression: '0 0 * * 6,0', description: 'Weekends at midnight', category: 'Weekly' },
  // Monthly
  { expression: '0 0 1 * *', description: 'First day of every month', category: 'Monthly' },
  { expression: '0 0 15 * *', description: '15th of every month', category: 'Monthly' },
  { expression: '0 0 1,15 * *', description: '1st and 15th of every month', category: 'Monthly' },
  { expression: '0 0 L * *', description: 'Last day of every month', category: 'Monthly' },
  // Yearly
  { expression: '0 0 1 1 *', description: 'January 1st (yearly)', category: 'Yearly' },
  { expression: '0 0 1 */3 *', description: 'Quarterly (every 3 months)', category: 'Yearly' },
  { expression: '0 0 1 */6 *', description: 'Every 6 months', category: 'Yearly' },
]

const FIELD_DESCRIPTIONS = [
  { name: 'Minute', range: '0-59', special: '* , - /' },
  { name: 'Hour', range: '0-23', special: '* , - /' },
  { name: 'Day of Month', range: '1-31', special: '* , - / L W' },
  { name: 'Month', range: '1-12', special: '* , - /' },
  { name: 'Day of Week', range: '0-7 (0,7=Sun)', special: '* , - / L #' },
]

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid cron expression (need 5 fields)'

  const [min, hour, dom, month, dow] = parts

  // Simple descriptions for common patterns
  if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') return 'Runs every minute'
  if (min.startsWith('*/')) return `Runs every ${min.slice(2)} minutes`
  if (min !== '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') return `Runs at minute ${min} of every hour`
  if (min !== '*' && hour !== '*' && dom === '*' && month === '*' && dow === '*') return `Runs daily at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`
  if (dow !== '*' && dom === '*') return `Runs at ${hour.padStart(2, '0')}:${min.padStart(2, '0')} on day(s) of week: ${dow}`
  if (dom !== '*' && dow === '*') return `Runs at ${hour.padStart(2, '0')}:${min.padStart(2, '0')} on day(s) of month: ${dom}`

  return `Min:${min} Hour:${hour} DOM:${dom} Month:${month} DOW:${dow}`
}

export default function CrontabReferenceTool() {
  const [customExpr, setCustomExpr] = useState('0 0 * * *')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...Array.from(new Set(CRON_EXAMPLES.map((e) => e.category)))]

  const filtered = activeCategory === 'All' ? CRON_EXAMPLES : CRON_EXAMPLES.filter((e) => e.category === activeCategory)

  return (
    <ToolPage title="Crontab Reference" description="Interactive cron expression reference with clickable examples and common patterns" category="datetime" categoryLabel="Date & Time"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Crontab Reference is a free browser-based tool that lets you a comprehensive reference guide for cron expression syntax with examples of common scheduling patterns. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter a date, time, or timestamp value in the input field.</li>
            <li>Select your target format or calculation type.</li>
            <li>View the converted or calculated result instantly.</li>
            <li>Copy the result for use in your code, logs, or scheduling systems.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when looking up cron syntax, understanding cron fields, or finding example cron schedules for common tasks. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this system administration tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is a crontab?', answer: 'A crontab (cron table) is a configuration file that specifies shell commands to run on a schedule in Unix-like operating systems. Each line defines a time pattern and the command to execute.' },
        { question: 'How do I edit my crontab?', answer: 'Run "crontab -e" in your terminal to open the crontab editor. Add one cron expression per line followed by the command to run, then save and exit.' },
        { question: 'What does 0 0 * * * mean in cron?', answer: 'This cron expression means "at minute 0, hour 0, every day" -- in other words, it runs once daily at midnight (00:00).' },
        { question: 'How do I run a cron job every 5 minutes?', answer: 'Use the expression "*/5 * * * *". The */5 in the minute field means every 5 minutes, and the asterisks mean every hour, day, month, and day of week.' },
      ]}
    >
      <div className="space-y-6">
        {/* Field reference */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Cron Syntax</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-center text-lg tracking-wider mb-3">
            <span className="text-primary">*</span>{' '}
            <span className="text-green-600 dark:text-green-400">*</span>{' '}
            <span className="text-orange-600 dark:text-orange-400">*</span>{' '}
            <span className="text-purple-600 dark:text-purple-400">*</span>{' '}
            <span className="text-red-600 dark:text-red-400">*</span>
          </div>
          <div className="grid grid-cols-5 gap-1 text-xs text-center">
            {FIELD_DESCRIPTIONS.map((f, i) => {
              const colors = ['text-primary', 'text-green-600 dark:text-green-400', 'text-orange-600 dark:text-orange-400', 'text-purple-600 dark:text-purple-400', 'text-red-600 dark:text-red-400']
              return (
                <div key={f.name} className="p-2 rounded bg-card border border-border">
                  <div className={`font-semibold ${colors[i]}`}>{f.name}</div>
                  <div className="text-muted-foreground">{f.range}</div>
                  <div className="font-mono text-muted-foreground">{f.special}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Custom expression */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Test an Expression</h3>
          <div className="flex gap-2 items-start">
            <input
              type="text"
              value={customExpr}
              onChange={(e) => setCustomExpr(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0 0 * * *"
            />
            <CopyButton text={customExpr} />
          </div>
          <div className="mt-2 p-3 rounded-lg bg-muted text-sm">{describeCron(customExpr)}</div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Examples grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map((ex) => (
            <button
              key={ex.expression + ex.description}
              onClick={() => setCustomExpr(ex.expression)}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left group"
            >
              <code className="text-sm font-mono font-bold text-primary whitespace-nowrap">{ex.expression}</code>
              <span className="text-sm text-muted-foreground flex-1">{ex.description}</span>
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Click</span>
            </button>
          ))}
        </div>
      </div>
    </ToolPage>
  )
}
