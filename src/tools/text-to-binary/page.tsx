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
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text to Binary is a free browser-based tool that lets you convert text to binary (1s and 0s) representation and decode binary back to readable text. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Choose your operation mode — <strong>encode</strong> or <strong>decode</strong>.</li>
            <li>Paste or type your input text in the source field.</li>
            <li>The converted result appears <strong>instantly</strong> in the output field.</li>
            <li>Copy the result for use in your code, API requests, or documents.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when learning about binary encoding, demonstrating how computers store text, or creating binary-themed designs. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this computing tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Encoding is NOT encryption — encoded data can be decoded by anyone. Never use encoding to protect sensitive information.</li>
            <li>UTF-8 characters, emojis, and special symbols are fully supported in both encoding and decoding.</li>
            <li>When decoding, ensure the input is complete — partial or corrupted encoded strings may produce unexpected results.</li>
            <li>Check for unwanted whitespace or line breaks that may have been introduced during copy-paste operations.</li>
            <li>Processing is entirely local — your data never leaves your browser.</li>
          </ul>
        </>
      }
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
