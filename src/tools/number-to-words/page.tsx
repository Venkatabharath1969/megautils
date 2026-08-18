'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function numberToWords(num: number): string {
  if (num === 0) return 'zero'

  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  const scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion']

  const isNegative = num < 0
  num = Math.abs(num)

  // Handle decimals
  const parts = num.toString().split('.')
  const intPart = parseInt(parts[0], 10)
  const decPart = parts.length > 1 ? parts[1] : null

  function convertChunk(n: number): string {
    if (n === 0) return ''
    if (n < 20) return ones[n]
    if (n < 100) {
      const t = tens[Math.floor(n / 10)]
      const o = ones[n % 10]
      return o ? `${t}-${o}` : t
    }
    const h = ones[Math.floor(n / 100)]
    const remainder = n % 100
    if (remainder === 0) return `${h} hundred`
    return `${h} hundred ${convertChunk(remainder)}`
  }

  if (intPart === 0 && decPart) {
    const decWords = decPart.split('').map((d) => ones[parseInt(d)] || 'zero').join(' ')
    return `${isNegative ? 'negative ' : ''}zero point ${decWords}`
  }

  const chunks: string[] = []
  let remaining = intPart
  let scaleIndex = 0

  while (remaining > 0) {
    const chunk = remaining % 1000
    if (chunk > 0) {
      const chunkWords = convertChunk(chunk)
      const scale = scales[scaleIndex]
      chunks.unshift(scale ? `${chunkWords} ${scale}` : chunkWords)
    }
    remaining = Math.floor(remaining / 1000)
    scaleIndex++
  }

  let result = chunks.join(', ')

  if (decPart) {
    const decWords = decPart.split('').map((d) => {
      const n = parseInt(d)
      return n === 0 ? 'zero' : ones[n]
    }).join(' ')
    result += ` point ${decWords}`
  }

  return (isNegative ? 'negative ' : '') + result
}

export default function NumberToWordsTool() {
  const [input, setInput] = useState('1234')

  const words = useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return ''
    const num = parseFloat(trimmed)
    if (isNaN(num)) return 'Please enter a valid number'
    if (Math.abs(num) > 999999999999999) return 'Number too large (max: quadrillions)'
    return numberToWords(num)
  }, [input])

  const examples = [
    { num: '42', desc: 'Simple number' },
    { num: '1234', desc: 'Thousands' },
    { num: '1000000', desc: 'Million' },
    { num: '1234567890', desc: 'Billions' },
    { num: '-500', desc: 'Negative' },
    { num: '3.14', desc: 'Decimal' },
  ]

  return (
    <ToolPage
      title="Number to Words"
      description="Convert numbers to English words. Handles up to quadrillions, negatives, and decimals."
      category="math"
      categoryLabel="Math & Science"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Number to Words is a free browser-based tool that lets you convert numeric values to their written word equivalents in English (e.g., 42 becomes 'forty-two'). It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when writing checks, generating invoices in words, creating legal documents, or accessibility requirements. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this document preparation tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need number conversion.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I convert a number to words?', answer: 'Type or paste any number into the input field and it is instantly converted to its English word equivalent.' },
        { question: 'What is the largest number this tool can convert?', answer: 'This tool handles numbers up to the quadrillions (999,999,999,999,999) as well as negative numbers and decimals.' },
        { question: 'How are decimal numbers written in words?', answer: 'The whole part is converted normally, then "point" is added followed by each decimal digit spoken individually (e.g., 3.14 becomes "three point one four").' },
        { question: 'Can I convert negative numbers to words?', answer: 'Yes, negative numbers are prefixed with the word "negative" followed by the number in words.' },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Enter a Number</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 1234"
            className="w-full h-12 px-4 rounded-lg border border-input bg-tool-bg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Result */}
        {words && (
          <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">In Words</div>
                <div className="text-xl font-semibold capitalize">{words}</div>
              </div>
              <CopyButton text={words} />
            </div>
          </div>
        )}

        {/* Examples */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Quick Examples</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {examples.map((ex) => (
              <button
                key={ex.num}
                onClick={() => setInput(ex.num)}
                className="p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
              >
                <div className="font-mono text-sm font-medium">{ex.num}</div>
                <div className="text-xs text-muted-foreground">{ex.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
