'use client'

import { useState, useRef, useCallback } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'
import { Upload, ImageIcon, Loader2, Shield, Wifi, Code, RefreshCw, Monitor } from 'lucide-react'

type Status = 'idle' | 'downloading' | 'processing' | 'done' | 'error'

export default function AIImageCaption() {
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [captions, setCaptions] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [showAltCode, setShowAltCode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentFileRef = useRef<File | null>(null)
  const pipelineRef = useRef<any>(null)

  const generateCaption = useCallback(async (file: File, existingPipeline?: any) => {
    setError('')
    setCaption('')
    setProgress(0)
    setProgressLabel('')
    setShowAltCode(false)

    // Create preview
    const reader = new FileReader()
    reader.onload = (ev) => setImageUrl(ev.target?.result as string)
    reader.readAsDataURL(file)

    try {
      let captioner = existingPipeline || pipelineRef.current

      if (!captioner) {
        setStatus('downloading')
        setProgressLabel('Downloading AI model (~250 MB, first time only — instant next time)...')

        const { pipeline } = await import('@huggingface/transformers')

        captioner = await pipeline(
          'image-to-text',
          'Xenova/vit-gpt2-image-captioning',
          {
            device: 'wasm',
            progress_callback: (p: any) => {
              if (p.progress !== undefined) {
                setProgress(Math.round(p.progress))
              }
            },
          },
        )

        pipelineRef.current = captioner
      }

      setStatus('processing')
      setProgressLabel('Generating caption...')
      setProgress(0)

      // Read image as data URL for the model
      const dataUrl = await new Promise<string>((resolve) => {
        const r = new FileReader()
        r.onload = (ev) => resolve(ev.target?.result as string)
        r.readAsDataURL(file)
      })

      const results = await captioner(dataUrl)

      const generatedText = Array.isArray(results)
        ? (results[0]?.generated_text || '').trim()
        : (results?.generated_text || '').trim()

      setCaption(generatedText)
      setCaptions((prev) => [...prev, generatedText])
      setStatus('done')
      setProgressLabel('')
    } catch (err) {
      console.error('Image captioning error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate caption. Please try again.')
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
    currentFileRef.current = file
    setCaptions([])
    generateCaption(file)
  }, [generateCaption])

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

  const handleGenerateAnother = useCallback(() => {
    if (currentFileRef.current) {
      generateCaption(currentFileRef.current, pipelineRef.current)
    }
  }, [generateCaption])

  const clear = useCallback(() => {
    setStatus('idle')
    setProgress(0)
    setProgressLabel('')
    setError('')
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setCaption('')
    setCaptions([])
    setDragOver(false)
    setShowAltCode(false)
    currentFileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [imageUrl])

  const isProcessing = status === 'downloading' || status === 'processing'

  const altTextSnippet = `<img src="your-image.jpg" alt="${caption}" />`

  return (
    <ToolPage
      title="AI Image Caption Generator"
      description="Generate natural language descriptions for any image using AI. Perfect for alt-text and accessibility — runs entirely in your browser."
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>AI Image Caption uses a vision-language model to generate a natural-language description of the contents of a photograph. It identifies objects, scenes, actions, and relationships in the image and produces a coherent sentence or paragraph describing what the photo shows. This is useful for accessibility (alt text), content management, and social media.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload or drag-and-drop an image.</li>
            <li>Wait while the AI model analyzes the visual content.</li>
            <li>Read the generated caption displayed below the image.</li>
            <li>Copy the caption for use as alt text, social media descriptions, or metadata.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Image captioning is essential for web accessibility — providing meaningful alt text for screen reader users. Content managers use it to auto-generate descriptions for large image libraries. Social media managers use it to draft post captions, and photographers use it to tag and organize their portfolios.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Clear, well-lit photographs produce the most accurate captions.</li>
            <li>The model may not recognize specific people or brand logos — it describes visual content generically.</li>
            <li>Use the generated caption as a starting point and refine it for context-specific accuracy.</li>
            <li>All processing runs locally, so your images remain private.</li>
            <li>For best results, ensure the main subject is prominent and not heavily occluded.</li>
          </ul>
        </>
      }
      slug="ai-image-caption"
      faqs={[
        {
          question: 'How does AI image captioning work?',
          answer: 'This tool uses the ViT-GPT2 model, which combines a Vision Transformer (ViT) image encoder with a GPT-2 text decoder. The ViT analyzes the visual content of your image, and GPT-2 generates a natural language description. Everything runs locally in your browser using WebAssembly.',
        },
        {
          question: 'Can I use the generated captions as alt text?',
          answer: 'Yes! The captions are designed to describe the visual content of images, making them excellent starting points for alt text. You can use the "Use as alt text" button to get ready-to-paste HTML code. For best accessibility, review and refine the caption to ensure it accurately conveys the image\'s purpose in your specific context.',
        },
        {
          question: 'Why is alt text important for accessibility?',
          answer: 'Alt text (alternative text) provides a text description of images for people who use screen readers, have slow internet connections, or have images disabled. It\'s essential for web accessibility (WCAG compliance), improves SEO, and ensures your content is available to all users regardless of their abilities or circumstances.',
        },
        {
          question: 'Is my image uploaded to a server?',
          answer: 'No. All processing happens entirely on your device, in your browser. Your images never leave your device. The AI model is downloaded once (~250 MB) and cached for future use, so it works offline after the first use.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {status === 'idle' ? 'Upload an Image' : status === 'done' ? 'Generated Caption' : 'Generating...'}
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

        {/* Privacy & offline badges + mobile warning */}
        {status === 'idle' && !imageUrl && (
          <div className="space-y-3">
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
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Monitor className="h-3.5 w-3.5" />
              This tool works best on desktop (large AI engine: ~250MB)
            </div>
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

        {/* Results: image + caption */}
        {status === 'done' && imageUrl && caption && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Uploaded image */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Uploaded Image</span>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={caption}
                    loading="lazy"
                    className="max-w-full h-auto max-h-80 mx-auto object-contain"
                  />
                </div>
              </div>

              {/* Caption card */}
              <div className="space-y-3">
                <span className="text-sm font-medium text-muted-foreground">Caption</span>
                <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-4">
                  <p className="text-base leading-relaxed">{caption}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton text={caption} />
                    <button
                      onClick={() => setShowAltCode(!showAltCode)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                    >
                      <Code className="h-3.5 w-3.5" />
                      {showAltCode ? 'Hide alt text' : 'Use as alt text'}
                    </button>
                  </div>

                  {/* Alt text code snippet */}
                  {showAltCode && (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">HTML with alt text:</span>
                      <div className="relative">
                        <pre className="p-3 rounded-md bg-muted text-xs overflow-x-auto font-mono">
                          <code>{altTextSnippet}</code>
                        </pre>
                        <div className="mt-2">
                          <CopyButton text={altTextSnippet} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Previous captions */}
                {captions.length > 1 && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground">Previous captions ({captions.length})</span>
                    <div className="space-y-1.5">
                      {captions.slice(0, -1).reverse().map((c, i) => (
                        <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/30 border border-border/50">
                          <span className="text-xs text-muted-foreground truncate">{c}</span>
                          <CopyButton text={c} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleGenerateAnother}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
              >
                <RefreshCw className="h-4 w-4" />
                Generate Another Caption
              </button>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors border border-border cursor-pointer">
                <Upload className="h-4 w-4" />
                Upload New Image
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
