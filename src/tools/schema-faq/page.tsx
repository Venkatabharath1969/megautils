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
    <ToolPage
      title="FAQ Schema Generator"
      description="Generate FAQPage JSON-LD structured data for SEO."
      category="seo"
      categoryLabel="SEO Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>FAQ Schema Generator is a free browser-based tool that lets you generate FAQPage JSON-LD structured data for frequently asked questions sections on your pages. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when getting FAQ rich snippets in search results that display expandable question-and-answer pairs. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this SEO tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need faq schema markup.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is FAQ schema markup?', answer: 'FAQ schema is JSON-LD structured data that marks up a page containing a list of questions and answers. It can make your page eligible for a rich FAQ snippet directly in Google search results.' },
        { question: 'How many questions should I include in FAQ schema?', answer: 'There is no strict limit, but Google typically displays 2-4 questions in the rich result. Include all relevant FAQs on your page, and Google will choose which ones to show.' },
        { question: 'Does FAQ schema guarantee a rich result in Google?', answer: 'No. Adding FAQ schema makes your page eligible for rich results, but Google decides whether to display them based on content quality, relevance, and other ranking factors.' },
        { question: 'Can I use FAQ schema on any page?', answer: 'FAQ schema should only be used on pages where the content is genuinely in a question-and-answer format authored by the site. It should not be used on forums or pages where users submit answers.' },
      ]}
    >
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
