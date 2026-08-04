'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function BlankLineRemoverTool() {
  const [input, setInput] = useState('')

  const { output, removed } = useMemo(() => {
    if (!input) return { output: '', removed: 0 }
    const lines = input.split('\n')
    const filtered = lines.filter((line) => line.trim().length > 0)
    return { output: filtered.join('\n'), removed: lines.length - filtered.length }
  }, [input])

  return (
    <ToolPage title="Blank Line Remover" description="Remove all blank and empty lines from text." category="text" categoryLabel="Text Tools">
      {input && (
        <div className="mb-4 p-3 rounded-lg bg-muted text-center">
          <span className="text-sm text-muted-foreground">
            Removed <span className="font-bold text-primary">{removed}</span> blank line{removed !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Paste text with blank lines..." rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Cleaned text will appear here..." rows={12} />
        </div>
      </div>
    </ToolPage>
  )
}
