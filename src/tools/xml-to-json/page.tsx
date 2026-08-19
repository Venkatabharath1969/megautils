'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

function xmlToJson(xml: string): unknown {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')
  const errorNode = doc.querySelector('parsererror')
  if (errorNode) {
    throw new Error('Invalid XML: ' + errorNode.textContent?.split('\n')[0])
  }
  return elementToJson(doc.documentElement)
}

function elementToJson(el: Element): unknown {
  const result: Record<string, unknown> = {}

  // Handle attributes
  if (el.attributes.length > 0) {
    const attrs: Record<string, string> = {}
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i]
      attrs[attr.name] = attr.value
    }
    result['@attributes'] = attrs
  }

  // Handle child nodes
  const children = el.childNodes
  let hasElementChildren = false

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child.nodeType === Node.ELEMENT_NODE) {
      hasElementChildren = true
      const childEl = child as Element
      const tagName = childEl.tagName
      const childJson = elementToJson(childEl)

      if (result[tagName] !== undefined) {
        if (!Array.isArray(result[tagName])) {
          result[tagName] = [result[tagName]]
        }
        (result[tagName] as unknown[]).push(childJson)
      } else {
        result[tagName] = childJson
      }
    }
  }

  // If no element children, get text content
  if (!hasElementChildren) {
    const text = el.textContent?.trim() || ''
    if (el.attributes.length > 0) {
      if (text) result['#text'] = text
    } else {
      return text
    }
  }

  return result
}

export default function XmlToJsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [jsonIndent, setJsonIndent] = useState<string>('2')

  const convert = () => {
    try {
      setError('')
      const parsed = xmlToJson(input.trim())
      const indentVal = jsonIndent === 'minified' ? undefined : Number(jsonIndent)
      setOutput(JSON.stringify(parsed, null, indentVal))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid XML input')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="XML to JSON Converter" description="Convert XML data to JSON format. Parses tags, attributes, and text content." category="developer" categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>XML to JSON Converter is a free browser-based tool that lets you convert XML documents to JSON format, mapping elements to objects and attributes to properties. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when integrating XML-based legacy systems with modern JSON APIs, migrating data formats, or processing XML feeds in JavaScript. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this data conversion tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I convert XML to JSON?', answer: 'Paste your XML into the input and click Convert to get a JSON representation. Element tags become keys, and repeated elements are automatically grouped into arrays.' },
        { question: 'How are XML attributes handled in JSON?', answer: 'XML attributes are placed in an @attributes object within the element, and text content of elements with attributes is stored under a #text key.' },
        { question: 'Does this tool validate XML before converting?', answer: 'Yes, the tool uses the browser DOMParser to validate XML syntax. If your XML is malformed, it will display a specific error message.' },
        { question: 'Can I convert large XML files to JSON?', answer: 'Yes, this tool processes XML entirely in your browser with no size limits imposed by a server, though very large files may take a moment to parse.' },
      ]}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">XML Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={'<person>\n  <name>John</name>\n  <age>30</age>\n  <hobbies>\n    <hobby>reading</hobby>\n    <hobby>coding</hobby>\n  </hobbies>\n</person>'} rows={14} />
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
        <select value={jsonIndent} onChange={(e) => setJsonIndent(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="minified">Minified</option>
        </select>
      </div>
    </ToolPage>
  )
}
