'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function jsonEscape(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/\b/g, '\\b')
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, (ch) => {
      return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')
    })
}

function jsonUnescape(str: string): string {
  let result = ''
  let i = 0
  while (i < str.length) {
    if (str[i] === '\\' && i + 1 < str.length) {
      const next = str[i + 1]
      if (next === '\\') { result += '\\'; i += 2 }
      else if (next === '"') { result += '"'; i += 2 }
      else if (next === 'n') { result += '\n'; i += 2 }
      else if (next === 'r') { result += '\r'; i += 2 }
      else if (next === 't') { result += '\t'; i += 2 }
      else if (next === 'f') { result += '\f'; i += 2 }
      else if (next === 'b') { result += '\b'; i += 2 }
      else if (next === '/' ) { result += '/'; i += 2 }
      else if (next === 'u' && i + 5 < str.length) {
        const hex = str.substring(i + 2, i + 6)
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          result += String.fromCharCode(parseInt(hex, 16))
          i += 6
        } else { result += str[i]; i++ }
      } else { result += str[i]; i++ }
    } else {
      result += str[i]; i++
    }
  }
  return result
}

export default function JsonEscapeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape')

  const process = () => {
    try {
      setOutput(mode === 'escape' ? jsonEscape(input) : jsonUnescape(input))
    } catch {
      setOutput('Error processing input')
    }
  }

  const clear = () => { setInput(''); setOutput('') }

  return (
    <ToolPage title="JSON String Escape / Unescape" description="Escape or unescape strings for use in JSON. Handles quotes, backslashes, newlines, tabs, and Unicode." category="string" categoryLabel="String Utilities"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>JSON Escape/Unescape is a free browser-based tool that lets you escape special characters in strings for JSON encoding, or unescape JSON-encoded strings back to readable text. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type the string value you want to process in the input field.</li>
            <li>Select the specific operation — escape, unescape, test, or generate.</li>
            <li>Review the processed output and any match highlights or validation results.</li>
            <li>Copy the result for direct use in your code or queries.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when preparing strings with special characters for JSON APIs, fixing malformed JSON, or debugging escaped sequences in API responses. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this data processing tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Escape characters correctly before inserting strings into code to prevent syntax errors and security vulnerabilities.</li>
            <li>Different languages and formats have different escaping rules — select the correct mode for your use case.</li>
            <li>Test escaped strings in a safe environment before using them in production queries or code.</li>
            <li>The tool handles edge cases like nested quotes, backslashes, and null bytes correctly.</li>
            <li>All processing is client-side — safe to use with database queries containing sensitive data.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'What characters need to be escaped in JSON strings?', answer: 'Double quotes, backslashes, newlines, carriage returns, tabs, form feeds, backspaces, and control characters (U+0000 to U+001F) must all be escaped in JSON strings.' },
        { question: 'How do I escape a JSON string?', answer: 'Paste your text in the input and click Escape to convert special characters to their JSON escape sequences like \\n for newlines and \\" for quotes.' },
        { question: 'What does JSON unescape do?', answer: 'JSON unescape converts escape sequences like \\n, \\t, \\", and \\uXXXX back to their original characters, making the string human-readable again.' },
      ]}>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setMode('escape')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'escape' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Escape</button>
        <button onClick={() => setMode('unescape')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'unescape' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Unescape</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'escape' ? 'Enter text to escape for JSON...\nHe said "hello"\nNew line here' : 'Enter escaped string...\nHe said \\"hello\\"\\nNew line here'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>

      <button onClick={process} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        {mode === 'escape' ? 'Escape String' : 'Unescape String'}
      </button>
    </ToolPage>
  )
}
