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
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Caesar Cipher is a free browser-based tool that lets you encrypt and decrypt text using the Caesar cipher shift technique, one of the oldest known encryption methods. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when learning about classical cryptography, puzzle solving, or demonstrating basic encryption concepts. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this cryptography tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need caesar cipher encryption.</li>
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
