'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Copy, Check, WifiOff } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  CDN-loaded qrcode-generator typings                               */
/* ------------------------------------------------------------------ */
interface QRCode {
  addData(data: string): void
  make(): void
  getModuleCount(): number
  isDark(row: number, col: number): boolean
}

declare global {
  interface Window {
    qrcode?: (typeNumber: number, errorCorrection: string) => QRCode
  }
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const SIZES = [
  { label: '200 × 200', value: 200 },
  { label: '300 × 300', value: 300 },
  { label: '400 × 400', value: 400 },
  { label: '500 × 500', value: 500 },
  { label: '600 × 600', value: 600 },
]

const ERROR_LEVELS: { label: string; value: string; desc: string }[] = [
  { label: 'L — Low (7 %)',        value: 'L', desc: '~7 % recovery' },
  { label: 'M — Medium (15 %)',    value: 'M', desc: '~15 % recovery' },
  { label: 'Q — Quartile (25 %)',  value: 'Q', desc: '~25 % recovery' },
  { label: 'H — High (30 %)',      value: 'H', desc: '~30 % recovery' },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function QrCodeGeneratorTool() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(300)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [errorLevel, setErrorLevel] = useState('M')
  const [libLoaded, setLibLoaded] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* ---- Load qrcode-generator from CDN once ---- */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.qrcode) {
      setLibLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js'
    script.async = true
    script.onload = () => setLibLoaded(true)
    script.onerror = () => setError('Failed to load QR code library. Please refresh.')
    document.head.appendChild(script)
    return () => { /* script stays cached */ }
  }, [])

  /* ---- Render QR on canvas ---- */
  const generateQR = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    if (!text.trim() || !libLoaded) {
      canvas.width = size
      canvas.height = size
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)
      setError('')
      return
    }

    try {
      const qr = window.qrcode!(0, errorLevel)
      qr.addData(text)
      qr.make()

      const moduleCount = qr.getModuleCount()
      const quietZone = 4                       // modules of quiet-zone padding
      const totalModules = moduleCount + quietZone * 2
      const cellSize = size / totalModules

      canvas.width = size
      canvas.height = size

      // Background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)

      // Modules
      ctx.fillStyle = fgColor
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            const x = Math.round((c + quietZone) * cellSize)
            const y = Math.round((r + quietZone) * cellSize)
            const w = Math.round((c + quietZone + 1) * cellSize) - x
            const h = Math.round((r + quietZone + 1) * cellSize) - y
            ctx.fillRect(x, y, w, h)
          }
        }
      }
      setError('')
    } catch {
      setError('Input too long for the selected error correction level. Try shorter text or a lower level.')
    }
  }, [text, size, fgColor, bgColor, errorLevel, libLoaded])

  useEffect(() => { generateQR() }, [generateQR])

  /* ---- Download PNG ---- */
  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return
    const a = document.createElement('a')
    a.download = `qr-code-${size}x${size}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }, [size, text])

  /* ---- Download SVG ---- */
  const downloadSVG = useCallback(() => {
    if (!text.trim() || !libLoaded) return
    try {
      const qr = window.qrcode!(0, errorLevel)
      qr.addData(text)
      qr.make()

      const moduleCount = qr.getModuleCount()
      const quietZone = 4
      const totalModules = moduleCount + quietZone * 2
      const cellSize = size / totalModules

      let rects = ''
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            const x = ((c + quietZone) * cellSize).toFixed(2)
            const y = ((r + quietZone) * cellSize).toFixed(2)
            const w = cellSize.toFixed(2)
            rects += `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${fgColor}"/>`
          }
        }
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${bgColor}"/>${rects}</svg>`

      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.download = `qr-code-${size}x${size}.svg`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* error already shown via canvas path */ }
  }, [text, size, fgColor, bgColor, errorLevel, libLoaded])

  /* ---- Copy image to clipboard ---- */
  const copyImage = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return
    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) return
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard API may be blocked */ }
  }, [text])

  /* ---- Clear ---- */
  const clear = () => {
    setText('')
    setError('')
  }

  const hasQR = text.trim().length > 0 && libLoaded && !error

  return (
    <ToolPage
      title="QR Code Generator"
      description="Generate customizable QR codes from text or URLs instantly. Choose colors, size, and error correction — runs entirely in your browser."
      category="generators"
      categoryLabel="Generators"
      slug="qr-code-generator"
      helpContent={
        <>
          <h2>What Is a QR Code Generator?</h2>
          <p>
            A QR (Quick Response) code is a two-dimensional barcode that stores text, URLs, contact
            information, Wi-Fi credentials, or any short string in a pattern of black-and-white
            modules. Smartphones and tablets can scan the code with their camera and instantly act on
            the encoded data — opening a link, joining a network, or saving a contact. This
            generator creates QR codes entirely in your browser using the Canvas API, so the text you
            enter never leaves your device.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Type or paste the text or URL you want to encode into the <strong>Text or URL</strong> field. The QR code updates in real time as you type.</li>
            <li>Choose a <strong>size</strong> from the dropdown — larger sizes are better for print, smaller sizes work well on screens.</li>
            <li>Pick <strong>foreground</strong> and <strong>background</strong> colors to match your brand or design.</li>
            <li>Select an <strong>error correction level</strong>. Higher levels make the code scannable even when partially damaged, but they also increase density.</li>
            <li>Click <strong>Download PNG</strong> for a raster image, <strong>Download SVG</strong> for a scalable vector, or <strong>Copy Image</strong> to paste the QR code directly into a document or chat.</li>
          </ol>

          <h2>Choosing the Right Error Correction Level</h2>
          <p>
            QR codes include redundancy so they can still be read if part of the pattern is obscured
            or damaged. Level <strong>L</strong> tolerates roughly 7 % damage and produces the
            simplest codes. Level <strong>M</strong> (the default) handles about 15 % and is a good
            all-round choice. Level <strong>Q</strong> recovers from roughly 25 % damage, and Level
            <strong> H</strong> can survive up to 30 % — ideal if you plan to place a logo over part
            of the code. Higher error correction increases the number of modules and may require a
            larger printed size to remain scannable.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Keep the encoded string short. URLs can be shortened with a link shortener before encoding to produce a less dense, easier-to-scan code.</li>
            <li>Ensure good contrast between foreground and background colors. Dark-on-light is most reliable for scanners.</li>
            <li>Use SVG for print materials — it scales to any size without losing quality.</li>
            <li>Test your QR code with at least two different scanning apps before distributing it widely.</li>
            <li>If you plan to overlay a logo, choose error correction level <strong>H</strong> and keep the logo small relative to the code.</li>
          </ul>
        </>
      }
      faqs={[
        {
          question: 'What can I encode in a QR code?',
          answer: 'You can encode any text, including URLs, email addresses, phone numbers, Wi-Fi credentials, or plain text messages. The maximum capacity depends on the content type and error correction level — roughly 4,296 alphanumeric characters at Level L.',
        },
        {
          question: 'What is error correction and which level should I choose?',
          answer: 'Error correction adds redundant data so the code remains scannable even if part of it is damaged or covered. Level L (7 %) is fine for clean digital use, M (15 %) is a balanced default, Q (25 %) is good for labels that may get scuffed, and H (30 %) is best if you want to overlay a small logo on the code.',
        },
        {
          question: 'Is my data sent to a server?',
          answer: 'No. The QR code is generated entirely in your browser using the Canvas API and a client-side JavaScript library. Your text never leaves your device, making the tool safe for sensitive data like Wi-Fi passwords or private URLs.',
        },
        {
          question: 'Do QR codes expire or stop working?',
          answer: 'QR codes themselves never expire — they simply encode static data. However, if the code contains a URL, the link destination could go offline independently. The QR code image will always decode to the same string it was created with.',
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- Left: Controls ---- */}
        <div className="space-y-4">
          {/* Text input */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Text or URL</span>
            <ClearButton onClear={clear} />
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter text or URL to generate QR code…"
            rows={4}
            className="tool-textarea w-full rounded-lg border border-input bg-tool-bg p-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />

          {/* Size selector */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Size:</label>
            <select
              value={size}
              onChange={e => setSize(Number(e.target.value))}
              className="h-9 px-3 rounded-md border border-input bg-card text-sm"
            >
              {SIZES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Error correction */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Error Correction:</label>
            <select
              value={errorLevel}
              onChange={e => setErrorLevel(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-card text-sm"
            >
              {ERROR_LEVELS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Color pickers */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Foreground:</label>
              <input
                type="color"
                value={fgColor}
                onChange={e => setFgColor(e.target.value)}
                className="w-9 h-9 rounded border border-input cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-muted-foreground">{fgColor.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Background:</label>
              <input
                type="color"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="w-9 h-9 rounded border border-input cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-muted-foreground">{bgColor.toUpperCase()}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={downloadPNG}
              disabled={!hasQR}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="h-3.5 w-3.5" /> Download PNG
            </button>
            <button
              onClick={downloadSVG}
              disabled={!hasQR}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="h-3.5 w-3.5" /> Download SVG
            </button>
            <button
              onClick={copyImage}
              disabled={!hasQR}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {copied
                ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</>
                : <><Copy className="h-3.5 w-3.5" /> Copy Image</>}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Offline badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium w-fit">
            <WifiOff className="h-3.5 w-3.5" />
            Works offline after first load
          </div>
        </div>

        {/* ---- Right: Preview ---- */}
        <div className="flex flex-col items-center justify-center">
          <div
            className="border border-border rounded-lg p-4 inline-flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto"
              style={{ width: size, height: size, imageRendering: 'pixelated' }}
            />
          </div>
          {!text.trim() && (
            <p className="text-sm text-muted-foreground mt-3">
              Start typing to see a live preview
            </p>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
