'use client'

import { useState, useCallback } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

function generateUUIDv4(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export default function UuidGeneratorTool() {
  const [quantity, setQuantity] = useState(1)
  const [uuids, setUuids] = useState<string[]>([])
  const [uuidCase, setUuidCase] = useState<'lower' | 'upper'>('lower')

  const generate = useCallback(() => {
    const clamped = Math.max(1, Math.min(100, quantity))
    const result: string[] = []
    for (let i = 0; i < clamped; i++) {
      const uuid = generateUUIDv4()
      result.push(uuidCase === 'upper' ? uuid.toUpperCase() : uuid)
    }
    setUuids(result)
  }, [quantity, uuidCase])

  const allText = uuids.join('\n')

  return (
    <ToolPage title="UUID Generator" description="Generate random UUID v4 identifiers. Bulk generate up to 100 at once." category="generators" categoryLabel="Generators">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Count:</label>
          <input
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-20 px-3 py-1.5 text-sm rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setUuidCase('lower')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${uuidCase === 'lower' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
            lowercase
          </button>
          <button onClick={() => setUuidCase('upper')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${uuidCase === 'upper' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
            UPPERCASE
          </button>
        </div>
        <button onClick={generate} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Generate
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Generated UUIDs</span>
        <div className="flex gap-1.5">
          {uuids.length > 0 && <CopyButton text={allText} />}
          {uuids.length > 0 && <ClearButton onClear={() => setUuids([])} />}
        </div>
      </div>

      {uuids.length === 0 ? (
        <div className="p-8 rounded-lg bg-muted text-center text-sm text-muted-foreground">
          Click Generate to create UUIDs
        </div>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted hover:bg-muted/80">
              <code className="text-sm font-mono">{uuid}</code>
              <CopyButton text={uuid} />
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  )
}
