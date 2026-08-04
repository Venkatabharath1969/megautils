'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 2) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

function getReadingEaseLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Very Easy', color: 'text-green-600' }
  if (score >= 80) return { label: 'Easy', color: 'text-green-500' }
  if (score >= 70) return { label: 'Fairly Easy', color: 'text-lime-500' }
  if (score >= 60) return { label: 'Standard', color: 'text-yellow-500' }
  if (score >= 50) return { label: 'Fairly Difficult', color: 'text-orange-500' }
  if (score >= 30) return { label: 'Difficult', color: 'text-red-500' }
  return { label: 'Very Confusing', color: 'text-red-700' }
}

function getGradeLabel(grade: number): string {
  if (grade <= 5) return '5th Grade'
  if (grade <= 6) return '6th Grade'
  if (grade <= 7) return '7th Grade'
  if (grade <= 8) return '8th Grade'
  if (grade <= 9) return '9th Grade'
  if (grade <= 10) return '10th Grade'
  if (grade <= 11) return '11th Grade'
  if (grade <= 12) return '12th Grade'
  if (grade <= 14) return 'College'
  return 'College Graduate'
}

export default function ReadabilityScoreTool() {
  const [text, setText] = useState('')

  const scores = useMemo(() => {
    const trimmed = text.trim()
    if (!trimmed) return null

    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = trimmed.split(/\s+/).filter(w => w.replace(/[^a-z]/gi, '').length > 0)
    const sentenceCount = Math.max(sentences.length, 1)
    const wordCount = words.length
    if (wordCount === 0) return null

    const syllableCounts = words.map(w => countSyllables(w))
    const totalSyllables = syllableCounts.reduce((a, b) => a + b, 0)
    const polysyllableWords = syllableCounts.filter(s => s >= 3).length

    const avgWordsPerSentence = wordCount / sentenceCount
    const avgSyllablesPerWord = totalSyllables / wordCount

    // Flesch Reading Ease
    const fleschReadingEase = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    const clampedFRE = Math.max(0, Math.min(100, fleschReadingEase))

    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59
    const clampedFKG = Math.max(0, fleschKincaidGrade)

    // Gunning Fog Index
    const gunningFog = 0.4 * (avgWordsPerSentence + 100 * (polysyllableWords / wordCount))

    // SMOG Index
    const smog = sentenceCount >= 3
      ? 1.0430 * Math.sqrt(polysyllableWords * (30 / sentenceCount)) + 3.1291
      : 1.0430 * Math.sqrt(polysyllableWords) + 3.1291

    return {
      wordCount,
      sentenceCount,
      totalSyllables,
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      avgSyllablesPerWord: avgSyllablesPerWord.toFixed(1),
      polysyllableWords,
      fleschReadingEase: clampedFRE,
      fleschKincaidGrade: clampedFKG,
      gunningFog,
      smog,
    }
  }, [text])

  return (
    <ToolPage title="Readability Score Analyzer" description="Calculate Flesch-Kincaid, Flesch Reading Ease, Gunning Fog, and SMOG readability scores." category="seo" categoryLabel="SEO Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Your Text</span>
            <ClearButton onClear={() => setText('')} />
          </div>
          <ToolTextarea value={text} onChange={setText} placeholder="Paste your text here to analyze readability..." rows={16} />
        </div>

        <div className="space-y-4">
          {scores ? (
            <>
              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Words', value: scores.wordCount },
                  { label: 'Sentences', value: scores.sentenceCount },
                  { label: 'Syllables', value: scores.totalSyllables },
                  { label: 'Avg Words/Sentence', value: scores.avgWordsPerSentence },
                  { label: 'Avg Syllables/Word', value: scores.avgSyllablesPerWord },
                  { label: 'Complex Words', value: scores.polysyllableWords },
                ].map(s => (
                  <div key={s.label} className="p-2 rounded-lg bg-muted text-center">
                    <div className="text-lg font-bold text-primary">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Scores */}
              <div className="space-y-3">
                {/* Flesch Reading Ease */}
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Flesch Reading Ease</span>
                    <span className={`text-2xl font-bold ${getReadingEaseLabel(scores.fleschReadingEase).color}`}>
                      {scores.fleschReadingEase.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{ width: `${scores.fleschReadingEase}%` }} />
                  </div>
                  <div className={`text-xs mt-1 font-medium ${getReadingEaseLabel(scores.fleschReadingEase).color}`}>
                    {getReadingEaseLabel(scores.fleschReadingEase).label}
                  </div>
                </div>

                {/* Flesch-Kincaid Grade */}
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Flesch-Kincaid Grade Level</span>
                    <span className="text-2xl font-bold text-primary">{scores.fleschKincaidGrade.toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Reading level: {getGradeLabel(scores.fleschKincaidGrade)}
                  </div>
                </div>

                {/* Gunning Fog */}
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Gunning Fog Index</span>
                    <span className="text-2xl font-bold text-primary">{scores.gunningFog.toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Years of education needed: {getGradeLabel(scores.gunningFog)}
                  </div>
                </div>

                {/* SMOG */}
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">SMOG Index</span>
                    <span className="text-2xl font-bold text-primary">{scores.smog.toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Years of education needed: {getGradeLabel(scores.smog)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Paste text to calculate readability scores.
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
