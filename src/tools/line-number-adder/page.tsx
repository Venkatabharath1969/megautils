'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function LineNumberAdderTool() {
  const [input, setInput] = useState('')
  const [startNumber, setStartNumber] = useState(1)
  const [separator, setSeparator] = useState('. ')

  const output = useMemo(() => {
    if (!input) return ''
    const lines = input.split('\n')
    const maxNumWidth = String(startNumber + lines.length - 1).length
    return lines.map((line, i) => {
      const num = String(startNumber + i).padStart(maxNumWidth, ' ')
      return `${num}${separator}${line}`
    }).join('\n')
  }, [input, startNumber, separator])

  return (
    <ToolPage
      title="Line Number Adder"
      description="Add line numbers to text with configurable start number and separator."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Line Number Adder is a free browser-based tool that lets you add sequential line numbers to each line of text with configurable starting number and separator style. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when preparing code for documentation, creating numbered reference lists, or formatting text for technical discussions. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text processing tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need line numbering.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I add line numbers to text?', answer: 'Paste your text into the input field and line numbers are automatically added to the beginning of each line in the output.' },
        { question: 'Can I start line numbering from a number other than 1?', answer: 'Yes, use the "Start at" field to set any starting number, such as 0 or 100.' },
        { question: 'Can I customize the separator between the number and text?', answer: 'Yes, you can change the separator to any string like a period, colon, tab, or custom characters using the separator field.' },
      ]}
    >
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Start at:</label>
          <input
            type="number"
            min={0}
            value={startNumber}
            onChange={(e) => setStartNumber(parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-1.5 text-sm rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Separator:</label>
          <input
            type="text"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-24 px-3 py-1.5 text-sm rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Enter text to add line numbers..." rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Numbered Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Numbered text will appear here..." rows={12} />
        </div>
      </div>
    </ToolPage>
  )
}
