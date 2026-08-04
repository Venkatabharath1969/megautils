'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

interface PhraseEntry {
  phrase: string
  count: number
  density: number
}

function extractNgrams(words: string[], n: number): PhraseEntry[] {
  if (words.length < n) return []
  const freq: Record<string, number> = {}
  for (let i = 0; i <= words.length - n; i++) {
    const phrase = words.slice(i, i + n).join(' ')
    freq[phrase] = (freq[phrase] || 0) + 1
  }
  const totalPhrases = words.length - n + 1
  return Object.entries(freq)
    .map(([phrase, count]) => ({ phrase, count, density: (count / totalPhrases) * 100 }))
    .filter(e => e.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 25)
}

export default function KeywordDensityCheckerTool() {
  const [text, setText] = useState('')
  const [targetKeyword, setTargetKeyword] = useState('')
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1)

  const analysis = useMemo(() => {
    if (!text.trim()) return { words: [], totalWords: 0, unigrams: [], bigrams: [], trigrams: [], targetCount: 0, targetDensity: 0 }

    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, '')
    const words = cleaned.split(/\s+/).filter(Boolean)
    const totalWords = words.length

    const unigrams = extractNgrams(words, 1)
    const bigrams = extractNgrams(words, 2)
    const trigrams = extractNgrams(words, 3)

    let targetCount = 0
    let targetDensity = 0
    if (targetKeyword.trim()) {
      const kw = targetKeyword.toLowerCase().trim()
      const kwWords = kw.split(/\s+/)
      if (kwWords.length === 1) {
        targetCount = words.filter(w => w === kw).length
        targetDensity = totalWords > 0 ? (targetCount / totalWords) * 100 : 0
      } else {
        for (let i = 0; i <= words.length - kwWords.length; i++) {
          if (words.slice(i, i + kwWords.length).join(' ') === kw) targetCount++
        }
        targetDensity = totalWords > 0 ? (targetCount / totalWords) * 100 : 0
      }
    }

    return { words, totalWords, unigrams, bigrams, trigrams, targetCount, targetDensity }
  }, [text, targetKeyword])

  const currentData = activeTab === 1 ? analysis.unigrams : activeTab === 2 ? analysis.bigrams : analysis.trigrams

  return (
    <ToolPage title="Keyword Density Checker" description="Analyze 1-word, 2-word, and 3-word phrase frequencies in your text." category="seo" categoryLabel="SEO Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Your Text</span>
            <ClearButton onClear={() => { setText(''); setTargetKeyword('') }} />
          </div>
          <ToolTextarea value={text} onChange={setText} placeholder="Paste your article or content here to analyze keyword density..." rows={12} />

          <div>
            <label className="block text-sm font-medium mb-1">Target Keyword</label>
            <input type="text" value={targetKeyword} onChange={e => setTargetKeyword(e.target.value)} placeholder="e.g. content marketing" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          {targetKeyword.trim() && analysis.totalWords > 0 && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-sm font-medium mb-1">Target: &quot;{targetKeyword}&quot;</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 rounded-md bg-card">
                  <div className="text-lg font-bold text-primary">{analysis.targetCount}</div>
                  <div className="text-xs text-muted-foreground">Occurrences</div>
                </div>
                <div className="text-center p-2 rounded-md bg-card">
                  <div className={`text-lg font-bold ${analysis.targetDensity > 3 ? 'text-red-500' : analysis.targetDensity >= 1 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {analysis.targetDensity.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Density</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {analysis.targetDensity > 3 ? 'Density is high - may appear as keyword stuffing' : analysis.targetDensity >= 1 ? 'Good keyword density' : 'Density is low - consider using the keyword more'}
              </div>
            </div>
          )}

          {analysis.totalWords > 0 && (
            <div className="p-3 rounded-lg bg-muted text-center">
              <span className="text-sm font-medium">Total Words: </span>
              <span className="text-sm font-bold text-primary">{analysis.totalWords}</span>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          <div className="flex gap-1 mb-3">
            {([1, 2, 3] as const).map(n => (
              <button key={n} onClick={() => setActiveTab(n)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === n ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                {n}-Word{n > 1 ? 's' : ''}
              </button>
            ))}
          </div>

          {currentData.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-2.5 font-medium">#</th>
                    <th className="text-left p-2.5 font-medium">Phrase</th>
                    <th className="text-right p-2.5 font-medium">Count</th>
                    <th className="text-right p-2.5 font-medium">Density</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, i) => (
                    <tr key={item.phrase} className="border-t border-border hover:bg-muted/50">
                      <td className="p-2.5 text-muted-foreground">{i + 1}</td>
                      <td className="p-2.5 font-mono text-xs">{item.phrase}</td>
                      <td className="p-2.5 text-right font-medium">{item.count}</td>
                      <td className="p-2.5 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${item.density > 3 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {item.density.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12 text-sm">
              {text.trim() ? 'No repeated phrases found. Try adding more text.' : 'Paste text to analyze keyword density.'}
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
