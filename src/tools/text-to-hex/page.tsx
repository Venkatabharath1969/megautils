'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function textToHex(text: string): string {
  return text
    .split('')
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join(' ')
}

function hexToText(hex: string): string {
  const cleaned = hex.replace(/[^0-9a-fA-F\s]/g, '').trim()
  if (!cleaned) return ''
  const bytes = cleaned.split(/\s+/)
  try {
    return bytes.map((b) => String.fromCharCode(parseInt(b, 16))).join('')
  } catch {
    return 'Error: Invalid hex input'
  }
}

export default function TextToHexTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const output = useMemo(() => {
    if (!input) return ''
    return mode === 'encode' ? textToHex(input) : hexToText(input)
  }, [input, mode])

  return (
    <ToolPage title="Text to Hex" description="Convert text to hexadecimal representation and hex back to text." category="encoders" categoryLabel="Encoders & Decoders">
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setMode('encode'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
          Text &rarr; Hex
        </button>
        <button onClick={() => { setMode('decode'); setInput('') }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
          Hex &rarr; Text
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Text Input' : 'Hex Input'}</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'encode' ? 'Enter text to convert...' : 'Enter hex values (space-separated)...'} rows={10} />
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
