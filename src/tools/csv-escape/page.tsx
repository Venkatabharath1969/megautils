'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function csvEscape(str: string): string {
  const needsQuoting = str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')
  if (!needsQuoting) return str
  return '"' + str.replace(/"/g, '""') + '"'
}

function csvUnescape(str: string): string {
  let s = str.trim()
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1)
    s = s.replace(/""/g, '"')
  }
  return s
}

function csvEscapeMultiline(input: string): string {
  return input.split('\n').map(line => csvEscape(line)).join('\n')
}

function csvUnescapeMultiline(input: string): string {
  return input.split('\n').map(line => csvUnescape(line)).join('\n')
}

export default function CsvEscapeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape')

  const process = () => {
    setOutput(mode === 'escape' ? csvEscapeMultiline(input) : csvUnescapeMultiline(input))
  }

  const clear = () => { setInput(''); setOutput('') }

  return (
    <ToolPage title="CSV Field Escape / Unescape" description="Escape or unescape strings for CSV fields. Handles quote wrapping and double-quote escaping." category="string" categoryLabel="String Utilities">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setMode('escape')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'escape' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Escape</button>
        <button onClick={() => setMode('unescape')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'unescape' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Unescape</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input (one field per line)</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'escape' ? 'Enter CSV fields, one per line...\nHello, World\nShe said "hi"\nPlain text' : 'Enter escaped CSV fields...\n"Hello, World"\n"She said ""hi"""\nPlain text'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>

      <button onClick={process} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        {mode === 'escape' ? 'Escape Fields' : 'Unescape Fields'}
      </button>
    </ToolPage>
  )
}
