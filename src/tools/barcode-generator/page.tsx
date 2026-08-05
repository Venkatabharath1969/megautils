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

export default function BarcodeGeneratorTool() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [barWidth, setBarWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generate = useCallback(() => {
    try {
      setError('')
      if (!input.trim()) { setError('Please enter text to encode'); return }
      const patterns = encodeCode128B(input)
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Calculate total width
      let totalUnits = 10 // quiet zone left
      for (const pattern of patterns) {
        for (const bar of pattern) {
          totalUnits += bar
        }
      }
      totalUnits += 10 // quiet zone right

      canvas.width = totalUnits * barWidth
      canvas.height = height + 30

      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw bars
      let x = 10 * barWidth // quiet zone
      ctx.fillStyle = '#000000'

      for (const pattern of patterns) {
        for (let i = 0; i < pattern.length; i++) {
          const w = pattern[i] * barWidth
          if (i % 2 === 0) {
            // Even index = bar (black)
            ctx.fillRect(x, 0, w, height)
          }
          // Odd index = space (white)
          x += w
        }
      }

      // Draw text below barcode
      ctx.fillStyle = '#000000'
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(input, canvas.width / 2, height + 20)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generating barcode')
    }
  }, [input, barWidth, height])

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
      faqs={[
        { question: 'What is Code 128 barcode format?', answer: 'Code 128 is a high-density linear barcode that can encode all 128 ASCII characters. It is widely used in shipping, packaging, and inventory management.' },
        { question: 'What characters can I encode in a Code 128 barcode?', answer: 'Code 128B supports all standard printable ASCII characters (codes 32-126), including letters, numbers, and common symbols.' },
        { question: 'How do I scan the generated barcode?', answer: 'Download the barcode as a PNG image and print it or display it on screen. Any standard barcode scanner or smartphone barcode reader app can scan Code 128 barcodes.' },
      ]}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium block mb-1">Text to Encode</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter text (ASCII 32-126)..."
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
