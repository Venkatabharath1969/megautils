'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function DuplicateLineRemoverTool() {
  const [input, setInput] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(true)
  const [trimWhitespace, setTrimWhitespace] = useState(false)
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false)

  const { output, removed } = useMemo(() => {
    if (!input) return { output: '', removed: 0 }
    const lines = input.split('\n')
    const seen = new Map<string, number>()
    const unique: string[] = []
    const duplicates: string[] = []
    let removedCount = 0
    for (const line of lines) {
      let key = caseSensitive ? line : line.toLowerCase()
      if (trimWhitespace) key = key.trim()
      const count = seen.get(key) || 0
      seen.set(key, count + 1)
      if (count > 0) {
        removedCount++
        duplicates.push(line)
      } else {
        unique.push(line)
      }
    }
    if (showDuplicatesOnly) {
      return { output: duplicates.join('\n'), removed: removedCount }
    }
    return { output: unique.join('\n'), removed: removedCount }
  }, [input, caseSensitive, trimWhitespace, showDuplicatesOnly])

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
            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when cleaning data lists, deduplicating log entries, preparing mailing lists, or tidying up copied content. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text processing tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I remove duplicate lines from text?', answer: 'Paste your text into the input field and all duplicate lines are automatically removed, keeping only the first occurrence of each unique line.' },
        { question: 'What is the difference between case-sensitive and case-insensitive duplicate removal?', answer: 'Case-sensitive treats "Hello" and "hello" as different lines, while case-insensitive considers them duplicates and keeps only the first one.' },
        { question: 'Does this tool preserve the original line order?', answer: 'Yes, the tool keeps lines in their original order and only removes subsequent duplicate occurrences.' },
        { question: 'Can I remove duplicates from a large text file?', answer: 'Yes, this tool processes text entirely in your browser with no upload limits, so it handles large texts efficiently.' },
      ]}
    >
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="rounded border-border" />
          Case-sensitive
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={trimWhitespace} onChange={(e) => setTrimWhitespace(e.target.checked)} className="rounded border-border" />
          Trim whitespace before comparing
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showDuplicatesOnly} onChange={(e) => setShowDuplicatesOnly(e.target.checked)} className="rounded border-border" />
          Show only duplicates
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
