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
            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when generating test data, creating repeated patterns, filling templates, or producing bulk text for testing. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text generation tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For very long documents, processing is instant but rendering the output may take a brief moment.</li>
            <li>The tool handles Unicode text correctly, including accented characters, CJK scripts, and emoji.</li>
            <li>Use the undo function in your browser (Ctrl+Z) if you need to revert input changes.</li>
            <li>Combine multiple text operations by copying the output of one tool into the input of another.</li>
            <li>No text is stored or transmitted — all processing runs locally in your browser.</li>
          </ul>

          <h2>Use Cases for Text Repetition</h2>
          <p>Text repetition is a surprisingly common need across software development and content creation. <strong>Software testing</strong> frequently requires repeated strings to verify input field limits, test buffer overflow handling, and validate maximum length constraints in forms and APIs. <strong>Load testing</strong> tools often need large payloads — repeating a realistic text block thousands of times creates test data that simulates real-world usage patterns. Designers use repeated <strong>placeholder content</strong> to fill layouts and preview how text wraps across different screen sizes, particularly when "Lorem ipsum" does not match the character profile of the final content. In <strong>CSS and web design</strong>, repeated characters like dots, dashes, or decorative symbols create visual patterns for separators, borders, and background textures. Database administrators also use repeated text to populate test tables with realistic data volumes for performance benchmarking.</p>

          <h2>Text Repeater in Programming</h2>
          <p>Most programming languages offer built-in ways to repeat strings, but this tool is faster for one-off tasks. In <strong>JavaScript</strong>, use <code>&apos;hello&apos;.repeat(3)</code> to get <code>&apos;hellohellohello&apos;</code> — note that the built-in method does not add separators between repetitions, so you would need <code>Array(3).fill(&apos;hello&apos;).join(&apos;\n&apos;)</code> for separated output. In <strong>Python</strong>, string multiplication works with the <code>*</code> operator: <code>&apos;hello&apos; * 3</code> produces <code>&apos;hellohellohello&apos;</code>, and for separated repetition you can use <code>&apos;\n&apos;.join([&apos;hello&apos;] * 3)</code>. This online tool handles both approaches — repetition with and without separators — without writing any code, making it ideal for quick tasks, non-developers, and situations where you need the result in your clipboard rather than in a script.</p>
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
