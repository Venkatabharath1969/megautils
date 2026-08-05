'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function jsonToXml(value: unknown, tagName: string, indent: string): string {
  if (value === null || value === undefined) {
    return `${indent}<${tagName} />\n`
  }
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return `${indent}<${tagName}>${escapeXml(String(value))}</${tagName}>\n`
  }
  if (Array.isArray(value)) {
    return value.map((item) => jsonToXml(item, tagName, indent)).join('')
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    let inner = ''
    for (const [key, val] of entries) {
      const safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^(\d)/, '_$1')
      inner += jsonToXml(val, safeKey, indent + '  ')
    }
    return `${indent}<${tagName}>\n${inner}${indent}</${tagName}>\n`
  }
  return ''
}

export default function JsonToXmlTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [rootTag, setRootTag] = useState('root')
  const [error, setError] = useState('')

  const convert = () => {
    try {
      setError('')
      const parsed = JSON.parse(input)
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXml(parsed, rootTag || 'root', '')}`
      setOutput(xml)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON input')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="JSON to XML Converter" description="Convert JSON data to XML format with configurable root element" category="developer" categoryLabel="Developer Tools" faqs={[
        { question: 'How do I convert JSON to XML?', answer: 'Paste your JSON data, optionally set a root element name, and click Convert to get well-formed XML with proper indentation and an XML declaration.' },
        { question: 'How are JSON arrays handled in XML conversion?', answer: 'JSON arrays are converted by repeating the parent element tag for each array item, which is the standard convention for representing lists in XML.' },
        { question: 'Are special characters escaped in the XML output?', answer: 'Yes, characters like &, <, >, ", and apostrophes are automatically escaped to their XML entity equivalents for valid XML output.' },
        { question: 'Can I customize the root XML element name?', answer: 'Yes, use the Root Element Name field to set any custom tag name for the outermost XML element instead of the default "root".' },
      ]}>
      <div className="mb-4">
        <label className="text-sm font-medium">Root Element Name</label>
        <input
          type="text"
          value={rootTag}
          onChange={(e) => setRootTag(e.target.value)}
          className="ml-2 px-3 py-1.5 rounded-md border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="root"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">JSON Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder='{"name": "John", "age": 30, "hobbies": ["reading", "coding"]}' rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">XML Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="output.xml" mimeType="application/xml" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="XML output will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <button onClick={convert} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Convert to XML
      </button>
    </ToolPage>
  )
}
