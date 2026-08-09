'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, Loader2, MousePointer2, Shield, Wifi } from 'lucide-react'

type Status = 'idle' | 'downloading' | 'ready' | 'processing' | 'done' | 'error'

interface ClickPoint {
  x: number
  y: number
  label: number // 1 = include (foreground), 0 = exclude (background)
}

export default function AISegment() {
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [originalName, setOriginalName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [clickPoints, setClickPoints] = useState<ClickPoint[]>([])
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const modelRef = useRef<any>(null)
  const processorRef = useRef<any>(null)
  const embeddingsRef = useRef<any>(null)
  const processedInputsRef = useRef<any>(null)
  const rawImageRef = useRef<any>(null)

  // Load model lazily
  const ensureModel = useCallback(async () => {
    if (modelRef.current && processorRef.current) return

    setStatus('downloading')
    setProgressLabel('Setting up AI (~14 MB, first time only — instant next time)...')
    setProgress(0)

    const { SamModel, AutoProcessor } = await import('@huggingface/transformers')

    const model = await SamModel.from_pretrained('Xenova/slimsam-77-uniform', {
      dtype: 'fp32',
      progress_callback: (p: any) => {
        if (p.progress !== undefined) {
          setProgress(Math.round(p.progress))
        }
      },
    })

    const processor = await AutoProcessor.from_pretrained('Xenova/slimsam-77-uniform')

    modelRef.current = model
    processorRef.current = processor
  }, [])

  // Compute image embedding (one-time per image)
  const computeEmbedding = useCallback(async (imageUrl: string) => {
    await ensureModel()

    setStatus('processing')
    setProgressLabel('Analyzing your image...')
    setProgress(0)

    const { RawImage } = await import('@huggingface/transformers')
    const rawImage = await RawImage.read(imageUrl)
    rawImageRef.current = rawImage

    // Process the image to get pixel_values
    const inputs = await processorRef.current(rawImage)
    processedInputsRef.current = inputs

    // Compute image embeddings (heavy step, only done once per image)
    const embeddings = await modelRef.current.get_image_embeddings(inputs)
    embeddingsRef.current = embeddings

    setStatus('ready')
    setProgressLabel('')
  }, [ensureModel])

  // Run segmentation with current click points
  const runSegmentation = useCallback(async (points: ClickPoint[]) => {
    if (!modelRef.current || !processorRef.current || !embeddingsRef.current || !processedInputsRef.current) return
    if (points.length === 0) {
      setResultUrl(null)
      return
    }

    setStatus('processing')
    setProgressLabel('Creating your cutout...')

    try {
      // Format points: [[[x1,y1], [x2,y2], ...]]
      const inputPoints = points.map(p => [p.x, p.y])
      const inputLabels = points.map(p => p.label)

      const cachedInputs = processedInputsRef.current

      // Use processor's reshape methods to transform points using cached sizes
      const processor = processorRef.current
      // SamProcessor delegates to image_processor; get the underlying image processor
      const imgProcessor = processor.image_processor || processor

      const reshapedPoints = imgProcessor.reshape_input_points(
        [inputPoints],
        cachedInputs.original_sizes,
        cachedInputs.reshaped_input_sizes,
      )

      const addLabels = imgProcessor.add_input_labels(
        [inputLabels],
        reshapedPoints,
      )

      // Build model inputs with cached embeddings
      const modelInputs = {
        image_embeddings: embeddingsRef.current.image_embeddings,
        image_positional_embeddings: embeddingsRef.current.image_positional_embeddings,
        input_points: reshapedPoints,
        input_labels: addLabels,
      }

      const outputs = await modelRef.current(modelInputs)

      // Post-process masks
      const masks = await processorRef.current.post_process_masks(
        outputs.pred_masks,
        cachedInputs.original_sizes,
        cachedInputs.reshaped_input_sizes,
      )

      // masks[0] has shape [1, 3, H, W] - pick the best mask based on iou_scores
      const mask = masks[0]
      const scores = outputs.iou_scores.data
      let bestIdx = 0
      let bestScore = -1
      for (let i = 0; i < 3; i++) {
        if (scores[i] > bestScore) {
          bestScore = scores[i]
          bestIdx = i
        }
      }

      // Extract the best mask
      const height = mask.dims[2]
      const width = mask.dims[3]
      const maskData = mask.data
      const maskOffset = bestIdx * height * width

      // Draw the cutout on a canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!

      // Draw original image
      const img = imgRef.current
      if (!img) return
      ctx.drawImage(img, 0, 0, width, height)

      // Get image data and apply mask as alpha
      const imgData = ctx.getImageData(0, 0, width, height)
      const pixels = imgData.data

      for (let i = 0; i < height * width; i++) {
        const isMasked = maskData[maskOffset + i]
        if (!isMasked) {
          pixels[i * 4 + 3] = 0 // Set alpha to 0 for non-masked pixels
        }
      }

      ctx.putImageData(imgData, 0, 0)

      // Convert to blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          if (resultUrl) URL.revokeObjectURL(resultUrl)
          setResultUrl(URL.createObjectURL(blob))
        }
      }, 'image/png')

      // Also draw mask overlay on the visible canvas
      drawOverlay(points, maskData, maskOffset, width, height)

      setStatus('done')
      setProgressLabel('')
    } catch (err) {
      console.error('Segmentation error (trying fallback):', err)
      // Fallback: re-process from raw image entirely
      await runSegmentationFallback(points)
    }
  }, [resultUrl])

  // Fallback: re-process the full image with points (no cached embeddings)
  const runSegmentationFallback = useCallback(async (points: ClickPoint[]) => {
    if (!modelRef.current || !processorRef.current) return
    if (points.length === 0) return

    // Use cached raw image or re-read from URL
    const rawImage = rawImageRef.current
    if (!rawImage) {
      setError('Image data not available. Please re-upload the image.')
      setStatus('error')
      return
    }

    try {
      const inputPoints = points.map(p => [p.x, p.y])
      const inputLabels = points.map(p => p.label)

      const inputs = await processorRef.current(rawImage, {
        input_points: [inputPoints],
        input_labels: [inputLabels],
      })

      const outputs = await modelRef.current(inputs)

      const masks = await processorRef.current.post_process_masks(
        outputs.pred_masks,
        inputs.original_sizes,
        inputs.reshaped_input_sizes,
      )

      const mask = masks[0]
      const scores = outputs.iou_scores.data
      let bestIdx = 0
      let bestScore = -1
      for (let i = 0; i < 3; i++) {
        if (scores[i] > bestScore) {
          bestScore = scores[i]
          bestIdx = i
        }
      }

      const height = mask.dims[2]
      const width = mask.dims[3]
      const maskData = mask.data
      const maskOffset = bestIdx * height * width

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!

      const img = imgRef.current
      if (!img) return
      ctx.drawImage(img, 0, 0, width, height)

      const imgData = ctx.getImageData(0, 0, width, height)
      const pixels = imgData.data

      for (let i = 0; i < height * width; i++) {
        if (!maskData[maskOffset + i]) {
          pixels[i * 4 + 3] = 0
        }
      }

      ctx.putImageData(imgData, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          if (resultUrl) URL.revokeObjectURL(resultUrl)
          setResultUrl(URL.createObjectURL(blob))
        }
      }, 'image/png')

      drawOverlay(points, maskData, maskOffset, width, height)

      setStatus('done')
      setProgressLabel('')
    } catch (err) {
      console.error('Fallback segmentation error:', err)
      setError(err instanceof Error ? err.message : 'Segmentation failed. Please try again.')
      setStatus('error')
    }
  }, [resultUrl])

  // Draw the image + mask overlay + click points on visible canvas
  const drawOverlay = useCallback((points: ClickPoint[], maskData?: any, maskOffset?: number, maskW?: number, maskH?: number) => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')!
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    // Draw the original image
    ctx.drawImage(img, 0, 0)

    // Draw mask overlay if available
    if (maskData && maskOffset !== undefined && maskW && maskH) {
      const overlayData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = overlayData.data

      for (let i = 0; i < maskH * maskW; i++) {
        if (maskData[maskOffset + i]) {
          // Semi-transparent blue overlay
          pixels[i * 4] = Math.round(pixels[i * 4] * 0.6 + 59 * 0.4)     // R
          pixels[i * 4 + 1] = Math.round(pixels[i * 4 + 1] * 0.6 + 130 * 0.4) // G
          pixels[i * 4 + 2] = Math.round(pixels[i * 4 + 2] * 0.6 + 246 * 0.4) // B
        }
      }

      ctx.putImageData(overlayData, 0, 0)
    }

    // Draw click points
    for (const point of points) {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI)
      ctx.fillStyle = point.label === 1 ? '#22c55e' : '#ef4444'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }, [])

  // Draw clean image with points (no mask)
  const drawImageWithPoints = useCallback((points: ClickPoint[]) => {
    drawOverlay(points)
  }, [drawOverlay])

  // Upload handler
  const processImage = useCallback(async (file: File) => {
    setOriginalName(file.name)
    setError('')
    setResultUrl(null)
    setClickPoints([])
    setProgress(0)
    setProgressLabel('')
    embeddingsRef.current = null
    processedInputsRef.current = null
    rawImageRef.current = null

    const url = URL.createObjectURL(file)
    setOriginalUrl(url)

    // Load image to get dimensions
    const img = new window.Image()
    img.src = url
    await new Promise<void>((resolve) => {
      img.onload = () => {
        setImageSize({ w: img.naturalWidth, h: img.naturalHeight })
        resolve()
      }
    })

    try {
      await computeEmbedding(url)
    } catch (err) {
      console.error('Error computing embedding:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze image. Please try again.')
      setStatus('error')
    }
  }, [computeEmbedding])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WebP)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be under 20 MB')
      return
    }
    processImage(file)
  }, [processImage])

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

  // Handle click on canvas
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (status !== 'ready' && status !== 'done') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = Math.round((e.clientX - rect.left) * scaleX)
    const y = Math.round((e.clientY - rect.top) * scaleY)

    // Left-click = include (1), right-click would be exclude (0) but handled by context menu
    const label = 1

    const newPoints = [...clickPoints, { x, y, label }]
    setClickPoints(newPoints)
    drawImageWithPoints(newPoints)
    runSegmentation(newPoints)
  }, [status, clickPoints, drawImageWithPoints, runSegmentation])

  // Handle right-click on canvas (exclude point)
  const handleCanvasRightClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (status !== 'ready' && status !== 'done') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = Math.round((e.clientX - rect.left) * scaleX)
    const y = Math.round((e.clientY - rect.top) * scaleY)

    const newPoints = [...clickPoints, { x, y, label: 0 }]
    setClickPoints(newPoints)
    drawImageWithPoints(newPoints)
    runSegmentation(newPoints)
  }, [status, clickPoints, drawImageWithPoints, runSegmentation])

  // Undo last click
  const undoLastClick = useCallback(() => {
    if (clickPoints.length === 0) return
    const newPoints = clickPoints.slice(0, -1)
    setClickPoints(newPoints)
    if (newPoints.length === 0) {
      setResultUrl(null)
      drawImageWithPoints([])
      setStatus('ready')
    } else {
      runSegmentation(newPoints)
    }
  }, [clickPoints, drawImageWithPoints, runSegmentation])

  // Draw image on canvas when image loads
  useEffect(() => {
    if (originalUrl && imgRef.current && canvasRef.current && (status === 'ready' || status === 'done')) {
      drawImageWithPoints(clickPoints)
    }
  }, [originalUrl, status, drawImageWithPoints, clickPoints])

  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const baseName = originalName.replace(/\.[^.]+$/, '')
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${baseName}-cutout.png`
    a.click()
  }, [resultUrl, originalName])

  const clear = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setProgressLabel('')
    setError('')
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setOriginalUrl(null)
    setResultUrl(null)
    setOriginalName('')
    setClickPoints([])
    setDragOver(false)
    setImageSize({ w: 0, h: 0 })
    embeddingsRef.current = null
    processedInputsRef.current = null
    rawImageRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [originalUrl, resultUrl])

  const isProcessing = status === 'downloading' || status === 'processing'

  return (
    <ToolPage
      title="AI Image Segmentation"
      description="Click on any object to cut it out. Uses Meta's Segment Anything AI. Runs entirely in your browser — your images never leave your device."
      category="image"
      categoryLabel="Image Tools"
      slug="ai-segment"
      faqs={[
        {
          question: 'What is AI image segmentation?',
          answer: 'AI image segmentation identifies and separates individual objects in an image. This tool uses Meta\'s Segment Anything AI (SlimSAM) to let you click on any object and get a precise cutout with a transparent background, perfect for photo editing, design, and compositing.',
        },
        {
          question: 'How do the include and exclude clicks work?',
          answer: 'Left-click (green dot) marks a point as part of the object you want to select. Right-click (red dot) marks a point as something to exclude from the selection. This helps refine the segmentation — for example, click on a person to select them, then right-click on something behind them that was accidentally included.',
        },
        {
          question: 'Is my image uploaded to a server?',
          answer: 'No. All processing happens entirely on your device, in your browser. The AI engine (~14 MB) is downloaded once and cached. Your images never leave your device, ensuring complete privacy.',
        },
        {
          question: 'Why is the first use slower?',
          answer: 'On first use, the AI engine (~14 MB) needs to be downloaded to your browser. This is cached automatically, so subsequent uses are instant. After loading, the AI analyzes your image once, then each click generates a cutout in under a second.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointer2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {status === 'idle' ? 'Upload an Image' : status === 'ready' ? 'Click on an object to segment it' : status === 'done' ? 'Click to refine, or download the cutout' : status === 'downloading' || status === 'processing' ? 'Processing...' : 'Error'}
            </span>
          </div>
          {status !== 'idle' && <ClearButton onClear={clear} />}
        </div>

        {/* Upload zone */}
        {status === 'idle' && !originalUrl && (
          <>
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
          </>
        )}

        {/* Progress bar */}
        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">{progressLabel}</span>
            </div>
            {status === 'downloading' && (
              <>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{progress}% complete</span>
              </>
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

        {/* Main interaction area */}
        {originalUrl && (status === 'ready' || status === 'done' || status === 'processing') && (
          <div className="space-y-4">
            {/* Instructions */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                Left-click = include
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                Right-click = exclude
              </span>
              {clickPoints.length > 0 && (
                <button
                  onClick={undoLastClick}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted text-xs transition-colors"
                >
                  Undo last point
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Interactive canvas */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Click to segment</span>
                <div className="border border-border rounded-lg p-2 bg-muted/20 overflow-hidden relative">
                  {/* Hidden image for reference */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={originalUrl}
                    alt="Original"
                    className="hidden"
                    crossOrigin="anonymous"
                  />
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onContextMenu={handleCanvasRightClick}
                    className="max-w-full h-auto max-h-[500px] mx-auto object-contain cursor-crosshair rounded"
                    style={{ display: 'block' }}
                  />
                  {status === 'processing' && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Cutout result */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Cutout result</span>
                <div
                  className="border border-border rounded-lg p-2 overflow-hidden min-h-[200px] flex items-center justify-center"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                >
                  {resultUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resultUrl}
                      alt="Segmented cutout"
                      loading="lazy"
                      className="max-w-full h-auto max-h-[500px] mx-auto object-contain"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Click on an object in the image to see the cutout here
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {resultUrl && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Cutout PNG
                </button>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors border border-border cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Try Another Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        clear()
                        setTimeout(() => handleFile(file), 50)
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
