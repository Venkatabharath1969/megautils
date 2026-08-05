'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload } from 'lucide-react'

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

    const newX = Math.min(dragStart.x, x) / scale
    const newY = Math.min(dragStart.y, y) / scale
    const newW = Math.abs(x - dragStart.x) / scale
    const newH = Math.abs(y - dragStart.y) / scale

    setCropX(Math.max(0, Math.round(newX)))
    setCropY(Math.max(0, Math.round(newY)))
    setCropW(Math.min(Math.round(newW), imgRef.current.width - Math.round(newX)))
    setCropH(Math.min(Math.round(newH), imgRef.current.height - Math.round(newY)))
  }, [isDragging, dragStart])

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
    setCroppedUrl(canvas.toDataURL('image/png'))
  }, [cropX, cropY, cropW, cropH])

  const handleDownload = useCallback(() => {
    if (!croppedUrl) return
    const a = document.createElement('a')
    a.href = croppedUrl
    a.download = `cropped-${cropW}x${cropH}.png`
    a.click()
  }, [croppedUrl, cropW, cropH])

  const clear = () => {
    setImageSrc(null)
    setCroppedUrl(null)
    setImgWidth(0)
    setImgHeight(0)
    setCropX(0)
    setCropY(0)
    setCropW(0)
    setCropH(0)
    imgRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Image Cropper"
      description="Crop images to any size with visual selection or precise coordinates"
      category="image"
      categoryLabel="Image Tools"
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
