'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

export default function WordCounterTool() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const trimmed = text.trim()
    const words = trimmed ? trimmed.split(/\s+/).length : 0
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length
    const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length || (trimmed.length > 0 ? 1 : 0) : 0
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(p => p.trim()).length : 0
    const lines = trimmed ? trimmed.split('\n').length : 0
    const readingTime = Math.ceil(words / 200)
    const speakingTime = Math.ceil(words / 130)
    return { words, chars, charsNoSpaces, sentences, paragraphs, lines, readingTime, speakingTime }
  }, [text])

  return (
    <ToolPage title="Word Counter" description="Count words, characters, sentences, paragraphs, and estimate reading time." category="text" categoryLabel="Text Tools">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Words', value: stats.words },
          { label: 'Characters', value: stats.chars },
          { label: 'No Spaces', value: stats.charsNoSpaces },
          { label: 'Sentences', value: stats.sentences },
          { label: 'Paragraphs', value: stats.paragraphs },
          { label: 'Lines', value: stats.lines },
          { label: 'Reading Time', value: `${stats.readingTime} min` },
          { label: 'Speaking Time', value: `${stats.speakingTime} min` },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-muted text-center">
            <div className="text-xl font-bold text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Your Text</span>
        <ClearButton onClear={() => setText('')} />
      </div>
      <ToolTextarea value={text} onChange={setText} placeholder="Start typing or paste your text here..." rows={12} />
    </ToolPage>
  )
}
