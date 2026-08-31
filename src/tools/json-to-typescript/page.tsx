'use client'

import { useState, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .split('_')
    .filter(Boolean)
    .map(capitalize)
    .join('')
}

interface ConvertOptions {
  rootName: string
  useType: boolean
  exportKeyword: boolean
  optionalProperties: boolean
}

function inferType(
  value: unknown,
  name: string,
  interfaces: Map<string, string>,
  options: ConvertOptions,
  depth: number = 0,
): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]'

    // Check if all elements are objects (for optional field inference)
    const objectItems = value.filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === 'object' && !Array.isArray(item),
    )

    if (objectItems.length === value.length && objectItems.length > 0) {
      // All elements are objects — merge keys and detect optional fields
      const allKeys = new Set<string>()
      for (const item of objectItems) {
        Object.keys(item).forEach(k => allKeys.add(k))
      }

      const interfaceName = sanitizeName(name + 'Item') || 'Item'

      const fields = Array.from(allKeys).map(key => {
        const presentInAll = objectItems.every(item => key in item)
        const valuesForKey = objectItems.filter(item => key in item).map(item => item[key])
        const fieldTypes = new Set<string>()
        for (const v of valuesForKey) {
          fieldTypes.add(inferType(v, key, interfaces, options, depth + 1))
        }
        const fieldType = fieldTypes.size === 1
          ? Array.from(fieldTypes)[0]
          : Array.from(fieldTypes).join(' | ')
        const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`
        const optionalMarker = options.optionalProperties || !presentInAll ? '?' : ''
        return `  ${safeKey}${optionalMarker}: ${fieldType};`
      })

      let finalName = interfaceName
      let counter = 1
      while (interfaces.has(finalName) && interfaces.get(finalName) !== fields.join('\n')) {
        finalName = interfaceName + counter
        counter++
      }

      interfaces.set(finalName, fields.join('\n'))
      return finalName + '[]'
    }

    // Collect all element types for non-object arrays
    const elementTypes = new Set<string>()
    for (const item of value) {
      const itemType = inferType(item, name + 'Item', interfaces, options, depth + 1)
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
      const fieldType = inferType(val, key, interfaces, options, depth + 1)
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`
      const optionalMarker = options.optionalProperties ? '?' : ''
      return `  ${safeKey}${optionalMarker}: ${fieldType};`
    })

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

function jsonToTypescript(jsonStr: string, options: ConvertOptions): string {
  const parsed = JSON.parse(jsonStr)
  const interfaces = new Map<string, string>()

  const rootType = inferType(parsed, options.rootName, interfaces, options)

  const prefix = options.exportKeyword ? 'export ' : ''
  const result: string[] = []

  interfaces.forEach((fields, name) => {
    if (options.useType) {
      result.push(`${prefix}type ${name} = {\n${fields}\n}`)
    } else {
      result.push(`${prefix}interface ${name} {\n${fields}\n}`)
    }
  })

  // If the root is an array, add a type alias
  if (Array.isArray(parsed) && !interfaces.has(options.rootName)) {
    result.push(`${prefix}type ${sanitizeName(options.rootName)} = ${rootType};`)
  }

  return result.join('\n\n')
}

export default function JsonToTypescriptTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [rootName, setRootName] = useState('Root')
  const [useType, setUseType] = useState(false)
  const [exportKeyword, setExportKeyword] = useState(true)
  const [optionalProperties, setOptionalProperties] = useState(false)

  const convert = useCallback(() => {
    try {
      if (!input.trim()) throw new Error('Please enter JSON data')
      setOutput(jsonToTypescript(input, { rootName, useType, exportKeyword, optionalProperties }))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }, [input, rootName, useType, exportKeyword, optionalProperties])

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text')
    setTimeout(() => {
      try {
        if (!pasted.trim()) return
        setOutput(jsonToTypescript(pasted, { rootName, useType, exportKeyword, optionalProperties }))
        setError('')
      } catch {
        // User will click convert manually
      }
    }, 0)
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="JSON to TypeScript"
      description="Generate TypeScript interfaces and types from JSON data with proper type inference for nested objects, arrays, and union types."
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is JSON to TypeScript?</h2>
          <p>
            JSON to TypeScript is a developer tool that automatically generates TypeScript interface or type declarations from raw JSON data. When working with REST APIs, configuration files, or any JSON data source, manually writing TypeScript types is tedious and error-prone. This tool analyzes the structure of your JSON — including nested objects, arrays, mixed-type arrays, and null values — and produces clean, accurate TypeScript definitions you can drop directly into your codebase.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your JSON data into the <strong>JSON Input</strong> panel on the left.</li>
            <li>Set a <strong>Root name</strong> for the top-level interface (defaults to &ldquo;Root&rdquo;).</li>
            <li>Choose whether to generate <code>interface</code> or <code>type</code> declarations using the checkbox.</li>
            <li>Toggle <strong>Export keyword</strong> on or off depending on whether you need exported types.</li>
            <li>Enable <strong>Optional properties</strong> if you want every property marked with <code>?</code>.</li>
            <li>Click <strong>Generate</strong> to produce the TypeScript output on the right.</li>
            <li>Use <strong>Copy</strong> or <strong>Download</strong> to export the generated types.</li>
          </ol>

          <h2>Key Features</h2>
          <ul>
            <li><strong>Nested object support</strong> — deeply nested JSON objects become separate named interfaces with proper references.</li>
            <li><strong>Array type inference</strong> — arrays of objects are merged to detect all possible keys, with optional markers for fields not present in every element.</li>
            <li><strong>Mixed-type arrays</strong> — arrays containing different primitive types produce union types like <code>(string | number)[]</code>.</li>
            <li><strong>Null handling</strong> — null values are typed as <code>null</code> so you can add proper null checks.</li>
            <li><strong>Safe key names</strong> — keys with special characters are automatically quoted.</li>
            <li><strong>Duplicate detection</strong> — interfaces with identical shapes are reused, while name collisions are resolved with numeric suffixes.</li>
          </ul>

          <h2>When to Use This Tool</h2>
          <p>
            Use this tool when bootstrapping type-safe API response types, generating interfaces from API documentation or sample payloads, migrating JavaScript projects to TypeScript, or creating type definitions for configuration files. It is also useful for learning how TypeScript types map to JSON structures.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Provide a <strong>representative sample</strong> with all possible fields populated for the most accurate types.</li>
            <li>Use <strong>arrays with multiple objects</strong> so the tool can detect optional fields automatically.</li>
            <li>Choose <code>type</code> over <code>interface</code> when you need union types or mapped types downstream.</li>
            <li>Review generated types and add JSDoc comments for documentation.</li>
            <li>All processing happens entirely in your browser — your data never leaves your device.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I generate TypeScript interfaces from JSON?', answer: 'Paste your JSON data into the input, set a root interface name, and click Generate to get exported TypeScript interfaces with inferred types.' },
        { question: 'Does this tool handle arrays and nested objects?', answer: 'Yes. Arrays are typed as element type arrays (e.g., string[]) and nested objects become separate named interfaces with proper references. Arrays of objects are merged to detect all possible keys.' },
        { question: 'Can I customize the root interface name?', answer: 'Yes, use the Root name field to specify a custom name for the top-level interface instead of the default "Root".' },
        { question: 'What is the difference between interface and type?', answer: 'Interfaces are extendable with "extends" and are the standard way to define object shapes. Types (using "type") support union types, intersection types, and mapped types. Both work well for most use cases.' },
        { question: 'What does the optional properties toggle do?', answer: 'When enabled, every property in the generated types is marked with "?" making them optional. This is useful when your JSON represents partial data or when fields may not always be present.' },
        { question: 'Is my JSON data safe?', answer: 'Yes. All processing happens entirely in your browser using JavaScript. Your JSON data never leaves your device and is never sent to any server.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">JSON Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} onPaste={handlePaste} placeholder={'Paste JSON here...\n{"name": "Alice", "age": 30, "address": {"city": "NYC"}}'} rows={14} />
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
      <div className="flex flex-wrap items-center gap-4 mt-4">
        <button onClick={convert} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          {useType ? 'Generate Types' : 'Generate Interfaces'}
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
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useType}
            onChange={(e) => setUseType(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Use <code className="text-xs bg-muted px-1 rounded">type</code> instead of <code className="text-xs bg-muted px-1 rounded">interface</code>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={exportKeyword}
            onChange={(e) => setExportKeyword(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Export keyword
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={optionalProperties}
            onChange={(e) => setOptionalProperties(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Optional properties
        </label>
      </div>
    </ToolPage>
  )
}
