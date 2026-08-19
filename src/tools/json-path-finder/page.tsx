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

function nodeMatchesSearch(node: JsonNode, search: string): boolean {
  if (!search) return false
  const lowerSearch = search.toLowerCase()
  if (node.key.toLowerCase().includes(lowerSearch)) return true
  const valStr = node.type === 'object' || node.type === 'array'
    ? '' : String(node.value).toLowerCase()
  if (valStr.includes(lowerSearch)) return true
  return false
}

function subtreeHasMatch(node: JsonNode, search: string): boolean {
  if (nodeMatchesSearch(node, search)) return true
  if (node.children) {
    return node.children.some(child => subtreeHasMatch(child, search))
  }
  return false
}

function TreeNode({
  node,
  selectedPath,
  onSelect,
  expandAll,
  searchTerm,
}: {
  node: JsonNode
  selectedPath: string
  onSelect: (path: string) => void
  expandAll: boolean | null
  searchTerm: string
}) {
  const defaultExpanded = expandAll !== null ? expandAll : node.depth < 2
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded)

  // When expandAll changes, sync
  const expanded = expandAll !== null ? expandAll : localExpanded

  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedPath === node.path
  const isMatch = searchTerm ? nodeMatchesSearch(node, searchTerm) : false
  const hasMatchInSubtree = searchTerm && hasChildren ? subtreeHasMatch(node, searchTerm) : false

  // When searching, hide branches that have no matches
  if (searchTerm && !isMatch && !hasMatchInSubtree) {
    return null
  }

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

  const shouldExpand = expandAll !== null ? expandAll : (searchTerm && hasMatchInSubtree ? true : localExpanded)

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 px-1 rounded cursor-pointer hover:bg-muted transition-colors ${isSelected ? 'bg-primary/10 ring-1 ring-primary' : ''} ${isMatch ? 'bg-yellow-500/20 ring-1 ring-yellow-500/50' : ''}`}
        style={{ paddingLeft: `${node.depth * 16 + 4}px` }}
        onClick={() => onSelect(node.path)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setLocalExpanded(!expanded) }}
            className="w-4 h-4 flex items-center justify-center text-xs text-muted-foreground shrink-0"
          >
            {shouldExpand ? '\u25BC' : '\u25B6'}
          </button>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}
        <span className={`text-sm font-medium shrink-0 ${isMatch ? 'text-yellow-700 dark:text-yellow-300 font-bold' : 'text-primary'}`}>{node.key}</span>
        <span className="text-xs text-muted-foreground shrink-0">:</span>
        <span className={`text-xs font-mono truncate ${typeColor}`}>{valuePreview}</span>
      </div>
      {shouldExpand && hasChildren && node.children!.map((child, i) => (
        <TreeNode
          key={`${child.path}-${i}`}
          node={child}
          selectedPath={selectedPath}
          onSelect={onSelect}
          expandAll={expandAll}
          searchTerm={searchTerm}
        />
      ))}
    </div>
  )
}

export default function JsonPathFinderTool() {
  const [input, setInput] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandAll, setExpandAll] = useState<boolean | null>(null)

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

  const clear = () => { setInput(''); setSelectedPath(''); setError(''); setSearchTerm(''); setExpandAll(null) }

  return (
    <ToolPage title="JSON Path Finder" description="Paste JSON, click on any key to find its JSONPath/dot notation path" category="developer" categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>JSON Path Finder is a free browser-based tool that lets you navigate JSON data interactively and find the JSONPath expression for any value in the structure. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when extracting data from complex JSON APIs, building JSONPath queries for data processing pipelines, or debugging nested JSON structures. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is JSONPath?', answer: 'JSONPath is a query language for JSON that uses dot notation and bracket syntax (like $.store.book[0].title) to locate specific values within a JSON document.' },
        { question: 'How do I find the path to a JSON value?', answer: 'Paste your JSON into the input and click on any key in the interactive tree view to instantly see its full JSONPath and the value at that location.' },
        { question: 'Does this tool support nested JSON and arrays?', answer: 'Yes, the tree view expands nested objects and arrays, and clicking any node at any depth gives you the correct path using dot and bracket notation.' },
      ]}>
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
            {tree && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandAll(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={() => setExpandAll(false)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>
          {tree && (
            <div className="mb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value) setExpandAll(null) }}
                placeholder="Search keys or values..."
                className="w-full px-3 py-1.5 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="rounded-lg border border-input bg-tool-bg p-2 min-h-[280px] max-h-[400px] overflow-auto">
            {tree ? (
              <TreeNode
                node={tree}
                selectedPath={selectedPath}
                onSelect={handleSelect}
                expandAll={expandAll}
                searchTerm={searchTerm}
              />
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
