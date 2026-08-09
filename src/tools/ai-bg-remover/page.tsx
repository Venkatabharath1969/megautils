'use client'

import { useState, useRef, useCallback } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, ImageIcon, Loader2, Shield, Wifi } from 'lucide-react'

type Status = 'idle' | 'downloading' | 'processing' | 'done' | 'error'

export default function AIBGRemover() {
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [originalName, setOriginalName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = useCallback(async (file: File) => {
    setOriginalName(file.name)
    setError('')
    setResultUrl(null)
    setProgress(0)
    setProgressLabel('')

    // Create preview of original
    const reader = new FileReader()
    reader.onload = (ev) => setOriginalUrl(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      setStatus('downloading')
      setProgressLabel('Preparing AI engine (one-time setup)...')

      const { removeBackground } = await import('@imgly/background-removal')

      setStatus('processing')
      setProgressLabel('Removing background...')
      setProgress(0)

      const blob = await removeBackground(file, {
        model: 'isnet_quint8',
        progress: (key: string, current: number, total: number) => {
          const pct = total > 0 ? Math.round((current / total) * 100) : 0
          setProgress(pct)
          if (key.includes('fetch') || key.includes('download')) {
            setStatus('downloading')
            setProgressLabel('Setting up AI (first time only — instant next time)...')
          } else {
            setStatus('processing')
            setProgressLabel('Working on your image...')
          }
        },
        output: {
          format: 'image/png' as const,
          quality: 1,
        },
      })

      const url = URL.createObjectURL(blob)
      setResultUrl(url)
      setStatus('done')
      setProgressLabel('')
    } catch (err) {
      console.error('Background removal error:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove background. Please try again.')
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
    if (!resultUrl) return
    const baseName = originalName.replace(/\.[^.]+$/, '')
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${baseName}-no-bg.png`
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
    setDragOver(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [originalUrl, resultUrl])

  const isProcessing = status === 'downloading' || status === 'processing'

  return (
    <ToolPage
      title="AI Background Remover"
      description="Remove image backgrounds instantly using AI. Runs entirely in your browser — your images never leave your device."
      category="image"
      categoryLabel="Image Tools"
      slug="ai-bg-remover"
      helpContent={
        <>
          <h2>What is AI Background Remover?</h2>
          <p>
            AI Background Remover is a free online tool that automatically detects the foreground subject in any photograph or image and removes the background, producing a clean PNG file with full transparency. Powered by a neural network that runs entirely inside your browser, it eliminates the need for manual masking in photo-editing software. Whether you are preparing product photos for an e-commerce store, creating profile pictures, designing marketing materials, or compositing images for social media, this tool delivers professional-quality cutouts in seconds without uploading your files to any external server.
          </p>
          <p>
            The underlying AI model analyzes every pixel to distinguish people, objects, and animals from their surroundings. It handles complex edges such as hair, fur, semi-transparent fabrics, and intricate shapes with impressive accuracy. Because the engine is downloaded once and cached in your browser, subsequent uses are nearly instant, and the tool even works offline after the initial setup.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Click the upload area or drag and drop an image file (PNG, JPG, or WebP) up to 20 MB in size.</li>
            <li>On your first visit the AI engine will be downloaded automatically. A progress bar shows the status of this one-time setup.</li>
            <li>Once the engine is ready, background removal begins immediately. You can watch the progress in real time.</li>
            <li>When processing is complete, a side-by-side comparison of the original and the transparent result is displayed.</li>
            <li>Click the download button to save the result as a high-quality PNG with a transparent background.</li>
            <li>Use the clear button to reset the tool and process another image.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Use high-resolution images with good lighting and clear contrast between the subject and the background for the best results.</li>
            <li>Simple, uncluttered backgrounds are removed more cleanly, but the AI also handles busy or complex scenes well.</li>
            <li>If the first run seems slow, be patient while the model downloads. Every subsequent use will be significantly faster thanks to browser caching.</li>
            <li>The output PNG preserves the original image dimensions, so you can drop it directly into design tools like Figma, Canva, or Photoshop.</li>
            <li>For batch processing, simply clear and upload the next image. The AI engine stays loaded in memory for the duration of your session.</li>
            <li>All processing is private. Your images are never sent to a server, making this tool safe for confidential or sensitive photos.</li>
          </ul>
        </>
      }
      faqs={[
        {
          question: 'How does AI background removal work?',
          answer: 'This tool uses an AI engine that runs entirely in your browser. It analyzes the image to detect the foreground subject and separates it from the background, producing a transparent PNG.',
        },
        {
          question: 'Is my image uploaded to a server?',
          answer: 'No. All processing happens entirely on your device, in your browser. Your images never leave your device. The AI engine is downloaded once and cached for future use.',
        },
        {
          question: 'Why is the first use slower?',
          answer: 'On first use, the AI engine (~40 MB) needs to be downloaded to your browser. This is cached automatically, so subsequent uses are much faster. You will see a progress bar during the download.',
        },
        {
          question: 'What image formats are supported?',
          answer: 'You can upload PNG, JPG, WebP, and most common image formats. The output is always a PNG file with a transparent background, which you can use in any design tool or application.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {status === 'idle' ? 'Upload an Image' : status === 'done' ? 'Result' : 'Processing...'}
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
                <span className="text-sm font-medium text-muted-foreground">Background Removed</span>
                <div className="border border-border rounded-lg p-2 overflow-hidden"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultUrl}
                    alt="Background removed"
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
          </div>
        )}
      </div>
    </ToolPage>
  )
}
