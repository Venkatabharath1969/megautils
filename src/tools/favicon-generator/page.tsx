'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload } from 'lucide-react'

const FAVICON_SIZES = [
  { size: 16, label: '16x16', desc: 'Classic favicon' },
  { size: 32, label: '32x32', desc: 'Standard favicon' },
  { size: 48, label: '48x48', desc: 'Windows site icon' },
  { size: 180, label: '180x180', desc: 'Apple touch icon' },
]

export default function FaviconGeneratorTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [generated, setGenerated] = useState<{ size: number; url: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const clear = () => {
    setImageSrc(null)
    setFileName('')
    setGenerated([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Favicon Generator"
      description="Generate favicons in all standard sizes from any image"
      category="image"
      categoryLabel="Image Tools"
      faqs={[
        { question: 'What size should a favicon be?', answer: 'The most common favicon sizes are 16x16 (classic browser tab), 32x32 (standard), 48x48 (Windows), and 180x180 (Apple touch icon). This tool generates all four sizes.' },
        { question: 'What image format works best for favicons?', answer: 'PNG is the most widely supported modern favicon format. Use a square source image with a simple design that remains recognizable at very small sizes.' },
        { question: 'How do I add a favicon to my website?', answer: 'Place the favicon file in your site root and add a link tag in your HTML head: <link rel="icon" href="/favicon-32x32.png" type="image/png">.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload Source Image</span>
          {imageSrc && <ClearButton onClear={clear} />}
        </div>

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

        {imageSrc && (
          <>
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

            {generated.length > 0 && (
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
                            width={Math.min(size, 64)}
                            height={Math.min(size, 64)}
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
            )}
          </>
        )}
      </div>
    </ToolPage>
  )
}
