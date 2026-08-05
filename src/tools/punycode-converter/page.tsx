'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

// Punycode parameters per RFC 3492
const BASE = 36
const TMIN = 1
const TMAX = 26
const SKEW = 38
const DAMP = 700
const INITIAL_BIAS = 72
const INITIAL_N = 128

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  delta = firstTime ? Math.floor(delta / DAMP) : Math.floor(delta / 2)
  delta += Math.floor(delta / numPoints)
  let k = 0
  while (delta > Math.floor(((BASE - TMIN) * TMAX) / 2)) {
    delta = Math.floor(delta / (BASE - TMIN))
    k += BASE
  }
  return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW))
}

function digitToChar(d: number): string {
  return d < 26 ? String.fromCharCode(97 + d) : String.fromCharCode(22 + d)
}

function charToDigit(ch: string): number {
  const code = ch.charCodeAt(0)
  if (code >= 48 && code <= 57) return code - 22
  if (code >= 65 && code <= 90) return code - 65
  if (code >= 97 && code <= 122) return code - 97
  throw new Error('Invalid Punycode character')
}

function punycodeEncode(input: string): string {
  const codePoints = Array.from(input).map((c) => c.codePointAt(0)!)
  const basicChars = codePoints.filter((cp) => cp < 128)
  const output: string[] = basicChars.map((cp) => String.fromCharCode(cp))

  let h = basicChars.length
  let b = basicChars.length

  if (b > 0) output.push('-')

  let n = INITIAL_N
  let delta = 0
  let bias = INITIAL_BIAS

  while (h < codePoints.length) {
    const m = Math.min(...codePoints.filter((cp) => cp >= n))
    delta += (m - n) * (h + 1)
    n = m

    for (const cp of codePoints) {
      if (cp < n) delta++
      if (cp === n) {
        let q = delta
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
          if (q < t) break
          output.push(digitToChar(t + ((q - t) % (BASE - t))))
          q = Math.floor((q - t) / (BASE - t))
        }
        output.push(digitToChar(q))
        bias = adapt(delta, h + 1, h === b)
        delta = 0
        h++
      }
    }
    delta++
    n++
  }

  return output.join('')
}

function punycodeDecode(input: string): string {
  const lastDash = input.lastIndexOf('-')
  let basic = lastDash > 0 ? input.slice(0, lastDash) : ''
  const encoded = lastDash >= 0 ? input.slice(lastDash + 1) : input

  const output: number[] = Array.from(basic).map((c) => c.charCodeAt(0))

  let n = INITIAL_N
  let i = 0
  let bias = INITIAL_BIAS
  let idx = 0

  while (idx < encoded.length) {
    const oldi = i
    let w = 1

    for (let k = BASE; ; k += BASE) {
      if (idx >= encoded.length) throw new Error('Invalid Punycode')
      const digit = charToDigit(encoded[idx++])
      i += digit * w
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias
      if (digit < t) break
      w *= BASE - t
    }

    bias = adapt(i - oldi, output.length + 1, oldi === 0)
    n += Math.floor(i / (output.length + 1))
    i = i % (output.length + 1)
    output.splice(i, 0, n)
    i++
  }

  return output.map((cp) => String.fromCodePoint(cp)).join('')
}

function domainToASCII(domain: string): string {
  return domain.split('.').map((label) => {
    if (/^[\x00-\x7F]*$/.test(label)) return label
    return 'xn--' + punycodeEncode(label)
  }).join('.')
}

function domainToUnicode(domain: string): string {
  return domain.split('.').map((label) => {
    if (label.startsWith('xn--')) {
      try {
        return punycodeDecode(label.slice(4))
      } catch {
        return label
      }
    }
    return label
  }).join('.')
}

export default function PunycodeConverterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'toASCII' | 'toUnicode'>('toASCII')
  const [error, setError] = useState('')

  const convert = () => {
    try {
      setError('')
      if (mode === 'toASCII') {
        setOutput(domainToASCII(input.trim()))
      } else {
        setOutput(domainToUnicode(input.trim()))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion error')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage
      title="Punycode Converter"
      description="Convert international domain names to/from Punycode (xn--) encoding"
      category="encoders"
      categoryLabel="Encoders & Decoders"
      faqs={[
        { question: 'What is Punycode?', answer: 'Punycode is an encoding system defined in RFC 3492 that converts Unicode characters (like accented letters, Chinese, or Arabic) into the limited ASCII character set used by the Domain Name System (DNS).' },
        { question: 'What does the xn-- prefix mean?', answer: 'The "xn--" prefix is the ACE (ASCII Compatible Encoding) label that indicates a domain name contains Punycode-encoded international characters. For example, "muenchen.de" with an umlaut becomes "xn--mnchen-3ya.de".' },
        { question: 'Why do international domain names need Punycode?', answer: 'DNS only supports ASCII characters (a-z, 0-9, and hyphens). Punycode allows domain names with non-ASCII characters like umlauts, accents, or CJK characters to work within this technical limitation.' },
      ]}
    >
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('toASCII')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'toASCII' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Unicode → Punycode</button>
        <button onClick={() => setMode('toUnicode')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'toUnicode' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Punycode → Unicode</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'toASCII' ? 'Unicode Domain' : 'Punycode Domain'}</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'toASCII' ? 'e.g. muenchen.de or example.com' : 'e.g. xn--mnchen-3ya.de'} rows={6} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{mode === 'toASCII' ? 'Punycode Result' : 'Unicode Result'}</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={6} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <button onClick={convert} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Convert
      </button>
    </ToolPage>
  )
}
