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
    <ToolPage title="Reading Time Calculator" description="Estimate reading and speaking time for any text. Based on 200 WPM reading and 130 WPM speaking speed." category="text" categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Reading Time Calculator is a free browser-based tool that lets you estimate how long it will take to read a piece of text based on average reading speed (200-250 words per minute). It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when adding reading time estimates to blog posts, planning presentation content, or gauging document length for readers. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this content planning tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need reading time estimation.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'What is the average reading speed?', answer: 'The average adult reading speed is approximately 200-250 words per minute (WPM). This tool uses 200 WPM as a conservative estimate for general content.' },
        { question: 'How is speaking time different from reading time?', answer: 'Speaking time is calculated at approximately 130 words per minute, which is slower than reading because spoken delivery requires pauses, emphasis, and audience engagement.' },
        { question: 'Why should I display reading time on my blog posts?', answer: 'Showing estimated reading time helps set reader expectations and can increase engagement. Studies show that readers are more likely to start an article when they know the time commitment.' },
      ]}>
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
