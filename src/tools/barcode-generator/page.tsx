'use client'

import { useState, useRef, useCallback } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'

// Code 128B encoding table (characters 0-94 map to ASCII 32-126)
const CODE128B_START = 104
const CODE128_STOP = 106

const CODE128_PATTERNS: number[][] = [
  [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
  [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
  [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
  [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
  [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],
  [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
  [2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
  [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
  [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],
  [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
  [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],
  [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
  [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],
  [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
  [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],
  [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
  [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],
  [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
  [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],
  [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
  [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],
  [2,1,1,2,3,2],[2,3,3,1,1,1,2],
]

function encodeCode128B(text: string): number[][] {
  const codes: number[] = [CODE128B_START]

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    if (charCode < 32 || charCode > 126) {
      throw new Error(`Character '${text[i]}' (code ${charCode}) is not supported in Code 128B`)
    }
    codes.push(charCode - 32)
  }

  // Calculate checksum
  let checksum = codes[0]
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i
  }
  checksum = checksum % 103
  codes.push(checksum)
  codes.push(CODE128_STOP)

  return codes.map((code) => CODE128_PATTERNS[code])
}

// EAN-13 encoding
const EAN13_L: string[] = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
const EAN13_G: string[] = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
const EAN13_R: string[] = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100']
const EAN13_PARITY: string[] = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']

function calculateEAN13CheckDigit(digits12: string): number {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits12[i]) * (i % 2 === 0 ? 1 : 3)
  }
  return (10 - (sum % 10)) % 10
}

function encodeEAN13(input: string): { bits: string; displayText: string } {
  let digits = input.replace(/[^0-9]/g, '')
  if (digits.length < 12 || digits.length > 13) {
    throw new Error('EAN-13 requires exactly 12 or 13 digits')
  }
  if (digits.length === 12) {
    digits = digits + calculateEAN13CheckDigit(digits)
  } else {
    // Validate check digit
    const expected = calculateEAN13CheckDigit(digits.substring(0, 12))
    if (parseInt(digits[12]) !== expected) {
      throw new Error(`Invalid check digit. Expected ${expected}, got ${digits[12]}`)
    }
  }

  const firstDigit = parseInt(digits[0])
  const parity = EAN13_PARITY[firstDigit]

  // Start guard: 101
  let bits = '101'

  // Left side (digits 1-6)
  for (let i = 0; i < 6; i++) {
    const d = parseInt(digits[i + 1])
    bits += parity[i] === 'L' ? EAN13_L[d] : EAN13_G[d]
  }

  // Center guard: 01010
  bits += '01010'

  // Right side (digits 7-12)
  for (let i = 0; i < 6; i++) {
    const d = parseInt(digits[i + 7])
    bits += EAN13_R[d]
  }

  // End guard: 101
  bits += '101'

  return { bits, displayText: digits }
}

export default function BarcodeGeneratorTool() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [barWidth, setBarWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [barcodeFormat, setBarcodeFormat] = useState<'code128' | 'ean13'>('code128')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generate = useCallback(() => {
    try {
      setError('')
      if (!input.trim()) { setError('Please enter text to encode'); return }
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (barcodeFormat === 'ean13') {
        // EAN-13 rendering
        const { bits, displayText } = encodeEAN13(input)
        const totalWidth = (bits.length + 14) * barWidth // 7 quiet zone each side
        canvas.width = totalWidth
        canvas.height = height + 30

        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        let x = 7 * barWidth
        for (let i = 0; i < bits.length; i++) {
          if (bits[i] === '1') {
            ctx.fillStyle = fgColor
            ctx.fillRect(x, 0, barWidth, height)
          }
          x += barWidth
        }

        ctx.fillStyle = fgColor
        ctx.font = '14px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(displayText, canvas.width / 2, height + 20)
      } else {
        // Code 128 rendering
        const patterns = encodeCode128B(input)

        let totalUnits = 10
        for (const pattern of patterns) {
          for (const bar of pattern) {
            totalUnits += bar
          }
        }
        totalUnits += 10

        canvas.width = totalUnits * barWidth
        canvas.height = height + 30

        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        let x2 = 10 * barWidth
        for (const pattern of patterns) {
          for (let i = 0; i < pattern.length; i++) {
            const w = pattern[i] * barWidth
            if (i % 2 === 0) {
              ctx.fillStyle = fgColor
              ctx.fillRect(x2, 0, w, height)
            }
            x2 += w
          }
        }

        ctx.fillStyle = fgColor
        ctx.font = '14px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(input, canvas.width / 2, height + 20)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generating barcode')
    }
  }, [input, barWidth, height, barcodeFormat, fgColor, bgColor])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'barcode.png'
    a.click()
  }

  const clear = () => { setInput(''); setError('') }

  return (
    <ToolPage title="Barcode Generator" description="Generate Code 128 barcodes from text. Download as PNG." category="generators" categoryLabel="Generators"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Barcode Generator is a free browser-based tool that lets you create standard barcodes (Code 128, EAN-13, UPC-A, Code 39) from text or numbers. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Configure the generation parameters — type, format, quantity, and any constraints.</li>
            <li>Click <strong>Generate</strong> to produce your output.</li>
            <li>Review the generated content and regenerate if needed.</li>
            <li>Copy individual items or download the full set for immediate use.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when generating barcodes for inventory, product labels, shipping, or asset tracking. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this retail tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Generated values use cryptographically secure random sources when security-sensitive (passwords, UUIDs).</li>
            <li>Click Generate multiple times to produce different variations until you find what you need.</li>
            <li>Customize format options to match the exact requirements of your project or platform.</li>
            <li>Copy individual items or generate in bulk depending on the tool capabilities.</li>
            <li>All generation happens in your browser — nothing is stored on any server.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is Code 128 barcode format?', answer: 'Code 128 is a high-density linear barcode that can encode all 128 ASCII characters. It is widely used in shipping, packaging, and inventory management.' },
        { question: 'What characters can I encode in a Code 128 barcode?', answer: 'Code 128B supports all standard printable ASCII characters (codes 32-126), including letters, numbers, and common symbols.' },
        { question: 'How do I scan the generated barcode?', answer: 'Download the barcode as a PNG image and print it or display it on screen. Any standard barcode scanner or smartphone barcode reader app can scan Code 128 barcodes.' },
      ]}
    >
      <div className="space-y-4">
        {/* Format selector */}
        <div>
          <label className="text-sm font-medium block mb-1.5">Barcode Format</label>
          <div className="flex gap-2">
            <button onClick={() => setBarcodeFormat('code128')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${barcodeFormat === 'code128' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
              Code 128
            </button>
            <button onClick={() => setBarcodeFormat('ean13')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${barcodeFormat === 'ean13' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
              EAN-13
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium block mb-1">
              {barcodeFormat === 'ean13' ? 'Digits (12 or 13)' : 'Text to Encode'}
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={barcodeFormat === 'ean13' ? 'Enter 12-13 digits...' : 'Enter text (ASCII 32-126)...'}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Bar Width</label>
            <select value={barWidth} onChange={(e) => setBarWidth(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm">
              <option value={1}>1px (small)</option>
              <option value={2}>2px (medium)</option>
              <option value={3}>3px (large)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Height</label>
            <select value={height} onChange={(e) => setHeight(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm">
              <option value={60}>60px</option>
              <option value={80}>80px</option>
              <option value={100}>100px</option>
              <option value={150}>150px</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Bar Color</label>
            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-input cursor-pointer" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Background</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-input cursor-pointer" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={generate} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Generate Barcode
          </button>
          <button onClick={download} className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
            Download PNG
          </button>
          <ClearButton onClear={clear} />
        </div>
        {error && <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
        <div className="flex justify-center p-6 bg-white rounded-lg border border-border">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>
      </div>
    </ToolPage>
  )
}
