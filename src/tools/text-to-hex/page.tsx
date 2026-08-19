'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

type HexFormat = 'space' | '0x' | '\\x' | 'colon' | 'none'

function textToHex(text: string, format: HexFormat, uppercase: boolean): string {
  const bytes = new TextEncoder().encode(text)
  const hexBytes = Array.from(bytes).map((b) => {
    const h = b.toString(16).padStart(2, '0')
    return uppercase ? h.toUpperCase() : h
  })
  switch (format) {
    case 'space': return hexBytes.join(' ')
    case '0x': return hexBytes.map((h) => `0x${h}`).join(' ')
    case '\\x': return hexBytes.map((h) => `\\x${h}`).join('')
    case 'colon': return hexBytes.join(':')
    case 'none': return hexBytes.join('')
  }
}

function hexToText(hex: string): string {
  // Strip common prefixes and separators to extract raw hex pairs
  const stripped = hex.replace(/0x/gi, '').replace(/\\x/gi, '').replace(/[^0-9a-fA-F\s:,]/g, '')
  const cleaned = stripped.replace(/[\s:,]+/g, ' ').trim()
  if (!cleaned) return ''
  // Split into individual hex tokens, then split any token longer than 2 chars into pairs
  const tokens = cleaned.split(/\s+/)
  const pairs: string[] = []
  for (const token of tokens) {
    if (token.length <= 2) {
      pairs.push(token)
    } else {
      for (let i = 0; i < token.length; i += 2) {
        pairs.push(token.substring(i, i + 2))
      }
    }
  }
  try {
    const byteArray = pairs.map((b) => {
      const val = parseInt(b, 16)
      if (isNaN(val)) throw new Error('Invalid hex')
      return val
    })
    return new TextDecoder().decode(new Uint8Array(byteArray))
  } catch {
    return 'Error: Invalid hex input'
  }
}

const FORMAT_OPTIONS: { value: HexFormat; label: string; example: string }[] = [
  { value: 'space', label: 'Space separated', example: '48 65 6c' },
  { value: '0x', label: '0x prefix', example: '0x48 0x65 0x6c' },
  { value: '\\x', label: '\\x prefix', example: '\\x48\\x65\\x6c' },
  { value: 'colon', label: 'Colon separated', example: '48:65:6c' },
  { value: 'none', label: 'No separator', example: '48656c' },
]

export default function TextToHexTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [format, setFormat] = useState<HexFormat>('space')
  const [uppercase, setUppercase] = useState(false)

  const output = useMemo(() => {
    if (!input) return ''
    return mode === 'encode' ? textToHex(input, format, uppercase) : hexToText(input)
  }, [input, mode, format, uppercase])

  return (
    <ToolPage
      title="Text to Hex"
      description="Convert text to hexadecimal representation and hex back to text."
      category="encoders"
      categoryLabel="Encoders & Decoders"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text to Hex is a free browser-based tool that lets you convert text to hexadecimal byte representation and decode hex strings back to readable text. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Choose your operation mode — <strong>encode</strong> or <strong>decode</strong>.</li>
            <li>Paste or type your input text in the source field.</li>
            <li>The converted result appears <strong>instantly</strong> in the output field.</li>
            <li>Copy the result for use in your code, API requests, or documents.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when debugging network protocols, analyzing binary data, or understanding character encoding at the byte level. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this computing tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is hexadecimal text encoding?', answer: 'Each character is converted to its ASCII code and displayed as a two-digit hexadecimal (base-16) number. For example, "A" becomes "41" and "z" becomes "7a".' },
        { question: 'Where is hex encoding commonly used?', answer: 'Hex encoding is widely used in debugging, color codes (like #FF5733), memory addresses, network packet analysis, and representing binary data in a human-readable format.' },
        { question: 'What is the difference between hex and binary encoding?', answer: 'Hex uses base-16 (digits 0-9 and letters A-F) while binary uses base-2 (only 0s and 1s). Hex is more compact since one hex digit represents exactly four binary digits.' },
      ]}
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => { setMode('encode'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
          Text &rarr; Hex
        </button>
        <button onClick={() => { setMode('decode'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
          Hex &rarr; Text
        </button>
        {mode === 'encode' && (
          <>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as HexFormat)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-secondary text-secondary-foreground border border-border transition-colors"
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label} ({opt.example})</option>
              ))}
            </select>
            <button
              onClick={() => setUppercase((v) => !v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uppercase ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
            >
              {uppercase ? 'UPPERCASE' : 'lowercase'}
            </button>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Text Input' : 'Hex Input'}</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'encode' ? 'Enter text to convert...' : 'Enter hex values (any format: space/colon/0x/\\x separated)...'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Hex Output' : 'Text Output'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>
    </ToolPage>
  )
}
