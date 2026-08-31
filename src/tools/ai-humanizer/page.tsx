'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'
import { Sparkles, ArrowLeftRight, Download, Shield } from 'lucide-react'

/* ────────────────────────────────────────────────────────────────────
   Contraction map
   ──────────────────────────────────────────────────────────────────── */

const CONTRACTIONS: Record<string, string> = {
  'do not': "don't", 'does not': "doesn't", 'did not': "didn't",
  'cannot': "can't", 'can not': "can't", 'will not': "won't",
  'would not': "wouldn't", 'could not': "couldn't", 'should not': "shouldn't",
  'is not': "isn't", 'are not': "aren't", 'was not': "wasn't",
  'were not': "weren't", 'has not': "hasn't", 'have not': "haven't",
  'had not': "hadn't", 'it is': "it's", 'it has': "it's",
  'they are': "they're", 'they have': "they've", 'they will': "they'll",
  'they would': "they'd", 'we are': "we're", 'we have': "we've",
  'we will': "we'll", 'we would': "we'd", 'you are': "you're",
  'you have': "you've", 'you will': "you'll", 'you would': "you'd",
  'he is': "he's", 'he has': "he's", 'he will': "he'll",
  'he would': "he'd", 'she is': "she's", 'she has': "she's",
  'she will': "she'll", 'she would': "she'd", 'I am': "I'm",
  'I have': "I've", 'I will': "I'll", 'I would': "I'd",
  'I had': "I'd", 'that is': "that's", 'that has': "that's",
  'who is': "who's", 'who has': "who's", 'what is': "what's",
  'what has': "what's", 'where is': "where's", 'there is': "there's",
  'here is': "here's", 'let us': "let's",
}

/* ────────────────────────────────────────────────────────────────────
   AI-tell phrase replacements
   ──────────────────────────────────────────────────────────────────── */

const AI_TELL_PHRASES: Record<string, string[]> = {
  'furthermore': ['Also', 'Plus', 'On top of that'],
  'moreover': ['Also', 'Plus', 'What\'s more'],
  'additionally': ['Also', 'Plus', 'And'],
  'consequently': ['So', 'As a result', 'Because of this'],
  'nevertheless': ['Still', 'But', 'Even so'],
  'nonetheless': ['Still', 'Even so', 'But'],
  'henceforth': ['From now on', 'Going forward'],
  'subsequently': ['Then', 'After that', 'Later'],
  'it is important to note': ['Note that', 'Keep in mind'],
  'it is important to note that': ['Note that', 'Keep in mind'],
  'it is worth noting that': ['Notably', 'Keep in mind'],
  'it should be noted that': ['Note that', 'Keep in mind that'],
  'in conclusion': ['To wrap up', 'So', 'All in all'],
  'to summarize': ['In short', 'So', 'Basically'],
  'in summary': ['In short', 'To wrap up', 'So'],
  'delve into': ['look at', 'explore', 'dig into'],
  'delves into': ['looks at', 'explores', 'digs into'],
  'delving into': ['looking at', 'exploring', 'digging into'],
  'a testament to': ['proof of', 'shows', 'evidence of'],
  'navigate the complexities': ['deal with', 'handle', 'work through'],
  'navigating the complexities': ['dealing with', 'handling', 'working through'],
  'it is crucial to': ['You need to', 'Make sure to', "It's key to"],
  'it is essential to': ['You need to', "It's key to", "Be sure to"],
  'in the realm of': ['in', 'when it comes to', 'in the world of'],
  'plays a pivotal role': ['matters a lot', 'is really important', 'is key'],
  'plays a crucial role': ['matters a lot', 'is really important', 'is key'],
  'a myriad of': ['many', 'lots of', 'a bunch of'],
  'a plethora of': ['many', 'lots of', 'a ton of'],
  'in today\'s world': ['these days', 'nowadays', 'right now'],
  'in today\'s society': ['these days', 'nowadays'],
  'in the modern era': ['these days', 'now', 'today'],
  'it is imperative': ["it's important", 'you really need to', 'you should'],
  'multifaceted': ['complex', 'varied', 'many-sided'],
  'encompasses': ['includes', 'covers', 'has'],
  'facilitates': ['helps with', 'makes easier', 'supports'],
  'leverage': ['use', 'take advantage of', 'make use of'],
  'leveraging': ['using', 'taking advantage of'],
  'utilize': ['use', 'work with', 'put to use'],
  'utilizing': ['using', 'working with'],
  'commence': ['start', 'begin', 'kick off'],
  'commencing': ['starting', 'beginning'],
  'endeavor': ['try', 'effort', 'attempt'],
  'endeavors': ['tries', 'efforts', 'attempts'],
  'paramount': ['key', 'super important', 'critical'],
  'comprehensive': ['thorough', 'complete', 'full'],
  'pertaining to': ['about', 'related to', 'on'],
  'in light of': ['given', 'because of', 'considering'],
  'with regard to': ['about', 'on', 'regarding'],
  'with respect to': ['about', 'for', 'when it comes to'],
  'aforementioned': ['mentioned', 'above', 'earlier'],
  'the aforementioned': ['the', 'this', 'that'],
  'thereby': ['so', 'which', 'and'],
  'wherein': ['where', 'in which'],
  'thereof': ['of it', 'of that'],
  'thus': ['so', 'this way', 'because of that'],
  'hence': ['so', 'that\'s why', 'because of this'],
}

/* ────────────────────────────────────────────────────────────────────
   Overly formal vocabulary → casual
   ──────────────────────────────────────────────────────────────────── */

const FORMAL_TO_CASUAL: Record<string, string[]> = {
  'acquire': ['get', 'pick up'], 'ascertain': ['find out', 'figure out'],
  'demonstrate': ['show', 'prove'], 'elucidate': ['explain', 'clear up'],
  'facilitate': ['help', 'make easier'], 'implement': ['set up', 'put in place'],
  'necessitate': ['need', 'call for'], 'obtain': ['get', 'grab'],
  'procure': ['get', 'find'], 'sufficient': ['enough'],
  'substantial': ['big', 'large', 'major'], 'significant': ['big', 'important', 'major'],
  'approximately': ['about', 'around'], 'considerable': ['big', 'a lot of'],
  'constitute': ['make up', 'form'], 'elaborate': ['explain', 'go into detail'],
  'exhibit': ['show', 'display'], 'formulate': ['create', 'come up with'],
  'indicate': ['show', 'point to', 'suggest'], 'optimize': ['improve', 'make better'],
  'preliminary': ['early', 'first'], 'subsequent': ['next', 'following', 'later'],
  'terminate': ['end', 'stop', 'finish'], 'underpinning': ['basis', 'foundation'],
  'predominantly': ['mostly', 'mainly'], 'proliferation': ['spread', 'growth'],
  'ramifications': ['effects', 'results', 'consequences'],
  'discourse': ['discussion', 'talk', 'conversation'],
  'juxtapose': ['compare', 'put side by side'],
  'ameliorate': ['improve', 'make better'], 'cognizant': ['aware', 'mindful'],
  'delineate': ['describe', 'outline'], 'efficacious': ['effective', 'useful'],
  'exacerbate': ['worsen', 'make worse'], 'inaugurate': ['start', 'begin', 'launch'],
  'mitigate': ['lessen', 'reduce'], 'scrutinize': ['examine', 'look closely at'],
  'ubiquitous': ['everywhere', 'common'], 'rudimentary': ['basic', 'simple'],
}

/* ────────────────────────────────────────────────────────────────────
   Informal sentence starters
   ──────────────────────────────────────────────────────────────────── */

const INFORMAL_STARTERS = ['And ', 'But ', 'So ', 'Plus, ', 'Thing is, ', 'Look, ', 'Honestly, ']

/* ────────────────────────────────────────────────────────────────────
   Seeded random
   ──────────────────────────────────────────────────────────────────── */

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

/* ────────────────────────────────────────────────────────────────────
   Humanization engine
   ──────────────────────────────────────────────────────────────────── */

function humanizeText(text: string): string {
  if (!text.trim()) return ''

  const seed = text.length * 37 + text.charCodeAt(0)
  const rng = seededRandom(seed)

  let result = text

  // 1. Add contractions
  for (const [formal, contracted] of Object.entries(CONTRACTIONS)) {
    const regex = new RegExp(`\\b${formal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    result = result.replace(regex, (match) => {
      // Preserve case of first letter
      if (match[0] === match[0].toUpperCase()) {
        return contracted.charAt(0).toUpperCase() + contracted.slice(1)
      }
      return contracted
    })
  }

  // 2. Replace AI-tell phrases (case-insensitive, sorted by length descending)
  const sortedPhrases = Object.entries(AI_TELL_PHRASES).sort((a, b) => b[0].length - a[0].length)
  for (const [phrase, replacements] of sortedPhrases) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    result = result.replace(regex, (match) => {
      const replacement = replacements[Math.floor(rng() * replacements.length)]
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1)
      }
      return replacement
    })
  }

  // 3. Replace overly formal vocabulary with casual equivalents
  for (const [formal, casuals] of Object.entries(FORMAL_TO_CASUAL)) {
    const regex = new RegExp(`\\b${formal}\\b`, 'gi')
    result = result.replace(regex, (match) => {
      if (rng() < 0.7) { // 70% chance to replace
        const casual = casuals[Math.floor(rng() * casuals.length)]
        if (match[0] === match[0].toUpperCase()) {
          return casual.charAt(0).toUpperCase() + casual.slice(1)
        }
        return casual
      }
      return match
    })
  }

  // 4. Vary sentence length — split long sentences
  const sentences = result.match(/[^.!?]*[.!?]+[\s]?|[^.!?]+$/g) || [result]
  const processedSentences: string[] = []

  for (let i = 0; i < sentences.length; i++) {
    let sentence = sentences[i]
    const words = sentence.split(/\s+/).filter(Boolean)

    // Split very long sentences (>25 words)
    if (words.length > 25) {
      const conjunctions = /,\s*(and|but|or|which|that|while|although|because|since|so)\s+/i
      const match = sentence.match(conjunctions)
      if (match && match.index) {
        const firstPart = sentence.slice(0, match.index).trim()
        const secondPart = sentence.slice(match.index + match[0].length).trim()
        if (firstPart && secondPart) {
          const firstClean = firstPart.replace(/[.!?]+$/, '') + '.'
          const secondClean = secondPart.charAt(0).toUpperCase() + secondPart.slice(1)
          processedSentences.push(firstClean + ' ')
          sentence = secondClean
        }
      }
    }

    // Occasionally merge short consecutive sentences
    if (i < sentences.length - 1 && words.length < 6 && rng() < 0.3) {
      const nextSentence = sentences[i + 1]
      const nextWords = nextSentence.split(/\s+/).filter(Boolean)
      if (nextWords.length < 8) {
        const merged = sentence.replace(/[.!?]+\s*$/, '') + ', and ' +
          nextSentence.trimStart().charAt(0).toLowerCase() + nextSentence.trimStart().slice(1)
        processedSentences.push(merged)
        i++ // skip next sentence
        continue
      }
    }

    processedSentences.push(sentence)
  }

  result = processedSentences.join('')

  // 5. Add informal starters occasionally (to sentences that start with normal words)
  const finalSentences = result.match(/[^.!?]*[.!?]+[\s]?|[^.!?]+$/g) || [result]
  const humanSentences: string[] = []

  for (let i = 0; i < finalSentences.length; i++) {
    let s = finalSentences[i]

    // Add informal starters to ~15% of sentences (not the first one)
    if (i > 0 && rng() < 0.15) {
      const trimmed = s.trimStart()
      // Only add starters to sentences that don't already start with a transition
      if (trimmed && !/^(And|But|So|Plus|Thing|Look|Honestly|However|Also|Well)/i.test(trimmed)) {
        const starter = INFORMAL_STARTERS[Math.floor(rng() * INFORMAL_STARTERS.length)]
        s = starter + trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
      }
    }

    humanSentences.push(s)
  }

  result = humanSentences.join('')

  // 6. Clean up
  result = result.replace(/\s{2,}/g, ' ').replace(/\s+([,.])/g, '$1').trim()

  return result
}

/* ────────────────────────────────────────────────────────────────────
   AI Detection Score (heuristic)
   ──────────────────────────────────────────────────────────────────── */

function calculateAIScore(text: string): number {
  if (!text.trim()) return 0

  let aiSignals = 0
  let totalChecks = 0
  const lowerText = text.toLowerCase()

  // Check for formal transition words
  const formalTransitions = ['furthermore', 'moreover', 'consequently', 'nevertheless',
    'nonetheless', 'henceforth', 'subsequently', 'additionally', 'in conclusion',
    'it is important to note', 'it should be noted', 'it is worth noting',
    'in light of', 'with regard to', 'pertaining to', 'aforementioned',
    'thereby', 'wherein', 'thereof', 'hence', 'thus']
  for (const t of formalTransitions) {
    totalChecks++
    if (lowerText.includes(t)) aiSignals++
  }

  // Check for AI-tell phrases
  const aiPhrases = ['delve into', 'a testament to', 'navigate the complexities',
    'plays a pivotal role', 'plays a crucial role', 'a myriad of', 'a plethora of',
    'in today\'s world', 'multifaceted', 'in the realm of', 'it is imperative',
    'in the modern era', 'the landscape of']
  for (const p of aiPhrases) {
    totalChecks++
    if (lowerText.includes(p)) aiSignals += 2
  }

  // Check for lack of contractions
  const noContractionPairs = ['do not', 'does not', 'did not', 'cannot', 'will not',
    'would not', 'could not', 'should not', 'is not', 'are not', 'was not',
    'it is', 'they are', 'we are', 'you are']
  let noContractionCount = 0
  for (const pair of noContractionPairs) {
    const regex = new RegExp(`\\b${pair}\\b`, 'gi')
    const matches = lowerText.match(regex)
    if (matches) noContractionCount += matches.length
  }
  totalChecks += 5
  if (noContractionCount > 3) aiSignals += 3
  else if (noContractionCount > 1) aiSignals += 1

  // Check sentence length uniformity (AI writes uniform sentence lengths)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5)
  if (sentences.length >= 3) {
    const lengths = sentences.map(s => s.trim().split(/\s+/).length)
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length
    const cv = Math.sqrt(variance) / avg // coefficient of variation
    totalChecks += 3
    if (cv < 0.2) aiSignals += 3 // Very uniform = likely AI
    else if (cv < 0.35) aiSignals += 1
  }

  // Check for vocabulary diversity
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)
  if (words.length > 20) {
    const uniqueRatio = new Set(words).size / words.length
    totalChecks += 2
    if (uniqueRatio > 0.75) aiSignals += 2 // Very high unique word ratio = likely AI
    else if (uniqueRatio > 0.65) aiSignals += 1
  }

  // Check for overly formal vocabulary
  const formalWords = ['utilize', 'facilitate', 'endeavor', 'commence', 'ascertain',
    'elucidate', 'ameliorate', 'efficacious', 'paramount', 'comprehensive',
    'substantial', 'significant', 'demonstrate', 'implement', 'optimize']
  let formalCount = 0
  for (const fw of formalWords) {
    if (lowerText.includes(fw)) formalCount++
  }
  totalChecks += 3
  if (formalCount > 4) aiSignals += 3
  else if (formalCount > 2) aiSignals += 2
  else if (formalCount > 0) aiSignals += 1

  // Calculate percentage (0-100, higher = more AI-like)
  const score = Math.min(100, Math.round((aiSignals / Math.max(totalChecks, 1)) * 100))
  return score
}

/* ────────────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────────────── */

export default function AIHumanizer() {
  const [input, setInput] = useState('')
  const [showCompare, setShowCompare] = useState(false)

  const result = useMemo(() => {
    if (!input.trim()) return null
    const humanized = humanizeText(input)
    return {
      text: humanized,
      inputWordCount: countWords(input),
      outputWordCount: countWords(humanized),
      inputScore: calculateAIScore(input),
      outputScore: calculateAIScore(humanized),
    }
  }, [input])

  const clear = useCallback(() => {
    setInput('')
    setShowCompare(false)
  }, [])

  const handleDownload = useCallback(() => {
    if (!result?.text) return
    const blob = new Blob([result.text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'humanized-text.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [result])

  return (
    <ToolPage
      title="AI Text Humanizer"
      description="Make AI-generated text sound more natural and human-written. Bypass AI detection — runs entirely in your browser."
      category="text"
      categoryLabel="Text Tools"
      slug="ai-humanizer"
      helpContent={
        <>
          <h2>What is AI Text Humanizer?</h2>
          <p>
            AI Text Humanizer transforms AI-generated text into more natural, human-sounding content. It applies a series of intelligent transformations including adding contractions, varying sentence lengths, replacing AI-characteristic phrases with casual alternatives, and adjusting overly formal vocabulary. The tool runs entirely in your browser using pure JavaScript — your text never leaves your device.
          </p>
          <p>
            AI-generated text often follows predictable patterns: uniform sentence lengths, formal vocabulary, lack of contractions, and signature phrases like &quot;delve into&quot; or &quot;it is important to note.&quot; This tool addresses all of these telltale signs to make the output read more naturally, as if written by a human author.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste your AI-generated text into the input area.</li>
            <li>The tool instantly humanizes the text with multiple transformation passes.</li>
            <li>Review the AI Detection Score to see how much the text improved.</li>
            <li>Use the Compare toggle to see the original alongside the humanized version.</li>
            <li>Copy the humanized text or download it as a text file.</li>
          </ol>

          <h2>What Transformations Are Applied?</h2>
          <ul>
            <li><strong>Contractions:</strong> &quot;do not&quot; → &quot;don&apos;t&quot;, &quot;it is&quot; → &quot;it&apos;s&quot;, &quot;they are&quot; → &quot;they&apos;re&quot;, etc.</li>
            <li><strong>AI phrase replacement:</strong> &quot;Furthermore&quot; → &quot;Also&quot;/&quot;Plus&quot;, &quot;delve into&quot; → &quot;look at&quot;/&quot;explore&quot;, etc.</li>
            <li><strong>Sentence variation:</strong> Long sentences are split, short ones occasionally merged.</li>
            <li><strong>Informal markers:</strong> Occasional sentences start with &quot;And&quot;, &quot;But&quot;, or &quot;So&quot;.</li>
            <li><strong>Vocabulary downgrade:</strong> Overly formal words replaced with casual equivalents.</li>
          </ul>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Always review the humanized output for accuracy — automated transformations can occasionally alter meaning.</li>
            <li>The tool works best on longer text (3+ sentences) where it can apply varied transformations.</li>
            <li>Use this as a starting point, then add your own personal touch for the most authentic result.</li>
            <li>The AI Detection Score is an estimate based on common patterns — no detection method is 100% accurate.</li>
            <li>This tool is designed for making your own AI-assisted content sound more natural, not for academic dishonesty.</li>
          </ul>
        </>
      }
      faqs={[
        {
          question: 'How does this AI humanizer work?',
          answer: 'The tool applies multiple transformation passes to your text: adding contractions, replacing AI-characteristic phrases with casual alternatives, varying sentence lengths, adding informal sentence starters, and downgrading overly formal vocabulary. Everything runs in pure JavaScript in your browser.',
        },
        {
          question: 'Is my text sent to any server?',
          answer: 'No. All processing happens entirely in your browser using JavaScript. Your text never leaves your device — there are no API calls, no cloud processing, and no data stored anywhere.',
        },
        {
          question: 'How accurate is the AI Detection Score?',
          answer: 'The detection score uses heuristics based on common AI writing patterns: formal transitions, lack of contractions, uniform sentence lengths, overly formal vocabulary, and AI-tell phrases. It provides a rough estimate but should not be treated as definitive — it is designed to show relative improvement between original and humanized text.',
        },
        {
          question: 'Will this bypass all AI detectors?',
          answer: 'No tool can guarantee bypassing all AI detectors, as detection methods vary and evolve. This tool significantly reduces common AI writing patterns, making text read more naturally. However, the best approach is to use it as a starting point and then add your own personal voice and edits.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Paste AI-generated text</span>
          </div>
          {input && <ClearButton onClear={clear} />}
        </div>

        {/* Input */}
        <ToolTextarea
          value={input}
          onChange={setInput}
          placeholder="Paste your AI-generated text here to humanize it..."
          rows={10}
        />

        {/* Results */}
        {result && result.text && (
          <div className="space-y-4">
            {/* Detection Score */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Original AI Score</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${
                    result.inputScore > 60 ? 'text-red-500' : result.inputScore > 30 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {result.inputScore}%
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          result.inputScore > 60 ? 'bg-red-500' : result.inputScore > 30 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${result.inputScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {result.inputScore > 60 ? 'Likely AI-generated' : result.inputScore > 30 ? 'Possibly AI-generated' : 'Likely human-written'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Humanized AI Score</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-bold ${
                    result.outputScore > 60 ? 'text-red-500' : result.outputScore > 30 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {result.outputScore}%
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          result.outputScore > 60 ? 'bg-red-500' : result.outputScore > 30 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${result.outputScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {result.outputScore > 60 ? 'Likely AI-generated' : result.outputScore > 30 ? 'Possibly AI-generated' : 'Likely human-written'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score improvement badge */}
            {result.inputScore > result.outputScore && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  AI detection score reduced by {result.inputScore - result.outputScore} points!
                </span>
              </div>
            )}

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 rounded-lg bg-muted text-sm">
              <span>
                Original: <strong>{result.inputWordCount.toLocaleString()}</strong> words
              </span>
              <span className="text-muted-foreground hidden sm:inline">→</span>
              <span>
                Humanized: <strong>{result.outputWordCount.toLocaleString()}</strong> words
              </span>
              {result.inputWordCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  result.outputWordCount !== result.inputWordCount
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {result.outputWordCount > result.inputWordCount ? '+' : ''}
                  {Math.round(((result.outputWordCount - result.inputWordCount) / result.inputWordCount) * 100)}% words
                </span>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowCompare(!showCompare)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-muted transition-colors border border-border"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  {showCompare ? 'Hide Compare' : 'Compare'}
                </button>
              </div>
            </div>

            {/* Compare view */}
            {showCompare && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1 block">Original</span>
                  <div className="w-full rounded-lg border border-input bg-muted/30 p-3 min-h-[120px] text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {input}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-muted-foreground mb-1 block">Humanized</span>
                  <div className="w-full rounded-lg border border-input bg-tool-bg p-3 min-h-[120px] text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {result.text}
                  </div>
                </div>
              </div>
            )}

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Humanized Text</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-muted transition-colors border border-border"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                  <CopyButton text={result.text} />
                </div>
              </div>
              <ToolTextarea value={result.text} readOnly rows={10} />
            </div>
          </div>
        )}

        {/* Empty state */}
        {!input.trim() && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Paste your AI-generated text above to humanize it instantly.
          </p>
        )}
      </div>
    </ToolPage>
  )
}
