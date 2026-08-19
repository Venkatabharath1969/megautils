'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let bits = ''
  for (const byte of bytes) {
    bits += byte.toString(2).padStart(8, '0')
  }
  // Pad to multiple of 5
  while (bits.length % 5 !== 0) {
    bits += '0'
  }

  let result = ''
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5)
    result += BASE32_ALPHABET[parseInt(chunk, 2)]
  }

  // Add padding
  const padMap: Record<number, number> = { 0: 0, 1: 6, 2: 4, 3: 3, 4: 1 }
  const remainder = bytes.length % 5
  const padCount = padMap[remainder] || 0
  result += '='.repeat(padCount)

  return result
}

function base32Decode(input: string): string {
  const cleaned = input.replace(/=+$/, '').toUpperCase()
  let bits = ''

  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch)
    if (idx === -1) throw new Error(`Invalid Base32 character: '${ch}'`)
    bits += idx.toString(2).padStart(5, '0')
  }

  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }

  return new TextDecoder().decode(new Uint8Array(bytes))
}

export default function Base32EncoderTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')

  const process = () => {
    try {
      setError('')
      if (mode === 'encode') {
        setOutput(base32Encode(input))
      } else {
        setOutput(base32Decode(input))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error processing input')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="Base32 Encoder / Decoder"
      description="Encode text to Base32 or decode Base32 to text (RFC 4648)"
      category="encoders"
      categoryLabel="Encoders & Decoders"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Base32 Encoder/Decoder is a free browser-based tool that lets you encode text to Base32 format or decode Base32 back to text. Base32 uses A-Z and 2-7 characters. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Choose your operation mode — <strong>encode</strong> or <strong>decode</strong>.</li>
            <li>Paste or type your input text in the source field.</li>
            <li>The converted result appears <strong>instantly</strong> in the output field.</li>
            <li>Copy the result for use in your code, API requests, or documents.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when encoding data for systems requiring case-insensitive alphanumeric representation, like TOTP secrets. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this encoding tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is Base32 encoding?', answer: 'Base32 is a binary-to-text encoding scheme defined in RFC 4648 that represents binary data using 32 ASCII characters (A-Z and 2-7). It is less space-efficient than Base64 but uses only uppercase letters and digits, avoiding case-sensitivity issues.' },
        { question: 'What is the difference between Base32 and Base64?', answer: 'Base32 uses 32 characters (A-Z, 2-7) and increases data size by about 60%, while Base64 uses 64 characters (A-Z, a-z, 0-9, +, /) and increases size by about 33%. Base32 is preferred when case-insensitivity is needed.' },
        { question: 'Where is Base32 commonly used?', answer: 'Base32 is used in TOTP two-factor authentication secrets, file naming on case-insensitive file systems, and certain DNS record encodings where only uppercase alphanumeric characters are safe.' },
      ]}
    >
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('encode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Encode</button>
        <button onClick={() => setMode('decode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Decode</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Text Input' : 'Base32 Input'}</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base32 to decode...'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Base32 Output' : 'Decoded Text'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <button onClick={process} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        {mode === 'encode' ? 'Encode to Base32' : 'Decode from Base32'}
      </button>
    </ToolPage>
  )
}
