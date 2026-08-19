'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'
import { ScanSearch, AlertTriangle } from 'lucide-react'

const TRANSITION_WORDS = [
  'however', 'furthermore', 'moreover', 'additionally', 'consequently',
  'nevertheless', 'therefore', 'thus', 'hence', 'accordingly',
  'meanwhile', 'subsequently', 'nonetheless', 'conversely', 'similarly',
  'likewise', 'specifically', 'particularly', 'notably', 'significantly',
  'ultimately', 'essentially', 'fundamentally', 'importantly', 'interestingly',
  'remarkably', 'undoubtedly', 'inevitably', 'evidently', 'certainly',
]

const COMMON_AI_STARTERS = [
  'the', 'this', 'it', 'in', 'these', 'there', 'one', 'as', 'when',
  'while', 'by', 'with', 'for', 'from', 'an', 'each', 'every',
]

interface IndicatorResult {
  label: string
  description: string
  score: number      // 0-100 where 100 = most AI-like
  value: string
}

function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?])\s+/g, '$1|SPLIT|')
    .split('|SPLIT|')
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

function analyzeText(text: string) {
  const trimmed = text.trim()
  const words = trimmed.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  if (wordCount < 50) return null

  const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z'-]/g, '').replace(/^'+|'+$/g, ''))
    .filter(w => w.length > 0)
  const sentences = splitSentences(trimmed)
  const sentenceCount = sentences.length

  // 1. Vocabulary Richness (Type-Token Ratio)
  const uniqueWords = new Set(lowerWords)
  const ttr = uniqueWords.size / lowerWords.length
  // Human text typically has higher TTR (0.6-0.8+), AI tends lower (0.4-0.6)
  // We use a sample-size-adjusted TTR to be fair to longer texts
  const adjustedTtr = ttr * Math.sqrt(lowerWords.length) / Math.sqrt(100)
  const clampedTtr = Math.min(1, Math.max(0, adjustedTtr))
  // Lower TTR = more AI-like
  let vocabScore: number
  if (clampedTtr >= 0.75) vocabScore = 10
  else if (clampedTtr >= 0.60) vocabScore = 30
  else if (clampedTtr >= 0.50) vocabScore = 50
  else if (clampedTtr >= 0.40) vocabScore = 70
  else vocabScore = 90

  // 2. Burstiness (Sentence Length Variance)
  const sentenceLengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length)
  const avgSentLen = sentenceLengths.reduce((a, b) => a + b, 0) / Math.max(sentenceCount, 1)
  const sentLenVariance = sentenceCount > 1
    ? sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentLen, 2), 0) / (sentenceCount - 1)
    : 0
  const coefficientOfVariation = avgSentLen > 0 ? Math.sqrt(sentLenVariance) / avgSentLen : 0
  // Humans: high CV (0.5-1.0+), AI: low CV (0.2-0.4)
  let burstinessScore: number
  if (coefficientOfVariation >= 0.7) burstinessScore = 10
  else if (coefficientOfVariation >= 0.55) burstinessScore = 25
  else if (coefficientOfVariation >= 0.40) burstinessScore = 45
  else if (coefficientOfVariation >= 0.30) burstinessScore = 65
  else if (coefficientOfVariation >= 0.20) burstinessScore = 80
  else burstinessScore = 95

  // 3. Perplexity Approximation (Word Frequency Uniformity)
  const freqMap = new Map<string, number>()
  for (const w of lowerWords) {
    freqMap.set(w, (freqMap.get(w) || 0) + 1)
  }
  const frequencies = Array.from(freqMap.values()).map(f => f / lowerWords.length)
  const entropy = -frequencies.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0)
  const maxEntropy = Math.log2(uniqueWords.size)
  const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0
  // AI text tends toward higher normalized entropy (more uniform distribution)
  let perplexityScore: number
  if (normalizedEntropy >= 0.98) perplexityScore = 90
  else if (normalizedEntropy >= 0.95) perplexityScore = 75
  else if (normalizedEntropy >= 0.90) perplexityScore = 55
  else if (normalizedEntropy >= 0.85) perplexityScore = 35
  else perplexityScore = 15

  // 4. Sentence Starter Diversity
  const starters = sentences
    .map(s => s.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, ''))
    .filter(Boolean)
  const uniqueStarters = new Set(starters)
  const starterRatio = starters.length > 0 ? uniqueStarters.size / starters.length : 1
  const commonStarterCount = starters.filter(s => COMMON_AI_STARTERS.includes(s)).length
  const commonStarterRatio = starters.length > 0 ? commonStarterCount / starters.length : 0
  // AI uses more common/repetitive starters
  let starterScore: number
  if (commonStarterRatio >= 0.8) starterScore = 90
  else if (commonStarterRatio >= 0.65) starterScore = 70
  else if (commonStarterRatio >= 0.50) starterScore = 50
  else if (commonStarterRatio >= 0.35) starterScore = 30
  else starterScore = 15
  // Also factor in the diversity ratio
  if (starterRatio < 0.4) starterScore = Math.min(95, starterScore + 15)
  else if (starterRatio > 0.8) starterScore = Math.max(5, starterScore - 15)

  // 5. Average Sentence Length
  // AI tends toward 15-25 words consistently
  let avgLenScore: number
  if (avgSentLen >= 15 && avgSentLen <= 25) avgLenScore = 75
  else if (avgSentLen >= 12 && avgSentLen <= 28) avgLenScore = 55
  else if (avgSentLen >= 8 && avgSentLen <= 35) avgLenScore = 35
  else avgLenScore = 15

  // 6. Transition Word Density
  const transitionCount = lowerWords.filter(w => TRANSITION_WORDS.includes(w)).length
  const transitionDensity = transitionCount / (wordCount / 100) // per 100 words
  let transitionScore: number
  if (transitionDensity >= 4.0) transitionScore = 95
  else if (transitionDensity >= 2.5) transitionScore = 80
  else if (transitionDensity >= 1.5) transitionScore = 60
  else if (transitionDensity >= 0.8) transitionScore = 40
  else if (transitionDensity >= 0.3) transitionScore = 20
  else transitionScore = 10

  const indicators: IndicatorResult[] = [
    {
      label: 'Perplexity',
      description: 'Word frequency uniformity — AI text distributes words more evenly',
      score: perplexityScore,
      value: `${(normalizedEntropy * 100).toFixed(1)}% uniform`,
    },
    {
      label: 'Burstiness',
      description: 'Sentence length variation — humans vary length more than AI',
      score: burstinessScore,
      value: `CV: ${coefficientOfVariation.toFixed(2)}`,
    },
    {
      label: 'Vocabulary Richness',
      description: 'Unique words ratio — AI tends to reuse words more often',
      score: vocabScore,
      value: `${(ttr * 100).toFixed(1)}% unique`,
    },
    {
      label: 'Sentence Starters',
      description: 'Diversity of first words — AI repeats "The", "This", "It" more',
      score: starterScore,
      value: `${(starterRatio * 100).toFixed(0)}% diverse`,
    },
    {
      label: 'Avg. Sentence Length',
      description: 'AI tends toward 15-25 words per sentence consistently',
      score: avgLenScore,
      value: `${avgSentLen.toFixed(1)} words`,
    },
    {
      label: 'Transition Density',
      description: 'Frequency of "However", "Furthermore", "Moreover", etc.',
      score: transitionScore,
      value: `${transitionDensity.toFixed(1)} per 100 words`,
    },
  ]

  // Weighted overall score
  const weights = [0.20, 0.25, 0.15, 0.15, 0.10, 0.15]
  const overallScore = Math.round(
    indicators.reduce((sum, ind, i) => sum + ind.score * weights[i], 0)
  )

  return { indicators, overallScore, wordCount, sentenceCount }
}

function getVerdict(score: number): { label: string; color: string; bgColor: string; ringColor: string } {
  if (score <= 25) return { label: 'Likely Human-Written', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500', ringColor: 'ring-green-500/20' }
  if (score <= 45) return { label: 'Mostly Human', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500', ringColor: 'ring-green-500/20' }
  if (score <= 55) return { label: 'Mixed / Uncertain', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500', ringColor: 'ring-yellow-500/20' }
  if (score <= 75) return { label: 'Likely AI-Generated', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500', ringColor: 'ring-red-500/20' }
  return { label: 'Highly Likely AI', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500', ringColor: 'ring-red-500/20' }
}

function getBarColor(score: number): string {
  if (score <= 30) return 'bg-green-500'
  if (score <= 55) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function AIContentDetectorTool() {
  const [text, setText] = useState('')

  const result = useMemo(() => analyzeText(text), [text])

  const wordCount = useMemo(() => {
    const trimmed = text.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }, [text])

  return (
    <ToolPage
      title="AI Content Detector"
      description="Detect whether text was written by AI or a human. Uses statistical analysis — runs entirely in your browser."
      category="text"
      categoryLabel="Text Tools"
      slug="ai-content-detector"
      helpContent={
        <>
          <h2>What is AI Content Detector?</h2>
          <p>
            AI Content Detector is a free browser-based tool that analyzes a piece of text and estimates whether it was written by a human or generated by an artificial intelligence model such as ChatGPT, Gemini, or Claude. Rather than relying on an external API, the detector uses six proven statistical indicators — perplexity, burstiness, vocabulary richness, sentence starter diversity, average sentence length, and transition word density — to score the text on a scale from likely human to highly likely AI. The entire analysis runs in your browser, so your text is never uploaded or stored anywhere.
          </p>
          <p>
            AI-generated text tends to exhibit measurable patterns: more uniform word distributions, consistent sentence lengths, repetitive sentence starters, and a higher density of formal transition words. Human writing, by contrast, is typically more varied and unpredictable. By measuring these characteristics, the tool produces a weighted overall score along with a detailed breakdown of each indicator, giving you a transparent look at why the text was classified the way it was.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type the text you want to analyze into the input area. A minimum of 50 words is required for meaningful statistical analysis.</li>
            <li>The tool analyzes your text instantly as you type and displays an overall AI probability score.</li>
            <li>Review the six individual indicator scores to understand which specific traits of the text lean human or AI.</li>
            <li>Use the verdict label — Likely Human-Written, Mostly Human, Mixed / Uncertain, Likely AI-Generated, or Highly Likely AI — as a quick summary.</li>
            <li>Click the clear button to reset the input and analyze a different piece of text.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Provide at least 200 words for the most reliable results. Short texts do not contain enough statistical signal for confident classification.</li>
            <li>Remember that no detection method is infallible. Heavily edited AI text or highly formulaic human writing can produce misleading scores.</li>
            <li>Use the per-indicator breakdown to identify specific patterns rather than relying solely on the overall score.</li>
            <li>This tool is best used as one signal among many. Combine its output with your own judgment, contextual knowledge, and other verification methods.</li>
            <li>All analysis happens locally in JavaScript. Your text never leaves your device, making it safe for confidential documents, student submissions, and proprietary content.</li>
            <li>The detector works with any English-language text including essays, articles, blog posts, emails, and creative writing.</li>
          </ul>
        </>
      }
      faqs={[
        {
          question: 'How does this AI content detector work?',
          answer: 'This tool analyzes your text using six statistical indicators: word frequency uniformity (perplexity), sentence length variation (burstiness), vocabulary richness, sentence starter diversity, average sentence length, and transition word density. AI-generated text tends to be more uniform and predictable across these metrics.',
        },
        {
          question: 'Is this tool 100% accurate?',
          answer: 'No AI detection tool is 100% accurate. This tool uses statistical heuristics that provide a probability estimate. Heavily edited AI text or very formulaic human writing can produce false results. Use the results as one signal among many, not as definitive proof.',
        },
        {
          question: 'Is my text uploaded to a server?',
          answer: 'No. All analysis runs entirely in your browser using JavaScript. Your text never leaves your device. There are no API calls, no server processing, and no data storage.',
        },
        {
          question: 'Why is a minimum of 50 words required?',
          answer: 'Statistical analysis needs a sufficient sample size to produce meaningful results. With fewer than 50 words, metrics like sentence length variance and vocabulary richness cannot be reliably calculated, leading to inaccurate scores.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanSearch className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Paste Text to Analyze</span>
          </div>
          {text && <ClearButton onClear={() => setText('')} />}
        </div>

        {/* Text Input */}
        <ToolTextarea
          value={text}
          onChange={setText}
          placeholder="Paste the text you want to analyze here (minimum 50 words)..."
          rows={12}
        />

        {/* Word count hint */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{wordCount} word{wordCount !== 1 ? 's' : ''} entered</span>
          {wordCount > 0 && wordCount < 50 && (
            <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              Need at least {50 - wordCount} more word{50 - wordCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 rounded-lg bg-muted">
                <div className={`text-6xl font-bold ${getVerdict(result.overallScore).color}`}>
                  {result.overallScore}%
                </div>
                <div className="text-sm font-medium mt-1">AI Probability</div>
                <div className={`text-xs font-semibold mt-0.5 ${getVerdict(result.overallScore).color}`}>
                  {getVerdict(result.overallScore).label}
                </div>
                <div className={`w-full h-2.5 rounded-full bg-card mt-4 overflow-hidden ring-1 ${getVerdict(result.overallScore).ringColor}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getVerdict(result.overallScore).bgColor}`}
                    style={{ width: `${result.overallScore}%` }}
                  />
                </div>
                <div className="flex justify-between w-full mt-1 text-[10px] text-muted-foreground">
                  <span>Human</span>
                  <span>AI</span>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="lg:col-span-2 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <div className="text-xl font-bold text-primary">{result.wordCount}</div>
                    <div className="text-[10px] text-muted-foreground">Words Analyzed</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <div className="text-xl font-bold text-primary">{result.sentenceCount}</div>
                    <div className="text-[10px] text-muted-foreground">Sentences</div>
                  </div>
                </div>

                {/* Indicator Breakdown */}
                <div className="p-4 rounded-lg border border-border">
                  <div className="text-sm font-medium mb-3">Indicator Breakdown</div>
                  <div className="space-y-3">
                    {result.indicators.map((ind) => (
                      <div key={ind.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{ind.label}</span>
                          <span className="text-xs text-muted-foreground">{ind.value}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getBarColor(ind.score)}`}
                              style={{ width: `${ind.score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-10 text-right ${getBarColor(ind.score).replace('bg-', 'text-')}`}>
                            {ind.score}%
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{ind.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Per-sentence highlighting */}
            {(() => {
              const sentences = text
                .replace(/([.!?])\s+/g, '$1|SPLIT|')
                .split('|SPLIT|')
                .map(s => s.trim())
                .filter(s => s.length > 0)
              if (sentences.length > 1) {
                return (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Per-Sentence Analysis</h3>
                    <div className="p-3 rounded-lg border border-border bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap">
                      {sentences.map((sentence, i) => {
                        const words = sentence.split(/\s+/).filter(Boolean)
                        const wordCount = words.length
                        if (wordCount < 5) return <span key={i}>{sentence}{' '}</span>
                        const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z'-]/g, '')).filter(w => w.length > 0)
                        const uniqueRatio = new Set(lowerWords).size / Math.max(lowerWords.length, 1)
                        const transCount = lowerWords.filter(w => TRANSITION_WORDS.includes(w)).length
                        const transDensity = transCount / (wordCount / 100)
                        const starterWord = words[0]?.toLowerCase().replace(/[^a-z]/g, '') || ''
                        const commonStarter = COMMON_AI_STARTERS.includes(starterWord) ? 1 : 0
                        let sentScore = 0
                        if (uniqueRatio < 0.5) sentScore += 30
                        else if (uniqueRatio < 0.7) sentScore += 15
                        if (transDensity > 3) sentScore += 25
                        else if (transDensity > 1.5) sentScore += 10
                        if (commonStarter) sentScore += 10
                        if (wordCount >= 15 && wordCount <= 25) sentScore += 15
                        const color = sentScore >= 40
                          ? 'bg-red-500/20 border-b-2 border-red-500/40'
                          : sentScore >= 20
                            ? 'bg-yellow-500/15 border-b-2 border-yellow-500/30'
                            : 'bg-green-500/10 border-b-2 border-green-500/30'
                        return <span key={i} className={`${color} rounded px-0.5`} title={`AI-likeness: ${sentScore}%`}>{sentence}{' '}</span>
                      })}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/30" /> Likely human</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/30" /> Mixed</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30" /> AI-like</span>
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {/* Disclaimer */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This tool uses statistical heuristics, not a trained AI model. Results are estimates, not proof. Heavily edited AI text may appear human, and formulaic human writing may appear AI-generated. Always use multiple signals before drawing conclusions.
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
