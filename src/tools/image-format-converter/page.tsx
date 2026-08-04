'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload } from 'lucide-react'

const FORMATS = [
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
]

export default function ImageFormatConverterTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [originalName, setOriginalName] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [format, setFormat] = useState('image/png')
  const [quality, setQuality] = useState(0.9)
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
  const [convertedSize, setConvertedSize] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setOriginalName(file.name)
    setOriginalSize(file.size)
    setConvertedUrl(null)
    setConvertedSize(0)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageSrc(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const convert = useCallback(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      // For JPG, fill white background (no alpha)
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setConvertedSize(blob.size)
            setConvertedUrl(URL.createObjectURL(blob))
          }
        },
        format,
        format === 'image/png' ? undefined : quality
      )
    }
    img.src = imageSrc
  }, [imageSrc, format, quality])

  const handleDownload = useCallback(() => {
    if (!convertedUrl) return
    const ext = FORMATS.find((f) => f.value === format)?.ext || 'png'
    const baseName = originalName.replace(/\.[^.]+$/, '')
    const a = document.createElement('a')
    a.href = convertedUrl
    a.download = `${baseName}.${ext}`
    a.click()
  }, [convertedUrl, format, originalName])

  const clear = () => {
    setImageSrc(null)
    setOriginalName('')
    setOriginalSize(0)
    setConvertedUrl(null)
    setConvertedSize(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const showQuality = format === 'image/jpeg' || format === 'image/webp'

  return (
    <ToolPage
      title="Image Format Converter"
      description="Convert images between PNG, JPG, and WebP formats"
      category="image"
      categoryLabel="Image Tools"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload Image</span>
          {imageSrc && <ClearButton onClear={clear} />}
        </div>

        {!imageSrc ? (
          <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload an image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <div>File: <strong>{originalName}</strong></div>
                <div>Size: <strong>{formatSize(originalSize)}</strong></div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Output Format</label>
                <div className="flex gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => { setFormat(f.value); setConvertedUrl(null) }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${format === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {showQuality && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quality: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => { setQuality(Number(e.target.value)); setConvertedUrl(null) }}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={convert}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Convert
                </button>
                {convertedUrl && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                )}
              </div>

              {convertedUrl && (
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
                  <div>Converted size: <strong>{formatSize(convertedSize)}</strong></div>
                  <div>
                    Savings:{' '}
                    <strong>
                      {convertedSize < originalSize
                        ? `-${((1 - convertedSize / originalSize) * 100).toFixed(1)}%`
                        : `+${((convertedSize / originalSize - 1) * 100).toFixed(1)}%`}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div>
              <span className="text-sm font-medium mb-2 block">Preview</span>
              <div className="border border-border rounded-lg p-2 bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={convertedUrl || imageSrc}
                  alt="Preview"
                  className="max-w-full h-auto max-h-80 mx-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
