'use client'

import { useState, useCallback, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download } from 'lucide-react'

const PRESETS = [
  { label: '1920 x 1080', w: 1920, h: 1080 },
  { label: '1280 x 720', w: 1280, h: 720 },
  { label: '800 x 600', w: 800, h: 600 },
  { label: '400 x 300', w: 400, h: 300 },
  { label: '300 x 250', w: 300, h: 250 },
  { label: '728 x 90', w: 728, h: 90 },
  { label: '512 x 512', w: 512, h: 512 },
  { label: '150 x 150', w: 150, h: 150 },
]

export default function PlaceholderImageGeneratorTool() {
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [bgColor, setBgColor] = useState('#cccccc')
  const [textColor, setTextColor] = useState('#666666')
  const [customText, setCustomText] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const displayText = customText || `${width} x ${height}`

  const generate = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    // Text
    const fontSize = Math.max(12, Math.min(width, height) / 8)
    ctx.fillStyle = textColor
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(displayText, width / 2, height / 2)

    // Border
    ctx.strokeStyle = textColor
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, width - 2, height - 2)

    setPreviewUrl(canvas.toDataURL('image/png'))
  }, [width, height, bgColor, textColor, displayText])

  // Auto-generate on mount
  useEffect(() => { generate() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = useCallback(() => {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = `placeholder-${width}x${height}.png`
    a.click()
  }, [previewUrl, width, height])

  const applyPreset = (w: number, h: number) => {
    setWidth(w)
    setHeight(h)
    setPreviewUrl(null)
  }

  const clear = () => {
    setWidth(800)
    setHeight(600)
    setBgColor('#cccccc')
    setTextColor('#666666')
    setCustomText('')
    setPreviewUrl(null)
  }

  return (
    <ToolPage
      title="Placeholder Image Generator"
      description="Generate placeholder images with custom dimensions, colors, and text"
      category="image"
      categoryLabel="Image Tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Settings</span>
            <ClearButton onClear={clear} />
          </div>

          {/* Presets */}
          <div>
            <label className="text-sm font-medium mb-2 block">Presets</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.w, p.h)}
                  className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                    width === p.w && height === p.h
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                min={1}
                max={4096}
                className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Height (px)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                min={1}
                max={4096}
                className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-md border border-input bg-card text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-9 w-12 rounded-md border border-input cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-md border border-input bg-card text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Custom text */}
          <div>
            <label className="text-sm font-medium mb-1 block">Custom Text (optional)</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={`Default: ${width} x ${height}`}
              className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={generate}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Generate
            </button>
            {previewUrl && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download PNG
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div>
          <span className="text-sm font-medium mb-2 block">Preview</span>
          <div className="border border-border rounded-lg p-2 bg-muted/20 flex items-center justify-center min-h-[200px]">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Placeholder" className="max-w-full h-auto max-h-96" />
            ) : (
              <span className="text-sm text-muted-foreground">Click Generate to preview</span>
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
