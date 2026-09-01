'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload, Shield } from 'lucide-react'

type DragType = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null
type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp'

const ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
  { label: '2:3 (Passport)', value: 2 / 3 },
] as const

export default function ImageCropTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imgNatW, setImgNatW] = useState(0)
  const [imgNatH, setImgNatH] = useState(0)
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<DragType>(null)
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 })
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png')
  const [quality, setQuality] = useState(92)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalImgRef = useRef<HTMLImageElement | null>(null)

  // Compute display scale
  const getScale = useCallback(() => {
    if (!containerRef.current || !imgRef.current || imgNatW === 0) return 1
    return imgRef.current.clientWidth / imgNatW
  }, [imgNatW])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP, BMP, GIF).')
      return
    }
    setError(null)
    setCroppedUrl(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      setImageSrc(src)
      const img = new Image()
      img.onload = () => {
        originalImgRef.current = img
        setImgNatW(img.naturalWidth)
        setImgNatH(img.naturalHeight)
        // Default crop to center 60%
        const w = Math.round(img.naturalWidth * 0.6)
        const h = Math.round(img.naturalHeight * 0.6)
        setCropArea({
          x: Math.round((img.naturalWidth - w) / 2),
          y: Math.round((img.naturalHeight - h) / 2),
          width: w,
          height: h,
        })
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [handleFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  // Clamp helper
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val))

  // Mouse down on crop handles or crop area
  const onMouseDown = useCallback((e: React.MouseEvent, type: DragType) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragType(type)
    setDragStart({
      mx: e.clientX,
      my: e.clientY,
      x: cropArea.x,
      y: cropArea.y,
      w: cropArea.width,
      h: cropArea.height,
    })
  }, [cropArea])

  // Mouse move for dragging
  useEffect(() => {
    if (!isDragging || !dragType) return

    const onMove = (e: MouseEvent) => {
      const scale = getScale()
      const dx = (e.clientX - dragStart.mx) / scale
      const dy = (e.clientY - dragStart.my) / scale
      let { x, y, w, h } = { x: dragStart.x, y: dragStart.y, w: dragStart.w, h: dragStart.h }

      if (dragType === 'move') {
        x = clamp(x + dx, 0, imgNatW - w)
        y = clamp(y + dy, 0, imgNatH - h)
      } else {
        // Resize based on handle
        if (dragType.includes('w')) {
          const newX = clamp(x + dx, 0, x + w - 20)
          w = w - (newX - x)
          x = newX
        }
        if (dragType.includes('e')) {
          w = clamp(w + dx, 20, imgNatW - x)
        }
        if (dragType.includes('n')) {
          const newY = clamp(y + dy, 0, y + h - 20)
          h = h - (newY - y)
          y = newY
        }
        if (dragType.includes('s')) {
          h = clamp(h + dy, 20, imgNatH - y)
        }

        // Enforce aspect ratio
        if (aspectRatio !== null) {
          if (dragType === 'n' || dragType === 's') {
            w = Math.round(h * aspectRatio)
            if (x + w > imgNatW) { w = imgNatW - x; h = Math.round(w / aspectRatio) }
          } else {
            h = Math.round(w / aspectRatio)
            if (y + h > imgNatH) { h = imgNatH - y; w = Math.round(h * aspectRatio) }
          }
        }
      }

      setCropArea({
        x: Math.round(x),
        y: Math.round(y),
        width: Math.max(20, Math.round(w)),
        height: Math.max(20, Math.round(h)),
      })
    }

    const onUp = () => {
      setIsDragging(false)
      setDragType(null)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, dragType, dragStart, imgNatW, imgNatH, aspectRatio, getScale])

  // Crop and generate result
  const performCrop = useCallback(() => {
    if (!originalImgRef.current || cropArea.width <= 0 || cropArea.height <= 0) return
    const canvas = document.createElement('canvas')
    canvas.width = cropArea.width
    canvas.height = cropArea.height
    const ctx = canvas.getContext('2d')!
    if (outputFormat === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(
      originalImgRef.current,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    )
    const q = outputFormat === 'image/png' ? undefined : quality / 100
    setCroppedUrl(canvas.toDataURL(outputFormat, q))
  }, [cropArea, outputFormat, quality])

  const handleDownload = useCallback(() => {
    if (!croppedUrl) return
    const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/jpeg' ? 'jpg' : 'webp'
    const a = document.createElement('a')
    a.href = croppedUrl
    a.download = `cropped-${cropArea.width}x${cropArea.height}.${ext}`
    a.click()
  }, [croppedUrl, cropArea.width, cropArea.height, outputFormat])

  const clear = () => {
    setImageSrc(null)
    setCroppedUrl(null)
    setImgNatW(0)
    setImgNatH(0)
    setCropArea({ x: 50, y: 50, width: 200, height: 200 })
    setAspectRatio(null)
    setOutputFormat('image/png')
    setQuality(92)
    setError(null)
    originalImgRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const applyAspectRatio = useCallback((ratio: number | null) => {
    setAspectRatio(ratio)
    if (ratio !== null && cropArea.width > 0) {
      const newH = Math.round(cropArea.width / ratio)
      const clampedH = Math.min(newH, imgNatH - cropArea.y)
      const adjustedW = newH > imgNatH - cropArea.y ? Math.round(clampedH * ratio) : cropArea.width
      setCropArea((prev) => ({ ...prev, width: adjustedW, height: clampedH }))
    }
  }, [cropArea.width, cropArea.y, imgNatH])

  // Handle style for crop overlay
  const scale = imageSrc && imgRef.current ? (imgRef.current.clientWidth / imgNatW || 1) : 1

  // Handle cursor
  const getCursor = (type: DragType) => {
    const map: Record<string, string> = {
      move: 'move', nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
      n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
    }
    return type ? map[type] || 'default' : 'default'
  }

  const handleSize = 10

  return (
    <ToolPage
      title="Image Crop Tool"
      description="Crop images with interactive drag handles, aspect ratio presets, and format options. Free, private, browser-based."
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Image Crop Tool is a free browser-based image cropping tool with interactive resize handles, aspect ratio presets, and format/quality options. Drag corners or edges to precisely select your crop area. Everything runs locally in your browser &mdash; your images are never uploaded to any server.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Drag and drop an image or click to upload (JPG, PNG, WebP, GIF, BMP supported).</li>
            <li>A crop selection box appears on your image. Drag the <strong>corners or edges</strong> to resize, or drag the center to move it.</li>
            <li>Optionally choose an <strong>aspect ratio preset</strong> (1:1 for square, 16:9 for widescreen, 2:3 for passport photos, etc.).</li>
            <li>Enter precise X, Y, Width, and Height coordinates for pixel-perfect cropping.</li>
            <li>Choose the output <strong>format</strong> (PNG, JPG, WebP) and adjust quality for JPG/WebP.</li>
            <li>Click <strong>Crop Image</strong> to generate the result, then download it.</li>
          </ol>

          <h2>Aspect Ratio Presets</h2>
          <ul>
            <li><strong>Free</strong> &mdash; No constraint, crop to any dimensions.</li>
            <li><strong>1:1</strong> &mdash; Square, perfect for profile pictures and Instagram posts.</li>
            <li><strong>4:3</strong> &mdash; Standard photo ratio, used by many cameras.</li>
            <li><strong>3:2</strong> &mdash; Classic 35mm film ratio, DSLR standard.</li>
            <li><strong>16:9</strong> &mdash; Widescreen for YouTube thumbnails, presentations, and HD video.</li>
            <li><strong>9:16</strong> &mdash; Vertical video for TikTok, Instagram Reels, YouTube Shorts.</li>
            <li><strong>2:3 (Passport)</strong> &mdash; Standard passport/visa photo ratio.</li>
          </ul>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Use PNG format for lossless output. Use JPG/WebP for smaller file sizes.</li>
            <li>For JPG/WebP, a quality of 85-92% gives excellent results with smaller files.</li>
            <li>The crop dimensions are shown in real pixels, making it easy to prepare images for specific platform requirements.</li>
            <li>Your images are never uploaded to any server &mdash; all processing happens on your device.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'Does this tool upload my images?', answer: 'No. All cropping happens entirely in your browser using the HTML5 Canvas API. Your images never leave your device, making this completely private and secure.' },
        { question: 'What aspect ratios are available?', answer: 'Free (no constraint), 1:1 (square), 4:3, 3:2, 16:9 (widescreen), 9:16 (vertical), and 2:3 (passport). You can also enter custom pixel dimensions.' },
        { question: 'What output formats are supported?', answer: 'You can export cropped images as PNG (lossless), JPEG (lossy, smaller), or WebP (modern, smallest). For JPG and WebP, a quality slider lets you balance file size and quality.' },
        { question: 'Can I crop to exact pixel dimensions?', answer: 'Yes. Use the X, Y, Width, and Height input fields to set precise crop coordinates. The crop box updates in real-time on the image.' },
        { question: 'Is this a free alternative to Canva or Photoshop cropping?', answer: 'Yes! This tool provides professional-quality cropping with interactive handles and aspect ratio presets, completely free with no account needed.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload Image</span>
          {imageSrc && <ClearButton onClear={clear} />}
        </div>

        {/* Upload area */}
        {!imageSrc ? (
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Drag & drop an image here, or click to upload</span>
            <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF, BMP</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Crop coordinates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'X', val: cropArea.x, set: (v: number) => setCropArea(p => ({ ...p, x: clamp(v, 0, imgNatW - p.width) })) },
                { label: 'Y', val: cropArea.y, set: (v: number) => setCropArea(p => ({ ...p, y: clamp(v, 0, imgNatH - p.height) })) },
                { label: 'Width', val: cropArea.width, set: (v: number) => setCropArea(p => ({ ...p, width: clamp(v, 20, imgNatW - p.x) })) },
                { label: 'Height', val: cropArea.height, set: (v: number) => setCropArea(p => ({ ...p, height: clamp(v, 20, imgNatH - p.y) })) },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="text-xs font-medium mb-1 block">{label} (px)</label>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => set(Number(e.target.value))}
                    min={0}
                    className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Aspect ratio presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium block">Aspect Ratio:</label>
              <div className="flex flex-wrap gap-1.5">
                {ASPECT_RATIOS.map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => applyAspectRatio(value)}
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
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
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
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-24 h-1.5 accent-primary"
                  />
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Original: {imgNatW} &times; {imgNatH} px &mdash; Crop: {cropArea.width} &times; {cropArea.height} px
            </div>

            {/* Interactive crop area */}
            <div
              ref={containerRef}
              className="relative border border-border rounded-lg p-2 bg-muted/20 overflow-hidden select-none"
              style={{ cursor: isDragging ? getCursor(dragType) : 'default' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Source"
                className="max-w-full h-auto max-h-[500px] mx-auto block"
                draggable={false}
                onLoad={() => {
                  // Force re-render to get correct scale
                  setCropArea((prev) => ({ ...prev }))
                }}
              />

              {/* Dark overlay (top, bottom, left, right) */}
              {imgRef.current && (
                <div
                  className="absolute"
                  style={{
                    top: imgRef.current.offsetTop,
                    left: imgRef.current.offsetLeft,
                    width: imgRef.current.clientWidth,
                    height: imgRef.current.clientHeight,
                    pointerEvents: 'none',
                  }}
                >
                  {/* Semi-transparent overlay covering non-crop areas — bg-black/50 intentional for crop dimming */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top */}
                    <div
                      className="absolute bg-black/50"
                      style={{
                        top: 0, left: 0, right: 0,
                        height: cropArea.y * scale,
                      }}
                    />
                    {/* Bottom */}
                    <div
                      className="absolute bg-black/50"
                      style={{
                        top: (cropArea.y + cropArea.height) * scale,
                        left: 0, right: 0,
                        bottom: 0,
                      }}
                    />
                    {/* Left */}
                    <div
                      className="absolute bg-black/50"
                      style={{
                        top: cropArea.y * scale,
                        left: 0,
                        width: cropArea.x * scale,
                        height: cropArea.height * scale,
                      }}
                    />
                    {/* Right */}
                    <div
                      className="absolute bg-black/50"
                      style={{
                        top: cropArea.y * scale,
                        left: (cropArea.x + cropArea.width) * scale,
                        right: 0,
                        height: cropArea.height * scale,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Crop selection box with handles */}
              {imgRef.current && (
                <div
                  className="absolute border-2 border-blue-500"
                  style={{
                    top: imgRef.current.offsetTop + cropArea.y * scale,
                    left: imgRef.current.offsetLeft + cropArea.x * scale,
                    width: cropArea.width * scale,
                    height: cropArea.height * scale,
                    cursor: 'move',
                    pointerEvents: 'auto',
                  }}
                  onMouseDown={(e) => onMouseDown(e, 'move')}
                >
                  {/* Rule of thirds grid lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-0 right-0 border-t border-white/30" />
                    <div className="absolute top-2/3 left-0 right-0 border-t border-white/30" />
                    <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/30" />
                    <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/30" />
                  </div>

                  {/* Corner handles — bg-white intentional: handles must contrast against any image */}
                  {(['nw', 'ne', 'sw', 'se'] as const).map((pos) => {
                    const isTop = pos.includes('n')
                    const isLeft = pos.includes('w')
                    return (
                      <div
                        key={pos}
                        className="absolute bg-white border-2 border-blue-500 rounded-sm"
                        style={{
                          width: handleSize,
                          height: handleSize,
                          top: isTop ? -handleSize / 2 : 'auto',
                          bottom: !isTop ? -handleSize / 2 : 'auto',
                          left: isLeft ? -handleSize / 2 : 'auto',
                          right: !isLeft ? -handleSize / 2 : 'auto',
                          cursor: `${pos}-resize`,
                          pointerEvents: 'auto',
                        }}
                        onMouseDown={(e) => onMouseDown(e, pos)}
                      />
                    )
                  })}

                  {/* Edge handles — bg-white intentional: handles must contrast against any image */}
                  {(['n', 's', 'e', 'w'] as const).map((pos) => {
                    const isHorizontal = pos === 'n' || pos === 's'
                    return (
                      <div
                        key={pos}
                        className="absolute bg-white border-2 border-blue-500 rounded-sm"
                        style={{
                          width: isHorizontal ? handleSize * 2 : handleSize,
                          height: isHorizontal ? handleSize : handleSize * 2,
                          top: pos === 'n' ? -handleSize / 2 : pos === 's' ? 'auto' : '50%',
                          bottom: pos === 's' ? -handleSize / 2 : 'auto',
                          left: pos === 'w' ? -handleSize / 2 : pos === 'e' ? 'auto' : '50%',
                          right: pos === 'e' ? -handleSize / 2 : 'auto',
                          transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
                          cursor: `${pos}-resize`,
                          pointerEvents: 'auto',
                        }}
                        onMouseDown={(e) => onMouseDown(e, pos)}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={performCrop}
                disabled={cropArea.width <= 0 || cropArea.height <= 0}
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

            {/* Cropped result preview */}
            {croppedUrl && (
              <div>
                <span className="text-sm font-medium mb-2 block">
                  Cropped Result ({cropArea.width} &times; {cropArea.height} px)
                </span>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={croppedUrl} alt="Cropped" className="max-w-full h-auto max-h-64 mx-auto" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privacy badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Shield className="h-3.5 w-3.5" />
          <span>Your images never leave your device. All cropping happens locally in your browser.</span>
        </div>
      </div>
    </ToolPage>
  )
}
