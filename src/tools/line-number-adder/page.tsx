'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function LineNumberAdderTool() {
  const [input, setInput] = useState('')
  const [startNumber, setStartNumber] = useState(1)
  const [separator, setSeparator] = useState('. ')

  const output = useMemo(() => {
    if (!input) return ''
    const lines = input.split('\n')
    const maxNumWidth = String(startNumber + lines.length - 1).length
    return lines.map((line, i) => {
      const num = String(startNumber + i).padStart(maxNumWidth, ' ')
      return `${num}${separator}${line}`
    }).join('\n')
  }, [input, startNumber, separator])

  return (
    <ToolPage title="Line Number Adder" description="Add line numbers to text with configurable start number and separator." category="text" categoryLabel="Text Tools">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Start at:</label>
          <input
            type="number"
            min={0}
            value={startNumber}
            onChange={(e) => setStartNumber(parseInt(e.target.value) || 0)}
            className="w-20 px-3 py-1.5 text-sm rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Separator:</label>
          <input
            type="text"
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-24 px-3 py-1.5 text-sm rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Enter text to add line numbers..." rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Numbered Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Numbered text will appear here..." rows={12} />
        </div>
      </div>
    </ToolPage>
  )
}
