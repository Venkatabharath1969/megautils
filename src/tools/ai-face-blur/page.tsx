'use client'

import { useState, useRef, useCallback } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, Loader2, Grid3X3, Eye, Square, Smile, Shield, Wifi } from 'lucide-react'

type BlurStyle = 'pixelate' | 'blur' | 'black' | 'emoji'
type Status = 'idle' | 'loading' | 'processing' | 'done' | 'error'

const BLUR_STYLES: { value: BlurStyle; label: string; icon: React.ReactNode }[] = [
  { value: 'pixelate', label: 'Pixelate', icon: <Grid3X3 className="h-4 w-4" /> },
  { value: 'blur', label: 'Gaussian Blur', icon: <Eye className="h-4 w-4" /> },
  { value: 'black', label: 'Black Bar', icon: <Square className="h-4 w-4" /> },
  { value: 'emoji', label: 'Emoji', icon: <Smile className="h-4 w-4" /> },
]

function pixelateRegion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  blockSize: number
) {
  const safeX = Math.max(0, Math.round(x))
  const safeY = Math.max(0, Math.round(y))
  const safeW = Math.round(w)
  const safeH = Math.round(h)

  const imageData = ctx.getImageData(safeX, safeY, safeW, safeH)
  const data = imageData.data
  for (let py = 0; py < safeH; py += blockSize) {
    for (let px = 0; px < safeW; px += blockSize) {
      const i = (py * safeW + px) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      for (let by = 0; by < blockSize && py + by < safeH; by++) {
        for (let bx = 0; bx < blockSize && px + bx < safeW; bx++) {
          const j = ((py + by) * safeW + (px + bx)) * 4
          data[j] = r
          data[j + 1] = g
          data[j + 2] = b
        }
      }
    }
  }
  ctx.putImageData(imageData, safeX, safeY)
}

function applyGaussianBlur(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const safeX = Math.max(0, Math.round(x))
  const safeY = Math.max(0, Math.round(y))
  const safeW = Math.round(w)
  const safeH = Math.round(h)

  // Use iterative box blur to approximate gaussian
  const iterations = 3
  const imageData = ctx.getImageData(safeX, safeY, safeW, safeH)
  const data = imageData.data
  const copy = new Uint8ClampedArray(data)

  for (let iter = 0; iter < iterations; iter++) {
    const src = iter % 2 === 0 ? data : copy
    const dst = iter % 2 === 0 ? copy : data

    for (let py = 0; py < safeH; py++) {
      for (let px = 0; px < safeW; px++) {
        let r = 0, g = 0, b = 0, count = 0
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = px + dx
            const ny = py + dy
            if (nx >= 0 && nx < safeW && ny >= 0 && ny < safeH) {
              const i = (ny * safeW + nx) * 4
              r += src[i]
              g += src[i + 1]
              b += src[i + 2]
              count++
            }
          }
        }
        const j = (py * safeW + px) * 4
        dst[j] = r / count
        dst[j + 1] = g / count
        dst[j + 2] = b / count
        dst[j + 3] = src[j + 3]
      }
    }
  }

  // Ensure final result is in data
  if (iterations % 2 === 1) {
    for (let i = 0; i < data.length; i++) data[i] = copy[i]
  }

  ctx.putImageData(imageData, safeX, safeY)
}

function applyBlackBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = '#000000'
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

function applyEmoji(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const size = Math.max(w, h)
  const centerX = x + w / 2
  const centerY = y + h / 2
  ctx.font = `${Math.round(size * 1.1)}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('😀', centerX, centerY)
}

export default function AIFaceBlurTool() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [faceCount, setFaceCount] = useState(0)
  const [blurStyle, setBlurStyle] = useState<BlurStyle>('pixelate')
  const [intensity, setIntensity] = useState(10)
  const [sensitivity, setSensitivity] = useState(0.5)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [originalFileName, setOriginalFileName] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  // Store raw detections so we can re-apply styles without re-detecting
  const detectionsRef = useRef<Array<{ x: number; y: number; width: number; height: number }>>([])

  const applyBlurToFaces = useCallback(
    (
      img: HTMLImageElement,
      detections: Array<{ x: number; y: number; width: number; height: number }>,
      style: BlurStyle,
      intensityVal: number
    ) => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      // Expand each detection box slightly for better coverage
      const padding = 0.15
      detections.forEach((box) => {
        const padX = box.width * padding
        const padY = box.height * padding
        const fx = Math.max(0, box.x - padX)
        const fy = Math.max(0, box.y - padY)
        const fw = Math.min(img.width - fx, box.width + padX * 2)
        const fh = Math.min(img.height - fy, box.height + padY * 2)

        switch (style) {
          case 'pixelate':
            pixelateRegion(ctx, fx, fy, fw, fh, Math.max(2, intensityVal))
            break
          case 'blur':
            applyGaussianBlur(ctx, fx, fy, fw, fh, Math.max(1, Math.round(intensityVal / 2)))
            break
          case 'black':
            applyBlackBar(ctx, fx, fy, fw, fh)
            break
          case 'emoji':
            applyEmoji(ctx, fx, fy, fw, fh)
            break
        }
      })

      setResultImage(canvas.toDataURL('image/png'))
    },
    []
  )

  const processImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please upload an image file (PNG, JPG, WebP)')
        setStatus('error')
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        setErrorMsg('File size must be under 20 MB')
        setStatus('error')
        return
      }
      setStatus('loading')
      setErrorMsg('')
      setFaceCount(0)
      setResultImage(null)
      setOriginalFileName(file.name.replace(/\.[^.]+$/, ''))

      try {
        // Dynamic import for lazy loading
        const faceapi = await import('@vladmandic/face-api')

        // Load TinyFaceDetector model from CDN
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1/model'
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)

        // Create image element
        const img = new Image()
        img.src = URL.createObjectURL(file)
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Failed to load image'))
        })
        imgRef.current = img

        setStatus('processing')

        // Detect faces
        const detections = await faceapi.detectAllFaces(
          img,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: sensitivity })
        )

        const boxes = detections.map((d) => ({
          x: d.box.x,
          y: d.box.y,
          width: d.box.width,
          height: d.box.height,
        }))
        detectionsRef.current = boxes
        setFaceCount(boxes.length)

        if (boxes.length === 0) {
          // Still show the original image even if no faces found
          const canvas = canvasRef.current
          if (canvas) {
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(img, 0, 0)
            setResultImage(canvas.toDataURL('image/png'))
          }
          setStatus('done')
          return
        }

        applyBlurToFaces(img, boxes, blurStyle, intensity)
        setStatus('done')
      } catch (e) {
        setStatus('error')
        setErrorMsg(e instanceof Error ? e.message : 'An error occurred during processing')
      }
    },
    [blurStyle, intensity, applyBlurToFaces]
  )

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      processImage(file)
    },
    [processImage]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        processImage(file)
      }
    },
    [processImage]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
  }, [])

  // Re-apply blur when style or intensity changes (only after initial processing)
  const reapply = useCallback(() => {
    if (!imgRef.current || detectionsRef.current.length === 0) return
    applyBlurToFaces(imgRef.current, detectionsRef.current, blurStyle, intensity)
  }, [blurStyle, intensity, applyBlurToFaces])

  const handleStyleChange = useCallback(
    (style: BlurStyle) => {
      setBlurStyle(style)
      if (status === 'done' && imgRef.current && detectionsRef.current.length > 0) {
        applyBlurToFaces(imgRef.current, detectionsRef.current, style, intensity)
      }
    },
    [status, intensity, applyBlurToFaces]
  )

  const handleIntensityChange = useCallback(
    (val: number) => {
      setIntensity(val)
      if (status === 'done' && imgRef.current && detectionsRef.current.length > 0) {
        applyBlurToFaces(imgRef.current, detectionsRef.current, blurStyle, val)
      }
    },
    [status, blurStyle, applyBlurToFaces]
  )

  const handleDownload = useCallback(() => {
    if (!resultImage) return
    const a = document.createElement('a')
    a.href = resultImage
    a.download = `${originalFileName || 'image'}-blurred.png`
    a.click()
  }, [resultImage, originalFileName])

  const clear = useCallback(() => {
    setStatus('idle')
    setErrorMsg('')
    setFaceCount(0)
    setResultImage(null)
    setOriginalFileName('')
    imgRef.current = null
    detectionsRef.current = []
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  return (
    <ToolPage
      title="AI Face Blur"
      description="Automatically detect and blur faces in photos for privacy. Choose pixelate, blur, or black bar styles. Runs entirely in your browser."
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>AI Face Blur automatically detects all human faces in a photograph and applies a blur effect to anonymize them. It uses a neural network–based face detection model that identifies facial regions with high accuracy, then applies a configurable Gaussian blur to each detected face while leaving the rest of the image untouched. The entire process runs in your browser — your photos are never uploaded.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload an image containing one or more faces.</li>
            <li>The AI model automatically detects all visible faces.</li>
            <li>Adjust the <strong>blur intensity</strong> slider to control how strongly faces are obscured.</li>
            <li>Preview the result and download the anonymized image.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Use face blur when sharing photos on social media where bystanders did not consent to being photographed, when publishing street photography, when creating training data that must comply with privacy regulations (GDPR), or when preparing images for public reports and presentations where individual identities must be protected.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>The detector works best on frontal or slightly angled faces; heavily occluded or profile faces may be missed.</li>
            <li>Increase blur intensity for stronger anonymization — a light blur may still allow identification.</li>
            <li>For group photos, all detected faces are blurred simultaneously.</li>
            <li>Processing happens entirely on your device, making it safe for sensitive photos.</li>
            <li>If a face is not detected, try cropping to include the full head and shoulders.</li>
          </ul>
        </>
      }
      slug="ai-face-blur"
      faqs={[
        {
          question: 'How does the AI face detection work?',
          answer:
            'This tool uses TinyFaceDetector, a lightweight AI engine from the face-api.js library. It runs entirely in your browser — no server processing or uploads required. The AI engine is only ~190KB and detects faces in real-time.',
        },
        {
          question: 'Is my image uploaded to any server?',
          answer:
            'No. All processing happens entirely in your browser, on your device. Your images never leave your device. The AI engine is loaded once and then runs locally in your browser.',
        },
        {
          question: 'What blur styles are available?',
          answer:
            'Four styles are available: Pixelate (mosaic effect), Gaussian Blur (smooth blur), Black Bar (solid black rectangle over each face), and Emoji (places a smiley emoji over each face). You can also adjust the intensity for pixelation and blur effects.',
        },
        {
          question: 'Why are some faces not detected?',
          answer:
            'The TinyFaceDetector works best with frontal faces that are clearly visible. Faces that are very small, heavily rotated, partially occluded, or in very low light may not be detected. Try uploading a higher resolution image for better results.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload Image</span>
          {status !== 'idle' && <ClearButton onClear={clear} />}
        </div>

        {/* Upload area — shown when idle or as a re-upload option */}
        {status === 'idle' && (
          <div>
            <label
              className={`flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl cursor-pointer transition-colors border-border hover:border-muted-foreground hover:bg-muted/50`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <span className="text-sm font-medium text-foreground">Drag & drop your image here, or click to browse</span>
              <span className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WebP</span>
              <span className="text-xs text-muted-foreground">Max file size: 20MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </label>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-3">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                Your image never leaves your device
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-blue-500" />
                Works offline after first use
              </span>
            </div>
          </div>
        )}

        {/* Loading / Processing states */}
        {(status === 'loading' || status === 'processing') && (
          <div className="flex flex-col items-center justify-center h-44 border border-border rounded-lg bg-muted/20">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
            <span className="text-sm font-medium">
              {status === 'loading' ? 'Preparing AI engine (one-time setup)...' : 'Scanning for faces...'}
            </span>
            <span className="text-xs text-muted-foreground mt-1">This may take a few seconds</span>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="p-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            <span className="font-medium">Error:</span> {errorMsg}
          </div>
        )}

        {/* Controls — shown after processing */}
        {status === 'done' && (
          <>
            {/* Face count badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  faceCount > 0
                    ? 'bg-primary/10 text-primary'
                    : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {faceCount > 0
                  ? `${faceCount} face${faceCount !== 1 ? 's' : ''} detected`
                  : 'No faces detected'}
              </div>
            </div>

            {/* Blur style selector */}
            {faceCount > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Blur Style</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BLUR_STYLES.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => handleStyleChange(s.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          blurStyle === s.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card hover:bg-muted'
                        }`}
                      >
                        {s.icon}
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity slider — hidden for black bar and emoji */}
                {(blurStyle === 'pixelate' || blurStyle === 'blur') && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Intensity</label>
                      <span className="text-xs text-muted-foreground tabular-nums">{intensity}</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={40}
                      value={intensity}
                      onChange={(e) => handleIntensityChange(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Light</span>
                      <span>Heavy</span>
                    </div>
                  </div>
                )}

                {/* Detection sensitivity slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Detection Sensitivity</label>
                    <span className="text-xs text-muted-foreground tabular-nums">{sensitivity.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={0.9}
                    step={0.1}
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>More faces (0.3)</span>
                    <span>Fewer false positives (0.9)</span>
                  </div>
                </div>

                {/* Re-apply button for manual trigger */}
                <button
                  onClick={reapply}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Re-apply Blur
                </button>
              </div>
            )}

            {/* Result image */}
            {resultImage && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Result</span>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
                <div className="border border-border rounded-lg p-2 bg-muted/20 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultImage}
                    alt="Face-blurred result"
                    loading="lazy"
                    className="max-w-full h-auto max-h-[500px] mx-auto block"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolPage>
  )
}
