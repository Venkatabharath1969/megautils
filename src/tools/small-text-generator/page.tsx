'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

const SUPERSCRIPT_MAP: Record<string, string> = {
  a: '\u1d43', b: '\u1d47', c: '\u1d9c', d: '\u1d48', e: '\u1d49',
  f: '\u1da0', g: '\u1d4d', h: '\u02b0', i: '\u2071', j: '\u02b2',
  k: '\u1d4f', l: '\u02e1', m: '\u1d50', n: '\u207f', o: '\u1d52',
  p: '\u1d56', q: '\u146b', r: '\u02b3', s: '\u02e2', t: '\u1d57',
  u: '\u1d58', v: '\u1d5b', w: '\u02b7', x: '\u02e3', y: '\u02b8',
  z: '\u1dbb',
  A: '\u1d2c', B: '\u1d2e', C: '\u1d9c', D: '\u1d30', E: '\u1d31',
  F: '\u1da0', G: '\u1d33', H: '\u1d34', I: '\u1d35', J: '\u1d36',
  K: '\u1d37', L: '\u1d38', M: '\u1d39', N: '\u1d3a', O: '\u1d3c',
  P: '\u1d3e', Q: '\u146b', R: '\u1d3f', S: '\u02e2', T: '\u1d40',
  U: '\u1d41', V: '\u2c7d', W: '\u1d42', X: '\u02e3', Y: '\u02b8',
  Z: '\u1dbb',
  '0': '\u2070', '1': '\u00b9', '2': '\u00b2', '3': '\u00b3', '4': '\u2074',
  '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079',
  '+': '\u207a', '-': '\u207b', '=': '\u207c', '(': '\u207d', ')': '\u207e',
}

const SUBSCRIPT_MAP: Record<string, string> = {
  a: '\u2090', e: '\u2091', h: '\u2095', i: '\u1d62', j: '\u2c7c',
  k: '\u2096', l: '\u2097', m: '\u2098', n: '\u2099', o: '\u2092',
  p: '\u209a', r: '\u1d63', s: '\u209b', t: '\u209c', u: '\u1d64',
  v: '\u1d65', x: '\u2093',
  '0': '\u2080', '1': '\u2081', '2': '\u2082', '3': '\u2083', '4': '\u2084',
  '5': '\u2085', '6': '\u2086', '7': '\u2087', '8': '\u2088', '9': '\u2089',
  '+': '\u208a', '-': '\u208b', '=': '\u208c', '(': '\u208d', ')': '\u208e',
}

const SMALL_CAPS_MAP: Record<string, string> = {
  a: '\u1d00', b: '\u0299', c: '\u1d04', d: '\u1d05', e: '\u1d07',
  f: '\ua730', g: '\u0262', h: '\u029c', i: '\u026a', j: '\u1d0a',
  k: '\u1d0b', l: '\u029f', m: '\u1d0d', n: '\u0274', o: '\u1d0f',
  p: '\u1d18', q: '\u01eb', r: '\u0280', s: '\u0455', t: '\u1d1b',
  u: '\u1d1c', v: '\u1d20', w: '\u1d21', x: '\u0078', y: '\u028f',
  z: '\u1d22',
}

function convert(text: string, map: Record<string, string>): string {
  return [...text].map(ch => map[ch] || ch).join('')
}

function toFullwidth(text: string): string {
  return [...text].map(ch => {
    const code = ch.charCodeAt(0)
    if (code === 32) return '\u3000' // fullwidth space
    if (code >= 33 && code <= 126) return String.fromCharCode(code + 0xFEE0)
    return ch
  }).join('')
}

export default function SmallTextGeneratorTool() {
  const [input, setInput] = useState('')

  const results = useMemo(() => {
    if (!input) return []
    return [
      { label: 'Superscript', value: convert(input, SUPERSCRIPT_MAP) },
      { label: 'Subscript', value: convert(input, SUBSCRIPT_MAP) },
      { label: 'Small Caps', value: convert(input.toLowerCase(), SMALL_CAPS_MAP) },
      { label: 'Fullwidth', value: toFullwidth(input) },
    ]
  }, [input])

  return (
    <ToolPage title="Small Text Generator" description="Convert text to small superscript, subscript, and small caps Unicode characters." category="text" categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Small Text Generator is a free browser-based tool that lets you convert regular text to small caps, superscript, or subscript Unicode characters for decorative formatting. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating stylized social media bios, decorative headings, or unique text formatting without HTML. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this design tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For very long documents, processing is instant but rendering the output may take a brief moment.</li>
            <li>The tool handles Unicode text correctly, including accented characters, CJK scripts, and emoji.</li>
            <li>Use the undo function in your browser (Ctrl+Z) if you need to revert input changes.</li>
            <li>Combine multiple text operations by copying the output of one tool into the input of another.</li>
            <li>No text is stored or transmitted — all processing runs locally in your browser.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'How does small text work?', answer: 'Small text uses special Unicode characters that visually resemble smaller versions of standard letters. These are real characters, not formatting, so they work anywhere text is supported.' },
        { question: 'Can I use small text on social media?', answer: 'Yes, small text generated with Unicode characters works on most social media platforms including Twitter/X, Instagram, Facebook, and Discord.' },
        { question: 'What is the difference between superscript, subscript, and small caps?', answer: 'Superscript characters appear above the text baseline (like exponents), subscript characters appear below it (like chemical formulas), and small caps are uppercase-styled letters at lowercase size.' },
      ]}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Input Text</span>
        <ClearButton onClear={() => setInput('')} />
      </div>
      <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type something here..." className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3">
          {results.map(r => (
            <div key={r.label} className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">{r.label}</span>
                <CopyButton text={r.value} />
              </div>
              <p className="text-lg break-all">{r.value}</p>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  )
}
