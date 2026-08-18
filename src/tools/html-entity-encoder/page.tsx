'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

const NAMED_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '\u00A0': '&nbsp;',
  '\u00A9': '&copy;',
  '\u00AE': '&reg;',
  '\u2122': '&trade;',
  '\u2019': '&rsquo;',
  '\u2018': '&lsquo;',
  '\u201C': '&ldquo;',
  '\u201D': '&rdquo;',
  '\u2013': '&ndash;',
  '\u2014': '&mdash;',
  '\u2026': '&hellip;',
}

const REVERSE_ENTITIES: Record<string, string> = {}
for (const [char, entity] of Object.entries(NAMED_ENTITIES)) {
  REVERSE_ENTITIES[entity] = char
}

function encodeHtmlEntities(text: string, mode: 'named' | 'numeric'): string {
  let result = ''
  for (const char of text) {
    if (mode === 'named' && NAMED_ENTITIES[char]) {
      result += NAMED_ENTITIES[char]
    } else if (char.charCodeAt(0) > 127 || (mode === 'numeric' && NAMED_ENTITIES[char])) {
      result += '&#' + char.charCodeAt(0) + ';'
    } else if (NAMED_ENTITIES[char]) {
      result += NAMED_ENTITIES[char]
    } else {
      result += char
    }
  }
  return result
}

function decodeHtmlEntities(text: string): string {
  let result = text

  // Decode named entities
  for (const [entity, char] of Object.entries(REVERSE_ENTITIES)) {
    result = result.split(entity).join(char)
  }

  // Decode numeric entities (decimal)
  result = result.replace(/&#(\d+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 10))
  })

  // Decode hex entities
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 16))
  })

  return result
}

export default function HtmlEntityEncoderTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [entityMode, setEntityMode] = useState<'named' | 'numeric'>('named')
  const [error, setError] = useState('')

  const process = () => {
    try {
      if (mode === 'encode') {
        setOutput(encodeHtmlEntities(input, entityMode))
      } else {
        setOutput(decodeHtmlEntities(input))
      }
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error processing input')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="HTML Entity Encoder / Decoder" description="Encode special characters to HTML entities or decode entities back to text" category="encoders" categoryLabel="Encoders & Decoders"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>HTML Entity Encoder/Decoder is a free browser-based tool that lets you convert special characters to HTML entities and decode HTML entities back to readable characters. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when preventing XSS attacks by encoding user input, displaying special characters in HTML, or decoding HTML-encoded content. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web security tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need html entity encoding.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'What are HTML entities?', answer: 'HTML entities are special codes like &amp; for & and &lt; for < that represent reserved characters in HTML so they display correctly in web pages.' },
        { question: 'When should I encode HTML entities?', answer: 'Encode HTML entities when displaying user-generated content on web pages to prevent XSS attacks and ensure special characters like <, >, and & render properly.' },
        { question: 'What is the difference between named and numeric HTML entities?', answer: 'Named entities use readable codes like &amp;amp; while numeric entities use character codes like &amp;#38;. Both produce the same result but named entities are more readable.' },
        { question: 'Can I decode HTML entities back to plain text?', answer: 'Yes, switch to Decode mode and paste your HTML entities to convert them back to their original characters, supporting named, decimal, and hex entity formats.' },
      ]}>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setMode('encode')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
        >
          Decode
        </button>
        {mode === 'encode' && (
          <select
            value={entityMode}
            onChange={(e) => setEntityMode(e.target.value as 'named' | 'numeric')}
            className="h-9 px-3 rounded-md border border-input bg-card text-sm"
          >
            <option value="named">Named Entities (&amp;amp;)</option>
            <option value="numeric">Numeric Entities (&amp;#38;)</option>
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Text Input' : 'HTML Entity Input'}</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={mode === 'encode' ? 'Enter text with special characters...\n<div class="test"> Hello & World </div>' : 'Enter HTML entities to decode...\n&lt;div class=&quot;test&quot;&gt;'}
            rows={10}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>

      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}

      <button onClick={process} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        {mode === 'encode' ? 'Encode Entities' : 'Decode Entities'}
      </button>
    </ToolPage>
  )
}
