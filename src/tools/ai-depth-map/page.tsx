'use client'

import { useState, useRef, useCallback } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, ImageIcon, Loader2, Shield, Wifi, Palette } from 'lucide-react'

type Status = 'idle' | 'downloading' | 'processing' | 'done' | 'error'

/** Map a 0-255 grayscale value to a rainbow colour (blue→cyan→green→yellow→red) */
function grayscaleToRainbow(v: number): [number, number, number] {
  const t = v / 255
  let r = 0, g = 0, b = 0
  if (t < 0.25) {
    // blue → cyan
    b = 255
    g = Math.round((t / 0.25) * 255)
  } else if (t < 0.5) {
    // cyan → green
    g = 255
    b = Math.round((1 - (t - 0.25) / 0.25) * 255)
  } else if (t < 0.75) {
    // green → yellow
    g = 255
    r = Math.round(((t - 0.5) / 0.25) * 255)
  } else {
    // yellow → red
    r = 255
    g = Math.round((1 - (t - 0.75) / 0.25) * 255)
  }
  return [r, g, b]
}

export default function AIDepthMap() {
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [grayscaleUrl, setGrayscaleUrl] = useState<string | null>(null)
  const [colorUrl, setColorUrl] = useState<string | null>(null)
  const [colorized, setColorized] = useState(false)
  const [originalName, setOriginalName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = useCallback(async (file: File) => {
    setOriginalName(file.name)
    setError('')
    setGrayscaleUrl(null)
    setColorUrl(null)
    setColorized(false)
    setProgress(0)
    setProgressLabel('')

    // Preview original
    const reader = new FileReader()
    reader.onload = (ev) => setOriginalUrl(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      setStatus('downloading')
      setProgressLabel('Loading AI model (one-time download ~15 MB)...')

      const { pipeline, RawImage } = await import('@huggingface/transformers')

      let lastPct = 0
      const estimator = await pipeline(
        'depth-estimation',
        'onnx-community/depth-anything-v2-small',
        {
          device: 'wasm',
          progress_callback: (p: { status: string; progress?: number; loaded?: number; total?: number }) => {
            if (p.status === 'progress' && typeof p.progress === 'number') {
              const pct = Math.round(p.progress)
              if (pct > lastPct) {
                lastPct = pct
                setProgress(pct)
              }
              setStatus('downloading')
              setProgressLabel('Downloading AI model (first time only)...')
            } else if (p.status === 'ready') {
              setProgress(100)
            }
          },
        },
      )

      setStatus('processing')
      setProgressLabel('Generating depth map...')
      setProgress(0)

      // Create an object URL for the file to pass to the pipeline
      const imageURL = URL.createObjectURL(file)

      const result = await estimator(imageURL)
      URL.revokeObjectURL(imageURL)

      // result.depth is a RawImage – extract it
      const depthImage = (result as { depth: InstanceType<typeof RawImage> }).depth

      // Convert depth data to a grayscale canvas
      const width = depthImage.width
      const height = depthImage.height

      // Create grayscale canvas
      const grayCanvas = document.createElement('canvas')
      grayCanvas.width = width
      grayCanvas.height = height
      const grayCtx = grayCanvas.getContext('2d')!
      const grayImageData = grayCtx.createImageData(width, height)

      // Create colour canvas
      const colorCanvas = document.createElement('canvas')
      colorCanvas.width = width
      colorCanvas.height = height
      const colorCtx = colorCanvas.getContext('2d')!
      const colorImageData = colorCtx.createImageData(width, height)

      // Normalise depth values to 0-255
      const depthData = depthImage.data as Float32Array | Uint8Array
      let min = Infinity, max = -Infinity
      for (let i = 0; i < depthData.length; i++) {
        if (depthData[i] < min) min = depthData[i]
        if (depthData[i] > max) max = depthData[i]
      }
      const range = max - min || 1

      for (let i = 0; i < depthData.length; i++) {
        const v = Math.round(((depthData[i] - min) / range) * 255)

        // Grayscale (white = near, black = far is default from model)
        grayImageData.data[i * 4] = v
        grayImageData.data[i * 4 + 1] = v
        grayImageData.data[i * 4 + 2] = v
        grayImageData.data[i * 4 + 3] = 255

        // Rainbow colour
        const [r, g, b] = grayscaleToRainbow(v)
        colorImageData.data[i * 4] = r
        colorImageData.data[i * 4 + 1] = g
        colorImageData.data[i * 4 + 2] = b
        colorImageData.data[i * 4 + 3] = 255
      }

      grayCtx.putImageData(grayImageData, 0, 0)
      colorCtx.putImageData(colorImageData, 0, 0)

      const grayUrl = grayCanvas.toDataURL('image/png')
      const colUrl = colorCanvas.toDataURL('image/png')

      setGrayscaleUrl(grayUrl)
      setColorUrl(colUrl)
      setStatus('done')
      setProgressLabel('')
    } catch (err) {
      console.error('Depth estimation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate depth map. Please try again.')
      setStatus('error')
    }
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

  const handleDownload = useCallback(() => {
    const url = colorized ? colorUrl : grayscaleUrl
    if (!url) return
    const baseName = originalName.replace(/\.[^.]+$/, '')
    const suffix = colorized ? '-depth-color' : '-depth-gray'
    const a = document.createElement('a')
    a.href = url
    a.download = `${baseName}${suffix}.png`
    a.click()
  }, [colorized, colorUrl, grayscaleUrl, originalName])

  const clear = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setProgressLabel('')
    setError('')
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    setOriginalUrl(null)
    setGrayscaleUrl(null)
    setColorUrl(null)
    setColorized(false)
    setOriginalName('')
    setDragOver(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [originalUrl])

  const isProcessing = status === 'downloading' || status === 'processing'

  return (
    <ToolPage
      title="AI Depth Map Generator"
      description="Generate 3D depth maps from any photo using AI. Create stunning depth effects — runs entirely in your browser."
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>A depth map generator uses AI to estimate the relative distance of objects in a photograph from the camera. It produces a grayscale image where lighter pixels represent closer objects and darker pixels represent objects farther away. This technique, called monocular depth estimation, runs entirely in your browser using a pre-trained neural network — no server upload required.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a photograph using the file picker or drag-and-drop.</li>
            <li>Wait a few seconds while the AI model loads and processes the image.</li>
            <li>View the generated <strong>depth map</strong> alongside your original photo.</li>
            <li>Download the depth map as a PNG for use in 3D modeling, AR, or visual effects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Depth maps are used in 3D scene reconstruction, augmented reality, computational photography (portrait mode blur), autonomous vehicle research, and game development. Designers use them to create parallax scrolling effects on websites, and photographers use them to simulate bokeh in post-processing.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Photos with clear foreground and background separation produce the best depth maps.</li>
            <li>The AI model runs on your device — larger images take longer to process but produce finer detail.</li>
            <li>Outdoor scenes with natural depth variation work better than flat surfaces.</li>
            <li>You can use the depth map in Photoshop or Blender as a displacement map for 3D effects.</li>
            <li>No internet connection is needed after the model loads — processing is fully offline.</li>
          </ul>
        </>
      }
      slug="ai-depth-map"
      faqs={[
        {
          question: 'What is a depth map?',
          answer: 'A depth map is a grayscale image where each pixel represents distance from the camera. White pixels are closer to the camera and black pixels are farther away. Depth maps are used in 3D effects, portrait mode, AR applications, and more.',
        },
        {
          question: 'How does the AI depth estimation work?',
          answer: 'This tool uses the Depth Anything V2 model, a state-of-the-art AI that estimates relative depth from a single 2D image. The model runs entirely in your browser using WebAssembly (WASM), so your images never leave your device.',
        },
        {
          question: 'Can I use depth maps for 3D or AR effects?',
          answer: 'Yes! Depth maps can be imported into 3D software like Blender, used for parallax effects on the web, applied as displacement maps for 3D geometry, or used in AR/VR applications to add depth to flat images.',
        },
        {
          question: 'What is the difference between grayscale and rainbow depth maps?',
          answer: 'Grayscale depth maps show depth as shades of gray (white = near, black = far) and are the standard format used by most 3D software. Rainbow/coloured depth maps use a gradient from blue (far) to red (near) for easier visual interpretation of depth layers.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {status === 'idle' ? 'Upload an Image' : status === 'done' ? 'Depth Map Result' : 'Processing...'}
            </span>
          </div>
          {status !== 'idle' && <ClearButton onClear={clear} />}
        </div>

        {/* Upload zone */}
        {status === 'idle' && !originalUrl && (
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
        {status === 'idle' && !originalUrl && (
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

            {/* Show original image while processing */}
            {originalUrl && (
              <div className="mt-4">
                <span className="text-sm text-muted-foreground mb-2 block">Original image:</span>
                <div className="border border-border rounded-lg p-2 bg-muted/20 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl}
                    alt="Original"
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

        {/* Result: side-by-side original + depth map */}
        {status === 'done' && originalUrl && grayscaleUrl && colorUrl && (
          <div className="space-y-4">
            {/* Toggle: Grayscale / Rainbow */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setColorized(false)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  !colorized
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-card hover:bg-muted'
                }`}
              >
                Grayscale
              </button>
              <button
                onClick={() => setColorized(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  colorized
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-card hover:bg-muted'
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                Rainbow
              </button>
            </div>

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

              {/* Depth Map */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {colorized ? 'Rainbow Depth Map' : 'Grayscale Depth Map'}
                </span>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={colorized ? colorUrl : grayscaleUrl}
                    alt={colorized ? 'Rainbow depth map' : 'Grayscale depth map'}
                    loading="lazy"
                    className="max-w-full h-auto max-h-80 mx-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
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
          </div>
        )}
      </div>
    </ToolPage>
  )
}
