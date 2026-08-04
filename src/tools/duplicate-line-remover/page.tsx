'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function DuplicateLineRemoverTool() {
  const [input, setInput] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(true)

  const { output, removed } = useMemo(() => {
    if (!input) return { output: '', removed: 0 }
    const lines = input.split('\n')
    const seen = new Set<string>()
    const unique: string[] = []
    let removedCount = 0
    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase()
      if (seen.has(key)) {
        removedCount++
      } else {
        seen.add(key)
        unique.push(line)
      }
    }
    return { output: unique.join('\n'), removed: removedCount }
  }, [input, caseSensitive])

  return (
    <ToolPage title="Duplicate Line Remover" description="Remove duplicate lines from text. Supports case-sensitive and case-insensitive matching." category="text" categoryLabel="Text Tools">
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="rounded border-border" />
          Case-sensitive
        </label>
        {input && (
          <span className="text-xs text-muted-foreground">
            {removed} duplicate{removed !== 1 ? 's' : ''} removed
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Paste text with duplicate lines..." rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Unique lines will appear here..." rows={12} />
        </div>
      </div>
    </ToolPage>
  )
}
