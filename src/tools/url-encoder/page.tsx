'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function UrlEncoderTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [encodeType, setEncodeType] = useState<'component' | 'full'>('component')
  const [error, setError] = useState('')

  const process = () => {
    try {
      if (mode === 'encode') {
        setOutput(
          encodeType === 'component'
            ? encodeURIComponent(input)
            : encodeURI(input)
        )
      } else {
        setOutput(
          encodeType === 'component'
            ? decodeURIComponent(input)
            : decodeURI(input)
        )
      }
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid input for ' + mode)
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="URL Encoder / Decoder"
      description="Encode or decode URLs and URL components"
      category="encoders"
      categoryLabel="Encoders & Decoders"
      faqs={[
        { question: 'What is URL encoding and why is it needed?', answer: 'URL encoding replaces unsafe characters like spaces, ampersands, and equals signs with percent-encoded values (e.g., %20) so they can be safely transmitted in a URL.' },
        { question: 'What is the difference between encodeURI and encodeURIComponent?', answer: 'encodeURI encodes a full URL but preserves characters like ://?#, while encodeURIComponent encodes everything including those characters — use it for query parameter values.' },
        { question: 'Which characters need to be URL encoded?', answer: 'Characters outside the unreserved set (A-Z, a-z, 0-9, -, _, ., ~) should be encoded. Common examples include spaces (%20), ampersands (%26), and plus signs (%2B).' },
        { question: 'Is my data safe when encoding or decoding URLs here?', answer: 'Yes. All encoding and decoding runs entirely in your browser using built-in JavaScript functions. No data is sent to any server.' },
      ]}
      helpContent={
        <>
          <h2>What is URL Encoding?</h2>
          <p>
            URL encoding, also known as percent-encoding, is the process of converting characters that are not allowed or
            have special meaning in a URL into a safe representation using a percent sign followed by two hexadecimal digits.
            For example, a space becomes <code>%20</code>, an ampersand becomes <code>%26</code>, and an equals sign becomes
            <code>%3D</code>. This is necessary because URLs can only contain a limited set of characters from the ASCII
            character set — letters, digits, hyphens, underscores, periods, and tildes are safe, but everything else must be
            encoded. Without proper encoding, browsers and servers may misinterpret characters like <code>&amp;</code> or
            <code>=</code> as query-string delimiters rather than literal values. This tool supports both
            <code>encodeURIComponent</code>, which encodes individual parameter values, and <code>encodeURI</code>, which
            encodes a full URL while preserving structural characters like colons, slashes, and question marks. Decoding
            reverses the process, restoring percent-encoded strings back to their original readable form.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Select the mode: click <strong>Encode</strong> to convert plain text into a URL-safe format, or <strong>Decode</strong> to convert a percent-encoded string back to readable text.</li>
            <li>Choose the encoding type from the dropdown: <strong>URI Component</strong> encodes everything including colons and slashes (best for query parameter values), while <strong>Full URI</strong> preserves URL structure characters.</li>
            <li>Paste or type your text into the input panel on the left.</li>
            <li>Click the <strong>Encode URL</strong> or <strong>Decode URL</strong> button to process your input.</li>
            <li>The result appears in the output panel on the right. Click <strong>Copy</strong> to send it to your clipboard.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Use <code>encodeURIComponent</code> (URI Component mode) when encoding values that will be placed inside query string parameters — this encodes characters like <code>&amp;</code>, <code>=</code>, and <code>/</code> that would otherwise break the URL structure.</li>
            <li>Use <code>encodeURI</code> (Full URI mode) only when encoding a complete URL where you want to preserve the protocol, domain, path separators, and query delimiters.</li>
            <li>Double-encoding is a common mistake. If your text already contains percent-encoded sequences like <code>%20</code>, decoding first and then re-encoding prevents sequences like <code>%2520</code>.</li>
            <li>When building URLs programmatically, always encode user-supplied input to prevent injection attacks and malformed requests.</li>
            <li>Test decoded output carefully — if decoding produces an error, the input may contain an invalid percent sequence such as <code>%ZZ</code>, which is not valid hexadecimal.</li>
            <li>Remember that the plus sign (<code>+</code>) is sometimes used to represent a space in form submissions but is not the same as <code>%20</code>. This tool uses standard percent-encoding, which converts spaces to <code>%20</code>.</li>
          </ul>
        </>
      }
    >
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
        <select
          value={encodeType}
          onChange={(e) => setEncodeType(e.target.value as 'component' | 'full')}
          className="h-9 px-3 rounded-md border border-input bg-card text-sm"
        >
          <option value="component">URI Component</option>
          <option value="full">Full URI</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Plain Text' : 'Encoded URL'}</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={mode === 'encode' ? 'Enter text to encode...\nhello world & foo=bar' : 'Enter encoded URL to decode...\nhello%20world%20%26%20foo%3Dbar'}
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
        {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
      </button>
    </ToolPage>
  )
}
