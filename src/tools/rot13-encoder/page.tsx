'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= 'Z' ? 65 : 97
    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base)
  })
}

function rot5(text: string): string {
  return text.replace(/[0-9]/g, (char) => {
    return String.fromCharCode(((char.charCodeAt(0) - 48 + 5) % 10) + 48)
  })
}

function rot47(text: string): string {
  return text.replace(/[!-~]/g, (char) => {
    return String.fromCharCode(((char.charCodeAt(0) - 33 + 47) % 94) + 33)
  })
}

export default function Rot13EncoderTool() {
  const [input, setInput] = useState('')
  const [enableRot5, setEnableRot5] = useState(false)
  const [enableRot47, setEnableRot47] = useState(false)

  const output = useMemo(() => {
    if (enableRot47) return rot47(input)
    let result = rot13(input)
    if (enableRot5) result = rot5(result)
    return result
  }, [input, enableRot5, enableRot47])

  return (
    <ToolPage
      title="ROT13 Encoder / Decoder"
      description="Apply ROT13 cipher to encode or decode text. ROT13 is its own inverse."
      category="encoders"
      categoryLabel="Encoders & Decoders"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>ROT13 Encoder is a free browser-based tool that lets you apply ROT13 substitution cipher that shifts each letter 13 positions in the alphabet, or decode ROT13-encoded text. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Choose your operation mode — <strong>encode</strong> or <strong>decode</strong>.</li>
            <li>Paste or type your input text in the source field.</li>
            <li>The converted result appears <strong>instantly</strong> in the output field.</li>
            <li>Copy the result for use in your code, API requests, or documents.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when obscuring spoilers, puzzle creation, or learning about basic substitution ciphers — ROT13 is its own inverse. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this cryptography tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Encoding is NOT encryption — encoded data can be decoded by anyone. Never use encoding to protect sensitive information.</li>
            <li>UTF-8 characters, emojis, and special symbols are fully supported in both encoding and decoding.</li>
            <li>When decoding, ensure the input is complete — partial or corrupted encoded strings may produce unexpected results.</li>
            <li>Check for unwanted whitespace or line breaks that may have been introduced during copy-paste operations.</li>
            <li>Processing is entirely local — your data never leaves your browser.</li>
          </ul>

          <h2>What is ROT13?</h2>
          <p>ROT13 is a specific type of <strong>Caesar cipher</strong> — one of the oldest and simplest substitution ciphers in history. It works by replacing each letter in the English alphabet with the letter exactly 13 positions after it. Since the English alphabet has 26 letters, applying ROT13 twice returns the original text, making it a perfectly symmetrical cipher. The letter A becomes N, B becomes O, C becomes P, and so on. Lowercase letters follow the same pattern: a becomes n, b becomes o, etc. Numbers, punctuation, spaces, and non-Latin characters are left completely unchanged.</p>

          <h2>History of ROT13</h2>
          <p>ROT13 gained widespread popularity in the early days of the internet, particularly on <strong>Usenet newsgroups</strong> in the 1980s and 1990s. Users applied ROT13 to hide <strong>spoilers</strong> for movies, books, and TV shows so that readers would only see the content if they deliberately chose to decode it. It was also commonly used to obscure the punchlines of jokes and answers to puzzles. Many Usenet newsreaders built in one-click ROT13 decoding for this reason. The convention was so widespread that "ROT13" became internet shorthand for any lightly obscured text. Today, ROT13 is still used in programming challenges, geocaching puzzles, and as a teaching example for basic cryptography concepts.</p>

          <h2>Is ROT13 Secure?</h2>
          <p>Absolutely not. ROT13 provides <strong>zero cryptographic security</strong>. It is trivially reversible — anyone who recognizes ROT13 text can decode it instantly, and automated tools can crack it in microseconds. ROT13 should never be used to protect passwords, personal data, confidential information, or any sensitive content. Its only legitimate purpose is <strong>casual obfuscation</strong>: hiding text from someone who is not actively trying to read it, like spoilers or puzzle answers. For actual security, use modern encryption algorithms such as AES-256 or RSA. Think of ROT13 as putting text behind a curtain, not behind a locked door.</p>
        </>
      }
      faqs={[
        { question: 'What is ROT13?', answer: 'ROT13 is a simple letter substitution cipher that replaces each letter with the letter 13 positions after it in the alphabet. Since the alphabet has 26 letters, applying ROT13 twice returns the original text.' },
        { question: 'Is ROT13 secure encryption?', answer: 'No. ROT13 provides no cryptographic security whatsoever. It is used only for obscuring text, such as hiding spoilers or puzzle answers, not for protecting sensitive information.' },
        { question: 'Does ROT13 work with numbers and special characters?', answer: 'No. ROT13 only transforms the 26 English letters (A-Z, a-z). Numbers, punctuation, spaces, and non-Latin characters pass through unchanged.' },
      ]}
    >
      <div className="mb-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
        ROT13 shifts each letter 13 positions in the alphabet. Applying it twice returns the original text.
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enableRot5} onChange={(e) => { setEnableRot5(e.target.checked); if (e.target.checked) setEnableRot47(false) }} className="rounded border-border" />
          ROT5 for digits (0-9 shifted by 5)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enableRot47} onChange={(e) => { setEnableRot47(e.target.checked); if (e.target.checked) setEnableRot5(false) }} className="rounded border-border" />
          ROT47 (all printable ASCII)
        </label>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Enter text to encode/decode with ROT13..." rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">ROT13 Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="ROT13 result will appear here..." rows={10} />
        </div>
      </div>
    </ToolPage>
  )
}
