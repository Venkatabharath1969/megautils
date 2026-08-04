'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function Base64EncoderTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const process = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input))))
      }
    } catch {
      setOutput('Error: Invalid input for ' + mode)
    }
  }

  const clear = () => { setInput(''); setOutput('') }

  return (
    <ToolPage title="Base64 Encoder / Decoder" description="Encode text to Base64 or decode Base64 to text. Supports UTF-8." category="encoders" categoryLabel="Encoders & Decoders">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('encode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Encode</button>
        <button onClick={() => setMode('decode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Decode</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Text Input' : 'Base64 Input'}</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={(v) => { setInput(v); }} placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>
      <button onClick={process} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
      </button>
    </ToolPage>
  )
}
