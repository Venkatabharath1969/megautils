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
