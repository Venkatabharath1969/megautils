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
      helpContent={
        <>
          <h2>What is a Word Counter?</h2>
          <p>
            A word counter is a tool that analyses a block of text and reports key statistics including the total number of words, characters (with and without spaces), sentences, paragraphs, and lines. It also estimates how long the text will take to read aloud or silently. Writers, students, marketers, and developers rely on word counters daily to meet length requirements, optimise content for SEO, and ensure readability. Unlike simple character counters built into some text editors, a dedicated word counter provides a comprehensive dashboard of metrics in one place.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Type directly into the text area, or <strong>paste</strong> existing content from a document, email, or web page.</li>
            <li>All statistics update <strong>instantly</strong> as you type — there is no button to press. The counts are displayed in the cards above the text area.</li>
            <li>Review the metrics you need: <strong>Words</strong>, <strong>Characters</strong>, <strong>Characters (no spaces)</strong>, <strong>Sentences</strong>, <strong>Paragraphs</strong>, <strong>Lines</strong>, <strong>Reading Time</strong>, and <strong>Speaking Time</strong>.</li>
            <li>Click <strong>Clear</strong> to reset the text area and start a new analysis.</li>
          </ol>

          <h2>When to Use a Word Counter</h2>
          <p>
            Word counters are essential when writing within strict limits — college essays with a 500-word cap, meta descriptions capped at 160 characters, tweets limited to 280 characters, or LinkedIn posts with a 3,000-character maximum. Content marketers use them to hit target article lengths for SEO (typically 1,000–2,000 words for blog posts). Public speakers use speaking-time estimates to fit presentations into allotted slots. The word counter on utilsnow.com handles all of these scenarios instantly in the browser.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li><strong>Reading time</strong> is based on an average of 200 words per minute, which is the widely accepted rate for adult readers processing online content.</li>
            <li><strong>Speaking time</strong> uses 130 words per minute, a comfortable pace for presentations or podcasts.</li>
            <li>If you need a character count <strong>without spaces</strong>, check the "No Spaces" card — this is the metric many academic and publishing platforms use.</li>
            <li>Sentence detection relies on terminal punctuation (<code>.</code>, <code>!</code>, <code>?</code>). Abbreviations like "U.S.A." may slightly inflate the count; rewrite them without periods if precision is critical.</li>
            <li>For SEO, aim for content that thoroughly covers a topic rather than padding to hit a word count — search engines reward depth and relevance over sheer length.</li>
          </ul>
        </>
      }
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
