'use client'

import { useState } from 'react'
import * as yaml from 'js-yaml'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

export default function YamlToJsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState<string | number>(2)

  const getIndentValue = (): string | number | undefined => {
    if (indent === 'minified') return undefined
    if (indent === 'tab') return '\t'
    return indent
  }

  const convert = () => {
    try {
      if (!input.trim()) { setOutput(''); setError(''); return }

      const isMultiDoc = /^---\s*$/m.test(input)
      let result: unknown

      if (isMultiDoc) {
        const docs: unknown[] = []
        yaml.loadAll(input, (doc) => { docs.push(doc) })
        result = docs.length === 1 ? docs[0] : docs
      } else {
        result = yaml.load(input)
      }

      setOutput(JSON.stringify(result, null, getIndentValue()))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid YAML')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="YAML to JSON Converter" description="Convert YAML data to JSON format" category="developer" categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>YAML to JSON Converter is a free browser-based tool that lets you convert YAML documents to JSON format for use in APIs, databases, or applications expecting JSON input. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when converting configuration files to JSON for programmatic processing, migrating YAML configs to JSON-based systems. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this data conversion tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I convert YAML to JSON?', answer: 'Paste your YAML content into the input and click Convert to get formatted JSON output. The tool handles nested objects, arrays, and all standard YAML data types.' },
        { question: 'What YAML features are supported?', answer: 'The converter supports key-value pairs, nested objects, arrays (dash lists), inline arrays/objects, comments, quoted strings, booleans, numbers, and null values.' },
        { question: 'Why convert YAML to JSON?', answer: 'JSON is more widely supported by APIs and programming languages, so converting YAML config files to JSON is useful for debugging, API testing, and data interchange.' },
        { question: 'Is my YAML data sent to a server?', answer: 'No, all conversion happens entirely in your browser. Your data never leaves your device, making it safe for sensitive configuration files.' },
      ]}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">YAML Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'Paste YAML here...\nname: John\nage: 30'} rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">JSON Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="output.json" mimeType="application/json" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="JSON output will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button onClick={convert} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Convert to JSON
        </button>
        <select value={indent} onChange={(e) => { const v = e.target.value; setIndent(v === 'tab' || v === 'minified' ? v : Number(v)) }} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value="tab">1 tab (\t)</option>
          <option value="minified">Minified</option>
        </select>
      </div>
    </ToolPage>
  )
}
