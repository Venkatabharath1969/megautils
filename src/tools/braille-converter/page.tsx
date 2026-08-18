'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

const BRAILLE_MAP: Record<string, string> = {
  'a': '\u2801', 'b': '\u2803', 'c': '\u2809', 'd': '\u2819', 'e': '\u2811',
  'f': '\u280B', 'g': '\u281B', 'h': '\u2813', 'i': '\u280A', 'j': '\u281A',
  'k': '\u2805', 'l': '\u2807', 'm': '\u280D', 'n': '\u281D', 'o': '\u2815',
  'p': '\u280F', 'q': '\u281F', 'r': '\u2817', 's': '\u280E', 't': '\u281E',
  'u': '\u2825', 'v': '\u2827', 'w': '\u283A', 'x': '\u282D', 'y': '\u283D',
  'z': '\u2835',
  '1': '\u2801', '2': '\u2803', '3': '\u2809', '4': '\u2819', '5': '\u2811',
  '6': '\u280B', '7': '\u281B', '8': '\u2813', '9': '\u280A', '0': '\u281A',
  ' ': ' ', '.': '\u2832', ',': '\u2802', '!': '\u2816', '?': '\u2826',
  '-': '\u2824', ';': '\u2806', ':': '\u2812', "'": '\u2804',
}

// Number indicator in Braille
const NUM_INDICATOR = '\u283C'

const REVERSE_BRAILLE: Record<string, string> = {}
for (const [key, value] of Object.entries(BRAILLE_MAP)) {
  if (key.length === 1 && /[a-z]/.test(key)) {
    REVERSE_BRAILLE[value] = key
  }
}
// Add punctuation to reverse
REVERSE_BRAILLE[' '] = ' '
REVERSE_BRAILLE['\u2832'] = '.'
REVERSE_BRAILLE['\u2802'] = ','
REVERSE_BRAILLE['\u2816'] = '!'
REVERSE_BRAILLE['\u2826'] = '?'
REVERSE_BRAILLE['\u2824'] = '-'
REVERSE_BRAILLE['\u2806'] = ';'
REVERSE_BRAILLE['\u2812'] = ':'
REVERSE_BRAILLE['\u2804'] = "'"

function textToBraille(text: string): string {
  let result = ''
  let inNumber = false

  for (const ch of text.toLowerCase()) {
    if (/[0-9]/.test(ch)) {
      if (!inNumber) {
        result += NUM_INDICATOR
        inNumber = true
      }
      result += BRAILLE_MAP[ch] || ch
    } else {
      inNumber = false
      result += BRAILLE_MAP[ch] || ch
    }
  }

  return result
}

function brailleToText(braille: string): string {
  let result = ''
  let inNumber = false

  for (const ch of braille) {
    if (ch === NUM_INDICATOR) {
      inNumber = true
      continue
    }
    if (ch === ' ') {
      inNumber = false
      result += ' '
      continue
    }
    if (inNumber && REVERSE_BRAILLE[ch]) {
      const letter = REVERSE_BRAILLE[ch]
      const numMap: Record<string, string> = {
        'a': '1', 'b': '2', 'c': '3', 'd': '4', 'e': '5',
        'f': '6', 'g': '7', 'h': '8', 'i': '9', 'j': '0'
      }
      result += numMap[letter] || letter
    } else {
      result += REVERSE_BRAILLE[ch] || ch
    }
  }

  return result
}

export default function BrailleConverterTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'toBraille' | 'fromBraille'>('toBraille')

  const output = useMemo(() => {
    if (!input) return ''
    try {
      return mode === 'toBraille' ? textToBraille(input) : brailleToText(input)
    } catch {
      return 'Error converting'
    }
  }, [input, mode])

  const clear = () => setInput('')

  return (
    <ToolPage
      title="Braille Converter"
      description="Convert text to Unicode Braille patterns and back. Supports A-Z, 0-9, and common punctuation."
      category="encoders"
      categoryLabel="Encoders & Decoders"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Braille Converter is a free browser-based tool that lets you convert text to Braille Unicode characters and Braille back to readable text. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating Braille representations for accessibility, education, or decorative purposes. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this accessibility tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need braille conversion.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I convert text to Braille?', answer: 'Type or paste text into the input field and it is instantly converted to Unicode Braille characters that you can copy and use anywhere.' },
        { question: 'What characters can be converted to Braille?', answer: 'This tool supports the English alphabet (A-Z), numbers (0-9), and common punctuation marks like periods, commas, and question marks.' },
        { question: 'Can I convert Braille back to text?', answer: 'Yes, switch to "Braille to Text" mode, paste Unicode Braille characters, and they will be decoded back to readable English text.' },
        { question: 'Is this the same as physical Braille?', answer: 'The patterns correspond to Grade 1 Braille (uncontracted), which maps each letter individually. Physical Braille books often use Grade 2 with contractions and abbreviations.' },
      ]}
    >
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setMode('toBraille'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'toBraille' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Text → Braille</button>
        <button onClick={() => { setMode('fromBraille'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'fromBraille' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Braille → Text</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'toBraille' ? 'Text Input' : 'Braille Input'}</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'toBraille' ? 'Type text to convert...' : 'Paste Braille characters...'} rows={8} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'toBraille' ? 'Braille Output' : 'Text Output'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={8} />
        </div>
      </div>

      {/* Reference Table */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-3">Braille Reference</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-2">
          {Object.entries(BRAILLE_MAP).filter(([k]) => /^[a-z]$/.test(k)).map(([char, braille]) => (
            <div key={char} className="flex flex-col items-center p-2 rounded-md bg-muted">
              <span className="text-2xl">{braille}</span>
              <span className="text-xs font-bold text-primary mt-1">{char.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  )
}
