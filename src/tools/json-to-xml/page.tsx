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

function jsonToXml(value: unknown, tagName: string, indent: string, indentUnit: string): string {
  if (value === null || value === undefined) {
    return `${indent}<${tagName} />\n`
  }
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return `${indent}<${tagName}>${escapeXml(String(value))}</${tagName}>\n`
  }
  if (Array.isArray(value)) {
    return value.map((item) => jsonToXml(item, tagName, indent, indentUnit)).join('')
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    let inner = ''
    for (const [key, val] of entries) {
      const safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^(\d)/, '_$1')
      inner += jsonToXml(val, safeKey, indent + indentUnit, indentUnit)
    }
    return `${indent}<${tagName}>\n${inner}${indent}</${tagName}>\n`
  }
  return ''
}

function minifyXml(xml: string): string {
  return xml.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim()
}

export default function JsonToXmlTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [rootTag, setRootTag] = useState('root')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState(2)
  const [minified, setMinified] = useState(false)

  const convert = () => {
    try {
      setError('')
      const parsed = JSON.parse(input)
      const indentUnit = ' '.repeat(indentSize)
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXml(parsed, rootTag || 'root', '', indentUnit)}`
      if (minified) xml = minifyXml(xml)
      setOutput(xml)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON input')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="JSON to XML Converter" description="Convert JSON data to XML format with configurable root element" category="developer" categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>JSON to XML Converter is a free browser-based tool that lets you convert JSON data to XML format with proper element nesting, attributes, and encoding. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when integrating with legacy XML-based systems, preparing data for SOAP APIs, or converting modern JSON APIs to XML format. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this data conversion tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I convert JSON to XML?', answer: 'Paste your JSON data, optionally set a root element name, and click Convert to get well-formed XML with proper indentation and an XML declaration.' },
        { question: 'How are JSON arrays handled in XML conversion?', answer: 'JSON arrays are converted by repeating the parent element tag for each array item, which is the standard convention for representing lists in XML.' },
        { question: 'Are special characters escaped in the XML output?', answer: 'Yes, characters like &, <, >, ", and apostrophes are automatically escaped to their XML entity equivalents for valid XML output.' },
        { question: 'Can I customize the root XML element name?', answer: 'Yes, use the Root Element Name field to set any custom tag name for the outermost XML element instead of the default "root".' },
      ]}>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div>
          <label className="text-sm font-medium">Root Element Name</label>
          <input
            type="text"
            value={rootTag}
            onChange={(e) => setRootTag(e.target.value)}
            className="ml-2 px-3 py-1.5 rounded-md border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="root"
          />
        </div>
        <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
          <input
            type="checkbox"
            checked={minified}
            onChange={(e) => setMinified(e.target.checked)}
            className="rounded border-input"
          />
          Minified
        </label>
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
