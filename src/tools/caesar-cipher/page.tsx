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

const ENGLISH_FREQ: Record<string, number> = {
  a: 8.167, b: 1.492, c: 2.782, d: 4.253, e: 12.702, f: 2.228, g: 2.015,
  h: 6.094, i: 6.966, j: 0.153, k: 0.772, l: 4.025, m: 2.406, n: 6.749,
  o: 7.507, p: 1.929, q: 0.095, r: 5.987, s: 6.327, t: 9.056, u: 2.758,
  v: 0.978, w: 2.360, x: 0.150, y: 1.974, z: 0.074,
}

function getLetterFrequencies(text: string): Record<string, number> {
  const freq: Record<string, number> = {}
  let total = 0
  for (const ch of text.toLowerCase()) {
    if (ch >= 'a' && ch <= 'z') {
      freq[ch] = (freq[ch] || 0) + 1
      total++
    }
  }
  if (total === 0) return freq
  for (const key of Object.keys(freq)) {
    freq[key] = (freq[key] / total) * 100
  }
  return freq
}

function chiSquared(freq: Record<string, number>): number {
  let chi = 0
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(97 + i)
    const observed = freq[letter] || 0
    const expected = ENGLISH_FREQ[letter]
    chi += ((observed - expected) ** 2) / expected
  }
  return chi
}

function autoDetectShift(text: string): number {
  let bestShift = 0
  let bestChi = Infinity
  for (let s = 0; s < 26; s++) {
    const shifted = caesarShift(text, s)
    const freq = getLetterFrequencies(shifted)
    const chi = chiSquared(freq)
    if (chi < bestChi) {
      bestChi = chi
      bestShift = s
    }
  }
  return bestShift
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

  const letterFreq = useMemo(() => getLetterFrequencies(input), [input])

  const handleAutoDetect = () => {
    const detected = autoDetectShift(input)
    // autoDetectShift finds the shift that makes text look like English
    // So if text is encrypted with shift N, caesarShift(text, 26-N) gives English
    // detected is the shift that produces English, so decrypt shift = detected
    setShift(detected === 0 ? 0 : 26 - detected)
    setMode('decrypt')
  }

  const clear = () => setInput('')

  return (
    <ToolPage
      title="Caesar Cipher"
      description="Encrypt and decrypt text using Caesar cipher with configurable shift (1-25)"
      category="encoders"
      categoryLabel="Encoders & Decoders"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Caesar Cipher is a free browser-based tool that lets you encrypt and decrypt text using the Caesar cipher shift technique, one of the oldest known encryption methods. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Choose your operation mode — <strong>encode</strong> or <strong>decode</strong>.</li>
            <li>Paste or type your input text in the source field.</li>
            <li>The converted result appears <strong>instantly</strong> in the output field.</li>
            <li>Copy the result for use in your code, API requests, or documents.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when learning about classical cryptography, puzzle solving, or demonstrating basic encryption concepts. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this cryptography tool saves time and eliminates the need for desktop software installation.</p>

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

      {/* Frequency Analysis */}
      {input && Object.keys(letterFreq).length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Letter Frequency Analysis</h3>
            <button
              onClick={handleAutoDetect}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Auto-detect Shift
            </button>
          </div>
          <div className="flex items-end gap-0.5 h-32 p-3 rounded-lg bg-muted/30 border border-border">
            {'abcdefghijklmnopqrstuvwxyz'.split('').map((letter) => {
              const pct = letterFreq[letter] || 0
              const maxPct = Math.max(...Object.values(letterFreq), 1)
              const height = (pct / maxPct) * 100
              return (
                <div key={letter} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-primary/70 rounded-t-sm min-h-[1px] transition-all"
                    style={{ height: `${height}%` }}
                    title={`${letter.toUpperCase()}: ${pct.toFixed(1)}%`}
                  />
                  <span className="text-[8px] text-muted-foreground mt-0.5 leading-none">{letter.toUpperCase()}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
