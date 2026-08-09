'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

export default function JsonFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)

  const format = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  const minify = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

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
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder='Paste your JSON here...\n{"key": "value"}' rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.json" mimeType="application/json" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Formatted JSON will appear here..." rows={14} />
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
        <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={1}>1 tab (\t)</option>
        </select>
      </div>
    </ToolPage>
  )
}
