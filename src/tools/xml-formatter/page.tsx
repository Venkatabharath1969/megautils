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
    <ToolPage
      title="XML Formatter"
      description="Format, beautify, and minify XML data"
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>XML Formatter is a free browser-based tool that lets you format and beautify XML documents with proper indentation, tag alignment, and attribute formatting. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when reading minified XML, debugging API responses, formatting configuration files, or preparing XML for documentation. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need xml formatting.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I pretty-print XML?', answer: 'Paste your XML into the input field and click "Format / Beautify" to add proper indentation and line breaks, making the nested tag structure easy to read.' },
        { question: 'What does minifying XML do?', answer: 'Minifying XML removes all unnecessary whitespace between tags, reducing the file size for faster transmission over networks or more compact storage.' },
        { question: 'Does formatting XML change the data content?', answer: 'No, formatting only adjusts whitespace and indentation between tags. All element names, attributes, and text content remain exactly the same.' },
        { question: 'Can this formatter handle XML with CDATA sections and comments?', answer: 'Yes, the formatter preserves CDATA sections, comments, and processing instructions like the XML declaration while properly indenting the surrounding structure.' },
      ]}
    >
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
