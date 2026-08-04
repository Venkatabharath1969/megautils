'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

function formatTime(minutes: number): string {
  if (minutes < 1) return 'Less than a minute'
  const hrs = Math.floor(minutes / 60)
  const mins = Math.ceil(minutes % 60)
  if (hrs > 0) return `${hrs} hr ${mins} min`
  return `${mins} min`
}

export default function ReadingTimeCalculatorTool() {
  const [input, setInput] = useState('')

  const stats = useMemo(() => {
    const trimmed = input.trim()
    const words = trimmed ? trimmed.split(/\s+/).length : 0
    const chars = input.length
    const charsNoSpaces = input.replace(/\s/g, '').length
    const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length || (trimmed.length > 0 ? 1 : 0) : 0
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0

    const readingTimeMin = words / 200
    const speakingTimeMin = words / 130
    const avgWordLength = words > 0 ? (charsNoSpaces / words).toFixed(1) : '0'

    return {
      words,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTimeMin,
      speakingTimeMin,
      avgWordLength,
    }
  }, [input])

  return (
    <ToolPage title="Reading Time Calculator" description="Estimate reading and speaking time for any text. Based on 200 WPM reading and 130 WPM speaking speed." category="text" categoryLabel="Text Tools">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-4 rounded-lg bg-muted text-center">
          <div className="text-2xl font-bold text-primary">{formatTime(stats.readingTimeMin)}</div>
          <div className="text-xs text-muted-foreground mt-1">Reading Time (200 WPM)</div>
        </div>
        <div className="p-4 rounded-lg bg-muted text-center">
          <div className="text-2xl font-bold text-primary">{formatTime(stats.speakingTimeMin)}</div>
          <div className="text-xs text-muted-foreground mt-1">Speaking Time (130 WPM)</div>
        </div>
        <div className="p-4 rounded-lg bg-muted text-center">
          <div className="text-2xl font-bold text-primary">{stats.words}</div>
          <div className="text-xs text-muted-foreground mt-1">Words</div>
        </div>
        <div className="p-4 rounded-lg bg-muted text-center">
          <div className="text-2xl font-bold text-primary">{stats.avgWordLength}</div>
          <div className="text-xs text-muted-foreground mt-1">Avg Word Length</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Characters', value: stats.chars },
          { label: 'No Spaces', value: stats.charsNoSpaces },
          { label: 'Sentences', value: stats.sentences },
          { label: 'Paragraphs', value: stats.paragraphs },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-muted text-center">
            <div className="text-xl font-bold text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Your Text</span>
        <ClearButton onClear={() => setInput('')} />
      </div>
      <ToolTextarea value={input} onChange={setInput} placeholder="Paste or type your text here to estimate reading time..." rows={12} />
    </ToolPage>
  )
}
