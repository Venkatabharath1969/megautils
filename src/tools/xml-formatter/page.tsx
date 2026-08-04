'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function formatXml(xml: string, indentSize: number = 2): string {
  // Remove existing whitespace between tags
  let formatted = ''
  const stripped = xml.replace(/>\s+</g, '><').trim()

  if (!stripped.startsWith('<')) throw new Error('Input does not appear to be valid XML')

  let indent = 0
  const pad = ' '.repeat(indentSize)
  const tokens = stripped.match(/<[^>]+>|[^<]+/g)

  if (!tokens) throw new Error('Could not parse XML')

  for (const token of tokens) {
    if (token.match(/^<\?/)) {
      // Processing instruction: <?xml ... ?>
      formatted += pad.repeat(indent) + token + '\n'
    } else if (token.match(/^<!--/)) {
      // Comment
      formatted += pad.repeat(indent) + token + '\n'
    } else if (token.match(/^<!\[CDATA\[/)) {
      // CDATA
      formatted += pad.repeat(indent) + token + '\n'
    } else if (token.match(/^<\//)) {
      // Closing tag
      indent = Math.max(0, indent - 1)
      formatted += pad.repeat(indent) + token + '\n'
    } else if (token.match(/\/>$/)) {
      // Self-closing tag
      formatted += pad.repeat(indent) + token + '\n'
    } else if (token.match(/^</)) {
      // Opening tag
      formatted += pad.repeat(indent) + token + '\n'
      indent++
    } else {
      // Text content
      const text = token.trim()
      if (text) {
        // Inline text: remove the previous newline and put text on same line as opening tag
        formatted = formatted.replace(/\n$/, '')
        formatted += text
        // Peek: if the closing tag follows, we want to keep it inline
      }
    }
  }

  // Clean up inline text + closing tag: merge lines where text and closing tag are adjacent
  const lines = formatted.split('\n')
  const merged: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (i > 0 && merged.length > 0) {
      const prev = merged[merged.length - 1]
      // If previous line doesn't end with > and current line is a closing tag
      if (!prev.trimEnd().endsWith('>') && line.trim().startsWith('</')) {
        merged[merged.length - 1] = prev + line.trim()
        continue
      }
    }
    merged.push(line)
  }

  return merged.join('\n').trim()
}

function minifyXml(xml: string): string {
  return xml.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim()
}

export default function XmlFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)

  const format = () => {
    try {
      setOutput(formatXml(input, indent))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid XML')
      setOutput('')
    }
  }

  const minify = () => {
    try {
      setOutput(minifyXml(input))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid XML')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="XML Formatter" description="Format, beautify, and minify XML data" category="developer" categoryLabel="Developer Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">XML Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder='Paste XML here...\n<root><item>value</item></root>' rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Formatted Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.xml" mimeType="application/xml" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Formatted XML will appear here..." rows={14} />
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
        </select>
      </div>
    </ToolPage>
  )
}
