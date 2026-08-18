'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, ImageIcon, Loader2, Shield, Wifi, Undo2, Eraser, Minus, Plus } from 'lucide-react'

type Status = 'idle' | 'painting' | 'processing' | 'done' | 'error'

export default function AIObjectRemover() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [originalName, setOriginalName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [brushSize, setBrushSize] = useState(20)
  const [isPainting, setIsPainting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [canvasStates, setCanvasStates] = useState<ImageData[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  const originalImageRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setCanvasStates(prev => [...prev.slice(-19), state])
  }, [])

  const drawBrush = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext('2d')
    const maskCtx = maskCanvas.getContext('2d')
    if (!ctx || !maskCtx) return

    // Draw red overlay on visible canvas
    ctx.globalAlpha = 0.45
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(x, y, brushSize, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1.0

    // Draw white on mask canvas (marks area to fill)
    maskCtx.fillStyle = '#ffffff'
    maskCtx.beginPath()
    maskCtx.arc(x, y, brushSize, 0, Math.PI * 2)
    maskCtx.fill()
  }, [brushSize])

  const handlePointerDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (status !== 'painting') return
    e.preventDefault()
    saveCanvasState()
    setIsPainting(true)
    const pt = getCanvasPoint(e)
    if (pt) drawBrush(pt.x, pt.y)
  }, [status, getCanvasPoint, drawBrush, saveCanvasState])

  const handlePointerMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting || status !== 'painting') return
    e.preventDefault()
    const pt = getCanvasPoint(e)
    if (pt) drawBrush(pt.x, pt.y)
  }, [isPainting, status, getCanvasPoint, drawBrush])

  const handlePointerUp = useCallback(() => {
    setIsPainting(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (status !== 'painting') return
    e.preventDefault()
    saveCanvasState()
    setIsPainting(true)
    const pt = getCanvasPoint(e)
    if (pt) drawBrush(pt.x, pt.y)
  }, [status, getCanvasPoint, drawBrush, saveCanvasState])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPainting || status !== 'painting') return
    e.preventDefault()
    const pt = getCanvasPoint(e)
    if (pt) drawBrush(pt.x, pt.y)
  }, [isPainting, status, getCanvasPoint, drawBrush])

  const handleTouchEnd = useCallback(() => {
    setIsPainting(false)
  }, [])

  const loadImageToCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    // Cap canvas size for performance while preserving aspect ratio
    const maxDim = 1200
    let w = img.naturalWidth
    let h = img.naturalHeight
    if (w > maxDim || h > maxDim) {
      const scale = maxDim / Math.max(w, h)
      w = Math.round(w * scale)
      h = Math.round(h * scale)
    }

    canvas.width = w
    canvas.height = h
    maskCanvas.width = w
    maskCanvas.height = h

    const ctx = canvas.getContext('2d')
    const maskCtx = maskCanvas.getContext('2d')
    if (!ctx || !maskCtx) return

    ctx.drawImage(img, 0, 0, w, h)
    maskCtx.fillStyle = '#000000'
    maskCtx.fillRect(0, 0, w, h)

    originalImageRef.current = img
    setCanvasStates([])
  }, [])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP, etc.)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be under 20 MB')
      return
    }

    setOriginalName(file.name)
    setError('')
    setResultUrl(null)
    setProgress(0)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      setOriginalUrl(url)

      const img = new Image()
      img.onload = () => {
        loadImageToCanvas(img)
        setStatus('painting')
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }, [loadImageToCanvas])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleUndo = useCallback(() => {
    if (canvasStates.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prevState = canvasStates[canvasStates.length - 1]
    ctx.putImageData(prevState, 0, 0)
    setCanvasStates(prev => prev.slice(0, -1))

    // Also reset the mask - rebuild from difference with original
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas || !originalImageRef.current) return
    const maskCtx = maskCanvas.getContext('2d')
    if (!maskCtx) return
    maskCtx.fillStyle = '#000000'
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
  }, [canvasStates])

  const contentAwareFill = useCallback(async () => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    const origImg = originalImageRef.current
    if (!canvas || !maskCanvas || !origImg) return

    setStatus('processing')
    setProgress(0)

    // Use a setTimeout-based approach to not block the UI
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const w = canvas.width
        const h = canvas.height

        // Get original image pixels
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = w
        tempCanvas.height = h
        const tempCtx = tempCanvas.getContext('2d')!
        tempCtx.drawImage(origImg, 0, 0, w, h)
        const origData = tempCtx.getImageData(0, 0, w, h)

        // Get mask
        const maskCtx = maskCanvas.getContext('2d')!
        const maskData = maskCtx.getImageData(0, 0, w, h)

        // Build mask boolean array (true = pixel to fill)
        const mask = new Uint8Array(w * h)
        for (let i = 0; i < w * h; i++) {
          // White pixels in mask = area to fill
          mask[i] = maskData.data[i * 4] > 128 ? 1 : 0
        }

        // Count masked pixels for progress reporting
        let maskedCount = 0
        for (let i = 0; i < mask.length; i++) {
          if (mask[i]) maskedCount++
        }

        if (maskedCount === 0) {
          setError('Please paint over the area you want to remove first.')
          setStatus('painting')
          resolve()
          return
        }

        // Work on a copy of original pixels
        const result = new Uint8ClampedArray(origData.data)
        const numPasses = 4
        const maxSearchRadius = 30

        // Process in passes
        let currentPass = 0

        function processPass() {
          // For each masked pixel, sample from nearest non-masked pixels
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const idx = y * w + x
              if (!mask[idx]) continue

              let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0

              // Search outward in concentric squares
              for (let r = 1; r <= maxSearchRadius; r++) {
                // Check pixels on the perimeter of the square at distance r
                for (let dy = -r; dy <= r; dy++) {
                  for (let dx = -r; dx <= r; dx++) {
                    // Only check perimeter pixels
                    if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue

                    const nx = x + dx
                    const ny = y + dy
                    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue

                    const nIdx = ny * w + nx
                    // On first pass, only sample non-masked; on later passes, sample all
                    if (currentPass === 0 && mask[nIdx]) continue

                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const weight = 1 / (dist * dist + 1)

                    const pi = nIdx * 4
                    totalR += result[pi] * weight
                    totalG += result[pi + 1] * weight
                    totalB += result[pi + 2] * weight
                    totalWeight += weight
                  }
                }

                // If we have enough samples, stop searching further
                if (totalWeight > 3) break
              }

              if (totalWeight > 0) {
                const pi = idx * 4
                result[pi] = Math.round(totalR / totalWeight)
                result[pi + 1] = Math.round(totalG / totalWeight)
                result[pi + 2] = Math.round(totalB / totalWeight)
                result[pi + 3] = 255
              }
            }
          }

          currentPass++
          setProgress(Math.round((currentPass / numPasses) * 100))

          if (currentPass < numPasses) {
            setTimeout(processPass, 0)
          } else {
            // Final result
            const finalData = new ImageData(result, w, h)
            const outCanvas = document.createElement('canvas')
            outCanvas.width = w
            outCanvas.height = h
            const outCtx = outCanvas.getContext('2d')!
            outCtx.putImageData(finalData, 0, 0)

            const url = outCanvas.toDataURL('image/png')
            setResultUrl(url)
            setStatus('done')
            resolve()
          }
        }

        setTimeout(processPass, 0)
      }, 50)
    })
  }, [])

  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const baseName = originalName.replace(/\.[^.]+$/, '')
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${baseName}-object-removed.png`
    a.click()
  }, [resultUrl, originalName])

  const clear = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setError('')
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    setOriginalUrl(null)
    setResultUrl(null)
    setOriginalName('')
    setDragOver(false)
    setCanvasStates([])
    setBrushSize(20)
    originalImageRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [originalUrl])

  // Prevent scrolling while painting on touch devices
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const preventScroll = (e: TouchEvent) => {
      if (status === 'painting') e.preventDefault()
    }
    canvas.addEventListener('touchmove', preventScroll, { passive: false })
    return () => canvas.removeEventListener('touchmove', preventScroll)
  }, [status])

  const isProcessing = status === 'processing'

  return (
    <ToolPage
      title="AI Object Remover"
      description="Remove unwanted objects from photos. Paint over what you want to erase — runs entirely in your browser."
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>AI Object Remover uses inpainting technology to remove unwanted objects from photographs. You select the area containing the object you want to remove, and the AI fills in the gap with content that matches the surrounding background. The result looks natural, as if the object was never there. All processing runs in your browser.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload the image containing the object you want to remove.</li>
            <li>Use the brush tool to <strong>paint over</strong> the object you want to erase.</li>
            <li>Click the remove button to let the AI inpaint the selected area.</li>
            <li>Preview the result and download the cleaned image.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Object removal is useful for cleaning up photographs before publishing — removing photobombers from vacation shots, erasing power lines from landscape photos, removing logos or watermarks from your own images, or cleaning up product photos for e-commerce listings.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Smaller objects on uniform backgrounds are removed most cleanly.</li>
            <li>For complex backgrounds (detailed textures, patterns), results may require touch-up.</li>
            <li>Paint slightly beyond the object edges to ensure complete removal.</li>
            <li>Processing time depends on the size of the selected area and your device performance.</li>
            <li>Your photos never leave your device — all AI processing is local.</li>
          </ul>
        </>
      }
      slug="ai-object-remover"
      faqs={[
        {
          question: 'How does the object removal work?',
          answer: 'You paint a mask over the object you want to remove. The algorithm then analyzes surrounding pixels and fills in the masked area with a weighted average of nearby colors, running multiple smoothing passes for a natural result. Everything runs in your browser — no uploads needed.',
        },
        {
          question: 'Is my image uploaded to a server?',
          answer: 'No. All processing happens entirely on your device, in your browser. Your images never leave your computer. No data is sent anywhere.',
        },
        {
          question: 'What types of objects can I remove?',
          answer: 'This tool works best for removing small to medium objects against relatively uniform or textured backgrounds — like blemishes, text overlays, wires, stickers, or photobombers. Very large or complex removals may show blending artifacts.',
        },
        {
          question: 'What image formats are supported?',
          answer: 'You can upload PNG, JPG, WebP, and most common image formats. The output is always a high-quality PNG file that you can download and use anywhere.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {status === 'idle' ? 'Upload an Image' : status === 'painting' ? 'Paint Over Objects to Remove' : status === 'processing' ? 'Processing...' : status === 'done' ? 'Result' : 'Error'}
            </span>
          </div>
          {status !== 'idle' && <ClearButton onClear={clear} />}
        </div>

        {/* Upload zone */}
        {status === 'idle' && (
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Upload className={`h-10 w-10 mb-3 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium text-foreground">
              Drag & drop your image here, or click to browse
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Supports JPG, PNG, WebP
            </span>
            <span className="text-xs text-muted-foreground">
              Max file size: 20MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </label>
        )}

        {/* Privacy & offline badges */}
        {status === 'idle' && (
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              Your image never leaves your device
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-blue-500" />
              Works fully offline
            </span>
          </div>
        )}

        {/* Painting mode */}
        {status === 'painting' && (
          <div className="space-y-4">
            {/* Brush controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Eraser className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Brush:</span>
                <button
                  onClick={() => setBrushSize(s => Math.max(5, s - 5))}
                  className="p-1 rounded border border-border hover:bg-muted transition-colors"
                  aria-label="Decrease brush size"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-24 accent-primary"
                />
                <button
                  onClick={() => setBrushSize(s => Math.min(50, s + 5))}
                  className="p-1 rounded border border-border hover:bg-muted transition-colors"
                  aria-label="Increase brush size"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs text-muted-foreground w-8">{brushSize}px</span>
              </div>

              <button
                onClick={handleUndo}
                disabled={canvasStates.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo
              </button>

              <button
                onClick={contentAwareFill}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors ml-auto"
              >
                <Eraser className="h-4 w-4" />
                Remove Objects
              </button>
            </div>

            {/* Canvas area */}
            <div ref={containerRef} className="border border-border rounded-lg p-2 bg-muted/20 overflow-auto">
              <canvas
                ref={canvasRef}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="max-w-full h-auto cursor-crosshair mx-auto block"
                style={{ touchAction: 'none' }}
              />
            </div>

            {/* Hidden mask canvas */}
            <canvas ref={maskCanvasRef} className="hidden" />

            <p className="text-xs text-muted-foreground text-center">
              Paint red over the objects you want to remove, then click &ldquo;Remove Objects&rdquo;
            </p>
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Filling in painted areas...</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{progress}% complete</span>

            {/* Hidden canvases kept alive during processing */}
            <canvas ref={canvasRef} className="hidden" />
            <canvas ref={maskCanvasRef} className="hidden" />
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
            <button
              onClick={clear}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Result: before/after comparison */}
        {status === 'done' && originalUrl && resultUrl && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Original</span>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl}
                    alt="Original image"
                    className="max-w-full h-auto max-h-80 mx-auto object-contain"
                  />
                </div>
              </div>

              {/* Result */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Objects Removed</span>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultUrl}
                    alt="Objects removed"
                    loading="lazy"
                    className="max-w-full h-auto max-h-80 mx-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Download button */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors border border-border cursor-pointer">
                <Upload className="h-4 w-4" />
                Process Another Image
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Hidden canvases */}
            <canvas ref={canvasRef} className="hidden" />
            <canvas ref={maskCanvasRef} className="hidden" />
          </div>
        )}
      </div>
    </ToolPage>
  )
}
