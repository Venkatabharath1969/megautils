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

  const convert = () => {
    try {
      setError('')
      const parsed = xmlToJson(input.trim())
      setOutput(JSON.stringify(parsed, null, 2))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid XML input')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="XML to JSON Converter" description="Convert XML data to JSON format. Parses tags, attributes, and text content." category="developer" categoryLabel="Developer Tools" faqs={[
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
      <button onClick={convert} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Convert to JSON
      </button>
    </ToolPage>
  )
}
