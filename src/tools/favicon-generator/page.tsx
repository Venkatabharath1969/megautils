'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload, Copy, Check, Type } from 'lucide-react'

const FAVICON_SIZES = [
  { size: 16, label: '16x16', desc: 'Classic favicon' },
  { size: 32, label: '32x32', desc: 'Standard favicon' },
  { size: 48, label: '48x48', desc: 'Windows site icon' },
  { size: 64, label: '64x64', desc: 'High-res favicon' },
  { size: 180, label: '180x180', desc: 'Apple touch icon' },
  { size: 192, label: '192x192', desc: 'Android chrome icon' },
  { size: 512, label: '512x512', desc: 'PWA splash icon' },
]

type GenerateMode = 'image' | 'text'

function buildHtmlSnippet(sizes: { size: number }[]): string {
  return sizes.map(({ size }) => {
    if (size === 180) {
      return `<link rel="apple-touch-icon" sizes="${size}x${size}" href="/apple-touch-icon.png">`
    }
    if (size === 192 || size === 512) {
      return `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/android-chrome-${size}x${size}.png">`
    }
    return `<link rel="icon" type="image/png" sizes="${size}x${size}" href="/favicon-${size}x${size}.png">`
  }).join('\n')
}

export default function FaviconGeneratorTool() {
  const [mode, setMode] = useState<GenerateMode>('image')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [generated, setGenerated] = useState<{ size: number; url: string }[]>([])
  const [snippetCopied, setSnippetCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ---- Text-to-favicon state ---- */
  const [faviconText, setFaviconText] = useState('')
  const [textBgColor, setTextBgColor] = useState('#3b82f6')
  const [textFgColor, setTextFgColor] = useState('#ffffff')

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setGenerated([])
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageSrc(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const generate = useCallback(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      const results: { size: number; url: string }[] = []
      for (const { size } of FAVICON_SIZES) {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, size, size)
        results.push({ size, url: canvas.toDataURL('image/png') })
      }
      setGenerated(results)
    }
    img.src = imageSrc
  }, [imageSrc])

  const generateFromText = useCallback(() => {
    if (!faviconText.trim()) return
    const displayText = faviconText.slice(0, 2)
    const results: { size: number; url: string }[] = []
    for (const { size } of FAVICON_SIZES) {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      // Background
      ctx.fillStyle = textBgColor
      ctx.fillRect(0, 0, size, size)
      // Text
      ctx.fillStyle = textFgColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const fontSize = displayText.length === 1 ? size * 0.65 : size * 0.45
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
      ctx.fillText(displayText, size / 2, size / 2 + size * 0.04)
      results.push({ size, url: canvas.toDataURL('image/png') })
    }
    setGenerated(results)
  }, [faviconText, textBgColor, textFgColor])

  const downloadOne = useCallback((url: string, size: number) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `favicon-${size}x${size}.png`
    a.click()
  }, [])

  const downloadAll = useCallback(() => {
    generated.forEach(({ url, size }) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = url
        a.download = `favicon-${size}x${size}.png`
        a.click()
      }, size * 2) // stagger downloads
    })
  }, [generated])

  const copySnippet = useCallback(() => {
    const snippet = buildHtmlSnippet(FAVICON_SIZES)
    navigator.clipboard.writeText(snippet).then(() => {
      setSnippetCopied(true)
      setTimeout(() => setSnippetCopied(false), 2000)
    })
  }, [])

  const clear = () => {
    setImageSrc(null)
    setFileName('')
    setGenerated([])
    setFaviconText('')
    setSnippetCopied(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Favicon Generator"
      description="Generate favicons in all standard sizes from any image"
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Favicon Generator is a free browser-based tool that lets you create favicons from images in multiple sizes (16x16, 32x32, 48x48, 180x180) for browsers and devices. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload your image using the <strong>file picker</strong> or drag and drop.</li>
            <li>Configure output settings such as size, format, or quality level.</li>
            <li>Preview the result and compare it with the original if available.</li>
            <li>Download the processed image to your device.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when adding a site icon visible in browser tabs, bookmarks, and home screens when building or updating a website. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Supported input formats typically include JPEG, PNG, WebP, and GIF — check specific format notes below the tool.</li>
            <li>Larger images produce higher quality output but take longer to process in the browser.</li>
            <li>The original image is never modified — all processing creates a new output file.</li>
            <li>For batch processing, use the tool repeatedly — each image is handled independently.</li>
            <li>Your images are never uploaded to any server — all processing happens on your device.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What size should a favicon be?', answer: 'The most common favicon sizes are 16x16 (classic browser tab), 32x32 (standard), 48x48 (Windows), and 180x180 (Apple touch icon). This tool generates all four sizes.' },
        { question: 'What image format works best for favicons?', answer: 'PNG is the most widely supported modern favicon format. Use a square source image with a simple design that remains recognizable at very small sizes.' },
        { question: 'How do I add a favicon to my website?', answer: 'Place the favicon file in your site root and add a link tag in your HTML head: <link rel="icon" href="/favicon-32x32.png" type="image/png">.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Favicon Generator</span>
          {(imageSrc || generated.length > 0) && <ClearButton onClear={clear} />}
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('image')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${mode === 'image' ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
          >
            <Upload className="h-3.5 w-3.5" /> From Image
          </button>
          <button
            onClick={() => setMode('text')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${mode === 'text' ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
          >
            <Type className="h-3.5 w-3.5" /> From Text
          </button>
        </div>

        {/* Image upload mode */}
        {mode === 'image' && !imageSrc && (
          <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {fileName || 'Click to upload an image (PNG, SVG, JPG recommended)'}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Square images work best</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        )}

        {/* Text-to-favicon mode */}
        {mode === 'text' && (
          <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/20">
            <div>
              <label className="text-xs font-medium mb-1 block">Text (1-2 characters)</label>
              <input
                type="text"
                value={faviconText}
                onChange={e => setFaviconText(e.target.value.slice(0, 2))}
                placeholder="AB"
                maxLength={2}
                className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium">Background:</label>
                <input
                  type="color"
                  value={textBgColor}
                  onChange={e => setTextBgColor(e.target.value)}
                  className="w-9 h-9 rounded border border-input cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-muted-foreground">{textBgColor.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium">Text Color:</label>
                <input
                  type="color"
                  value={textFgColor}
                  onChange={e => setTextFgColor(e.target.value)}
                  className="w-9 h-9 rounded border border-input cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-muted-foreground">{textFgColor.toUpperCase()}</span>
              </div>
            </div>
            {/* Preview */}
            {faviconText.trim() && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">Preview:</span>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: textBgColor, color: textFgColor }}
                >
                  {faviconText.slice(0, 2)}
                </div>
              </div>
            )}
            <button
              onClick={generateFromText}
              disabled={!faviconText.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Generate Favicons from Text
            </button>
          </div>
        )}

        {/* Image source preview + generate */}
        {mode === 'image' && imageSrc && (
          <div className="flex items-center gap-4">
            <div className="border border-border rounded-lg p-2 bg-muted/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt="Source" className="w-24 h-24 object-contain" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={generate}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Generate Favicons
              </button>
              {generated.length > 0 && (
                <button
                  onClick={downloadAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download All
                </button>
              )}
            </div>
          </div>
        )}

        {/* Generated favicons grid */}
        {generated.length > 0 && (
          <>
            {mode === 'text' && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download All
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {FAVICON_SIZES.map(({ size, label, desc }) => {
                const item = generated.find((g) => g.size === size)
                if (!item) return null
                return (
                  <div key={size} className="border border-border rounded-lg p-4 text-center space-y-3">
                    <div className="flex items-center justify-center h-20">
                      <div
                        className="bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] dark:bg-[repeating-conic-gradient(#374151_0%_25%,transparent_0%_50%)] bg-[length:8px_8px] inline-flex items-center justify-center p-1 rounded"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={label}
                          width={Math.min(size, 80)}
                          height={Math.min(size, 80)}
                          className="image-rendering-pixelated"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                    <button
                      onClick={() => downloadOne(item.url, size)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border hover:bg-muted transition-colors w-full justify-center"
                    >
                      <Download className="h-3 w-3" /> Download
                    </button>
                  </div>
                )
              })}
            </div>

            {/* HTML Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">HTML Link Tags</span>
                <button
                  onClick={copySnippet}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                >
                  {snippetCopied
                    ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</>
                    : <><Copy className="h-3.5 w-3.5" /> Copy Snippet</>}
                </button>
              </div>
              <pre className="w-full rounded-lg border border-input bg-card p-3 text-xs font-mono overflow-x-auto whitespace-pre text-muted-foreground">
                {buildHtmlSnippet(FAVICON_SIZES)}
              </pre>
            </div>
          </>
        )}
      </div>
    </ToolPage>
  )
}
