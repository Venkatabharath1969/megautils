'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'
import { FileText, List } from 'lucide-react'

type LengthPreset = 'short' | 'medium' | 'long' | 'custom'

const PRESET_COUNTS: Record<Exclude<LengthPreset, 'custom'>, number> = {
  short: 3,
  medium: 5,
  long: 8,
}

/* ---- Pure JS extractive summarization ---- */

function splitSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or end-of-string
  const raw = text.match(/[^.!?]*[.!?]+[\s]?|[^.!?]+$/g)
  if (!raw) return []
  return raw
    .map(s => s.trim())
    .filter(s => s.length > 10) // drop fragments
}

function tokenize(sentence: string): string[] {
  return sentence
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
}

const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
  'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
  'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
  'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
  'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
  'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
  'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'is', 'are', 'was', 'were', 'been', 'being', 'has', 'had', 'did', 'does',
  'am', 'very', 'much', 'more', 'many', 'such', 'each', 'own', 'same',
])

function summarize(text: string, count: number): { sentences: string[]; allSentences: string[] } {
  const sentences = splitSentences(text)
  if (sentences.length <= count) {
    return { sentences: [...sentences], allSentences: sentences }
  }

  // Tokenize each sentence
  const tokenized = sentences.map(tokenize)

  // Compute TF per sentence
  const docCount = sentences.length
  const dfMap = new Map<string, number>() // how many sentences contain word

  const tfMaps: Map<string, number>[] = tokenized.map(words => {
    const tf = new Map<string, number>()
    const seen = new Set<string>()
    for (const w of words) {
      tf.set(w, (tf.get(w) || 0) + 1)
      if (!seen.has(w)) {
        seen.add(w)
        dfMap.set(w, (dfMap.get(w) || 0) + 1)
      }
    }
    return tf
  })

  // Score each sentence by sum of TF-IDF of its words
  const scores = tokenized.map((words, idx) => {
    if (words.length === 0) return 0
    let score = 0
    const tf = tfMaps[idx]
    for (const w of words) {
      const tfVal = (tf.get(w) || 0) / words.length
      const idf = Math.log(docCount / (1 + (dfMap.get(w) || 0)))
      score += tfVal * idf
    }
    // Slight position bias: first/last sentences are often important
    if (idx === 0) score *= 1.2
    if (idx === sentences.length - 1) score *= 1.05
    return score
  })

  // Rank and pick top N, then restore original order
  const ranked = scores
    .map((score, idx) => ({ score, idx }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.idx - b.idx)

  return {
    sentences: ranked.map(r => sentences[r.idx]),
    allSentences: sentences,
  }
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

/* ---- Component ---- */

export default function AITextSummarizer() {
  const [input, setInput] = useState('')
  const [preset, setPreset] = useState<LengthPreset>('medium')
  const [customCount, setCustomCount] = useState(5)
  const [bulletMode, setBulletMode] = useState(false)

  const targetCount = preset === 'custom' ? customCount : PRESET_COUNTS[preset]

  const result = useMemo(() => {
    if (!input.trim()) return null
    const { sentences, allSentences } = summarize(input, targetCount)
    if (sentences.length === 0) return null
    const summaryText = sentences.join(' ')
    const origWords = countWords(input)
    const summaryWords = countWords(summaryText)
    const reduction = origWords > 0 ? Math.round((1 - summaryWords / origWords) * 100) : 0
    return { sentences, summaryText, origWords, summaryWords, reduction, totalSentences: allSentences.length }
  }, [input, targetCount])

  const clear = useCallback(() => {
    setInput('')
  }, [])

  const presetButtons: { key: LengthPreset; label: string }[] = [
    { key: 'short', label: 'Short (3)' },
    { key: 'medium', label: 'Medium (5)' },
    { key: 'long', label: 'Long (8)' },
    { key: 'custom', label: 'Custom' },
  ]

  return (
    <ToolPage
      title="AI Text Summarizer"
      description="Summarize long text into key points instantly. Extracts the most important sentences — runs entirely in your browser."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>The AI Text Summarizer condenses long documents, articles, and text passages into shorter summaries that capture the key points. It uses a language model to identify the most important sentences and concepts, producing a coherent summary that saves you reading time. All processing runs locally in your browser.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste the text you want to summarize into the input area.</li>
            <li>Click <strong>Summarize</strong> to process the text.</li>
            <li>Read the generated summary highlighting the key points.</li>
            <li>Copy the summary for notes, reports, or quick reference.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Text summarization saves time when reviewing long articles, research papers, reports, or email threads. Students use it to create study notes, professionals use it to quickly digest meeting minutes, and content curators use it to write article abstracts.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Provide at least a few paragraphs of text for meaningful summaries — very short inputs produce minimal output.</li>
            <li>Well-structured text with clear topic sentences produces the best summaries.</li>
            <li>Always verify that the summary captures the critical points — AI may omit nuanced details.</li>
            <li>The tool works best with informational and expository text, not creative writing.</li>
            <li>Your text is never sent to any server — processing is entirely local.</li>
          </ul>
        </>
      }
      slug="ai-text-summarizer"
      faqs={[
        {
          question: 'How does this text summarizer work?',
          answer: 'This tool uses extractive summarization powered by TF-IDF (Term Frequency-Inverse Document Frequency). It splits your text into sentences, scores each sentence by how important its words are relative to the whole document, and selects the top-scoring sentences while maintaining their original order.',
        },
        {
          question: 'Is my text sent to a server or AI model?',
          answer: 'No. Everything runs entirely in your browser using pure JavaScript. Your text never leaves your device — there is no server, no API call, and no AI model download required.',
        },
        {
          question: 'What kind of text works best?',
          answer: 'This summarizer works best on articles, essays, reports, blog posts, and other long-form written content with clear sentences. It is less effective on bulleted lists, code, or very short text with fewer than a handful of sentences.',
        },
        {
          question: 'Can I control the summary length?',
          answer: 'Yes. You can choose from Short (3 sentences), Medium (5 sentences), Long (8 sentences), or use the Custom slider to pick any number between 1 and 20 sentences.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Paste your text</span>
          </div>
          {input && <ClearButton onClear={clear} />}
        </div>

        {/* Input textarea */}
        <ToolTextarea
          value={input}
          onChange={setInput}
          placeholder="Paste an article, essay, report, or any long text here to summarize..."
          rows={12}
        />

        {/* Summary length selector */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Summary Length</span>
          <div className="flex flex-wrap gap-2">
            {presetButtons.map(btn => (
              <button
                key={btn.key}
                onClick={() => setPreset(btn.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preset === btn.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground border border-border'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={bulletMode} onChange={(e) => setBulletMode(e.target.checked)} className="rounded border-border" />
            Bullet point output
          </label>
          {preset === 'custom' && (
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={20}
                value={customCount}
                onChange={e => setCustomCount(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-sm font-medium tabular-nums w-16 text-right">
                {customCount} {customCount === 1 ? 'sentence' : 'sentences'}
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 rounded-lg bg-muted text-sm">
              <span>
                Original: <strong>{formatNumber(result.origWords)}</strong> words ({result.totalSentences} sentences)
              </span>
              <span className="text-muted-foreground hidden sm:inline">→</span>
              <span>
                Summary: <strong>{formatNumber(result.summaryWords)}</strong> words ({result.sentences.length} sentences)
              </span>
              {result.reduction > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold">
                  {result.reduction}% reduction
                </span>
              )}
            </div>

            {/* Summary text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Summary</span>
                <CopyButton text={bulletMode ? result.sentences.map(s => `• ${s}`).join('\n') : result.summaryText} />
              </div>
              <ToolTextarea value={bulletMode ? result.sentences.map(s => `• ${s}`).join('\n') : result.summaryText} readOnly rows={6} />
            </div>

            {/* Key points */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <List className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Key Points</span>
                </div>
                <CopyButton text={result.sentences.map(s => `• ${s}`).join('\n')} />
              </div>
              <ul className="space-y-2">
                {result.sentences.map((sentence, i) => (
                  <li key={i} className="flex gap-2 text-sm p-2 rounded-lg bg-muted">
                    <span className="text-primary font-bold mt-0.5 shrink-0">•</span>
                    <span>{sentence}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Empty state hint */}
        {!input.trim() && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Paste or type your text above to generate an instant summary.
          </p>
        )}
      </div>
    </ToolPage>
  )
}
