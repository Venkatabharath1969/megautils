'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length <= 2) return w.length > 0 ? 1 : 0
  // Count groups of consecutive vowels
  const vowelGroups = w.match(/[aeiouy]+/g)
  if (!vowelGroups) return 1
  let count = vowelGroups.length
  // Subtract silent-e at end
  if (w.endsWith('e') && count > 1) count--
  // Handle -le endings (e.g. "table")
  if (w.endsWith('le') && w.length > 2 && !/[aeiouy]/.test(w[w.length - 3])) count++
  return Math.max(1, count)
}

function getFleschLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Very Easy', color: 'text-green-600 dark:text-green-400' }
  if (score >= 80) return { label: 'Easy', color: 'text-green-600 dark:text-green-400' }
  if (score >= 60) return { label: 'Standard', color: 'text-blue-600 dark:text-blue-400' }
  if (score >= 30) return { label: 'Difficult', color: 'text-orange-600 dark:text-orange-400' }
  return { label: 'Very Difficult', color: 'text-red-600 dark:text-red-400' }
}

export default function WordCounterTool() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    const trimmed = text.trim()
    const wordList = trimmed ? trimmed.split(/\s+/) : []
    const words = wordList.length
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length
    const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length || (trimmed.length > 0 ? 1 : 0) : 0
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(p => p.trim()).length : 0
    const lines = trimmed ? trimmed.split('\n').length : 0
    const readingTime = Math.ceil(words / 200)
    const speakingTime = Math.ceil(words / 130)
    const uniqueWords = trimmed ? new Set(wordList.map(w => w.toLowerCase().replace(/[^a-z0-9'-]/g, '')).filter(Boolean)).size : 0
    const avgWordLength = words > 0 ? (charsNoSpaces / words) : 0
    const pageCount = Math.ceil(words / 250)
    const syllableCount = trimmed ? wordList.reduce((sum, w) => sum + countSyllables(w), 0) : 0
    const fleschScore = words > 0 && sentences > 0
      ? 206.835 - 1.015 * (words / sentences) - 84.6 * (syllableCount / words)
      : 0
    return { words, chars, charsNoSpaces, sentences, paragraphs, lines, readingTime, speakingTime, uniqueWords, avgWordLength, pageCount, syllableCount, fleschScore }
  }, [text])

  const topWords = useMemo(() => {
    const trimmed = text.trim()
    if (!trimmed) return []
    const freq = new Map<string, number>()
    const words = trimmed.toLowerCase().replace(/[^a-z0-9\s'-]/g, '').split(/\s+/).filter(w => w.length > 1)
    for (const w of words) {
      freq.set(w, (freq.get(w) || 0) + 1)
    }
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
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
          { label: 'Unique Words', value: stats.uniqueWords },
          { label: 'Avg Word Length', value: stats.avgWordLength > 0 ? stats.avgWordLength.toFixed(1) : '0' },
          { label: 'Pages', value: stats.pageCount },
          { label: 'Syllables', value: stats.syllableCount },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-muted text-center">
            <div className="text-xl font-bold text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Flesch Reading Ease */}
      {stats.words > 0 && stats.sentences > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Flesch Reading Ease</span>
            <Link
              href="/tools/readability-score"
              className="text-xs font-medium text-primary hover:underline"
            >
              Full Readability Analysis →
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-primary">{Math.round(stats.fleschScore)}</div>
            <div>
              <div className={`text-sm font-semibold ${getFleschLabel(stats.fleschScore).color}`}>
                {getFleschLabel(stats.fleschScore).label}
              </div>
              <div className="text-xs text-muted-foreground">
                Score range: 0 (very difficult) to 100 (very easy)
              </div>
            </div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted-foreground/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(0, Math.min(100, stats.fleschScore))}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Your Text</span>
        <ClearButton onClear={() => setText('')} />
      </div>
      <ToolTextarea value={text} onChange={setText} placeholder="Start typing or paste your text here..." rows={12} />

      {topWords.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Top 10 Most Used Words</h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left p-2 font-medium text-muted-foreground w-10">#</th>
                  <th className="text-left p-2 font-medium text-muted-foreground">Word</th>
                  <th className="text-right p-2 font-medium text-muted-foreground w-20">Count</th>
                  <th className="p-2 font-medium text-muted-foreground">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {topWords.map(([word, count], i) => (
                  <tr key={word} className="border-b border-border last:border-0">
                    <td className="p-2 text-muted-foreground">{i + 1}</td>
                    <td className="p-2 font-mono font-medium">{word}</td>
                    <td className="p-2 text-right">{count}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(count / topWords[0][1]) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolPage>
  )
}
