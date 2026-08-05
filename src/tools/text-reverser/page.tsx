'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

type ReverseMode = 'characters' | 'words' | 'lines'

export default function TextReverserTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<ReverseMode>('characters')

  const output = useMemo(() => {
    if (!input) return ''
    switch (mode) {
      case 'characters':
        return [...input].reverse().join('')
      case 'words':
        return input.split('\n').map((line) => line.split(/\s+/).reverse().join(' ')).join('\n')
      case 'lines':
        return input.split('\n').reverse().join('\n')
      default:
        return input
    }
  }, [input, mode])

  const modes: { value: ReverseMode; label: string }[] = [
    { value: 'characters', label: 'Characters' },
    { value: 'words', label: 'Words' },
    { value: 'lines', label: 'Lines' },
  ]

  return (
    <ToolPage
      title="Text Reverser"
      description="Reverse text by characters, words, or lines."
      category="text"
      categoryLabel="Text Tools"
      faqs={[
        { question: 'How do I reverse text online?', answer: 'Paste your text into the input field and choose a reversal mode (characters, words, or lines). The reversed output appears instantly.' },
        { question: 'What is the difference between reversing characters, words, and lines?', answer: 'Character reversal flips every character ("hello" becomes "olleh"), word reversal reorders words in each line, and line reversal reorders the lines themselves.' },
        { question: 'Can I reverse text with emojis or special characters?', answer: 'Yes, this tool correctly handles Unicode characters including emojis, accented letters, and symbols when reversing.' },
      ]}
    >
      <div className="flex gap-2 mb-4">
        {modes.map((m) => (
          <button key={m.value} onClick={() => setMode(m.value)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Enter text to reverse..." rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Reversed Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Reversed text will appear here..." rows={10} />
        </div>
      </div>
    </ToolPage>
  )
}
