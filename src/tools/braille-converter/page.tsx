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
    <ToolPage title="Braille Converter" description="Convert text to Unicode Braille patterns and back. Supports A-Z, 0-9, and common punctuation." category="encoders" categoryLabel="Encoders & Decoders">
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
