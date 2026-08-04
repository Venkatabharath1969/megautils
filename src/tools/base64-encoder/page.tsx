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
