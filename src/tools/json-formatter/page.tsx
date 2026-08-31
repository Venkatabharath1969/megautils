'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'
import { Upload, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys)
  if (obj && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>).sort().reduce((acc, key) => {
      acc[key] = sortKeys((obj as Record<string, unknown>)[key])
      return acc
    }, {} as Record<string, unknown>)
  }
  return obj
}

function countKeys(obj: unknown): number {
  if (Array.isArray(obj)) return obj.reduce((sum, item) => sum + countKeys(item), 0)
  if (obj && typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    return entries.reduce((sum, [, val]) => sum + 1 + countKeys(val), 0)
  }
  return 0
}

function maxDepth(obj: unknown, depth = 0): number {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return depth + 1
    return Math.max(...obj.map(item => maxDepth(item, depth + 1)))
  }
  if (obj && typeof obj === 'object') {
    const vals = Object.values(obj as Record<string, unknown>)
    if (vals.length === 0) return depth + 1
    return Math.max(...vals.map(val => maxDepth(val, depth + 1)))
  }
  return depth
}

function nodeCount(obj: unknown): number {
  if (Array.isArray(obj)) return 1 + obj.reduce<number>((sum, item) => sum + nodeCount(item), 0)
  if (obj && typeof obj === 'object') {
    return 1 + Object.values(obj as Record<string, unknown>).reduce<number>((sum, val) => sum + nodeCount(val), 0)
  }
  return 1
}

interface JsonStats {
  sizeBytes: number
  keys: number
  depth: number
  nodes: number
}

// --- Tree View ---

interface TreeNodeData {
  key: string
  value: unknown
  type: 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object'
  depth: number
  children?: TreeNodeData[]
}

function buildTree(value: unknown, key: string, depth: number): TreeNodeData {
  if (value === null) return { key, value, type: 'null', depth }
  if (Array.isArray(value)) {
    return {
      key,
      value,
      type: 'array',
      depth,
      children: value.map((item, i) => buildTree(item, String(i), depth + 1)),
    }
  }
  if (typeof value === 'object') {
    return {
      key,
      value,
      type: 'object',
      depth,
      children: Object.entries(value as Record<string, unknown>).map(([k, v]) => buildTree(v, k, depth + 1)),
    }
  }
  if (typeof value === 'string') return { key, value, type: 'string', depth }
  if (typeof value === 'number') return { key, value, type: 'number', depth }
  if (typeof value === 'boolean') return { key, value, type: 'boolean', depth }
  return { key, value, type: 'null', depth }
}

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  string: { label: 'str', className: 'bg-green-500/15 text-green-700 dark:text-green-400' },
  number: { label: 'num', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  boolean: { label: 'bool', className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400' },
  null: { label: 'null', className: 'bg-red-500/15 text-red-700 dark:text-red-400' },
  array: { label: 'arr', className: 'bg-purple-500/15 text-purple-700 dark:text-purple-400' },
  object: { label: 'obj', className: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400' },
}

function TreeNodeComponent({ node }: { node: TreeNodeData }) {
  const [expanded, setExpanded] = useState(node.depth < 2)
  const [copied, setCopied] = useState(false)

  const hasChildren = node.children && node.children.length > 0
  const badge = TYPE_BADGES[node.type]

  const valuePreview = useMemo(() => {
    if (node.type === 'array') return `Array(${(node.value as unknown[]).length})`
    if (node.type === 'object') return `{${Object.keys(node.value as Record<string, unknown>).length} keys}`
    if (node.type === 'string') {
      const s = String(node.value)
      return `"${s.length > 60 ? s.slice(0, 60) + '...' : s}"`
    }
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

  const copyValue = () => {
    const text = typeof node.value === 'string' ? node.value : JSON.stringify(node.value, null, 2)
    navigator.clipboard.writeText(String(text)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div>
      <div
        className="flex items-center gap-1 py-0.5 px-1 rounded hover:bg-muted transition-colors group"
        style={{ paddingLeft: `${node.depth * 16 + 4}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-4 h-4 flex items-center justify-center text-muted-foreground shrink-0"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}
        <span className="text-sm font-medium shrink-0 text-primary">{node.key}</span>
        <span className="text-xs text-muted-foreground shrink-0">:</span>
        <span className={`inline-block px-1 py-px rounded text-[10px] font-semibold leading-tight ${badge.className}`}>{badge.label}</span>
        <span className={`text-xs font-mono truncate ${typeColor}`}>{valuePreview}</span>
        <button
          onClick={copyValue}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted-foreground/10 shrink-0"
          title="Copy value"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
        </button>
      </div>
      {expanded && hasChildren && node.children!.map((child, i) => (
        <TreeNodeComponent key={`${child.key}-${i}`} node={child} />
      ))}
    </div>
  )
}

export default function JsonFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState<string | number>(2)
  const [sortKeysEnabled, setSortKeysEnabled] = useState(false)
  const [stats, setStats] = useState<JsonStats | null>(null)
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const treeData = useMemo(() => {
    if (!output) return null
    try {
      const parsed = JSON.parse(output)
      return buildTree(parsed, 'root', 0)
    } catch {
      return null
    }
  }, [output])

  const getIndentValue = useCallback(() => {
    return indent === 'tab' ? '\t' : indent
  }, [indent])

  const computeStats = useCallback((parsed: unknown, formatted: string) => {
    setStats({
      sizeBytes: new Blob([formatted]).size,
      keys: countKeys(parsed),
      depth: maxDepth(parsed),
      nodes: nodeCount(parsed),
    })
  }, [])

  const formatJson = useCallback((jsonStr: string) => {
    try {
      let parsed = JSON.parse(jsonStr)
      if (sortKeysEnabled) parsed = sortKeys(parsed)
      const formatted = JSON.stringify(parsed, null, getIndentValue())
      setOutput(formatted)
      setError('')
      computeStats(parsed, formatted)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
      setStats(null)
    }
  }, [sortKeysEnabled, getIndentValue, computeStats])

  const format = () => formatJson(input)

  const minify = () => {
    try {
      let parsed = JSON.parse(input)
      if (sortKeysEnabled) parsed = sortKeys(parsed)
      const formatted = JSON.stringify(parsed)
      setOutput(formatted)
      setError('')
      computeStats(parsed, formatted)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
      setStats(null)
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError(''); setStats(null) }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text')
    setTimeout(() => {
      formatJson(pasted)
    }, 0)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setInput(content)
      formatJson(content)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <ToolPage
      title="JSON Formatter & Validator"
      description="Format, validate, beautify, and minify JSON data. Supports tree view."
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is a JSON Formatter?</h2>
          <p>
            A JSON formatter is a tool that takes raw or minified JSON (JavaScript Object Notation) data and restructures it with proper indentation, line breaks, and spacing so that it becomes easy to read and understand. JSON is the most widely used data-interchange format on the web, powering REST APIs, configuration files, NoSQL databases, and more. When JSON is transmitted over a network it is usually minified — stripped of all unnecessary whitespace — to reduce payload size. While efficient for machines, minified JSON is nearly impossible for humans to scan quickly, making a formatter essential for everyday development work.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your raw JSON into the <strong>Input JSON</strong> panel on the left.</li>
            <li>Choose your preferred indentation level — <strong>2 spaces</strong>, <strong>4 spaces</strong>, or <strong>1 tab</strong> — from the dropdown below.</li>
            <li>Click <strong>Format / Beautify</strong> to produce human-readable output, or click <strong>Minify</strong> to compress the JSON into a single line.</li>
            <li>Review the result in the <strong>Output</strong> panel. If the input contains syntax errors, a detailed error message will appear so you can fix the problem.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> buttons to export the formatted result.</li>
          </ol>

          <h2>When to Use a JSON Formatter</h2>
          <p>
            Developers regularly format JSON when debugging API responses, reviewing configuration files, or preparing data for documentation. It is also useful before committing JSON to version control, because consistently formatted files produce cleaner diffs. If you need to reduce file size for production, the <strong>Minify</strong> option strips every unnecessary character while keeping the data intact.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Always <strong>validate</strong> JSON before sending it to an API — a single trailing comma or unquoted key will cause parsing failures.</li>
            <li>Use <strong>2-space indentation</strong> for compact readability or <strong>4 spaces</strong> when you want extra visual separation between nested levels.</li>
            <li>When working with large files, minify before transmission and format only on the receiving side to keep bandwidth low.</li>
            <li>Remember that standard JSON does not allow comments. If you need annotated configs, consider JSON5 or JSONC and convert to strict JSON afterwards.</li>
            <li>All processing in this formatter on utilsnow.com happens entirely in your browser — your data never leaves your device, so it is safe to paste sensitive payloads.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is JSON formatting?', answer: 'JSON formatting (or beautifying) adds proper indentation and line breaks to minified JSON data, making it easier to read and debug.' },
        { question: 'Is my JSON data safe?', answer: 'Yes. All processing happens entirely in your browser. Your JSON data never leaves your device.' },
        { question: 'What JSON errors can this tool detect?', answer: 'This tool detects syntax errors like missing commas, unclosed brackets, invalid strings, and trailing commas that are not permitted in standard JSON.' },
        { question: 'What is the difference between formatting and minifying JSON?', answer: 'Formatting adds whitespace and indentation for readability, while minifying removes all unnecessary whitespace to reduce file size for production use.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input JSON</span>
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
                <Upload className="h-3.5 w-3.5" /> Upload JSON
              </button>
              <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
              <ClearButton onClear={clear} />
            </div>
          </div>
          <ToolTextarea value={input} onChange={setInput} onPaste={handlePaste} placeholder='Paste your JSON here...\n{"key": "value"}' rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Output</span>
              {output && (
                <div className="flex rounded-md border border-border overflow-hidden">
                  <button
                    onClick={() => setViewMode('text')}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors ${viewMode === 'text' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors border-l border-border ${viewMode === 'tree' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                  >
                    Tree
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.json" mimeType="application/json" />}
            </div>
          </div>
          {viewMode === 'text' ? (
            <ToolTextarea value={output} readOnly placeholder="Formatted JSON will appear here..." rows={14} />
          ) : (
            <div className="rounded-lg border border-input bg-tool-bg p-2 font-mono text-sm overflow-auto max-h-[360px] min-h-[360px]">
              {treeData ? (
                <TreeNodeComponent node={treeData} />
              ) : (
                <p className="text-muted-foreground text-sm p-2">Formatted JSON will appear here...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button onClick={format} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Format / Beautify
        </button>
        <button onClick={minify} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors border border-border">
          Minify
        </button>
        <select value={indent} onChange={(e) => { const v = e.target.value; setIndent(v === 'tab' ? 'tab' : Number(v)) }} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value="tab">1 tab (\t)</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={sortKeysEnabled} onChange={(e) => setSortKeysEnabled(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
          Sort Keys
        </label>
      </div>

      {stats && (
        <div className="mt-3 flex flex-wrap gap-4 p-3 rounded-lg border border-border bg-muted/50 text-sm">
          <span><span className="font-medium text-muted-foreground">Size:</span> {stats.sizeBytes.toLocaleString()} bytes{stats.sizeBytes >= 1024 && ` (${(stats.sizeBytes / 1024).toFixed(1)} KB)`}</span>
          <span><span className="font-medium text-muted-foreground">Keys:</span> {stats.keys.toLocaleString()}</span>
          <span><span className="font-medium text-muted-foreground">Max Depth:</span> {stats.depth}</span>
          <span><span className="font-medium text-muted-foreground">Nodes:</span> {stats.nodes.toLocaleString()}</span>
        </div>
      )}
    </ToolPage>
  )
}
