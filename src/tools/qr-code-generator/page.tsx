'use client'

import { useState, useCallback } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'
import { Download } from 'lucide-react'

const SIZES = [
  { label: '200 x 200', value: 200 },
  { label: '300 x 300', value: 300 },
  { label: '500 x 500', value: 500 },
]

export default function QrCodeGeneratorTool() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(300)
  const [generated, setGenerated] = useState(false)

  const qrUrl = text
    ? `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(text)}&choe=UTF-8`
    : ''

  const handleGenerate = useCallback(() => {
    if (text.trim()) setGenerated(true)
  }, [text])

  const handleDownload = useCallback(async () => {
    if (!qrUrl) return
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, size, size)
        const link = document.createElement('a')
        link.download = `qr-code-${size}x${size}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      img.src = qrUrl
    } catch {
      // Fallback: open image in new tab
      window.open(qrUrl, '_blank')
    }
  }, [qrUrl, size])

  const clear = () => {
    setText('')
    setGenerated(false)
  }

  return (
    <ToolPage
      title="QR Code Generator"
      description="Generate QR codes from text or URLs instantly"
      category="generators"
      categoryLabel="Generators"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Text or URL</span>
            <ClearButton onClear={clear} />
          </div>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setGenerated(false) }}
            placeholder="Enter text or URL to generate QR code..."
            rows={5}
            className="tool-textarea w-full rounded-lg border border-input bg-tool-bg p-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Size:</label>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setGenerated(false) }}
              className="h-9 px-3 rounded-md border border-input bg-card text-sm"
            >
              {SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGenerate}
              disabled={!text.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Generate QR Code
            </button>
            {generated && qrUrl && (
              <>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download PNG
                </button>
                <CopyButton text={qrUrl} />
              </>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center justify-center">
          {generated && qrUrl ? (
            <div className="border border-border rounded-lg p-4 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="Generated QR Code"
                width={size}
                height={size}
                className="max-w-full h-auto"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg w-full text-muted-foreground text-sm">
              QR code preview will appear here
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
