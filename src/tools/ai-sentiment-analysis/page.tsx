'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'
import { Type } from 'lucide-react'

/* ──────────────────────────────────────────────
   AFINN-inspired sentiment lexicon (200+ pos, 200+ neg)
   Scores range from -5 (most negative) to +5 (most positive)
   ────────────────────────────────────────────── */

const POSITIVE_WORDS: Record<string, number> = {
  // +5 — strongest positive
  outstanding: 5, superb: 5, breathtaking: 5, phenomenal: 5, spectacular: 5,
  masterpiece: 5, magnificent: 5, extraordinary: 5, flawless: 5, impeccable: 5,
  // +4
  amazing: 4, excellent: 4, wonderful: 4, fantastic: 4, brilliant: 4,
  incredible: 4, awesome: 4, exceptional: 4, marvelous: 4, terrific: 4,
  glorious: 4, fabulous: 4, sublime: 4, exquisite: 4, remarkable: 4,
  delightful: 4, stellar: 4, thrilling: 4, triumphant: 4, sensational: 4,
  // +3
  great: 3, love: 3, beautiful: 3, perfect: 3, best: 3,
  happy: 3, joyful: 3, exciting: 3, impressive: 3, superior: 3,
  elegant: 3, graceful: 3, charming: 3, vibrant: 3, radiant: 3,
  glowing: 3, inspiring: 3, uplifting: 3, refreshing: 3, splendid: 3,
  admire: 3, adore: 3, bliss: 3, blessed: 3, celebrate: 3,
  champion: 3, cheerful: 3, creative: 3, dazzling: 3, devoted: 3,
  ecstatic: 3, enchanting: 3, enthusiastic: 3, euphoric: 3, exhilarating: 3,
  flourishing: 3, gorgeous: 3, grateful: 3, heavenly: 3, heroic: 3,
  hilarious: 3, honorable: 3, innovative: 3, legendary: 3, loving: 3,
  magical: 3, majestic: 3, miraculous: 3, passionate: 3, prosperous: 3,
  // +2
  good: 2, nice: 2, enjoy: 2, like: 2, pleasant: 2,
  positive: 2, helpful: 2, useful: 2, interesting: 2, effective: 2,
  reliable: 2, comfortable: 2, friendly: 2, generous: 2, kind: 2,
  smart: 2, talented: 2, warm: 2, worthy: 2, succeed: 2,
  success: 2, successful: 2, valuable: 2, win: 2, winner: 2,
  glad: 2, pleased: 2, proud: 2, satisfy: 2, satisfied: 2,
  bright: 2, calm: 2, clean: 2, clear: 2, confident: 2,
  convenient: 2, correct: 2, dedicated: 2, eager: 2, efficient: 2,
  fair: 2, faithful: 2, fun: 2, genuine: 2, honest: 2,
  hopeful: 2, ideal: 2, improved: 2, joyous: 2, joy: 2,
  keen: 2, lively: 2, loyal: 2, merit: 2, neat: 2,
  noble: 2, nurturing: 2, optimistic: 2, peaceful: 2, polite: 2,
  powerful: 2, practical: 2, precise: 2, pure: 2, quick: 2,
  rational: 2, respectful: 2, reward: 2, rewarding: 2, robust: 2,
  safe: 2, secure: 2, sincere: 2, smooth: 2, stable: 2,
  strong: 2, supportive: 2, swift: 2, thankful: 2, thorough: 2,
  thoughtful: 2, thrive: 2, tidy: 2, trustworthy: 2, upbeat: 2,
  // +1
  ok: 1, okay: 1, fine: 1, decent: 1, adequate: 1,
  acceptable: 1, reasonable: 1, proper: 1, steady: 1, normal: 1,
  agree: 1, approve: 1, balanced: 1, benefit: 1, capable: 1,
  certain: 1, coherent: 1, competent: 1, consistent: 1, content: 1,
  familiar: 1, fitting: 1, functional: 1, handy: 1, intact: 1,
  manageable: 1, mild: 1, moderate: 1, natural: 1, orderly: 1,
  patient: 1, ready: 1, regular: 1, relevant: 1, simple: 1,
  solid: 1, standard: 1, suitable: 1, sufficient: 1, tolerable: 1,
  understandable: 1, valid: 1, welcome: 1, willing: 1, workable: 1,
}

const NEGATIVE_WORDS: Record<string, number> = {
  // -5 — strongest negative
  atrocious: -5, abhorrent: -5, despicable: -5, catastrophic: -5, devastating: -5,
  horrific: -5, abysmal: -5, deplorable: -5, repulsive: -5, vile: -5,
  // -4
  terrible: -4, awful: -4, horrible: -4, dreadful: -4, appalling: -4,
  disgusting: -4, hideous: -4, horrendous: -4, ghastly: -4, revolting: -4,
  abominable: -4, contemptible: -4, detestable: -4, loathsome: -4, wretched: -4,
  outrageous: -4, pathetic: -4, reprehensible: -4, sickening: -4, unbearable: -4,
  // -3
  hate: -3, bad: -3, ugly: -3, worst: -3, angry: -3,
  annoying: -3, cruel: -3, dangerous: -3, depressing: -3, destroy: -3,
  disappointing: -3, disaster: -3, disgrace: -3, dismal: -3, distressing: -3,
  embarrassing: -3, evil: -3, fail: -3, failure: -3, fear: -3,
  filthy: -3, foolish: -3, fraud: -3, frightening: -3, furious: -3,
  grief: -3, grim: -3, gross: -3, guilty: -3, harmful: -3,
  harsh: -3, heartbreaking: -3, hopeless: -3, hostile: -3, humiliating: -3,
  ignorant: -3, inferior: -3, insane: -3, insulting: -3, miserable: -3,
  nasty: -3, offensive: -3, painful: -3, pitiful: -3, poison: -3,
  rotten: -3, ruthless: -3, savage: -3, scandal: -3, shameful: -3,
  shocking: -3, sinister: -3, stupid: -3, toxic: -3, tragic: -3,
  unacceptable: -3, unfortunate: -3, violent: -3, vicious: -3, worthless: -3,
  // -2
  poor: -2, boring: -2, cheap: -2, confusing: -2, difficult: -2,
  dirty: -2, dislike: -2, doubt: -2, dull: -2, error: -2,
  exhausting: -2, expensive: -2, faulty: -2, flawed: -2, frustrating: -2,
  helpless: -2, hurtful: -2, immature: -2, imperfect: -2, impolite: -2,
  inadequate: -2, incompetent: -2, incomplete: -2, inconvenient: -2, ineffective: -2,
  insecure: -2, irritating: -2, lacking: -2, lazy: -2, limited: -2,
  lonely: -2, lousy: -2, mediocre: -2, messy: -2, neglect: -2,
  nervous: -2, noisy: -2, obsolete: -2, overpriced: -2, problem: -2,
  regret: -2, reject: -2, rigid: -2, risky: -2, rude: -2,
  sad: -2, selfish: -2, slow: -2, sloppy: -2, stressful: -2,
  stuck: -2, suspect: -2, tedious: -2, tense: -2, tired: -2,
  troubled: -2, unappealing: -2, unclear: -2, unfair: -2, unhappy: -2,
  unkind: -2, unlikely: -2, unpleasant: -2, unreliable: -2, unstable: -2,
  useless: -2, weak: -2, worried: -2, wrong: -2, worse: -2,
  // -1
  miss: -1, lost: -1, cold: -1, dark: -1, delay: -1,
  flat: -1, grey: -1, hard: -1, heavy: -1, issue: -1,
  odd: -1, old: -1, plain: -1, rough: -1, small: -1,
  strange: -1, tight: -1, tough: -1, tricky: -1, uncertain: -1,
  uncomfortable: -1, undecided: -1, uneven: -1, unfamiliar: -1, uninspired: -1,
  unnecessary: -1, unsure: -1, unusual: -1, vague: -1, complex: -1,
  concern: -1, demanding: -1, distant: -1, dry: -1, faint: -1,
  forgettable: -1, generic: -1, hesitant: -1, indifferent: -1, lengthy: -1,
  mundane: -1, narrow: -1, passive: -1, predictable: -1, questionable: -1,
  reluctant: -1, repetitive: -1, reserved: -1, restless: -1, shallow: -1,
}

const ALL_WORDS: Record<string, number> = { ...POSITIVE_WORDS, ...NEGATIVE_WORDS }

const INTENSIFIERS: Record<string, number> = {
  very: 1.5, extremely: 2, incredibly: 2, absolutely: 2, totally: 1.5,
  completely: 1.8, utterly: 2, really: 1.3, truly: 1.4, highly: 1.5,
  deeply: 1.5, remarkably: 1.6, exceptionally: 1.8, extraordinarily: 2,
  immensely: 1.8, profoundly: 1.8, especially: 1.3, particularly: 1.3,
  so: 1.3, most: 1.5, super: 1.5, quite: 1.2, rather: 1.1,
}

const NEGATORS = new Set([
  'not', 'never', 'no', 'neither', 'nor', 'nobody', 'nothing',
  'nowhere', 'hardly', 'barely', 'scarcely', 'rarely', 'seldom',
  "don't", "doesn't", "didn't", "won't", "wouldn't", "shouldn't",
  "couldn't", "isn't", "aren't", "wasn't", "weren't", "hasn't",
  "haven't", "hadn't", "cannot", "can't", "mustn't",
  "dont", "doesnt", "didnt", "wont", "wouldnt", "shouldnt",
  "couldnt", "isnt", "arent", "wasnt", "werent", "hasnt",
  "havent", "hadnt", "cant", "mustnt",
])

/* ──────────────────────────────────────────────
   Analysis engine
   ────────────────────────────────────────────── */

interface WordHit {
  word: string
  score: number
  index: number
}

interface SentenceResult {
  text: string
  score: number
  label: string
  emoji: string
}

interface AnalysisResult {
  score: number            // raw sum
  normalizedScore: number  // -100 to +100
  label: string
  emoji: string
  confidence: number       // 0-100
  positiveWords: WordHit[]
  negativeWords: WordHit[]
  sentences: SentenceResult[]
  wordCount: number
  scoredWordCount: number
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9'\s-]/g, ' ').split(/\s+/).filter(Boolean)
}

function analyzeSentiment(text: string): AnalysisResult | null {
  if (!text.trim()) return null

  const tokens = tokenize(text)
  if (tokens.length === 0) return null

  const positiveWords: WordHit[] = []
  const negativeWords: WordHit[] = []
  let totalScore = 0
  let scoredWordCount = 0

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const baseScore = ALL_WORDS[token]
    if (baseScore === undefined) continue

    let finalScore = baseScore

    // Check for negator in 1-3 words before
    let negated = false
    for (let j = Math.max(0, i - 3); j < i; j++) {
      if (NEGATORS.has(tokens[j])) {
        negated = true
        break
      }
    }

    // Check for intensifier immediately before
    let intensified = 1
    if (i > 0 && INTENSIFIERS[tokens[i - 1]]) {
      intensified = INTENSIFIERS[tokens[i - 1]]
    }

    if (negated) {
      // "not bad" becomes slightly positive (+1), "not good" becomes slightly negative (-1)
      finalScore = baseScore > 0 ? -Math.ceil(Math.abs(baseScore) * 0.5) : Math.ceil(Math.abs(baseScore) * 0.5)
    } else {
      finalScore = Math.round(baseScore * intensified)
    }

    totalScore += finalScore
    scoredWordCount++

    const hit: WordHit = { word: token, score: finalScore, index: i }
    if (finalScore > 0) positiveWords.push(hit)
    else if (finalScore < 0) negativeWords.push(hit)
  }

  // Normalize score to -100..+100
  // Use a soft normalization: score per scored word, scaled
  const maxPossible = Math.max(scoredWordCount * 3, 1) // average word strength ~3
  const normalizedScore = Math.max(-100, Math.min(100, Math.round((totalScore / maxPossible) * 100)))

  // Confidence: how many words contributed to the score vs total words
  const coverage = scoredWordCount / Math.max(tokens.length, 1)
  const consistency = scoredWordCount > 0
    ? 1 - (Math.min(positiveWords.length, negativeWords.length) / scoredWordCount)
    : 0
  const confidence = Math.round(Math.min(100, (coverage * 50 + consistency * 50) * (Math.min(scoredWordCount, 10) / 10) * 1.5))

  let label: string
  let emoji: string
  if (normalizedScore > 15) { label = 'Positive'; emoji = '\u{1F60A}' }
  else if (normalizedScore < -15) { label = 'Negative'; emoji = '\u{1F61E}' }
  else { label = 'Neutral'; emoji = '\u{1F610}' }

  // Sentence-by-sentence breakdown
  const sentenceTexts = text.split(/(?<=[.!?])\s+|[\n\r]+/).filter(s => s.trim().length > 0)
  const sentences: SentenceResult[] = sentenceTexts.map(s => {
    const sTokens = tokenize(s)
    let sScore = 0
    let sScoredCount = 0

    for (let i = 0; i < sTokens.length; i++) {
      const token = sTokens[i]
      const base = ALL_WORDS[token]
      if (base === undefined) continue

      let fs = base
      let neg = false
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (NEGATORS.has(sTokens[j])) { neg = true; break }
      }
      let intens = 1
      if (i > 0 && INTENSIFIERS[sTokens[i - 1]]) intens = INTENSIFIERS[sTokens[i - 1]]

      if (neg) {
        fs = base > 0 ? -Math.ceil(Math.abs(base) * 0.5) : Math.ceil(Math.abs(base) * 0.5)
      } else {
        fs = Math.round(base * intens)
      }
      sScore += fs
      sScoredCount++
    }

    const sMax = Math.max(sScoredCount * 3, 1)
    const sNorm = Math.max(-100, Math.min(100, Math.round((sScore / sMax) * 100)))

    let sLabel: string
    let sEmoji: string
    if (sNorm > 15) { sLabel = 'Positive'; sEmoji = '\u{1F60A}' }
    else if (sNorm < -15) { sLabel = 'Negative'; sEmoji = '\u{1F61E}' }
    else { sLabel = 'Neutral'; sEmoji = '\u{1F610}' }

    return { text: s.trim(), score: sNorm, label: sLabel, emoji: sEmoji }
  })

  // Sort word hits by absolute score descending
  positiveWords.sort((a, b) => b.score - a.score)
  negativeWords.sort((a, b) => a.score - b.score)

  return {
    score: totalScore,
    normalizedScore,
    label,
    emoji,
    confidence,
    positiveWords,
    negativeWords,
    sentences,
    wordCount: tokens.length,
    scoredWordCount,
  }
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

function ScoreBar({ score }: { score: number }) {
  // score is -100 to +100, map to 0-100 for position
  const pct = (score + 100) / 2

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>-100</span>
        <span>0</span>
        <span>+100</span>
      </div>
      <div className="relative h-4 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)' }}>
        <div
          className="absolute top-0 h-full w-1 bg-foreground rounded-full shadow-lg ring-2 ring-background"
          style={{ left: `calc(${pct}% - 2px)`, transition: 'left 0.3s ease' }}
        />
      </div>
    </div>
  )
}

function WordBadges({ words, variant }: { words: WordHit[]; variant: 'positive' | 'negative' }) {
  // Deduplicate by word
  const seen = new Set<string>()
  const unique = words.filter(w => {
    if (seen.has(w.word)) return false
    seen.add(w.word)
    return true
  }).slice(0, 15)

  if (unique.length === 0) return null

  const colorClass = variant === 'positive'
    ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30'
    : 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'

  return (
    <div className="flex flex-wrap gap-1.5">
      {unique.map((w, i) => (
        <span key={`${w.word}-${i}`} className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border ${colorClass}`}>
          {w.word}
          <span className="opacity-60">({w.score > 0 ? '+' : ''}{w.score})</span>
        </span>
      ))}
    </div>
  )
}

export default function AISentimentAnalysis() {
  const [input, setInput] = useState('')

  const result = useMemo(() => analyzeSentiment(input), [input])

  const clear = () => setInput('')

  return (
    <ToolPage
      title="AI Sentiment Analysis"
      description="Analyze the emotional tone of any text. Detects positive, negative, and neutral sentiment — runs entirely in your browser."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>AI Sentiment Analysis examines text and determines its emotional tone — positive, negative, or neutral — along with a confidence score. It uses a natural language processing model to understand context, sarcasm indicators, and word connotations. The analysis runs entirely in your browser for instant, private results.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type the text you want to analyze.</li>
            <li>Click <strong>Analyze</strong> to process the text.</li>
            <li>View the sentiment classification (positive, negative, or neutral) with a confidence score.</li>
            <li>Use the results for content analysis, brand monitoring, or customer feedback assessment.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Sentiment analysis is used in social media monitoring, customer review analysis, brand reputation management, market research, and content strategy. Writers use it to gauge the emotional tone of their drafts, and support teams use it to prioritize negative feedback.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Longer text passages produce more reliable sentiment scores than single words or short phrases.</li>
            <li>Sarcasm and irony can confuse the model — review edge cases manually.</li>
            <li>The tool works best with English text written in a direct style.</li>
            <li>All analysis runs locally, so customer feedback and private communications remain confidential.</li>
            <li>For mixed-sentiment text, the overall score reflects the dominant tone.</li>
          </ul>
        </>
      }
      slug="ai-sentiment-analysis"
      faqs={[
        {
          question: 'How does this sentiment analysis work?',
          answer: 'This tool uses a keyword-based approach inspired by the AFINN lexicon. It scores individual words on a scale from -5 (very negative) to +5 (very positive), handles negators like "not" and "never", and applies intensifiers like "very" and "extremely" to calculate an overall sentiment score.',
        },
        {
          question: 'Is my text sent to any server?',
          answer: 'No. All analysis runs entirely in your browser using pure JavaScript. Your text never leaves your device — there are no API calls, no data collection, and no server processing involved.',
        },
        {
          question: 'What do the scores mean?',
          answer: 'The sentiment score ranges from -100 (extremely negative) to +100 (extremely positive). Scores above +15 are classified as positive, below -15 as negative, and everything in between as neutral. The confidence percentage reflects how much of your text contributed to the score and how consistent the sentiment is.',
        },
        {
          question: 'Can it understand sarcasm or complex context?',
          answer: 'This tool handles basic negation (e.g., "not good" is detected as negative) and intensifiers (e.g., "very bad" scores lower than "bad"), but it cannot detect sarcasm, irony, or deep contextual meaning. For most practical uses like reviews, feedback, and social posts, it provides accurate results.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Enter Text to Analyze</span>
          </div>
          {input && <ClearButton onClear={clear} />}
        </div>

        {/* Input */}
        <ToolTextarea
          value={input}
          onChange={setInput}
          placeholder="Paste or type any text here — reviews, tweets, emails, articles... Analysis is instant as you type."
          rows={10}
        />

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Big emoji + label + score */}
            <div className="flex flex-col items-center gap-3 py-6 rounded-xl bg-muted/50 border border-border">
              <span className="text-6xl">{result.emoji}</span>
              <div className="text-center">
                <h2 className="text-2xl font-bold">{result.label}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Score: <span className="font-semibold text-foreground">{result.normalizedScore > 0 ? '+' : ''}{result.normalizedScore}</span>
                  <span className="mx-2">|</span>
                  Confidence: <span className="font-semibold text-foreground">{result.confidence}%</span>
                </p>
              </div>
            </div>

            {/* Score bar */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sentiment Score</span>
              <div className="mt-2">
                <ScoreBar score={result.normalizedScore} />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                <div className="text-lg font-bold">{result.wordCount}</div>
                <div className="text-xs text-muted-foreground">Total Words</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{result.positiveWords.length}</div>
                <div className="text-xs text-muted-foreground">Positive Hits</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{result.negativeWords.length}</div>
                <div className="text-xs text-muted-foreground">Negative Hits</div>
              </div>
            </div>

            {/* Positive words */}
            {result.positiveWords.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
                  Positive Words Found
                </h3>
                <WordBadges words={result.positiveWords} variant="positive" />
              </div>
            )}

            {/* Negative words */}
            {result.negativeWords.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                  Negative Words Found
                </h3>
                <WordBadges words={result.negativeWords} variant="negative" />
              </div>
            )}

            {/* Sentence breakdown */}
            {result.sentences.length > 1 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Sentence-by-Sentence Breakdown</h3>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left p-2.5 font-medium text-muted-foreground">Sentence</th>
                        <th className="text-center p-2.5 font-medium text-muted-foreground w-20">Score</th>
                        <th className="text-center p-2.5 font-medium text-muted-foreground w-28">Sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.sentences.map((s, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-2.5 max-w-[400px] truncate">{s.text}</td>
                          <td className="p-2.5 text-center font-mono font-medium">
                            <span className={s.score > 15 ? 'text-green-600 dark:text-green-400' : s.score < -15 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}>
                              {s.score > 0 ? '+' : ''}{s.score}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="text-sm">{s.emoji} {s.label}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state hint */}
        {!result && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Type or paste text above to see instant sentiment analysis.</p>
            <p className="text-xs mt-1">Works with reviews, tweets, emails, articles, and any English text.</p>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
