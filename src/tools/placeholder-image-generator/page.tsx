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
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Placeholder Image Generator is a free browser-based tool that lets you generate placeholder images with custom dimensions, colors, and text for design mockups. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when filling image spaces in web prototypes, creating layout mockups, or generating test images for responsive design. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this design tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need placeholder images.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What are placeholder images used for?', answer: 'Placeholder images are used during web design and development to fill image spaces before final assets are ready. They help visualize layouts and test responsive designs.' },
        { question: 'Can I customize the text on placeholder images?', answer: 'Yes. By default the image displays its dimensions, but you can enter any custom text. You can also change the background and text colors.' },
        { question: 'What format are the generated placeholder images?', answer: 'Placeholder images are generated as PNG files, which support transparency and sharp text rendering at any size.' },
      ]}
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
