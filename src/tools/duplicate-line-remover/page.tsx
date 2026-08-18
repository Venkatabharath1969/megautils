'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function DuplicateLineRemoverTool() {
  const [input, setInput] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(true)

  const { output, removed } = useMemo(() => {
    if (!input) return { output: '', removed: 0 }
    const lines = input.split('\n')
    const seen = new Set<string>()
    const unique: string[] = []
    let removedCount = 0
    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase()
      if (seen.has(key)) {
        removedCount++
      } else {
        seen.add(key)
        unique.push(line)
      }
    }
    return { output: unique.join('\n'), removed: removedCount }
  }, [input, caseSensitive])

  return (
    <ToolPage
      title="Duplicate Line Remover"
      description="Remove duplicate lines from text. Supports case-sensitive and case-insensitive matching."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Duplicate Line Remover is a free browser-based tool that lets you remove duplicate lines from text while optionally preserving the original order of first occurrences. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when cleaning data lists, deduplicating log entries, preparing mailing lists, or tidying up copied content. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text processing tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need duplicate removal.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I remove duplicate lines from text?', answer: 'Paste your text into the input field and all duplicate lines are automatically removed, keeping only the first occurrence of each unique line.' },
        { question: 'What is the difference between case-sensitive and case-insensitive duplicate removal?', answer: 'Case-sensitive treats "Hello" and "hello" as different lines, while case-insensitive considers them duplicates and keeps only the first one.' },
        { question: 'Does this tool preserve the original line order?', answer: 'Yes, the tool keeps lines in their original order and only removes subsequent duplicate occurrences.' },
        { question: 'Can I remove duplicates from a large text file?', answer: 'Yes, this tool processes text entirely in your browser with no upload limits, so it handles large texts efficiently.' },
      ]}
    >
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="rounded border-border" />
          Case-sensitive
        </label>
        {input && (
          <span className="text-xs text-muted-foreground">
            {removed} duplicate{removed !== 1 ? 's' : ''} removed
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Paste text with duplicate lines..." rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Unique lines will appear here..." rows={12} />
        </div>
      </div>
    </ToolPage>
  )
}
