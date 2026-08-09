'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, ImageIcon, Loader2, Shield, Wifi, Download, SlidersHorizontal } from 'lucide-react'

type Status = 'idle' | 'downloading' | 'processing' | 'done' | 'error'

interface Detection {
  score: number
  label: string
  box: { xmin: number; ymin: number; xmax: number; ymax: number }
}

const COLORS = [
  '#FF3838', '#FF9D97', '#FF701F', '#FFB21D', '#CFD231',
  '#48F90A', '#92CC17', '#3DDB86', '#1A9334', '#00D4BB',
  '#2C99A8', '#00C2FF', '#344593', '#6473FF', '#0018EC',
  '#8438FF', '#520085', '#CB38FF', '#FF95C8', '#FF37C7',
]

export default function AIObjectDetection() {
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [detections, setDetections] = useState<Detection[]>([])
  const [threshold, setThreshold] = useState(50)
  const [allDetections, setAllDetections] = useState<Detection[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const drawDetections = useCallback((dets: Detection[], img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas || !img) return

    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(img, 0, 0)

    const labelColorMap: Record<string, string> = {}
    let colorIdx = 0
    dets.forEach((d) => {
      if (!(d.label in labelColorMap)) {
        labelColorMap[d.label] = COLORS[colorIdx % COLORS.length]
        colorIdx++
      }
    })

    dets.forEach(({ label, score, box }) => {
      const color = labelColorMap[label]
      const x = box.xmin
      const y = box.ymin
      const w = box.xmax - box.xmin
      const h = box.ymax - box.ymin

      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(2, Math.round(img.naturalWidth / 300))
      ctx.strokeRect(x, y, w, h)

      const text = `${label} ${(score * 100).toFixed(0)}%`
      const fontSize = Math.max(14, Math.round(img.naturalWidth / 50))
      ctx.font = `bold ${fontSize}px sans-serif`
      const textMetrics = ctx.measureText(text)
      const textH = fontSize + 8
      const textW = textMetrics.width + 12

      const labelY = y - textH > 0 ? y - textH : y
      ctx.fillStyle = color
      ctx.fillRect(x, labelY, textW, textH)
      ctx.fillStyle = '#FFFFFF'
      ctx.textBaseline = 'top'
      ctx.fillText(text, x + 6, labelY + 4)
    })
  }, [])

  // Re-draw when threshold changes
  useEffect(() => {
    if (status !== 'done' || !imgRef.current || allDetections.length === 0) return
    const filtered = allDetections.filter(d => d.score >= threshold / 100)
    setDetections(filtered)
    drawDetections(filtered, imgRef.current)
  }, [threshold, status, allDetections, drawDetections])

  const detectObjects = useCallback(async (file: File) => {
    setError('')
    setDetections([])
    setAllDetections([])
    setProgress(0)
    setProgressLabel('')

    const dataUrl = await new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = (ev) => resolve(ev.target?.result as string)
      r.readAsDataURL(file)
    })
    setImageUrl(dataUrl)

    try {
      setStatus('downloading')
      setProgressLabel('Loading AI model (~43 MB, first time only \u2014 instant next time)...')

      const { pipeline } = await import('@huggingface/transformers')

      const detector = await pipeline(
        'object-detection',
        'Xenova/detr-resnet-50',
        {
          device: 'wasm',
          progress_callback: (p: any) => {
            if (p.progress !== undefined) {
              setProgress(Math.round(p.progress))
            }
          },
        },
      )

      setStatus('processing')
      setProgressLabel('Detecting objects in your image...')
      setProgress(0)

      const results = await detector(dataUrl, { threshold: 0.01 }) as Detection[]

      setAllDetections(results)
      const filtered = results.filter(d => d.score >= threshold / 100)
      setDetections(filtered)

      // Wait for image to load then draw
      const img = new Image()
      img.onload = () => {
        if (imgRef.current) {
          imgRef.current.src = dataUrl
        }
        // Small delay to let imgRef update
        setTimeout(() => {
          drawDetections(filtered, img)
          // Store img ref for redrawing
          if (imgRef.current) {
            imgRef.current = img as any
          }
        }, 50)
        imgRef.current = img as any
      }
      img.src = dataUrl

      setStatus('done')
      setProgressLabel('')
    } catch (err) {
      console.error('Object detection error:', err)
      setError(err instanceof Error ? err.message : 'Failed to detect objects. Please try again.')
      setStatus('error')
    }
  }, [threshold, drawDetections])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP, etc.)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be under 20 MB')
      return
    }
    detectObjects(file)
  }, [detectObjects])

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

  const clear = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setProgressLabel('')
    setError('')
    setImageUrl(null)
    setDetections([])
    setAllDetections([])
    setDragOver(false)
    setThreshold(50)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'detected-objects.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [])

  const isProcessing = status === 'downloading' || status === 'processing'

  // Build summary: "Found X objects: 2 people, 1 car"
  const buildSummary = (dets: Detection[]) => {
    if (dets.length === 0) return 'No objects detected above threshold'
    const counts: Record<string, number> = {}
    dets.forEach(d => { counts[d.label] = (counts[d.label] || 0) + 1 })
    const parts = Object.entries(counts).map(([label, count]) => `${count} ${label}${count > 1 ? 's' : ''}`)
    return `Found ${dets.length} object${dets.length !== 1 ? 's' : ''}: ${parts.join(', ')}`
  }

  const confidenceColor = (score: number) => {
    if (score > 0.8) return 'text-green-600 dark:text-green-400'
    if (score > 0.5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-muted-foreground'
  }

  return (
    <ToolPage
      title="AI Object Detection"
      description="Detect and label objects in any image using AI. Identifies 80+ object types with bounding boxes \u2014 runs entirely in your browser."
      category="image"
      categoryLabel="Image Tools"
      slug="ai-object-detection"
      faqs={[
        {
          question: 'How does AI object detection work?',
          answer: 'This tool uses DETR (Detection Transformer), a deep learning model from Facebook Research that runs entirely in your browser via WebAssembly. It analyzes the image and predicts bounding boxes with labels for every object it recognizes.',
        },
        {
          question: 'What objects can it detect?',
          answer: 'The model is trained on the COCO dataset and can detect 80+ object categories including people, vehicles (car, truck, bus, bicycle, motorcycle), animals (cat, dog, bird, horse), furniture (chair, couch, bed, table), electronics (laptop, phone, TV), food items (banana, apple, pizza, cake), and much more.',
        },
        {
          question: 'What does the confidence threshold do?',
          answer: 'The confidence threshold controls how certain the model must be before showing a detection. Higher thresholds (e.g. 80%) only show very confident detections, reducing false positives. Lower thresholds (e.g. 20%) show more detections but may include some incorrect ones. The default 50% is a good balance.',
        },
        {
          question: 'Is my image uploaded to a server?',
          answer: 'No. All processing happens entirely on your device, in your browser. Your images never leave your device. The AI model is downloaded once (~43 MB) and cached for future use, so it works offline after the first use.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {status === 'idle' ? 'Upload an Image' : status === 'done' ? 'Detection Results' : 'Analyzing...'}
            </span>
          </div>
          {status !== 'idle' && <ClearButton onClear={clear} />}
        </div>

        {/* Upload zone */}
        {status === 'idle' && !imageUrl && (
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
        {status === 'idle' && !imageUrl && (
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              Your image never leaves your device
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-blue-500" />
              Works offline after first use
            </span>
          </div>
        )}

        {/* Progress bar */}
        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">{progressLabel}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{progress}% complete</span>

            {/* Show image while processing */}
            {imageUrl && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground mb-2 block">Your image:</span>
                <div className="border border-border rounded-lg p-2 bg-muted/20 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Uploaded"
                    className="max-w-full h-auto max-h-64 object-contain"
                  />
                </div>
              </div>
            )}
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

        {/* Results */}
        {status === 'done' && imageUrl && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm font-medium">
              {buildSummary(detections)}
            </div>

            {/* Threshold slider */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Confidence Threshold: {threshold}%</label>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0% (show all)</span>
                <span>100% (most confident)</span>
              </div>
            </div>

            {/* Canvas with bounding boxes */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Annotated Image</span>
              <div className="border border-border rounded-lg p-2 bg-muted/20">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto max-h-[500px] mx-auto object-contain block"
                />
                {/* Hidden img for reference */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef as any}
                  src={imageUrl}
                  alt="Source"
                  className="hidden"
                />
              </div>
            </div>

            {/* Detection list */}
            {detections.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Detections ({detections.length})</span>
                <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                  {detections.map((det, i) => {
                    const labelColorMap: Record<string, string> = {}
                    let ci = 0
                    allDetections.forEach((d) => {
                      if (!(d.label in labelColorMap)) {
                        labelColorMap[d.label] = COLORS[ci % COLORS.length]
                        ci++
                      }
                    })
                    const color = labelColorMap[det.label] || COLORS[0]
                    const pct = (det.score * 100).toFixed(1)
                    return (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-card">
                        <span
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium capitalize flex-1">{det.label}</span>
                        <span className={`text-sm font-semibold tabular-nums ${confidenceColor(det.score)}`}>
                          {pct}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download Annotated Image
              </button>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors border border-border cursor-pointer">
                <Upload className="h-4 w-4" />
                Detect Another Image
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
