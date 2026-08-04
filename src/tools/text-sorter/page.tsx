'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

type SortMode = 'az' | 'za' | 'length-asc' | 'length-desc' | 'random' | 'reverse'

export default function TextSorterTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<SortMode>('az')

  const output = useMemo(() => {
    if (!input.trim()) return ''
    const lines = input.split('\n')
    let sorted: string[]
    switch (mode) {
      case 'az':
        sorted = [...lines].sort((a, b) => a.localeCompare(b))
        break
      case 'za':
        sorted = [...lines].sort((a, b) => b.localeCompare(a))
        break
      case 'length-asc':
        sorted = [...lines].sort((a, b) => a.length - b.length)
        break
      case 'length-desc':
        sorted = [...lines].sort((a, b) => b.length - a.length)
        break
      case 'random':
        sorted = [...lines].sort(() => Math.random() - 0.5)
        break
      case 'reverse':
        sorted = [...lines].reverse()
        break
      default:
        sorted = lines
    }
    return sorted.join('\n')
  }, [input, mode])

  const modes: { value: SortMode; label: string }[] = [
    { value: 'az', label: 'A \u2192 Z' },
    { value: 'za', label: 'Z \u2192 A' },
    { value: 'length-asc', label: 'Length \u2191' },
    { value: 'length-desc', label: 'Length \u2193' },
    { value: 'random', label: 'Shuffle' },
    { value: 'reverse', label: 'Reverse' },
  ]

  return (
    <ToolPage title="Text Sorter" description="Sort lines alphabetically, by length, shuffle randomly, or reverse order." category="text" categoryLabel="Text Tools">
      <div className="flex flex-wrap gap-2 mb-4">
        {modes.map((m) => (
          <button key={m.value} onClick={() => setMode(m.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === m.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
            {m.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Enter text (one item per line)..." rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sorted Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Sorted result will appear here..." rows={12} />
        </div>
      </div>
    </ToolPage>
  )
}
