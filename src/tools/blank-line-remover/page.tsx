'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function BlankLineRemoverTool() {
  const [input, setInput] = useState('')

  const { output, removed } = useMemo(() => {
    if (!input) return { output: '', removed: 0 }
    const lines = input.split('\n')
    const filtered = lines.filter((line) => line.trim().length > 0)
    return { output: filtered.join('\n'), removed: lines.length - filtered.length }
  }, [input])

  return (
    <ToolPage
      title="Blank Line Remover"
      description="Remove all blank and empty lines from text."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Blank Line Remover is a free browser-based tool that lets you remove empty lines and extra whitespace from text documents. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when cleaning up copied text, preparing data for processing, or tidying code. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text processing tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need blank line removal.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I remove blank lines from text?', answer: 'Paste your text into the input box and all empty or whitespace-only lines are instantly removed from the output.' },
        { question: 'Does this tool remove lines that only contain spaces or tabs?', answer: 'Yes, lines that contain only whitespace characters (spaces, tabs) are treated as blank and removed.' },
        { question: 'Will removing blank lines affect my other formatting?', answer: 'No, only completely empty or whitespace-only lines are removed. All other lines remain unchanged with their original content and indentation.' },
      ]}
    >
      {input && (
        <div className="mb-4 p-3 rounded-lg bg-muted text-center">
          <span className="text-sm text-muted-foreground">
            Removed <span className="font-bold text-primary">{removed}</span> blank line{removed !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Paste text with blank lines..." rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Cleaned text will appear here..." rows={12} />
        </div>
      </div>
    </ToolPage>
  )
}
