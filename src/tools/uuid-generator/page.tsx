'use client'

import { useState, useCallback } from 'react'
import { ToolPage, CopyButton, ClearButton, DownloadButton } from '@/components/tool-page'

function generateUUIDv4(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function generateUUIDv7(): string {
  const now = Date.now()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  // Embed 48-bit Unix millisecond timestamp in bytes 0-5
  bytes[0] = (now / 2 ** 40) & 0xff
  bytes[1] = (now / 2 ** 32) & 0xff
  bytes[2] = (now / 2 ** 24) & 0xff
  bytes[3] = (now / 2 ** 16) & 0xff
  bytes[4] = (now / 2 ** 8) & 0xff
  bytes[5] = now & 0xff

  // Set version to 7 (0111) in byte 6
  bytes[6] = (bytes[6] & 0x0f) | 0x70
  // Set variant to 10 in byte 8
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function parseUUID(input: string): {
  valid: boolean
  version?: number
  variant?: string
  timestamp?: string
  formatted?: string
} {
  const cleaned = input.trim().replace(/-/g, '').toLowerCase()
  if (!/^[0-9a-f]{32}$/.test(cleaned)) {
    return { valid: false }
  }

  const formatted = `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`

  // Version is the high nibble of byte 6 (chars 12-13)
  const version = parseInt(cleaned[12], 16)

  // Variant is determined by the high bits of byte 8 (chars 16-17)
  const variantByte = parseInt(cleaned.slice(16, 18), 16)
  let variant: string
  if ((variantByte & 0x80) === 0) {
    variant = 'NCS (reserved)'
  } else if ((variantByte & 0xc0) === 0x80) {
    variant = 'RFC 4122 / RFC 9562'
  } else if ((variantByte & 0xe0) === 0xc0) {
    variant = 'Microsoft (reserved)'
  } else {
    variant = 'Future (reserved)'
  }

  let timestamp: string | undefined

  // Extract timestamp for v1
  if (version === 1) {
    // v1 timestamp: time_low (0-7), time_mid (8-11), time_hi (13-15) — skipping version nibble
    const timeHi = cleaned.slice(13, 16)
    const timeMid = cleaned.slice(8, 12)
    const timeLow = cleaned.slice(0, 8)
    const ticks = BigInt('0x' + timeHi + timeMid + timeLow)
    // UUID v1 epoch is Oct 15, 1582. Offset to Unix epoch in 100ns intervals.
    const unixOffset = BigInt('122192928000000000')
    const unixNs100 = ticks - unixOffset
    const unixMs = Number(unixNs100 / BigInt(10000))
    if (unixMs > 0 && unixMs < 1e16) {
      timestamp = new Date(unixMs).toISOString()
    }
  }

  // Extract timestamp for v7
  if (version === 7) {
    // v7: first 48 bits (bytes 0-5) are Unix millisecond timestamp
    const msHex = cleaned.slice(0, 12)
    const ms = parseInt(msHex, 16)
    if (ms > 0 && ms < 1e16) {
      timestamp = new Date(ms).toISOString()
    }
  }

  return { valid: true, version, variant, timestamp, formatted }
}

export default function UuidGeneratorTool() {
  const [quantity, setQuantity] = useState(1)
  const [uuids, setUuids] = useState<string[]>([])
  const [uuidCase, setUuidCase] = useState<'lower' | 'upper'>('lower')
  const [uuidVersion, setUuidVersion] = useState<'v4' | 'v7'>('v4')
  const [removeHyphens, setRemoveHyphens] = useState(false)
  const [outputFormat, setOutputFormat] = useState<'plain' | 'json' | 'csv' | 'sql'>('plain')

  // Parser state
  const [parseInput, setParseInput] = useState('')
  const [parseResult, setParseResult] = useState<ReturnType<typeof parseUUID> | null>(null)

  const generate = useCallback(() => {
    const clamped = Math.max(1, Math.min(500, quantity))
    const result: string[] = []
    for (let i = 0; i < clamped; i++) {
      let uuid = uuidVersion === 'v7' ? generateUUIDv7() : generateUUIDv4()
      if (removeHyphens) uuid = uuid.replace(/-/g, '')
      result.push(uuidCase === 'upper' ? uuid.toUpperCase() : uuid)
    }
    setUuids(result)
  }, [quantity, uuidCase, uuidVersion, removeHyphens])

  const handleParse = useCallback(() => {
    if (!parseInput.trim()) return
    setParseResult(parseUUID(parseInput))
  }, [parseInput])

  const allText = (() => {
    switch (outputFormat) {
      case 'json': return JSON.stringify(uuids, null, 2)
      case 'csv': return uuids.join(',')
      case 'sql': return uuids.map(u => `'${u}'`).join(',')
      default: return uuids.join('\n')
    }
  })()

  return (
    <ToolPage
      title="UUID Generator"
      description="Generate random UUID v4 identifiers. Bulk generate up to 500 at once."
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
      {/* Generator Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Version:</label>
          <div className="flex gap-2">
            <button onClick={() => setUuidVersion('v4')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${uuidVersion === 'v4' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
              v4
            </button>
            <button onClick={() => setUuidVersion('v7')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${uuidVersion === 'v7' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
              v7
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Count:</label>
          <input
            type="number"
            min={1}
            max={500}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={removeHyphens}
            onChange={(e) => setRemoveHyphens(e.target.checked)}
            className="rounded border-border"
          />
          Remove hyphens
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Format:</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'plain' | 'json' | 'csv' | 'sql')}
            className="h-9 px-3 rounded-md border border-input bg-card text-sm"
          >
            <option value="plain">Plain</option>
            <option value="json">JSON Array</option>
            <option value="csv">CSV</option>
            <option value="sql">SQL</option>
          </select>
        </div>
        <button onClick={generate} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Generate
        </button>
      </div>

      {/* Generated UUIDs */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Generated UUIDs</span>
        <div className="flex gap-1.5">
          {uuids.length > 0 && <CopyButton text={allText} />}
          {uuids.length > 0 && <DownloadButton content={allText} filename="uuids.txt" />}
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

      {/* UUID Parser */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-sm font-medium mb-3">Parse UUID</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={parseInput}
            onChange={(e) => { setParseInput(e.target.value); setParseResult(null) }}
            placeholder="Paste a UUID to parse (e.g. 550e8400-e29b-41d4-a716-446655440000)"
            className="flex-1 px-3 py-2 text-sm font-mono rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleParse}
            disabled={!parseInput.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Parse
          </button>
        </div>

        {parseResult && (
          <div className="p-4 rounded-lg bg-muted space-y-2">
            {!parseResult.valid ? (
              <p className="text-sm text-red-500 font-medium">Invalid UUID format. Must be 32 hexadecimal characters (with or without hyphens).</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <span className="text-muted-foreground">Valid</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Yes</span>

                  <span className="text-muted-foreground">Formatted</span>
                  <code className="font-mono text-xs">{parseResult.formatted}</code>

                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">{parseResult.version}</span>

                  <span className="text-muted-foreground">Variant</span>
                  <span className="font-medium">{parseResult.variant}</span>

                  {parseResult.timestamp && (
                    <>
                      <span className="text-muted-foreground">Timestamp</span>
                      <span className="font-medium">{parseResult.timestamp}</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
