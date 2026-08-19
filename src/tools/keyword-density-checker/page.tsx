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

const STOP_WORDS = new Set(['the', 'a', 'an', 'is', 'in', 'to', 'of', 'and', 'for', 'on', 'it', 'at', 'by', 'as', 'or', 'be', 'this', 'that', 'with', 'from', 'are', 'was', 'were', 'has', 'have', 'had', 'not', 'but', 'what', 'all', 'can', 'her', 'his', 'one', 'our', 'out', 'you', 'its', 'do', 'no', 'if', 'so', 'up', 'we', 'my', 'me', 'he', 'she', 'they', 'them'])

export default function KeywordDensityCheckerTool() {
  const [text, setText] = useState('')
  const [targetKeyword, setTargetKeyword] = useState('')
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1)
  const [filterStopWords, setFilterStopWords] = useState(false)

  const analysis = useMemo(() => {
    if (!text.trim()) return { words: [], totalWords: 0, unigrams: [], bigrams: [], trigrams: [], targetCount: 0, targetDensity: 0 }

    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, '')
    const allWords = cleaned.split(/\s+/).filter(Boolean)
    const words = filterStopWords ? allWords.filter(w => !STOP_WORDS.has(w)) : allWords
    const totalWords = allWords.length

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
  }, [text, targetKeyword, filterStopWords])

  const currentData = activeTab === 1 ? analysis.unigrams : activeTab === 2 ? analysis.bigrams : analysis.trigrams

  return (
    <ToolPage title="Keyword Density Checker" description="Analyze 1-word, 2-word, and 3-word phrase frequencies in your text." category="seo" categoryLabel="SEO Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Keyword Density Checker is a free browser-based tool that lets you analyze text to find keyword frequency, density percentages, and prominent phrases for SEO optimization. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Fill in the required fields with your page or content information.</li>
            <li>Configure optional settings to match your specific SEO needs.</li>
            <li>Review the generated output, preview, or analysis results.</li>
            <li>Copy the generated code or export the results for use on your website.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when optimizing blog posts for target keywords, avoiding keyword stuffing, or analyzing competitor content strategy. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this SEO tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Validate generated markup using Google Rich Results Test before deploying to your site.</li>
            <li>Keep meta titles under 60 characters and descriptions under 160 characters for optimal display in search results.</li>
            <li>Update structured data whenever your page content changes significantly.</li>
            <li>Test how your pages appear in search results using the preview features provided.</li>
            <li>All SEO analysis runs in your browser — your website data stays private.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'What is keyword density?', answer: 'Keyword density is the percentage of times a keyword or phrase appears in your content compared to the total word count. It helps gauge whether a keyword is used naturally or excessively.' },
        { question: 'What is the ideal keyword density for SEO?', answer: 'Most SEO experts recommend a keyword density between 1% and 3%. Going above 3% may be seen as keyword stuffing, which can hurt your search rankings.' },
        { question: 'What is keyword stuffing?', answer: 'Keyword stuffing is the practice of unnaturally overusing keywords in content to manipulate search rankings. Search engines penalize this practice, so focus on writing naturally.' },
      ]}>
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

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={filterStopWords} onChange={e => setFilterStopWords(e.target.checked)} className="rounded border-input" />
            <span className="font-medium">Filter stop words</span>
            <span className="text-xs text-muted-foreground">(the, a, is, in, to, of, and, for...)</span>
          </label>

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
