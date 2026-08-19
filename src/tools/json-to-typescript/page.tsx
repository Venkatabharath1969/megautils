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
    <ToolPage title="JSON to TypeScript" description="Generate TypeScript interfaces from JSON data" category="developer" categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>JSON to TypeScript is a free browser-based tool that lets you generate TypeScript interfaces and types from JSON data with proper type inference for nested objects and arrays. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating type-safe API response types, generating interfaces from API documentation, or adding TypeScript types to existing JavaScript projects. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this TypeScript development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For large inputs, the tool processes data efficiently in your browser but very large files may take a moment.</li>
            <li>Use keyboard shortcuts like Ctrl+A to select all output text before copying.</li>
            <li>The tool preserves your data types and structure during conversion or formatting.</li>
            <li>Compare the formatted output with the original to verify no data was altered.</li>
            <li>All processing is client-side — safe for use with proprietary or sensitive code.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'How do I generate TypeScript interfaces from JSON?', answer: 'Paste your JSON data into the input, set a root interface name, and click Generate to get exported TypeScript interfaces with inferred types.' },
        { question: 'Does this tool handle arrays and nested objects?', answer: 'Yes, arrays are typed as element type arrays (e.g., string[]) and nested objects become separate named interfaces with proper references.' },
        { question: 'Can I customize the root interface name?', answer: 'Yes, use the Root name field to specify a custom name for the top-level interface instead of the default "Root".' },
        { question: 'What TypeScript types are inferred from JSON?', answer: 'The tool infers string, number, boolean, null, and unknown types, and generates union types for arrays with mixed element types.' },
      ]}>
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
