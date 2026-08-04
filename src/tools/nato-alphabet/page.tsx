'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

const NATO_MAP: Record<string, string> = {
  A: 'Alfa', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo',
  F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliet',
  K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar',
  P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango',
  U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee',
  Z: 'Zulu',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
}

const REVERSE_NATO: Record<string, string> = {}
for (const [key, value] of Object.entries(NATO_MAP)) {
  REVERSE_NATO[value.toLowerCase()] = key
}

function textToNato(text: string): string {
  return text
    .split('')
    .map((ch) => {
      const upper = ch.toUpperCase()
      if (NATO_MAP[upper]) return NATO_MAP[upper]
      if (ch === ' ') return '(space)'
      return ch
    })
    .join(' ')
}

function natoToText(nato: string): string {
  return nato
    .split(/\s+/)
    .map((word) => {
      if (word.toLowerCase() === '(space)') return ' '
      const found = REVERSE_NATO[word.toLowerCase()]
      return found || word
    })
    .join('')
}

export default function NatoAlphabetTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'toNato' | 'fromNato'>('toNato')

  const output = useMemo(() => {
    if (!input) return ''
    try {
      return mode === 'toNato' ? textToNato(input) : natoToText(input)
    } catch {
      return 'Error converting'
    }
  }, [input, mode])

  const clear = () => setInput('')

  return (
    <ToolPage title="NATO Phonetic Alphabet" description="Convert text to/from NATO phonetic alphabet (Alfa, Bravo, Charlie...)" category="encoders" categoryLabel="Encoders & Decoders">
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setMode('toNato'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'toNato' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Text → NATO</button>
        <button onClick={() => { setMode('fromNato'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'fromNato' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>NATO → Text</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'toNato' ? 'Text Input' : 'NATO Input'}</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'toNato' ? 'Type text to convert...' : 'Alfa Bravo Charlie...'} rows={8} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'toNato' ? 'NATO Output' : 'Text Output'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={8} />
        </div>
      </div>

      {/* Reference Table */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-3">NATO Phonetic Alphabet Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(NATO_MAP).map(([char, word]) => (
            <div key={char} className="flex items-center gap-2 p-2 rounded-md bg-muted text-sm">
              <span className="font-bold text-primary w-6 text-center">{char}</span>
              <span className="text-muted-foreground">{word}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  )
}
