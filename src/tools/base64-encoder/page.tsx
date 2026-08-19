'use client'

import { useState, useMemo, useRef } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let result = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0
    result += chars[b0 >> 2]
    result += chars[((b0 & 3) << 4) | (b1 >> 4)]
    result += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '='
    result += i + 2 < bytes.length ? chars[b2 & 63] : '='
  }
  return result
}

function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromUrlSafe(urlSafe: string): string {
  let b64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4 !== 0) b64 += '='
  return b64
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function Base64EncoderTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [urlSafe, setUrlSafe] = useState(false)
  const [fileResult, setFileResult] = useState<{ name: string; size: number; dataUri: string; base64: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const output = useMemo(() => {
    if (!input) return ''
    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(input)))
        return urlSafe ? toUrlSafe(encoded) : encoded
      } else {
        const toDecode = urlSafe ? fromUrlSafe(input) : input
        return decodeURIComponent(escape(atob(toDecode)))
      }
    } catch {
      return 'Error: Invalid input for ' + mode
    }
  }, [input, mode, urlSafe])

  const clear = () => {
    setInput('')
    setFileResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer
      const base64 = arrayBufferToBase64(buffer)
      const finalBase64 = urlSafe ? toUrlSafe(base64) : base64
      const dataUri = `data:${file.type || 'application/octet-stream'};base64,${base64}`
      setFileResult({ name: file.name, size: file.size, dataUri, base64: finalBase64 })
    }
    reader.readAsArrayBuffer(file)
  }

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
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex gap-2">
          <button onClick={() => setMode('encode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'encode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Encode</button>
          <button onClick={() => setMode('decode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'decode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Decode</button>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="rounded border-border" />
          <span className="font-medium">URL-safe Base64</span>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Text Input' : 'Base64 Input'}</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here in real time..." rows={10} />
        </div>
      </div>

      {/* File-to-Base64 Section */}
      <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
        <h3 className="text-sm font-semibold mb-3">File to Base64</h3>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:transition-colors"
        />
        {fileResult && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">File: <strong className="text-foreground">{fileResult.name}</strong></span>
              <span className="text-muted-foreground">Size: <strong className="text-foreground">{formatFileSize(fileResult.size)}</strong></span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">Data URI</span>
                <CopyButton text={fileResult.dataUri} />
              </div>
              <pre className="p-3 rounded-lg bg-muted text-xs font-mono break-all max-h-32 overflow-auto">{fileResult.dataUri}</pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">Base64 String{urlSafe ? ' (URL-safe)' : ''}</span>
                <CopyButton text={fileResult.base64} />
              </div>
              <pre className="p-3 rounded-lg bg-muted text-xs font-mono break-all max-h-32 overflow-auto">{fileResult.base64}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
