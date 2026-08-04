'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

interface QAPair {
  question: string
  answer: string
}

export default function SchemaFaqTool() {
  const [pairs, setPairs] = useState<QAPair[]>([{ question: '', answer: '' }])

  const updatePair = (index: number, field: keyof QAPair, value: string) => {
    const updated = [...pairs]
    updated[index] = { ...updated[index], [field]: value }
    setPairs(updated)
  }

  const addPair = () => setPairs([...pairs, { question: '', answer: '' }])

  const removePair = (index: number) => {
    if (pairs.length > 1) setPairs(pairs.filter((_, i) => i !== index))
  }

  const output = useMemo(() => {
    const validPairs = pairs.filter(p => p.question.trim() || p.answer.trim())
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: validPairs.map(p => ({
        '@type': 'Question',
        name: p.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: p.answer,
        },
      })),
    }
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }, [pairs])

  const clear = () => setPairs([{ question: '', answer: '' }])

  const inputClass = 'w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage title="FAQ Schema Generator" description="Generate FAQPage JSON-LD structured data for SEO." category="seo" categoryLabel="SEO Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Questions & Answers</h2>
            <ClearButton onClear={clear} />
          </div>

          {pairs.map((pair, i) => (
            <div key={i} className="p-3 rounded-lg border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Q&A #{i + 1}</span>
                {pairs.length > 1 && (
                  <button onClick={() => removePair(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                )}
              </div>
              <input type="text" value={pair.question} onChange={e => updatePair(i, 'question', e.target.value)} placeholder="Question..." className={inputClass} />
              <textarea value={pair.answer} onChange={e => updatePair(i, 'answer', e.target.value)} placeholder="Answer..." rows={2} className={inputClass} />
            </div>
          ))}

          <button onClick={addPair} className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            + Add Question
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Generated JSON-LD</span>
            <CopyButton text={output} />
          </div>
          <pre className="w-full rounded-lg border border-input bg-tool-bg p-3 text-xs font-mono overflow-auto whitespace-pre-wrap min-h-[300px]">{output}</pre>
        </div>
      </div>
    </ToolPage>
  )
}
