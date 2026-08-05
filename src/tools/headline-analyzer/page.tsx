'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'

const POWER_WORDS = [
  'amazing', 'awesome', 'best', 'brilliant', 'breathtaking', 'captivating', 'compelling',
  'critical', 'crucial', 'deadly', 'definitive', 'devastating', 'discover', 'dominate',
  'effortless', 'elite', 'epic', 'essential', 'exclusive', 'expert', 'extraordinary',
  'fantastic', 'fascinating', 'free', 'guaranteed', 'hack', 'hidden', 'huge', 'immediately',
  'important', 'impossible', 'incredible', 'insane', 'insider', 'instant', 'legendary',
  'life-changing', 'limited', 'lucrative', 'magical', 'massive', 'mind-blowing', 'miracle',
  'must', 'new', 'outstanding', 'perfect', 'phenomenal', 'powerful', 'premium', 'proven',
  'remarkable', 'revolutionary', 'ridiculous', 'secret', 'sensational', 'shocking',
  'simple', 'spectacular', 'stunning', 'superb', 'surprising', 'top', 'ultimate',
  'unbelievable', 'unconventional', 'unexpected', 'unique', 'unleash', 'unprecedented',
  'urgent', 'vital', 'wonderful',
]

const EMOTIONAL_WORDS = [
  'afraid', 'agony', 'angry', 'anxiety', 'ashamed', 'awe', 'beautiful', 'bliss',
  'bold', 'brave', 'calm', 'cheerful', 'confident', 'courage', 'crazy', 'daring',
  'delight', 'desire', 'desperate', 'dread', 'eager', 'ecstatic', 'embarrass', 'enraged',
  'excited', 'faith', 'fear', 'fierce', 'frustrated', 'fury', 'grateful', 'greed',
  'grief', 'happy', 'hate', 'heartbreak', 'hope', 'horror', 'hurt', 'inspire',
  'jealous', 'joy', 'laugh', 'lonely', 'love', 'lust', 'miserable', 'obsessed',
  'outrage', 'pain', 'panic', 'passion', 'pity', 'proud', 'rage', 'relief',
  'sad', 'scared', 'shame', 'shock', 'smile', 'sorrow', 'stress', 'struggle',
  'suffer', 'terror', 'thrill', 'trust', 'victory', 'vulnerable', 'worry',
]

function detectHeadlineType(headline: string): string {
  const lower = headline.toLowerCase()
  if (/^\d+\s|top\s\d+/i.test(lower)) return 'Listicle'
  if (/^(how\s+to|how\s+do|how\s+can)/i.test(lower)) return 'How-To'
  if (/\?$/.test(headline.trim())) return 'Question'
  if (/^(why|what|when|where|who|which)/i.test(lower)) return 'Question'
  if (/^(the\s+(ultimate|complete|definitive|essential))/i.test(lower)) return 'Guide'
  if (/^(breaking|just\s+in|alert|update)/i.test(lower)) return 'News'
  if (/^(\d+\s+(ways|tips|tricks|steps|reasons|ideas|secrets|hacks|strategies|methods))/i.test(lower)) return 'Listicle'
  return 'Statement'
}

export default function HeadlineAnalyzerTool() {
  const [headline, setHeadline] = useState('')

  const analysis = useMemo(() => {
    const trimmed = headline.trim()
    if (!trimmed) return null

    const words = trimmed.split(/\s+/).filter(Boolean)
    const wordCount = words.length
    const charCount = trimmed.length
    const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))

    // Word count score (ideal 6-12)
    let wordScore = 0
    if (wordCount >= 6 && wordCount <= 12) wordScore = 25
    else if (wordCount >= 4 && wordCount <= 14) wordScore = 15
    else wordScore = 5

    // Power words
    const foundPower = lowerWords.filter(w => POWER_WORDS.includes(w))
    const powerScore = Math.min(25, foundPower.length * 8)

    // Emotional words
    const foundEmotional = lowerWords.filter(w => EMOTIONAL_WORDS.includes(w))
    const emotionalScore = Math.min(25, foundEmotional.length * 10)

    // SERP display check
    const serpFit = charCount <= 60
    const serpScore = serpFit ? 15 : charCount <= 70 ? 10 : 5

    // Headline type bonus
    const headlineType = detectHeadlineType(trimmed)
    const typeScore = headlineType !== 'Statement' ? 10 : 5

    const overallScore = Math.min(100, wordScore + powerScore + emotionalScore + serpScore + typeScore)

    return {
      wordCount,
      charCount,
      foundPower: [...new Set(foundPower)],
      foundEmotional: [...new Set(foundEmotional)],
      headlineType,
      serpFit,
      overallScore,
      wordScore,
      powerScore,
      emotionalScore,
      serpScore,
      typeScore,
    }
  }, [headline])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-lime-500'
    if (score >= 40) return 'text-yellow-500'
    if (score >= 20) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Average'
    if (score >= 20) return 'Needs Work'
    return 'Poor'
  }

  return (
    <ToolPage title="Headline Analyzer" description="Analyze your headline for word count, power words, emotional impact, and SERP readiness." category="content" categoryLabel="Content Tools" faqs={[
        { question: 'What makes a good headline?', answer: 'A good headline is 6-12 words long, includes power or emotional words, fits within Google\'s 60-character display limit, and uses a proven format like a listicle, how-to, or question.' },
        { question: 'What are power words in headlines?', answer: 'Power words are persuasive terms like "proven," "ultimate," "essential," and "secret" that grab attention and increase click-through rates on your content.' },
        { question: 'How long should a headline be for SEO?', answer: 'Keep headlines under 60 characters so they display fully in Google search results. For word count, 6-12 words is the ideal range for engagement and readability.' },
        { question: 'What headline score should I aim for?', answer: 'Aim for a score of 60 or above, which indicates good use of power words, emotional triggers, and proper length. Scores above 80 are considered excellent.' },
      ]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Enter Your Headline</span>
          <ClearButton onClear={() => setHeadline('')} />
        </div>

        <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. 10 Proven Ways to Boost Your Website Traffic" className="w-full rounded-lg border border-input bg-tool-bg p-3 text-lg focus:outline-none focus:ring-2 focus:ring-ring" />

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Overall Score */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center p-6 rounded-lg bg-muted">
              <div className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <div className="text-sm font-medium mt-1">Overall Score</div>
              <div className={`text-xs font-semibold mt-0.5 ${getScoreColor(analysis.overallScore)}`}>
                {getScoreLabel(analysis.overallScore)}
              </div>
              <div className="w-full h-2 rounded-full bg-card mt-3 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${analysis.overallScore >= 60 ? 'bg-green-500' : analysis.overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${analysis.overallScore}%` }} />
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-xl font-bold text-primary">{analysis.wordCount}</div>
                  <div className="text-[10px] text-muted-foreground">Word Count</div>
                  <div className={`text-[10px] font-medium ${analysis.wordCount >= 6 && analysis.wordCount <= 12 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {analysis.wordCount >= 6 && analysis.wordCount <= 12 ? 'Ideal' : 'Not ideal (6-12)'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-xl font-bold text-primary">{analysis.charCount}</div>
                  <div className="text-[10px] text-muted-foreground">Characters</div>
                  <div className={`text-[10px] font-medium ${analysis.serpFit ? 'text-green-500' : 'text-red-500'}`}>
                    {analysis.serpFit ? 'Fits SERP' : 'Too long for SERP'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-xl font-bold text-primary">{analysis.foundPower.length}</div>
                  <div className="text-[10px] text-muted-foreground">Power Words</div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-xl font-bold text-primary">{analysis.foundEmotional.length}</div>
                  <div className="text-[10px] text-muted-foreground">Emotional Words</div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border">
                <div className="text-sm font-medium mb-1">Headline Type</div>
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{analysis.headlineType}</span>
              </div>

              {analysis.foundPower.length > 0 && (
                <div className="p-3 rounded-lg border border-border">
                  <div className="text-sm font-medium mb-1">Power Words Found</div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.foundPower.map(w => (
                      <span key={w} className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">{w}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.foundEmotional.length > 0 && (
                <div className="p-3 rounded-lg border border-border">
                  <div className="text-sm font-medium mb-1">Emotional Words Found</div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.foundEmotional.map(w => (
                      <span key={w} className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs">{w}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Score breakdown */}
              <div className="p-3 rounded-lg border border-border">
                <div className="text-sm font-medium mb-2">Score Breakdown</div>
                <div className="space-y-1.5 text-xs">
                  {[
                    { label: 'Word Count', score: analysis.wordScore, max: 25 },
                    { label: 'Power Words', score: analysis.powerScore, max: 25 },
                    { label: 'Emotional Impact', score: analysis.emotionalScore, max: 25 },
                    { label: 'SERP Length', score: analysis.serpScore, max: 15 },
                    { label: 'Headline Type', score: analysis.typeScore, max: 10 },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="w-28 text-muted-foreground">{item.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(item.score / item.max) * 100}%` }} />
                      </div>
                      <span className="w-12 text-right font-medium">{item.score}/{item.max}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
