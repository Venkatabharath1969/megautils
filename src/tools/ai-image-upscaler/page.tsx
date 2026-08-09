'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload, AlertTriangle, Shield, Wifi } from 'lucide-react'

export default function AIImageUpscaler() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 })
  const [errorMsg, setErrorMsg] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
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

    setStatus('processing')
    setProgress(0)
    setUpscaledImage(null)
    setErrorMsg('')

    try {
      // Load original image
      const url = URL.createObjectURL(file)
      const img = new window.Image()
      img.src = url
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
      })
      setOriginalImage(url)
      setOriginalSize({ w: img.width, h: img.height })

      // Dynamic imports for lazy loading
      const Upscaler = (await import('upscaler')).default
      const model = (await import('@upscalerjs/esrgan-slim/2x')).default

      const upscaler = new Upscaler({ model })

      const result = await upscaler.upscale(img, {
        output: 'base64',
        patchSize: 64,
        padding: 2,
        progress: (percent: number) => {
          setProgress(Math.round(percent * 100))
        },
      })

      setUpscaledImage(result as string)
      setStatus('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Upscaling failed')
      setStatus('error')
    }
  }, [])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDownload = useCallback(() => {
    if (!upscaledImage) return
    const a = document.createElement('a')
    a.href = upscaledImage
    a.download = `upscaled-${originalSize.w * 2}x${originalSize.h * 2}.png`
    a.click()
  }, [upscaledImage, originalSize])

  const clear = useCallback(() => {
    if (originalImage) URL.revokeObjectURL(originalImage)
    setOriginalImage(null)
    setUpscaledImage(null)
    setStatus('idle')
    setProgress(0)
    setOriginalSize({ w: 0, h: 0 })
    setErrorMsg('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [originalImage])

  const showLargeWarning = originalSize.w > 2000 || originalSize.h > 2000

  return (
    <ToolPage
      title="AI Image Upscaler"
      description="Enlarge images 2x using AI super-resolution. Enhances detail that standard resizing blurs. Runs entirely in your browser."
      category="image"
      categoryLabel="Image Tools"
      slug="ai-image-upscaler"
      faqs={[
        { question: 'How does AI image upscaling work?', answer: 'AI upscaling uses an advanced AI engine (ESRGAN) trained on millions of image pairs. It learns to predict missing high-resolution details rather than simply interpolating pixels, producing sharper and more detailed results than traditional resizing.' },
        { question: 'Is my image uploaded to any server?', answer: 'No. All processing runs entirely in your browser on your device. Your images never leave your device, ensuring complete privacy.' },
        { question: 'What image formats are supported?', answer: 'You can upload any format supported by your browser, including PNG, JPEG, WebP, and GIF. The upscaled output is downloaded as a PNG file to preserve maximum quality.' },
        { question: 'Why is upscaling large images slow?', answer: 'AI upscaling is computationally intensive. The AI processes the image in small patches. Larger images have more patches to process, so they take longer. Images over 2000px on either side may take significantly more time.' },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload Image</span>
          {originalImage && <ClearButton onClear={clear} />}
        </div>

        {/* Upload area */}
        {!originalImage ? (
          <div>
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Upload className={`h-10 w-10 mb-3 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
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
        ) : (
          <div className="space-y-6">
            {/* Large image warning */}
            {showLargeWarning && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Large images may take longer to process
              </div>
            )}

            {/* Processing progress */}
            {status === 'processing' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Enhancing your image with AI...</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error message */}
            {status === 'error' && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                {errorMsg || 'An error occurred during upscaling.'}
              </div>
            )}

            {/* Before / After comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Original</span>
                  <span className="text-xs text-muted-foreground">{originalSize.w} × {originalSize.h}</span>
                </div>
                <div className="border border-border rounded-lg p-2 bg-muted/20 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalImage}
                    alt="Original"
                    className="max-w-full h-auto max-h-80 mx-auto object-contain"
                  />
                </div>
              </div>

              {/* Upscaled */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Upscaled (2×)</span>
                  {status === 'done' && (
                    <span className="text-xs text-muted-foreground">{originalSize.w * 2} × {originalSize.h * 2}</span>
                  )}
                </div>
                <div className="border border-border rounded-lg p-2 bg-muted/20 overflow-hidden min-h-[160px] flex items-center justify-center">
                  {status === 'done' && upscaledImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={upscaledImage}
                      alt="Upscaled"
                      loading="lazy"
                      className="max-w-full h-auto max-h-80 mx-auto object-contain"
                    />
                  ) : status === 'processing' ? (
                    <span className="text-sm text-muted-foreground">Working on your image...</span>
                  ) : status === 'error' ? (
                    <span className="text-sm text-red-500">Failed</span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Dimension info + actions */}
            {status === 'done' && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                  <strong>{originalSize.w}×{originalSize.h}</strong> → <strong>{originalSize.w * 2}×{originalSize.h * 2}</strong> (2× upscaled)
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-4 w-4" /> Download Upscaled Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
