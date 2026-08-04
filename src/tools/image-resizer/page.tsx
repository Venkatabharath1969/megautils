'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Lock, Unlock, Upload } from 'lucide-react'

export default function ImageResizerTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [originalWidth, setOriginalWidth] = useState(0)
  const [originalHeight, setOriginalHeight] = useState(0)
  const [originalSize, setOriginalSize] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [lockAspect, setLockAspect] = useState(true)
  const [resizedUrl, setResizedUrl] = useState<string | null>(null)
  const [resizedSize, setResizedSize] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const aspectRatio = useRef(1)

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setOriginalSize(file.size)
    setResizedUrl(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      setImageSrc(src)
      const img = new Image()
      img.onload = () => {
        setOriginalWidth(img.width)
        setOriginalHeight(img.height)
        setWidth(img.width)
        setHeight(img.height)
        aspectRatio.current = img.width / img.height
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [])

  const handleWidthChange = useCallback((val: number) => {
    setWidth(val)
    if (lockAspect) {
      setHeight(Math.round(val / aspectRatio.current))
    }
    setResizedUrl(null)
  }, [lockAspect])

  const handleHeightChange = useCallback((val: number) => {
    setHeight(val)
    if (lockAspect) {
      setWidth(Math.round(val * aspectRatio.current))
    }
    setResizedUrl(null)
  }, [lockAspect])

  const resize = useCallback(() => {
    if (!imageSrc || width <= 0 || height <= 0) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (blob) {
          setResizedSize(blob.size)
          setResizedUrl(URL.createObjectURL(blob))
        }
      }, 'image/png')
    }
    img.src = imageSrc
  }, [imageSrc, width, height])

  const handleDownload = useCallback(() => {
    if (!resizedUrl) return
    const a = document.createElement('a')
    a.href = resizedUrl
    a.download = `resized-${width}x${height}.png`
    a.click()
  }, [resizedUrl, width, height])

  const clear = () => {
    setImageSrc(null)
    setResizedUrl(null)
    setWidth(0)
    setHeight(0)
    setOriginalWidth(0)
    setOriginalHeight(0)
    setOriginalSize(0)
    setResizedSize(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <ToolPage
      title="Image Resizer"
      description="Resize images to any dimension while maintaining quality"
      category="image"
      categoryLabel="Image Tools"
      faqs={[
        { question: 'Does resizing an image reduce its quality?', answer: 'Enlarging an image beyond its original dimensions can reduce sharpness because new pixels must be interpolated. Downscaling generally preserves quality well.' },
        { question: 'What does locking the aspect ratio do?', answer: 'Locking the aspect ratio ensures that when you change the width, the height adjusts proportionally (and vice versa), preventing the image from appearing stretched or squished.' },
        { question: 'Is my image uploaded to a server?', answer: 'No. All resizing is done locally in your browser using the HTML Canvas API. Your image never leaves your device.' },
        { question: 'What image formats are supported?', answer: 'You can upload any format your browser supports, including PNG, JPEG, WebP, GIF, and SVG. The resized output is downloaded as a PNG file.' },
      ]}
    >
      <div className="space-y-6">
        {/* Upload */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upload Image</label>
          {imageSrc && <ClearButton onClear={clear} />}
        </div>

        {!imageSrc ? (
          <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload or drag an image</span>
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
              <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                <div>Original: <strong>{originalWidth} x {originalHeight}</strong></div>
                <div>File size: <strong>{formatSize(originalSize)}</strong></div>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    min={1}
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                  />
                </div>
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors"
                  title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                >
                  {lockAspect ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Height (px)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    min={1}
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={resize}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Resize Image
                </button>
                {resizedUrl && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                )}
              </div>

              {resizedUrl && (
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
                  <div>New size: <strong>{width} x {height}</strong></div>
                  <div>File size: <strong>{formatSize(resizedSize)}</strong></div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="space-y-3">
              <span className="text-sm font-medium">{resizedUrl ? 'Resized Preview' : 'Original Preview'}</span>
              <div className="border border-border rounded-lg p-2 bg-muted/20 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resizedUrl || imageSrc}
                  alt="Preview"
                  className="max-w-full h-auto max-h-80 mx-auto object-contain"
                />
              </div>
            </div>
          </div>
        )}

        <input
          ref={imageSrc ? undefined : fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className={imageSrc ? 'hidden' : 'hidden'}
          id="image-resizer-input"
        />
      </div>
    </ToolPage>
  )
}
