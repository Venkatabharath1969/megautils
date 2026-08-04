'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function UrlEncoderTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodeType, setEncodeType] = useState<'component' | 'full'>('component')
  const [error, setError] = useState('')

  const process = () => {
    try {
      if (mode === 'encode') {
        setOutput(
          encodeType === 'component'
            ? encodeURIComponent(input)
            : encodeURI(input)
        )
      } else {
        setOutput(
          encodeType === 'component'
            ? decodeURIComponent(input)
            : decodeURI(input)
        )
      }
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input for ' + mode)
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="URL Encoder / Decoder" description="Encode or decode URLs and URL components" category="encoders" categoryLabel="Encoders & Decoders">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setMode('encode')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
        >
          Decode
        </button>
        <select
          value={encodeType}
          onChange={(e) => setEncodeType(e.target.value as 'component' | 'full')}
          className="h-9 px-3 rounded-md border border-input bg-card text-sm"
        >
          <option value="component">URI Component</option>
          <option value="full">Full URI</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Plain Text' : 'Encoded URL'}</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={mode === 'encode' ? 'Enter text to encode...\nhello world & foo=bar' : 'Enter encoded URL to decode...\nhello%20world%20%26%20foo%3Dbar'}
            rows={10}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>

      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}

      <button onClick={process} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
      </button>
    </ToolPage>
  )
}
