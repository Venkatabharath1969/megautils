'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97
    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base)
  })
}

export default function Rot13EncoderTool() {
  const [input, setInput] = useState('')

  const output = useMemo(() => rot13(input), [input])

  return (
    <ToolPage
      title="ROT13 Encoder / Decoder"
      description="Apply ROT13 cipher to encode or decode text. ROT13 is its own inverse."
      category="encoders"
      categoryLabel="Encoders & Decoders"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>ROT13 Encoder is a free browser-based tool that lets you apply ROT13 substitution cipher that shifts each letter 13 positions in the alphabet, or decode ROT13-encoded text. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when obscuring spoilers, puzzle creation, or learning about basic substitution ciphers — ROT13 is its own inverse. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this cryptography tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need rot13 encoding.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is ROT13?', answer: 'ROT13 is a simple letter substitution cipher that replaces each letter with the letter 13 positions after it in the alphabet. Since the alphabet has 26 letters, applying ROT13 twice returns the original text.' },
        { question: 'Is ROT13 secure encryption?', answer: 'No. ROT13 provides no cryptographic security whatsoever. It is used only for obscuring text, such as hiding spoilers or puzzle answers, not for protecting sensitive information.' },
        { question: 'Does ROT13 work with numbers and special characters?', answer: 'No. ROT13 only transforms the 26 English letters (A-Z, a-z). Numbers, punctuation, spaces, and non-Latin characters pass through unchanged.' },
      ]}
    >
      <div className="mb-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
        ROT13 shifts each letter 13 positions in the alphabet. Applying it twice returns the original text.
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Enter text to encode/decode with ROT13..." rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">ROT13 Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="ROT13 result will appear here..." rows={10} />
        </div>
      </div>
    </ToolPage>
  )
}
