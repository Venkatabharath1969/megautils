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
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text Reverser is a free browser-based tool that lets you reverse text at the character level, word level, or line level for various text manipulation needs. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating palindrome tests, generating reversed text for puzzles, or debugging string encoding issues. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text processing tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need text reversal.</li>
          </ul>
        </>
      }
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
