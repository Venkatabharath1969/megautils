'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function caesarShift(text: string, shift: number): string {
  return text
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0)
      // Uppercase
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65)
      }
      // Lowercase
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97)
      }
      return ch
    })
    .join('')
}

export default function CaesarCipherTool() {
  const [input, setInput] = useState('')
  const [shift, setShift] = useState(13)
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')

  const output = useMemo(() => {
    if (!input) return ''
    const effectiveShift = mode === 'encrypt' ? shift : -shift
    return caesarShift(input, effectiveShift)
  }, [input, shift, mode])

  const clear = () => setInput('')

  return (
    <ToolPage
      title="Caesar Cipher"
      description="Encrypt and decrypt text using Caesar cipher with configurable shift (1-25)"
      category="encoders"
      categoryLabel="Encoders & Decoders"
      faqs={[
        { question: 'What is a Caesar cipher?', answer: 'A Caesar cipher is one of the oldest encryption techniques, named after Julius Caesar. It works by shifting each letter in the text by a fixed number of positions in the alphabet.' },
        { question: 'How do I decrypt a Caesar cipher without knowing the shift?', answer: 'Use the brute force table shown below the output. It displays all 25 possible shifts at once, so you can visually scan for the one that produces readable text.' },
        { question: 'Is Caesar cipher the same as ROT13?', answer: 'ROT13 is a specific case of the Caesar cipher with a shift of 13. Since the alphabet has 26 letters, ROT13 is its own inverse, meaning encoding and decoding use the same operation.' },
        { question: 'Is the Caesar cipher secure?', answer: 'No. The Caesar cipher is trivially easy to break since there are only 25 possible shifts to try. It is used for learning and puzzles, not for securing sensitive data.' },
      ]}
    >
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex gap-2">
          <button onClick={() => setMode('encrypt')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encrypt' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Encrypt</button>
          <button onClick={() => setMode('decrypt')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decrypt' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Decrypt</button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Shift:</label>
          <input
            type="range"
            min={1}
            max={25}
            value={shift}
            onChange={(e) => setShift(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm font-mono font-bold w-6 text-center">{shift}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input Text</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Enter text to encrypt or decrypt..." rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encrypt' ? 'Encrypted Output' : 'Decrypted Output'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>

      {/* All shifts preview */}
      {input && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3">All Shifts (Brute Force)</h3>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
            {Array.from({ length: 25 }, (_, i) => i + 1).map((s) => (
              <div key={s} className={`flex items-center gap-3 px-3 py-1.5 text-sm ${s === shift ? 'bg-primary/10 font-medium' : 'hover:bg-muted'} ${s > 1 ? 'border-t border-border' : ''}`}>
                <span className="text-muted-foreground w-12 shrink-0">ROT-{s}</span>
                <span className="font-mono truncate">{caesarShift(input, s).slice(0, 100)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolPage>
  )
}
