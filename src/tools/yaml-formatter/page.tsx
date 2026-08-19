'use client'

import { useState } from 'react'
import * as yaml from 'js-yaml'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

export default function YamlFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState(2)
  const [sortKeysEnabled, setSortKeysEnabled] = useState(false)

  const format = () => {
    try {
      setError('')
      if (!input.trim()) { setOutput(''); return }
      const parsed = yaml.load(input)
      const formatted = yaml.dump(parsed, {
        indent: indentSize,
        sortKeys: sortKeysEnabled,
        lineWidth: -1,
        noRefs: true,
      })
      setOutput(formatted.trimEnd())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid YAML input')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="YAML Formatter"
      description="Format and beautify YAML with consistent indentation"
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>YAML Formatter is a free browser-based tool that lets you format and validate YAML documents with proper indentation, consistent style, and syntax checking. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when cleaning up Kubernetes manifests, Docker Compose files, CI/CD configurations, or any YAML-based config. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this DevOps tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'Why is indentation so important in YAML?', answer: 'YAML uses indentation to define structure and hierarchy instead of brackets or tags, so incorrect indentation will change the meaning of your data or cause parsing errors.' },
        { question: 'How many spaces should I use for YAML indentation?', answer: 'Two spaces per level is the most common convention in YAML files. Tabs are not allowed in YAML, so spaces must be used for indentation.' },
        { question: 'Can this tool fix broken YAML indentation?', answer: 'Yes, paste your YAML and click "Format" to parse it and regenerate it with clean, consistent two-space indentation throughout the document.' },
        { question: 'What is the difference between YAML and JSON?', answer: 'YAML is a superset of JSON that uses indentation instead of braces, supports comments, and is generally more human-readable, making it popular for configuration files.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">YAML Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'name: John\nage: 30\nhobbies:\n  - reading\n  - coding'} rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Formatted Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.yaml" mimeType="text/yaml" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Formatted YAML will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button onClick={format} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Format YAML
        </button>
        <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={sortKeysEnabled} onChange={(e) => setSortKeysEnabled(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
          Sort Keys
        </label>
      </div>
    </ToolPage>
  )
}
