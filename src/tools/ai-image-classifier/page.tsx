'use client'

import { useState, useRef, useCallback } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, ImageIcon, Loader2, Shield, Wifi } from 'lucide-react'

type Status = 'idle' | 'downloading' | 'processing' | 'done' | 'error'

interface Prediction {
  label: string
  score: number
}

export default function AIImageClassifier() {
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const classifyImage = useCallback(async (file: File) => {
    setError('')
    setPredictions([])
    setProgress(0)
    setProgressLabel('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (ev) => setImageUrl(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      setStatus('downloading')
      setProgressLabel('Setting up AI (~20 MB, first time only — instant next time)...')

      const { pipeline } = await import('@huggingface/transformers')

      const classifier = await pipeline(
        'image-classification',
        'Xenova/mobilevit-small',
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
      setProgressLabel('Analyzing your image...')
      setProgress(0)

      // Read image as data URL for the classifier
      const dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader()
        r.onload = (ev) => resolve(ev.target?.result as string)
        r.readAsDataURL(file)
      })

      const results = await classifier(dataUrl, { top_k: 5 }) as Prediction[]

      setPredictions(results)
      setStatus('done')
      setProgressLabel('')
    } catch (err) {
      console.error('Image classification error:', err)
      setError(err instanceof Error ? err.message : 'Failed to classify image. Please try again.')
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
    classifyImage(file)
  }, [classifyImage])

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
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setPredictions([])
    setDragOver(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [imageUrl])

  const isProcessing = status === 'downloading' || status === 'processing'

  const confidenceColor = (score: number) => {
    if (score > 0.8) return 'bg-green-500'
    if (score > 0.5) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const confidenceTextColor = (score: number) => {
    if (score > 0.8) return 'text-green-600 dark:text-green-400'
    if (score > 0.5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-muted-foreground'
  }

  return (
    <ToolPage
      title="AI Image Classifier"
      description="Identify objects, animals, and scenes in any photo using AI. Get instant labels with confidence scores — runs entirely in your browser."
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>AI Image Classifier identifies the contents of an image and assigns category labels with confidence scores. It uses a pre-trained image classification model to recognize hundreds of object categories — from animals and vehicles to food and everyday objects. The model runs entirely in your browser for instant, private results.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload an image using the file picker or drag-and-drop.</li>
            <li>The AI model processes the image and identifies its contents.</li>
            <li>View the top predicted categories with <strong>confidence percentages</strong>.</li>
            <li>Use the classifications for tagging, sorting, or content moderation.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Image classification is used for automatic photo organization, content moderation, e-commerce product categorization, wildlife identification, and accessibility tagging. Developers use it to prototype computer vision features before building custom models.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Images with a single clear subject produce the most accurate classifications.</li>
            <li>The model recognizes common objects but may struggle with abstract art or highly specialized items.</li>
            <li>Confidence scores below 50% indicate uncertainty — consider the top three predictions together.</li>
            <li>All processing is local, so sensitive images are never uploaded.</li>
            <li>Try different angles or crops of the same subject to see how classification changes.</li>
          </ul>
        </>
      }
      slug="ai-image-classifier"
      faqs={[
        {
          question: 'How does AI image classification work?',
          answer: 'This tool uses the MobileViT deep learning model that runs entirely in your browser. It analyzes your image and compares it against 1,000 known categories (from the ImageNet dataset) to identify objects, animals, scenes, and more.',
        },
        {
          question: 'What can it recognize?',
          answer: 'The model can identify over 1,000 categories including animals (dogs, cats, birds), vehicles (cars, planes, boats), everyday objects (furniture, electronics, food), scenes (beaches, mountains, cityscapes), and much more.',
        },
        {
          question: 'How accurate is the classification?',
          answer: 'The MobileViT model provides high accuracy for common objects and scenes. Confidence scores are shown for each prediction — green bars (above 80%) indicate high confidence, yellow (50-80%) moderate, and gray (below 50%) lower confidence. Results work best with clear, well-lit photos of single subjects.',
        },
        {
          question: 'Is my image uploaded to a server?',
          answer: 'No. All processing happens entirely on your device, in your browser. Your images never leave your device. The AI model is downloaded once (~20 MB) and cached for future use, so it works offline after the first use.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {status === 'idle' ? 'Upload an Image' : status === 'done' ? 'Results' : 'Analyzing...'}
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

        {/* Results: image + predictions */}
        {status === 'done' && imageUrl && predictions.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Uploaded image */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Uploaded Image</span>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Uploaded image"
                    loading="lazy"
                    className="max-w-full h-auto max-h-80 mx-auto object-contain"
                  />
                </div>
              </div>

              {/* Predictions */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Top Predictions</span>
                <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
                  {predictions.map((pred, i) => {
                    const pct = Math.round(pred.score * 100)
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{pred.label.replace(/_/g, ' ')}</span>
                          <span className={`text-sm font-semibold tabular-nums ${confidenceTextColor(pred.score)}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${confidenceColor(pred.score)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Classify another */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors border border-border cursor-pointer">
                <Upload className="h-4 w-4" />
                Classify Another Image
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
