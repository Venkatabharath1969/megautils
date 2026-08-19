'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload } from 'lucide-react'

type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp'

const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
  { label: '9:16', value: 9 / 16 },
] as const

export default function ImageCropperTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imgWidth, setImgWidth] = useState(0)
  const [imgHeight, setImgHeight] = useState(0)
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropW, setCropW] = useState(0)
  const [cropH, setCropH] = useState(0)
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Aspect ratio
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)

  // Output format & quality
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png')
  const [quality, setQuality] = useState(92)

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCroppedUrl(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      setImageSrc(src)
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        setImgWidth(img.width)
        setImgHeight(img.height)
        // Default crop to center 50%
        const w = Math.round(img.width * 0.5)
        const h = Math.round(img.height * 0.5)
        setCropX(Math.round((img.width - w) / 2))
        setCropY(Math.round((img.height - h) / 2))
        setCropW(w)
        setCropH(h)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [])

  // Draw crop overlay on canvas
  useEffect(() => {
    if (!imageSrc || !canvasRef.current || !imgRef.current) return
    const canvas = canvasRef.current
    const img = imgRef.current
    const container = previewRef.current
    if (!container) return

    const maxW = container.clientWidth
    const scale = Math.min(maxW / img.width, 400 / img.height, 1)
    canvas.width = img.width * scale
    canvas.height = img.height * scale

    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // Darken outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Clear crop area
    const sx = cropX * scale
    const sy = cropY * scale
    const sw = cropW * scale
    const sh = cropH * scale
    ctx.clearRect(sx, sy, sw, sh)
    ctx.drawImage(img, cropX, cropY, cropW, cropH, sx, sy, sw, sh)

    // Crop border
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.strokeRect(sx, sy, sw, sh)
  }, [imageSrc, cropX, cropY, cropW, cropH])

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    const rect = canvasRef.current!.getBoundingClientRect()
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current || !imgRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const scale = canvasRef.current.width / imgRef.current.width

    let newX = Math.min(dragStart.x, x) / scale
    let newY = Math.min(dragStart.y, y) / scale
    let newW = Math.abs(x - dragStart.x) / scale
    let newH = Math.abs(y - dragStart.y) / scale

    // Enforce aspect ratio if set
    if (aspectRatio !== null && newW > 0 && newH > 0) {
      const currentRatio = newW / newH
      if (currentRatio > aspectRatio) {
        newW = newH * aspectRatio
      } else {
        newH = newW / aspectRatio
      }
    }

    // Clamp to image bounds
    const clampedX = Math.max(0, Math.round(newX))
    const clampedY = Math.max(0, Math.round(newY))
    const clampedW = Math.min(Math.round(newW), imgRef.current.width - clampedX)
    const clampedH = Math.min(Math.round(newH), imgRef.current.height - clampedY)

    setCropX(clampedX)
    setCropY(clampedY)
    setCropW(clampedW)
    setCropH(clampedH)
  }, [isDragging, dragStart, aspectRatio])

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const crop = useCallback(() => {
    if (!imgRef.current || cropW <= 0 || cropH <= 0) return
    const canvas = document.createElement('canvas')
    canvas.width = cropW
    canvas.height = cropH
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(imgRef.current, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
    const q = outputFormat === 'image/png' ? 1 : quality / 100
    setCroppedUrl(canvas.toDataURL(outputFormat, q))
  }, [cropX, cropY, cropW, cropH, outputFormat, quality])

  const handleDownload = useCallback(() => {
    if (!croppedUrl) return
    const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/jpeg' ? 'jpg' : 'webp'
    const a = document.createElement('a')
    a.href = croppedUrl
    a.download = `cropped-${cropW}x${cropH}.${ext}`
    a.click()
  }, [croppedUrl, cropW, cropH, outputFormat])

  const clear = () => {
    setImageSrc(null)
    setCroppedUrl(null)
    setImgWidth(0)
    setImgHeight(0)
    setCropX(0)
    setCropY(0)
    setCropW(0)
    setCropH(0)
    setAspectRatio(null)
    setOutputFormat('image/png')
    setQuality(92)
    imgRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Image Cropper"
      description="Crop images to any size with visual selection or precise coordinates"
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Image Cropper is a free browser-based tool that lets you crop images to custom dimensions or preset aspect ratios with a visual drag-and-drop interface. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload your image using the <strong>file picker</strong> or drag and drop.</li>
            <li>Configure output settings such as size, format, or quality level.</li>
            <li>Preview the result and compare it with the original if available.</li>
            <li>Download the processed image to your device.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when preparing images for social media profiles, creating thumbnails, or cutting images to specific dimensions for web design. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this image editing tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I crop an image to exact pixel dimensions?', answer: 'Upload your image, then enter the exact X, Y, Width, and Height values in the coordinate fields. Click Crop to generate the cropped result at your specified dimensions.' },
        { question: 'Does this tool upload my image to a server?', answer: 'No. All cropping is done entirely in your browser using the HTML5 Canvas API. Your image never leaves your device.' },
        { question: 'What image formats can I crop?', answer: 'You can crop any image format supported by your browser, including PNG, JPG, WebP, GIF, and BMP. The cropped output is saved as PNG.' },
      ]}
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
          <>
            {/* Crop coordinates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">X</label>
                <input
                  type="number"
                  value={cropX}
                  onChange={(e) => setCropX(Math.max(0, Math.min(Number(e.target.value), imgWidth - cropW)))}
                  min={0}
                  max={imgWidth - cropW}
                  className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Y</label>
                <input
                  type="number"
                  value={cropY}
                  onChange={(e) => setCropY(Math.max(0, Math.min(Number(e.target.value), imgHeight - cropH)))}
                  min={0}
                  max={imgHeight - cropH}
                  className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Width</label>
                <input
                  type="number"
                  value={cropW}
                  onChange={(e) => setCropW(Math.max(1, Math.min(Number(e.target.value), imgWidth - cropX)))}
                  min={1}
                  max={imgWidth - cropX}
                  className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Height</label>
                <input
                  type="number"
                  value={cropH}
                  onChange={(e) => setCropH(Math.max(1, Math.min(Number(e.target.value), imgHeight - cropY)))}
                  min={1}
                  max={imgHeight - cropY}
                  className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                />
              </div>
            </div>

            {/* Aspect ratio presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium block">Aspect Ratio:</label>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_RATIOS.map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setAspectRatio(value)
                      // If a ratio is selected and we have a crop, adjust height to match
                      if (value !== null && cropW > 0) {
                        const newH = Math.round(cropW / value)
                        const clampedH = Math.min(newH, imgHeight - cropY)
                        setCropH(clampedH)
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                      aspectRatio === value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Output format & quality */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium">Format:</label>
                <select
                  value={outputFormat}
                  onChange={e => setOutputFormat(e.target.value as OutputFormat)}
                  className="h-8 px-2 rounded-md border border-input bg-card text-xs"
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
              {outputFormat !== 'image/png' && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium">Quality: {quality}%</label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={1}
                    value={quality}
                    onChange={e => setQuality(Number(e.target.value))}
                    className="w-24 h-1.5 accent-primary"
                  />
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Original: {imgWidth} x {imgHeight} &mdash; Drag on the image to select a crop area, or enter coordinates above.
            </div>

            {/* Canvas preview */}
            <div ref={previewRef} className="border border-border rounded-lg p-2 bg-muted/20 overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className="max-w-full cursor-crosshair mx-auto block"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={crop}
                disabled={cropW <= 0 || cropH <= 0}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Crop Image
              </button>
              {croppedUrl && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              )}
            </div>

            {croppedUrl && (
              <div>
                <span className="text-sm font-medium mb-2 block">Cropped Result ({cropW} x {cropH})</span>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={croppedUrl} alt="Cropped" className="max-w-full h-auto max-h-64 mx-auto" />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolPage>
  )
}
