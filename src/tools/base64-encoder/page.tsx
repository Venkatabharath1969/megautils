'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function Base64EncoderTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const process = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input))))
      }
    } catch {
      setOutput('Error: Invalid input for ' + mode)
    }
  }

  const clear = () => { setInput(''); setOutput('') }

  return (
    <ToolPage
      title="Base64 Encoder / Decoder"
      description="Encode text to Base64 or decode Base64 to text. Supports UTF-8."
      category="encoders"
      categoryLabel="Encoders & Decoders"
      helpContent={
        <>
          <h2>What is Base64 Encoding?</h2>
          <p>
            Base64 is a binary-to-text encoding scheme that represents binary data using a set of 64 ASCII characters (A–Z, a–z, 0–9, <code>+</code>, and <code>/</code>, plus <code>=</code> for padding). It was originally designed to transmit binary content over channels that only support text, such as email (MIME) and early HTTP. Today Base64 is used everywhere in web development — from embedding images directly in HTML and CSS via data URIs, to encoding authentication tokens, to passing binary payloads through JSON APIs that only accept string values.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Select a mode: click <strong>Encode</strong> to convert plain text into Base64, or <strong>Decode</strong> to convert a Base64 string back to readable text.</li>
            <li>Paste or type your content into the left <strong>Input</strong> panel.</li>
            <li>Click the <strong>Encode to Base64</strong> (or <strong>Decode from Base64</strong>) button.</li>
            <li>The result appears instantly in the right <strong>Output</strong> panel.</li>
            <li>Use the <strong>Copy</strong> button to copy the result to your clipboard for use in code, configuration files, or API requests.</li>
          </ol>

          <h2>When to Use Base64 Encoding</h2>
          <p>
            Base64 is the right choice when you need to embed a small image or font directly inside a stylesheet to reduce HTTP requests, when you are constructing a <code>data:</code> URI, or when an API requires you to submit file content as a JSON string. It is also commonly used to inspect or debug encoded values you encounter in JWTs, email headers, or URL parameters.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li><strong>Base64 is not encryption.</strong> It provides no security whatsoever — anyone can decode it instantly. Never use it as a way to hide sensitive data.</li>
            <li>Encoding increases size by roughly <strong>33 %</strong>. For large files, sending the binary directly (e.g., via <code>multipart/form-data</code>) is far more efficient than Base64-encoding it into JSON.</li>
            <li>This tool on utilsnow.com fully supports <strong>UTF-8</strong>, so accented characters, CJK text, and emojis encode and decode correctly.</li>
            <li>When embedding Base64 in CSS, use the format <code>url(data:image/png;base64,...)</code> and keep the encoded asset under a few kilobytes to avoid slowing down stylesheet parsing.</li>
            <li>If a Base64 string looks corrupted after decoding, make sure no extra whitespace or line breaks were introduced during copy-paste — Base64 strings must be continuous.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is Base64 encoding used for?', answer: 'Base64 encoding converts binary data into ASCII text, commonly used to embed images in HTML/CSS, transmit data in URLs, and send email attachments via MIME.' },
        { question: 'Is Base64 encoding the same as encryption?', answer: 'No. Base64 is an encoding scheme, not encryption. It does not provide any security — anyone can decode Base64 data without a key.' },
        { question: 'Does Base64 encoding increase file size?', answer: 'Yes. Base64 encoding increases data size by approximately 33% because it represents 3 bytes of binary data as 4 ASCII characters.' },
        { question: 'Can this tool handle special characters and emojis?', answer: 'Yes. This tool fully supports UTF-8 encoding, so special characters, accented letters, and emojis are encoded and decoded correctly.' },
      ]}
    >
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('encode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Encode</button>
        <button onClick={() => setMode('decode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Decode</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Text Input' : 'Base64 Input'}</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={(v) => { setInput(v); }} placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>
      <button onClick={process} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
      </button>
    </ToolPage>
  )
}
