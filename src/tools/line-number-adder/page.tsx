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
            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when preparing code for documentation, creating numbered reference lists, or formatting text for technical discussions. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text processing tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For very long documents, processing is instant but rendering the output may take a brief moment.</li>
            <li>The tool handles Unicode text correctly, including accented characters, CJK scripts, and emoji.</li>
            <li>Use the undo function in your browser (Ctrl+Z) if you need to revert input changes.</li>
            <li>Combine multiple text operations by copying the output of one tool into the input of another.</li>
            <li>No text is stored or transmitted — all processing runs locally in your browser.</li>
          </ul>

          <h2>When to Add Line Numbers</h2>
          <p>Line numbers are essential in many professional workflows. During <strong>code review</strong>, numbered lines let reviewers reference specific locations in pull request comments — saying "see line 42" is far clearer than quoting surrounding code. In <strong>technical documentation</strong>, numbered code examples help readers follow along and match explanations to exact lines. <strong>Legal documents</strong> such as contracts, depositions, and court filings frequently require line numbering so that attorneys, judges, and witnesses can reference specific passages precisely. When analyzing <strong>log files</strong> from servers or applications, adding line numbers makes it easy to correlate error messages with timestamps and cross-reference with monitoring tools. Educators also use line-numbered text for <strong>literary analysis</strong> so students can cite specific lines in poems, plays, or prose passages.</p>

          <h2>Line Numbering Formats</h2>
          <p>Different contexts call for different numbering styles. The <strong>standard format</strong> (1, 2, 3...) is the most common and works well for most purposes — this tool uses right-aligned padding by default so that numbers stay neatly aligned regardless of the total line count. <strong>Zero-padded numbering</strong> (001, 002, 003...) is popular in programming and data processing because it maintains consistent string lengths, which simplifies sorting and parsing. You can achieve this by adjusting the start number in this tool. A <strong>prefix-style format</strong> uses a custom separator like a colon, tab, or pipe character between the number and the text — for example, <code>1: function main()</code> or <code>1 | function main()</code>. This tool lets you set any separator string, giving you full control over the output format. For programming contexts, a tab separator often works best since it aligns cleanly in monospaced fonts.</p>
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
