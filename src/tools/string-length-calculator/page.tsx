'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

export default function StringLengthCalculatorTool() {
  const [input, setInput] = useState('')

  const stats = useMemo(() => {
    const charCount = [...input].length // Handles surrogate pairs correctly
    const utf16Length = input.length    // JavaScript string length (UTF-16 code units)
    const byteLength = new TextEncoder().encode(input).length // UTF-8 byte length
    const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0
    const lineCount = input ? input.split('\n').length : 0
    return { charCount, utf16Length, byteLength, wordCount, lineCount }
  }, [input])

  return (
    <ToolPage title="String Length Calculator" description="Analyze text length: character count, UTF-8 byte length, UTF-16 length, word count, and line count." category="text" categoryLabel="Text Tools">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Characters', value: stats.charCount },
          { label: 'UTF-8 Bytes', value: stats.byteLength },
          { label: 'UTF-16 Length', value: stats.utf16Length },
          { label: 'Words', value: stats.wordCount },
          { label: 'Lines', value: stats.lineCount },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-muted text-center">
            <div className="text-xl font-bold text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Input Text</span>
        <ClearButton onClear={() => setInput('')} />
      </div>
      <ToolTextarea value={input} onChange={setInput} placeholder="Enter or paste text to analyze..." rows={10} />
    </ToolPage>
  )
}
