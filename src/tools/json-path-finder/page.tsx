'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

interface JsonNode {
  key: string
  path: string
  value: unknown
  type: string
  depth: number
  children?: JsonNode[]
}

function buildTree(value: unknown, key: string, path: string, depth: number): JsonNode {
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value

  const node: JsonNode = { key, path, value, type, depth }

  if (Array.isArray(value)) {
    node.children = value.map((item, i) =>
      buildTree(item, String(i), `${path}[${i}]`, depth + 1)
    )
  } else if (type === 'object' && value !== null) {
    node.children = Object.entries(value as Record<string, unknown>).map(([k, v]) => {
      const safePath = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? `${path}.${k}` : `${path}["${k}"]`
      return buildTree(v, k, safePath, depth + 1)
    })
  }

  return node
}

function TreeNode({ node, selectedPath, onSelect }: { node: JsonNode; selectedPath: string; onSelect: (path: string) => void }) {
  const [expanded, setExpanded] = useState(node.depth < 2)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedPath === node.path

  const valuePreview = useMemo(() => {
    if (node.type === 'array') return `Array(${(node.value as unknown[]).length})`
    if (node.type === 'object') return `{${Object.keys(node.value as Record<string, unknown>).length} keys}`
    if (node.type === 'string') return `"${String(node.value).slice(0, 50)}${String(node.value).length > 50 ? '...' : ''}"`
    if (node.type === 'null') return 'null'
    return String(node.value)
  }, [node])

  const typeColor = useMemo(() => {
    switch (node.type) {
      case 'string': return 'text-green-600 dark:text-green-400'
      case 'number': return 'text-blue-600 dark:text-blue-400'
      case 'boolean': return 'text-orange-600 dark:text-orange-400'
      case 'null': return 'text-red-600 dark:text-red-400'
      default: return 'text-muted-foreground'
    }
  }, [node.type])

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 px-1 rounded cursor-pointer hover:bg-muted transition-colors ${isSelected ? 'bg-primary/10 ring-1 ring-primary' : ''}`}
        style={{ paddingLeft: `${node.depth * 16 + 4}px` }}
        onClick={() => onSelect(node.path)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="w-4 h-4 flex items-center justify-center text-xs text-muted-foreground shrink-0"
          >
            {expanded ? '\u25BC' : '\u25B6'}
          </button>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}
        <span className="text-sm font-medium text-primary shrink-0">{node.key}</span>
        <span className="text-xs text-muted-foreground shrink-0">:</span>
        <span className={`text-xs font-mono truncate ${typeColor}`}>{valuePreview}</span>
      </div>
      {expanded && hasChildren && node.children!.map((child, i) => (
        <TreeNode key={`${child.path}-${i}`} node={child} selectedPath={selectedPath} onSelect={onSelect} />
      ))}
    </div>
  )
}

export default function JsonPathFinderTool() {
  const [input, setInput] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [error, setError] = useState('')

  const tree = useMemo(() => {
    if (!input.trim()) return null
    try {
      setError('')
      const parsed = JSON.parse(input)
      return buildTree(parsed, 'root', '$', 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      return null
    }
  }, [input])

  const selectedValue = useMemo(() => {
    if (!selectedPath || !input.trim()) return ''
    try {
      const parsed = JSON.parse(input)
      const pathParts = selectedPath
        .replace(/^\$/, '')
        .split(/\.|\[/)
        .filter(Boolean)
        .map((p) => p.replace(/\]$/, '').replace(/^"(.*)"$/, '$1'))

      let current: unknown = parsed
      for (const part of pathParts) {
        if (current === null || current === undefined) return 'undefined'
        if (Array.isArray(current)) {
          current = current[parseInt(part)]
        } else if (typeof current === 'object') {
          current = (current as Record<string, unknown>)[part]
        }
      }
      return JSON.stringify(current, null, 2)
    } catch {
      return ''
    }
  }, [selectedPath, input])

  const handleSelect = useCallback((path: string) => {
    setSelectedPath(path)
  }, [])

  const clear = () => { setInput(''); setSelectedPath(''); setError('') }

  return (
    <ToolPage title="JSON Path Finder" description="Paste JSON, click on any key to find its JSONPath/dot notation path" category="developer" categoryLabel="Developer Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">JSON Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder='{"name": "John", "address": {"city": "NYC"}, "items": [1, 2, 3]}' rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">JSON Tree</span>
          </div>
          <div className="rounded-lg border border-input bg-tool-bg p-2 min-h-[280px] max-h-[400px] overflow-auto">
            {tree ? (
              <TreeNode node={tree} selectedPath={selectedPath} onSelect={handleSelect} />
            ) : (
              <div className="text-sm text-muted-foreground p-4 text-center">
                {error ? '' : 'Paste valid JSON to see the tree'}
              </div>
            )}
          </div>
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      {selectedPath && (
        <div className="mt-4 space-y-3">
          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground">JSONPath</span>
              <CopyButton text={selectedPath} />
            </div>
            <code className="text-sm font-mono text-primary">{selectedPath}</code>
          </div>
          {selectedValue && (
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">Value</span>
                <CopyButton text={selectedValue} />
              </div>
              <pre className="text-sm font-mono overflow-x-auto max-h-32">{selectedValue}</pre>
            </div>
          )}
        </div>
      )}
    </ToolPage>
  )
}
