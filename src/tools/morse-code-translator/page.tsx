'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

const CHAR_TO_MORSE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
}

const MORSE_TO_CHAR: Record<string, string> = Object.fromEntries(
  Object.entries(CHAR_TO_MORSE).map(([k, v]) => [v, k])
)

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((char) => {
      if (char === ' ') return '/'
      return CHAR_TO_MORSE[char] || ''
    })
    .filter(Boolean)
    .join(' ')
}

function morseToText(morse: string): string {
  return morse
    .split(' ')
    .map((code) => {
      if (code === '/' || code === '') return ' '
      return MORSE_TO_CHAR[code] || '?'
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function MorseCodeTranslatorTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const output = useMemo(() => {
    if (!input) return ''
    return mode === 'encode' ? textToMorse(input) : morseToText(input)
  }, [input, mode])

  return (
    <ToolPage title="Morse Code Translator" description="Convert text to Morse code and Morse code back to text." category="encoders" categoryLabel="Encoders & Decoders">
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setMode('encode'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
          Text &rarr; Morse
        </button>
        <button onClick={() => { setMode('decode'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
          Morse &rarr; Text
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Text Input' : 'Morse Input'}</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'encode' ? 'Enter text to translate...' : 'Enter Morse code (dots, dashes, spaces, / for word break)...'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Morse Output' : 'Text Output'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>

      {/* Quick reference */}
      <details className="mt-4">
        <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">Morse Code Reference</summary>
        <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
          {Object.entries(CHAR_TO_MORSE).slice(0, 36).map(([char, code]) => (
            <div key={char} className="p-2 rounded bg-muted text-center">
              <div className="font-bold text-sm">{char}</div>
              <div className="text-xs text-muted-foreground font-mono">{code}</div>
            </div>
          ))}
        </div>
      </details>
    </ToolPage>
  )
}
