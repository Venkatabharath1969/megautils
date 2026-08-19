'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

export default function StringLengthCalculatorTool() {
  const [input, setInput] = useState('')

  const stats = useMemo(() => {
    const charCount = [...input].length // Handles surrogate pairs correctly
    const utf16Length = input.length    // JavaScript string length (UTF-16 code units)
    const byteLength = new TextEncoder().encode(input).length // UTF-8 byte length
    const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0
    const lineCount = input ? input.split('\n').length : 0
    return { charCount, utf16Length, byteLength, wordCount, lineCount }
  }, [input])

  return (
    <ToolPage
      title="String Length Calculator"
      description="Analyze text length: character count, UTF-8 byte length, UTF-16 length, word count, and line count."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>String Length Calculator is a free browser-based tool that lets you count the exact number of characters, bytes, words, and lines in a text string with Unicode support. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when verifying string lengths for database fields, API input limits, SMS character counts, or programming constraints. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For very long documents, processing is instant but rendering the output may take a brief moment.</li>
            <li>The tool handles Unicode text correctly, including accented characters, CJK scripts, and emoji.</li>
            <li>Use the undo function in your browser (Ctrl+Z) if you need to revert input changes.</li>
            <li>Combine multiple text operations by copying the output of one tool into the input of another.</li>
            <li>No text is stored or transmitted — all processing runs locally in your browser.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is the difference between character count and byte length?', answer: 'Character count is the number of visible characters, while byte length measures storage size in UTF-8 encoding where non-ASCII characters use 2-4 bytes each.' },
        { question: 'Why is UTF-16 length different from character count?', answer: 'UTF-16 length matches JavaScript\'s .length property, which counts surrogate pairs (like emojis) as 2 units instead of 1 character.' },
        { question: 'How are words counted?', answer: 'Words are counted by splitting text on whitespace, so any sequence of non-space characters separated by spaces, tabs, or newlines counts as one word.' },
      ]}
    >
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Characters', value: stats.charCount },
          { label: 'UTF-8 Bytes', value: stats.byteLength },
          { label: 'UTF-16 Length', value: stats.utf16Length },
          { label: 'Words', value: stats.wordCount },
          { label: 'Lines', value: stats.lineCount },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-muted text-center">
            <div className="text-xl font-bold text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Input Text</span>
        <ClearButton onClear={() => setInput('')} />
      </div>
      <ToolTextarea value={input} onChange={setInput} placeholder="Enter or paste text to analyze..." rows={10} />
    </ToolPage>
  )
}
