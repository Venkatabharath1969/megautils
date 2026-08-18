'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function TextRepeaterTool() {
  const [input, setInput] = useState('')
  const [count, setCount] = useState(3)
  const [separatorType, setSeparatorType] = useState<'newline' | 'space' | 'comma' | 'custom'>('newline')
  const [customSep, setCustomSep] = useState('')

  const separator = useMemo(() => {
    switch (separatorType) {
      case 'newline': return '\n'
      case 'space': return ' '
      case 'comma': return ', '
      case 'custom': return customSep
    }
  }, [separatorType, customSep])

  const output = useMemo(() => {
    if (!input || count < 1) return ''
    const safeCount = Math.min(count, 10000)
    return Array(safeCount).fill(input).join(separator)
  }, [input, count, separator])

  return (
    <ToolPage
      title="Text Repeater"
      description="Repeat text N times with a configurable separator."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text Repeater is a free browser-based tool that lets you repeat a text string a specified number of times with configurable separators between repetitions. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when generating test data, creating repeated patterns, filling templates, or producing bulk text for testing. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text generation tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need text repetition.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I repeat text multiple times?', answer: 'Enter your text, set the repeat count (up to 10,000), choose a separator, and the repeated output is generated instantly.' },
        { question: 'What separators can I use between repeated text?', answer: 'You can separate repeated text with a new line, space, comma, or any custom separator string you define.' },
        { question: 'Is there a limit to how many times I can repeat text?', answer: 'The tool supports up to 10,000 repetitions to ensure smooth browser performance.' },
        { question: 'Can I repeat multiple lines of text at once?', answer: 'Yes, paste any multi-line text and the entire block is repeated as a unit with your chosen separator between each copy.' },
      ]}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Input Text</span>
          <ClearButton onClear={() => { setInput(''); setCount(3) }} />
        </div>
        <ToolTextarea value={input} onChange={setInput} placeholder="Enter text to repeat..." rows={4} />

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Repeat Count</label>
            <input type="number" min={1} max={10000} value={count} onChange={e => setCount(parseInt(e.target.value) || 1)} className="w-28 rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Separator</label>
            <div className="flex gap-2">
              {(['newline', 'space', 'comma', 'custom'] as const).map(s => (
                <button key={s} onClick={() => setSeparatorType(s)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${separatorType === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                  {s === 'newline' ? 'New Line' : s}
                </button>
              ))}
            </div>
          </div>
          {separatorType === 'custom' && (
            <div>
              <label className="block text-sm font-medium mb-1">Custom Separator</label>
              <input type="text" value={customSep} onChange={e => setCustomSep(e.target.value)} placeholder=" | " className="w-32 rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output ({output.length} chars)</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Repeated text will appear here..." rows={8} />
        </div>
      </div>
    </ToolPage>
  )
}
