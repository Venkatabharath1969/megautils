'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function textToBinary(text: string): string {
  return text
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ')
}

function binaryToText(binary: string): string {
  const cleaned = binary.replace(/[^01\s]/g, '').trim()
  if (!cleaned) return ''
  const bytes = cleaned.split(/\s+/)
  try {
    return bytes.map((b) => String.fromCharCode(parseInt(b, 2))).join('')
  } catch {
    return 'Error: Invalid binary input'
  }
}

export default function TextToBinaryTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const output = useMemo(() => {
    if (!input) return ''
    return mode === 'encode' ? textToBinary(input) : binaryToText(input)
  }, [input, mode])

  return (
    <ToolPage
      title="Text to Binary"
      description="Convert text to 8-bit binary representation and binary back to text."
      category="encoders"
      categoryLabel="Encoders & Decoders"
      faqs={[
        { question: 'How does text to binary conversion work?', answer: 'Each character is converted to its ASCII code number, which is then represented as an 8-bit binary string of 0s and 1s. For example, the letter "A" (ASCII 65) becomes "01000001".' },
        { question: 'Why are binary values separated by spaces?', answer: 'Spaces separate each 8-bit byte so you can distinguish individual characters. Without spaces, the binary string would be ambiguous and impossible to decode back to text.' },
        { question: 'Can I convert binary back to readable text?', answer: 'Yes, switch to the "Binary to Text" mode and paste space-separated 8-bit binary values to decode them back into the original text characters.' },
      ]}
    >
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setMode('encode'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
          Text &rarr; Binary
        </button>
        <button onClick={() => { setMode('decode'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
          Binary &rarr; Text
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Text Input' : 'Binary Input'}</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'encode' ? 'Enter text to convert...' : 'Enter binary (space-separated bytes)...'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Binary Output' : 'Text Output'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>
    </ToolPage>
  )
}
