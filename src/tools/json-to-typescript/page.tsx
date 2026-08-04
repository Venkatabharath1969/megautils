'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function sanitizeName(name: string): string {
  // Convert to PascalCase
  return name
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .split('_')
    .filter(Boolean)
    .map(capitalize)
    .join('')
}

function inferType(value: unknown, name: string, interfaces: Map<string, string>, depth: number = 0): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return Number.isInteger(value) ? 'number' : 'number'
  if (typeof value === 'boolean') return 'boolean'

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]'

    // Collect all element types
    const elementTypes = new Set<string>()
    for (const item of value) {
      const itemType = inferType(item, name + 'Item', interfaces, depth + 1)
      elementTypes.add(itemType)
    }

    if (elementTypes.size === 1) {
      return Array.from(elementTypes)[0] + '[]'
    }
    return '(' + Array.from(elementTypes).join(' | ') + ')[]'
  }

  if (typeof value === 'object') {
    const interfaceName = sanitizeName(name) || 'Root'
    const entries = Object.entries(value as Record<string, unknown>)

    if (entries.length === 0) {
      return 'Record<string, unknown>'
    }

    const fields = entries.map(([key, val]) => {
      const fieldType = inferType(val, key, interfaces, depth + 1)
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`
      return `  ${safeKey}: ${fieldType};`
    })

    // Check for duplicate interface names
    let finalName = interfaceName
    let counter = 1
    while (interfaces.has(finalName) && interfaces.get(finalName) !== fields.join('\n')) {
      finalName = interfaceName + counter
      counter++
    }

    interfaces.set(finalName, fields.join('\n'))
    return finalName
  }

  return 'unknown'
}

function jsonToTypescript(jsonStr: string, rootName: string): string {
  const parsed = JSON.parse(jsonStr)
  const interfaces = new Map<string, string>()

  const rootType = inferType(parsed, rootName, interfaces)

  const result: string[] = []

  interfaces.forEach((fields, name) => {
    result.push(`export interface ${name} {\n${fields}\n}`)
  })

  // If the root is an array, add a type alias
  if (Array.isArray(parsed) && !interfaces.has(rootName)) {
    result.push(`export type ${sanitizeName(rootName)} = ${rootType};`)
  }

  return result.join('\n\n')
}

export default function JsonToTypescriptTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [rootName, setRootName] = useState('Root')

  const convert = () => {
    try {
      if (!input.trim()) throw new Error('Please enter JSON data')
      setOutput(jsonToTypescript(input, rootName))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="JSON to TypeScript" description="Generate TypeScript interfaces from JSON data" category="developer" categoryLabel="Developer Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">JSON Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'Paste JSON here...\n{"name": "Alice", "age": 30}'} rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">TypeScript Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="types.ts" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="TypeScript interfaces will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button onClick={convert} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Generate Interfaces
        </button>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Root name:</label>
          <input
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-card text-sm w-32"
            placeholder="Root"
          />
        </div>
      </div>
    </ToolPage>
  )
}
