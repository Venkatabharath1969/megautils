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
    <ToolPage
      title="UUID Generator"
      description="Generate random UUID v4 identifiers. Bulk generate up to 100 at once."
      category="generators"
      categoryLabel="Generators"
      helpContent={
        <>
          <h2>What is a UUID Generator?</h2>
          <p>
            A UUID (Universally Unique Identifier) generator creates 128-bit identifiers that are guaranteed to be unique for all practical purposes without requiring a central registration authority. The most commonly used version — UUID v4 — is generated from cryptographically strong random numbers, producing identifiers like <code>550e8400-e29b-41d4-a716-446655440000</code>. UUIDs are the standard way to assign IDs to database records, distributed system nodes, API resources, message-queue events, and session tokens in modern software architectures.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Set the <strong>Count</strong> — choose how many UUIDs you need, from 1 up to 100 at a time.</li>
            <li>Select your preferred <strong>case</strong>: lowercase (default and most common) or UPPERCASE.</li>
            <li>Click <strong>Generate</strong>. All UUIDs appear instantly in a scrollable list.</li>
            <li>Click the <strong>Copy</strong> button next to any single UUID to copy it, or use the bulk <strong>Copy</strong> button at the top to copy every generated UUID (one per line).</li>
            <li>Click <strong>Clear</strong> to reset the list and generate a fresh batch.</li>
          </ol>

          <h2>When to Use a UUID Generator</h2>
          <p>
            Developers use UUIDs when they need unique primary keys that can be generated on the client side without hitting a database sequence, when merging data from multiple microservices that each create records independently, and when building offline-first applications that sync later. UUIDs are also ideal for creating shareable links, tracking analytics events, and assigning correlation IDs to distributed traces. The UUID generator on utilsnow.com runs entirely in your browser using the Web Crypto API, so no identifiers are ever transmitted to a server.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>UUID v4 collision probability is astronomically low — you would need to generate roughly <strong>2.71 quintillion</strong> IDs before a 50 % chance of a single duplicate.</li>
            <li>If you need <strong>sortable</strong> IDs (e.g., for database index performance), consider UUIDv7 or ULID, which embed a timestamp prefix. UUID v4 is fully random and does not sort chronologically.</li>
            <li>Store UUIDs as a native <code>UUID</code> column type in PostgreSQL or as <code>BINARY(16)</code> in MySQL for optimal storage and indexing — storing them as a 36-character string wastes space.</li>
            <li>When displaying UUIDs to end users, consider showing only the first 8 characters as a short reference and revealing the full ID on click or hover.</li>
            <li>This tool uses <code>crypto.getRandomValues</code>, the same cryptographic primitive your browser uses for TLS, so the generated UUIDs are suitable for security-sensitive contexts.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is a UUID and what is it used for?', answer: 'A UUID (Universally Unique Identifier) is a 128-bit identifier used to uniquely identify resources in databases, APIs, and distributed systems without requiring a central authority.' },
        { question: 'Can two UUIDs ever be the same?', answer: 'While theoretically possible, the probability of a collision with UUID v4 is astronomically low — you would need to generate about 2.71 quintillion UUIDs to have a 50% chance of a single duplicate.' },
        { question: 'What is the difference between UUID versions?', answer: 'UUID v1 is based on timestamp and MAC address, v4 is fully random (most commonly used), and v5 uses SHA-1 hashing of a namespace and name. This tool generates v4 UUIDs.' },
        { question: 'Are UUIDs generated here cryptographically secure?', answer: 'Yes. This tool uses the Web Crypto API (crypto.getRandomValues) to generate random bytes, ensuring the UUIDs are suitable for security-sensitive applications.' },
      ]}
    >
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
