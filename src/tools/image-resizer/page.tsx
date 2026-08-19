'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Lock, Unlock, Upload } from 'lucide-react'

const PRESETS = [
  { label: 'Instagram Post', w: 1080, h: 1080 },
  { label: 'Twitter Header', w: 1500, h: 500 },
  { label: 'Facebook Cover', w: 820, h: 312 },
  { label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { label: 'LinkedIn Banner', w: 1584, h: 396 },
  { label: 'Passport Photo', w: 413, h: 531 },
] as const

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
  const [isDragging, setIsDragging] = useState(false)
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [quality, setQuality] = useState(85)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const aspectRatio = useRef(1)

  const processFile = useCallback((file: File) => {
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

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }, [processFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
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
      }, `image/${outputFormat}`, outputFormat === 'png' ? undefined : quality / 100)
    }
    img.src = imageSrc
  }, [imageSrc, width, height, outputFormat, quality])

  const handleDownload = useCallback(() => {
    if (!resizedUrl) return
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat
    const a = document.createElement('a')
    a.href = resizedUrl
    a.download = `resized-${width}x${height}.${ext}`
    a.click()
  }, [resizedUrl, width, height, outputFormat])

  const clear = () => {
    setImageSrc(null)
    setResizedUrl(null)
    setWidth(0)
    setHeight(0)
    setOriginalWidth(0)
    setOriginalHeight(0)
    setOriginalSize(0)
    setResizedSize(0)
    setOutputFormat('png')
    setQuality(85)
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
        { question: 'What image formats are supported?', answer: 'You can upload any format your browser supports, including PNG, JPEG, WebP, GIF, and SVG. The resized output can be downloaded as PNG, JPEG, or WebP — use JPEG or WebP with an adjustable quality slider for smaller file sizes.' },
      ]}
      helpContent={
        <>
          <h2>What is an Image Resizer?</h2>
          <p>
            An image resizer is a tool that changes the pixel dimensions of an image to match a desired width and height.
            Resizing is one of the most common image-editing tasks and is essential for web development, social media posting,
            email newsletters, and print preparation. Images that are too large slow down web pages and waste bandwidth, while
            images that are too small appear blurry when stretched. This tool performs all resizing directly in your browser
            using the HTML Canvas API — your image is never uploaded to a server, keeping your files completely private. You
            can upload any format your browser supports, including PNG, JPEG, WebP, GIF, and SVG. Choose your output format
            — PNG for lossless quality, or JPEG/WebP with an adjustable quality slider for smaller file sizes. An aspect-ratio lock ensures your image maintains its original proportions
            by default, preventing the stretched or squished appearance that results from changing width and height independently.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Click the upload area or drag and drop an image file onto it. The tool accepts PNG, JPEG, WebP, GIF, SVG, and other browser-supported formats.</li>
            <li>Once uploaded, the original dimensions and file size are displayed. The width and height fields are pre-filled with the current pixel values.</li>
            <li>Enter your desired width or height. If the aspect-ratio lock is enabled, the other dimension updates automatically to maintain proportions.</li>
            <li>To resize freely without preserving proportions, click the lock icon between the width and height fields to unlock the aspect ratio.</li>
            <li>Click <strong>Resize Image</strong> to generate the resized version. A preview and the new file size appear instantly.</li>
            <li>Click <strong>Download</strong> to save the resized image as a PNG file to your device.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Always resize images down rather than up when possible. Downscaling preserves sharpness, while upscaling forces the browser to interpolate new pixels, which reduces clarity.</li>
            <li>For website hero images and banners, common widths are 1200px to 1920px. For thumbnails and social media avatars, 150px to 500px is typical.</li>
            <li>Keep the aspect ratio locked unless you specifically need a non-proportional crop — unlocking it can distort faces, text, and other recognizable elements.</li>
            <li>Check the file size after resizing. If the output is still too large for your needs, consider using a dedicated image compressor to reduce quality slightly without changing dimensions.</li>
            <li>When preparing images for retina or high-DPI displays, export at twice the display size (e.g., 600px wide for a 300px container) and let CSS scale them down for crisp rendering.</li>
            <li>Use the Clear button to remove the current image and start fresh without reloading the page.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Upload */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upload Image</label>
          {imageSrc && <ClearButton onClear={clear} />}
        </div>

        {!imageSrc ? (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {isDragging ? 'Drop your image here' : 'Click to upload or drag an image'}
            </span>
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

              {/* Percentage resize */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Resize by %</label>
                <div className="flex flex-wrap gap-1.5">
                  {[25, 50, 75, 100, 125, 150, 200].map(pct => (
                    <button key={pct} onClick={() => { const w = Math.round(originalWidth * pct / 100); const h = Math.round(originalHeight * pct / 100); setWidth(w); setHeight(h); setResizedUrl(null) }} className={`px-2 py-1 text-xs rounded-md border transition-colors ${width === Math.round(originalWidth * pct / 100) && height === Math.round(originalHeight * pct / 100) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset sizes */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Preset Sizes</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setWidth(p.w)
                        setHeight(p.h)
                        setLockAspect(false)
                        setResizedUrl(null)
                      }}
                      className="px-2 py-1 text-xs rounded-md border border-border bg-card hover:bg-muted transition-colors"
                      title={`${p.w} × ${p.h}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output format & quality */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Output Format</label>
                  <select
                    value={outputFormat}
                    onChange={(e) => { setOutputFormat(e.target.value as 'png' | 'jpeg' | 'webp'); setResizedUrl(null) }}
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
                {outputFormat !== 'png' && (
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1 block">Quality: {quality}%</label>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={quality}
                      onChange={(e) => { setQuality(Number(e.target.value)); setResizedUrl(null) }}
                      className="w-full h-9"
                    />
                  </div>
                )}
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
