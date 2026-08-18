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
    <ToolPage
      title="Morse Code Translator"
      description="Convert text to Morse code and Morse code back to text."
      category="encoders"
      categoryLabel="Encoders & Decoders"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Morse Code Translator is a free browser-based tool that lets you translate text to Morse code (dots and dashes) and decode Morse code back to readable text. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when learning Morse code, encoding messages for educational purposes, or decoding historical Morse transmissions. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this communication tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need morse code.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I translate text to Morse code?', answer: 'Enter your text in the input field and it is instantly converted to dots and dashes. Spaces between letters and "/" between words separate the Morse symbols.' },
        { question: 'How do I read Morse code?', answer: 'Each letter is represented by a unique combination of dots (.) and dashes (-). Switch to "Morse to Text" mode and paste the Morse code to decode it.' },
        { question: 'What characters does Morse code support?', answer: 'Morse code covers the English alphabet (A-Z), numbers (0-9), and common punctuation marks like periods, commas, and question marks.' },
      ]}
    >
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
