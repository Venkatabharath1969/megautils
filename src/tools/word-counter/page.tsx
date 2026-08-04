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
    <ToolPage
      title="Word Counter"
      description="Count words, characters, sentences, paragraphs, and estimate reading time."
      category="text"
      categoryLabel="Text Tools"
      faqs={[
        { question: 'How is reading time calculated?', answer: 'Reading time is estimated based on an average reading speed of 200 words per minute, which is the standard rate for adult readers processing online content.' },
        { question: 'Does the character count include spaces?', answer: 'Both counts are provided — total characters (with spaces) and characters without spaces — so you can use whichever is needed for your platform or assignment.' },
        { question: 'What counts as a sentence?', answer: 'A sentence is detected by terminal punctuation marks (period, exclamation mark, or question mark). Abbreviations with periods may slightly affect the count.' },
        { question: 'Can I use this for Twitter/X or Instagram character limits?', answer: 'Yes. Use the character count to check against platform limits such as 280 characters for X (Twitter) posts or 2,200 characters for Instagram captions.' },
      ]}
    >
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
