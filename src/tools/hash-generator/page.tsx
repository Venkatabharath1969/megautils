'use client'

import { useState, useEffect, useRef } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

// Simple MD5 implementation (Web Crypto doesn't support MD5)
function md5(input: string): string {
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt))
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  function binlMD5(x: number[], len: number): number[] {
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d
      a = md5ff(a, b, c, d, x[i] || 0, 7, -680876936); d = md5ff(d, a, b, c, x[i + 1] || 0, 12, -389564586)
      c = md5ff(c, d, a, b, x[i + 2] || 0, 17, 606105819); b = md5ff(b, c, d, a, x[i + 3] || 0, 22, -1044525330)
      a = md5ff(a, b, c, d, x[i + 4] || 0, 7, -176418897); d = md5ff(d, a, b, c, x[i + 5] || 0, 12, 1200080426)
      c = md5ff(c, d, a, b, x[i + 6] || 0, 17, -1473231341); b = md5ff(b, c, d, a, x[i + 7] || 0, 22, -45705983)
      a = md5ff(a, b, c, d, x[i + 8] || 0, 7, 1770035416); d = md5ff(d, a, b, c, x[i + 9] || 0, 12, -1958414417)
      c = md5ff(c, d, a, b, x[i + 10] || 0, 17, -42063); b = md5ff(b, c, d, a, x[i + 11] || 0, 22, -1990404162)
      a = md5ff(a, b, c, d, x[i + 12] || 0, 7, 1804603682); d = md5ff(d, a, b, c, x[i + 13] || 0, 12, -40341101)
      c = md5ff(c, d, a, b, x[i + 14] || 0, 17, -1502002290); b = md5ff(b, c, d, a, x[i + 15] || 0, 22, 1236535329)
      a = md5gg(a, b, c, d, x[i + 1] || 0, 5, -165796510); d = md5gg(d, a, b, c, x[i + 6] || 0, 9, -1069501632)
      c = md5gg(c, d, a, b, x[i + 11] || 0, 14, 643717713); b = md5gg(b, c, d, a, x[i] || 0, 20, -373897302)
      a = md5gg(a, b, c, d, x[i + 5] || 0, 5, -701558691); d = md5gg(d, a, b, c, x[i + 10] || 0, 9, 38016083)
      c = md5gg(c, d, a, b, x[i + 15] || 0, 14, -660478335); b = md5gg(b, c, d, a, x[i + 4] || 0, 20, -405537848)
      a = md5gg(a, b, c, d, x[i + 9] || 0, 5, 568446438); d = md5gg(d, a, b, c, x[i + 14] || 0, 9, -1019803690)
      c = md5gg(c, d, a, b, x[i + 3] || 0, 14, -187363961); b = md5gg(b, c, d, a, x[i + 8] || 0, 20, 1163531501)
      a = md5gg(a, b, c, d, x[i + 13] || 0, 5, -1444681467); d = md5gg(d, a, b, c, x[i + 2] || 0, 9, -51403784)
      c = md5gg(c, d, a, b, x[i + 7] || 0, 14, 1735328473); b = md5gg(b, c, d, a, x[i + 12] || 0, 20, -1926607734)
      a = md5hh(a, b, c, d, x[i + 5] || 0, 4, -378558); d = md5hh(d, a, b, c, x[i + 8] || 0, 11, -2022574463)
      c = md5hh(c, d, a, b, x[i + 11] || 0, 16, 1839030562); b = md5hh(b, c, d, a, x[i + 14] || 0, 23, -35309556)
      a = md5hh(a, b, c, d, x[i + 1] || 0, 4, -1530992060); d = md5hh(d, a, b, c, x[i + 4] || 0, 11, 1272893353)
      c = md5hh(c, d, a, b, x[i + 7] || 0, 16, -155497632); b = md5hh(b, c, d, a, x[i + 10] || 0, 23, -1094730640)
      a = md5hh(a, b, c, d, x[i + 13] || 0, 4, 681279174); d = md5hh(d, a, b, c, x[i] || 0, 11, -358537222)
      c = md5hh(c, d, a, b, x[i + 3] || 0, 16, -722521979); b = md5hh(b, c, d, a, x[i + 6] || 0, 23, 76029189)
      a = md5hh(a, b, c, d, x[i + 9] || 0, 4, -640364487); d = md5hh(d, a, b, c, x[i + 12] || 0, 11, -421815835)
      c = md5hh(c, d, a, b, x[i + 15] || 0, 16, 530742520); b = md5hh(b, c, d, a, x[i + 2] || 0, 23, -995338651)
      a = md5ii(a, b, c, d, x[i] || 0, 6, -198630844); d = md5ii(d, a, b, c, x[i + 7] || 0, 10, 1126891415)
      c = md5ii(c, d, a, b, x[i + 14] || 0, 15, -1416354905); b = md5ii(b, c, d, a, x[i + 5] || 0, 21, -57434055)
      a = md5ii(a, b, c, d, x[i + 12] || 0, 6, 1700485571); d = md5ii(d, a, b, c, x[i + 3] || 0, 10, -1894986606)
      c = md5ii(c, d, a, b, x[i + 10] || 0, 15, -1051523); b = md5ii(b, c, d, a, x[i + 1] || 0, 21, -2054922799)
      a = md5ii(a, b, c, d, x[i + 8] || 0, 6, 1873313359); d = md5ii(d, a, b, c, x[i + 15] || 0, 10, -30611744)
      c = md5ii(c, d, a, b, x[i + 6] || 0, 15, -1560198380); b = md5ii(b, c, d, a, x[i + 13] || 0, 21, 1309151649)
      a = md5ii(a, b, c, d, x[i + 4] || 0, 6, -145523070); d = md5ii(d, a, b, c, x[i + 11] || 0, 10, -1120210379)
      c = md5ii(c, d, a, b, x[i + 2] || 0, 15, 718787259); b = md5ii(b, c, d, a, x[i + 9] || 0, 21, -343485551)
      a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd)
    }
    return [a, b, c, d]
  }

  function rstrMD5(s: string): string {
    const input = unescape(encodeURIComponent(s))
    const x: number[] = []
    for (let i = 0; i < input.length * 8; i += 8) {
      x[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32)
    }
    const output = binlMD5(x, input.length * 8)
    let hex = ''
    for (let i = 0; i < output.length * 4; i++) {
      hex += ('0' + ((output[i >> 2] >> ((i % 4) * 8)) & 0xff).toString(16)).slice(-2)
    }
    return hex
  }

  return rstrMD5(input)
}

async function hashBufferWithCrypto(algorithm: string, data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hashWithCrypto(algorithm: string, text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  return hashBufferWithCrypto(algorithm, data.buffer as ArrayBuffer)
}

async function computeHmac(algorithm: string, key: string, text: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(key)
  const msgData = encoder.encode(text)
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: algorithm }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function md5Bytes(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  function safeAdd(x: number, y: number) {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt))
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t) }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t) }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t) }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t) }

  const len = bytes.length * 8
  const x: number[] = []
  for (let i = 0; i < bytes.length; i++) {
    x[i >> 2] |= bytes[i] << ((i % 4) * 8)
  }
  x[len >> 5] |= 0x80 << (len % 32)
  x[(((len + 64) >>> 9) << 4) + 14] = len

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878
  for (let i = 0; i < x.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d
    a = md5ff(a, b, c, d, x[i] || 0, 7, -680876936); d = md5ff(d, a, b, c, x[i + 1] || 0, 12, -389564586)
    c = md5ff(c, d, a, b, x[i + 2] || 0, 17, 606105819); b = md5ff(b, c, d, a, x[i + 3] || 0, 22, -1044525330)
    a = md5ff(a, b, c, d, x[i + 4] || 0, 7, -176418897); d = md5ff(d, a, b, c, x[i + 5] || 0, 12, 1200080426)
    c = md5ff(c, d, a, b, x[i + 6] || 0, 17, -1473231341); b = md5ff(b, c, d, a, x[i + 7] || 0, 22, -45705983)
    a = md5ff(a, b, c, d, x[i + 8] || 0, 7, 1770035416); d = md5ff(d, a, b, c, x[i + 9] || 0, 12, -1958414417)
    c = md5ff(c, d, a, b, x[i + 10] || 0, 17, -42063); b = md5ff(b, c, d, a, x[i + 11] || 0, 22, -1990404162)
    a = md5ff(a, b, c, d, x[i + 12] || 0, 7, 1804603682); d = md5ff(d, a, b, c, x[i + 13] || 0, 12, -40341101)
    c = md5ff(c, d, a, b, x[i + 14] || 0, 17, -1502002290); b = md5ff(b, c, d, a, x[i + 15] || 0, 22, 1236535329)
    a = md5gg(a, b, c, d, x[i + 1] || 0, 5, -165796510); d = md5gg(d, a, b, c, x[i + 6] || 0, 9, -1069501632)
    c = md5gg(c, d, a, b, x[i + 11] || 0, 14, 643717713); b = md5gg(b, c, d, a, x[i] || 0, 20, -373897302)
    a = md5gg(a, b, c, d, x[i + 5] || 0, 5, -701558691); d = md5gg(d, a, b, c, x[i + 10] || 0, 9, 38016083)
    c = md5gg(c, d, a, b, x[i + 15] || 0, 14, -660478335); b = md5gg(b, c, d, a, x[i + 4] || 0, 20, -405537848)
    a = md5gg(a, b, c, d, x[i + 9] || 0, 5, 568446438); d = md5gg(d, a, b, c, x[i + 14] || 0, 9, -1019803690)
    c = md5gg(c, d, a, b, x[i + 3] || 0, 14, -187363961); b = md5gg(b, c, d, a, x[i + 8] || 0, 20, 1163531501)
    a = md5gg(a, b, c, d, x[i + 13] || 0, 5, -1444681467); d = md5gg(d, a, b, c, x[i + 2] || 0, 9, -51403784)
    c = md5gg(c, d, a, b, x[i + 7] || 0, 14, 1735328473); b = md5gg(b, c, d, a, x[i + 12] || 0, 20, -1926607734)
    a = md5hh(a, b, c, d, x[i + 5] || 0, 4, -378558); d = md5hh(d, a, b, c, x[i + 8] || 0, 11, -2022574463)
    c = md5hh(c, d, a, b, x[i + 11] || 0, 16, 1839030562); b = md5hh(b, c, d, a, x[i + 14] || 0, 23, -35309556)
    a = md5hh(a, b, c, d, x[i + 1] || 0, 4, -1530992060); d = md5hh(d, a, b, c, x[i + 4] || 0, 11, 1272893353)
    c = md5hh(c, d, a, b, x[i + 7] || 0, 16, -155497632); b = md5hh(b, c, d, a, x[i + 10] || 0, 23, -1094730640)
    a = md5hh(a, b, c, d, x[i + 13] || 0, 4, 681279174); d = md5hh(d, a, b, c, x[i] || 0, 11, -358537222)
    c = md5hh(c, d, a, b, x[i + 3] || 0, 16, -722521979); b = md5hh(b, c, d, a, x[i + 6] || 0, 23, 76029189)
    a = md5hh(a, b, c, d, x[i + 9] || 0, 4, -640364487); d = md5hh(d, a, b, c, x[i + 12] || 0, 11, -421815835)
    c = md5hh(c, d, a, b, x[i + 15] || 0, 16, 530742520); b = md5hh(b, c, d, a, x[i + 2] || 0, 23, -995338651)
    a = md5ii(a, b, c, d, x[i] || 0, 6, -198630844); d = md5ii(d, a, b, c, x[i + 7] || 0, 10, 1126891415)
    c = md5ii(c, d, a, b, x[i + 14] || 0, 15, -1416354905); b = md5ii(b, c, d, a, x[i + 5] || 0, 21, -57434055)
    a = md5ii(a, b, c, d, x[i + 12] || 0, 6, 1700485571); d = md5ii(d, a, b, c, x[i + 3] || 0, 10, -1894986606)
    c = md5ii(c, d, a, b, x[i + 10] || 0, 15, -1051523); b = md5ii(b, c, d, a, x[i + 1] || 0, 21, -2054922799)
    a = md5ii(a, b, c, d, x[i + 8] || 0, 6, 1873313359); d = md5ii(d, a, b, c, x[i + 15] || 0, 10, -30611744)
    c = md5ii(c, d, a, b, x[i + 6] || 0, 15, -1560198380); b = md5ii(b, c, d, a, x[i + 13] || 0, 21, 1309151649)
    a = md5ii(a, b, c, d, x[i + 4] || 0, 6, -145523070); d = md5ii(d, a, b, c, x[i + 11] || 0, 10, -1120210379)
    c = md5ii(c, d, a, b, x[i + 2] || 0, 15, 718787259); b = md5ii(b, c, d, a, x[i + 9] || 0, 21, -343485551)
    a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd)
  }
  const output = [a, b, c, d]
  let hex = ''
  for (let i = 0; i < output.length * 4; i++) {
    hex += ('0' + ((output[i >> 2] >> ((i % 4) * 8)) & 0xff).toString(16)).slice(-2)
  }
  return hex
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

interface HashResult {
  md5: string
  sha1: string
  sha256: string
  sha384: string
  sha512: string
}

const emptyHashes: HashResult = { md5: '', sha1: '', sha256: '', sha384: '', sha512: '' }

export default function HashGeneratorTool() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<HashResult>(emptyHashes)
  const [uppercase, setUppercase] = useState(false)
  const [hmacKey, setHmacKey] = useState('')
  const [hmacSha1, setHmacSha1] = useState('')
  const [hmacSha256, setHmacSha256] = useState('')
  const [hmacSha512, setHmacSha512] = useState('')
  const [compareHash, setCompareHash] = useState('')
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null)
  const [fileHashes, setFileHashes] = useState<HashResult>(emptyHashes)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Text hashing
  useEffect(() => {
    if (!input) {
      setHashes(emptyHashes)
      return
    }

    const md5Hash = md5(input)

    Promise.all([
      hashWithCrypto('SHA-1', input),
      hashWithCrypto('SHA-256', input),
      hashWithCrypto('SHA-384', input),
      hashWithCrypto('SHA-512', input),
    ]).then(([sha1, sha256, sha384, sha512]) => {
      setHashes({ md5: md5Hash, sha1, sha256, sha384, sha512 })
    })
  }, [input])

  // HMAC computation
  useEffect(() => {
    if (!input || !hmacKey) {
      setHmacSha1('')
      setHmacSha256('')
      setHmacSha512('')
      return
    }
    computeHmac('SHA-1', hmacKey, input).then(setHmacSha1)
    computeHmac('SHA-256', hmacKey, input).then(setHmacSha256)
    computeHmac('SHA-512', hmacKey, input).then(setHmacSha512)
  }, [input, hmacKey])

  // File hashing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileInfo({ name: file.name, size: file.size })
    const reader = new FileReader()
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer
      const fileMd5 = md5Bytes(buffer)
      Promise.all([
        hashBufferWithCrypto('SHA-1', buffer),
        hashBufferWithCrypto('SHA-256', buffer),
        hashBufferWithCrypto('SHA-384', buffer),
        hashBufferWithCrypto('SHA-512', buffer),
      ]).then(([sha1, sha256, sha384, sha512]) => {
        setFileHashes({ md5: fileMd5, sha1, sha256, sha384, sha512 })
      })
    }
    reader.readAsArrayBuffer(file)
  }

  const applyCase = (hex: string) => uppercase ? hex.toUpperCase() : hex

  // Hash comparison logic
  const allComputedHashes = [
    hashes.md5, hashes.sha1, hashes.sha256, hashes.sha384, hashes.sha512,
    fileHashes.md5, fileHashes.sha1, fileHashes.sha256, fileHashes.sha384, fileHashes.sha512,
    hmacSha1, hmacSha256, hmacSha512,
  ].filter(Boolean)

  const compareResult = compareHash.trim().length > 0
    ? allComputedHashes.some((h) => h.toLowerCase() === compareHash.trim().toLowerCase())
    : null

  const hashEntries = [
    { label: 'MD5', value: hashes.md5, bits: '128-bit' },
    { label: 'SHA-1', value: hashes.sha1, bits: '160-bit' },
    { label: 'SHA-256', value: hashes.sha256, bits: '256-bit' },
    { label: 'SHA-384', value: hashes.sha384, bits: '384-bit' },
    { label: 'SHA-512', value: hashes.sha512, bits: '512-bit' },
  ]

  const fileHashEntries = [
    { label: 'MD5', value: fileHashes.md5, bits: '128-bit' },
    { label: 'SHA-1', value: fileHashes.sha1, bits: '160-bit' },
    { label: 'SHA-256', value: fileHashes.sha256, bits: '256-bit' },
    { label: 'SHA-384', value: fileHashes.sha384, bits: '384-bit' },
    { label: 'SHA-512', value: fileHashes.sha512, bits: '512-bit' },
  ]

  return (
    <ToolPage
      title="Hash Generator"
      description="Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text input."
      category="encoders"
      categoryLabel="Encoders & Decoders"
      faqs={[
        { question: 'What is the difference between MD5 and SHA-256?', answer: 'MD5 produces a 128-bit hash and is fast but considered cryptographically broken. SHA-256 produces a 256-bit hash and is currently the standard for security-sensitive applications like SSL certificates and blockchain.' },
        { question: 'Can you reverse a hash back to the original text?', answer: 'No. Hashing is a one-way function by design. You cannot mathematically reverse a hash, though weak hashes like MD5 can be attacked with precomputed lookup tables.' },
        { question: 'Which hashing algorithm should I use?', answer: 'Use SHA-256 or SHA-512 for security purposes. MD5 and SHA-1 are fine for checksums and non-security uses like cache keys or file integrity checks.' },
        { question: 'Is my input text stored or sent anywhere?', answer: 'No. All hashing is performed locally in your browser using the Web Crypto API and a browser-based MD5 implementation. Nothing leaves your device.' },
      ]}
      helpContent={
        <>
          <h2>What is a Hash Generator?</h2>
          <p>
            A hash generator takes any text input and produces a fixed-length string of hexadecimal characters called a hash
            or digest. Hashing is a one-way mathematical function — the same input always produces the same output, but you
            cannot reverse the hash back to the original text. This property makes hashing essential for password storage, data
            integrity verification, digital signatures, and blockchain technology. This tool computes four widely used
            algorithms simultaneously: MD5, which produces a 128-bit hash and is commonly used for checksums; SHA-1, a 160-bit
            algorithm that is now deprecated for security use; SHA-256, the current industry standard used in TLS certificates
            and Bitcoin; and SHA-512, which offers the largest digest size for maximum collision resistance. All hashing is
            performed locally in your browser using the Web Crypto API and a pure JavaScript MD5 implementation, so your data
            never leaves your device.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Type or paste the text you want to hash into the input field.</li>
            <li>All four hash values — MD5, SHA-1, SHA-256, and SHA-512 — are computed in real time and displayed below the input as you type.</li>
            <li>Click the <strong>Copy</strong> button next to any hash to copy its hexadecimal value to your clipboard.</li>
            <li>Use the copied hash wherever you need it: configuration files, checksum verification, database seeding, or documentation.</li>
            <li>Click <strong>Clear</strong> to reset the input and all computed hashes.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Use SHA-256 or SHA-512 for any security-sensitive application such as password hashing, file integrity checks, or digital signatures. MD5 and SHA-1 are considered cryptographically broken and should only be used for non-security purposes.</li>
            <li>Even a single-character change in the input produces a completely different hash — this avalanche effect is what makes hashes useful for detecting tampering.</li>
            <li>When verifying file downloads, compute the SHA-256 hash of the downloaded file and compare it to the hash published by the author to ensure the file has not been corrupted or altered.</li>
            <li>Never store plain-text passwords. Instead, store their hashes using a purpose-built algorithm like bcrypt or Argon2 that adds salting and key stretching on top of basic hashing.</li>
            <li>MD5 is still useful for non-security tasks such as generating cache keys, deduplicating content, or creating short identifiers where collision risk is acceptable.</li>
            <li>Remember that hashing is deterministic — the same input always yields the same output — so identical passwords will produce identical hashes unless a unique salt is added.</li>
          </ul>
        </>
      }
    >
      {/* Controls row */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="rounded border-border" />
          <span className="font-medium">Uppercase hex</span>
        </label>
      </div>

      {/* Text input */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Input Text</span>
        <ClearButton onClear={() => { setInput(''); setHmacKey(''); setHmacSha1(''); setHmacSha256(''); setHmacSha512('') }} />
      </div>
      <ToolTextarea value={input} onChange={setInput} placeholder="Enter text to hash..." rows={5} />

      {/* HMAC Key input */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">HMAC Key <span className="font-normal text-muted-foreground">(optional — computes HMAC-SHA1, HMAC-SHA256, HMAC-SHA512)</span></span>
        </div>
        <input
          type="text"
          value={hmacKey}
          onChange={(e) => setHmacKey(e.target.value)}
          placeholder="Enter a secret key for HMAC..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Text hash results */}
      {input && (
        <div className="mt-6 space-y-3">
          {hashEntries.map((h) => (
            <div key={h.label} className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  {h.label} <span className="font-normal">({h.bits})</span>
                </span>
                {h.value && <CopyButton text={applyCase(h.value)} />}
              </div>
              <code className="text-sm font-mono break-all">{h.value ? applyCase(h.value) : 'Computing...'}</code>
            </div>
          ))}
          {hmacKey && [
            { label: 'HMAC-SHA1', bits: '160-bit', value: hmacSha1 },
            { label: 'HMAC-SHA256', bits: '256-bit', value: hmacSha256 },
            { label: 'HMAC-SHA512', bits: '512-bit', value: hmacSha512 },
          ].map((h) => (
            <div key={h.label} className="p-3 rounded-lg bg-muted border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  {h.label} <span className="font-normal">({h.bits})</span>
                </span>
                {h.value && <CopyButton text={applyCase(h.value)} />}
              </div>
              <code className="text-sm font-mono break-all">{h.value ? applyCase(h.value) : 'Computing...'}</code>
            </div>
          ))}
        </div>
      )}

      {/* File hashing section */}
      <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
        <h3 className="text-sm font-semibold mb-3">File Hashing</h3>
        <input
          type="file"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:transition-colors"
        />
        {fileInfo && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">File: <strong className="text-foreground">{fileInfo.name}</strong></span>
              <span className="text-muted-foreground">Size: <strong className="text-foreground">{formatFileSize(fileInfo.size)}</strong></span>
            </div>
            {fileHashEntries.map((h) => (
              <div key={'file-' + h.label} className="p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {h.label} <span className="font-normal">({h.bits})</span>
                  </span>
                  {h.value && <CopyButton text={applyCase(h.value)} />}
                </div>
                <code className="text-sm font-mono break-all">{h.value ? applyCase(h.value) : 'Computing...'}</code>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hash comparison */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Compare Hash</span>
          {compareResult !== null && (
            <span className={`text-lg font-bold ${compareResult ? 'text-green-500' : 'text-red-500'}`}>
              {compareResult ? '\u2713 Match' : '\u2717 No match'}
            </span>
          )}
        </div>
        <input
          type="text"
          value={compareHash}
          onChange={(e) => setCompareHash(e.target.value)}
          placeholder="Paste a hash to compare against computed values..."
          className={`w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring ${
            compareResult === null ? 'border-border' : compareResult ? 'border-green-500' : 'border-red-500'
          }`}
        />
      </div>
    </ToolPage>
  )
}
