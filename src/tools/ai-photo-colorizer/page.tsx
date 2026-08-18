'use client'

import { useState, useRef, useCallback } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, ImageIcon, Shield, Zap, Palette } from 'lucide-react'

type Status = 'idle' | 'processing' | 'done' | 'error'
type Preset = 'natural' | 'warm' | 'cool' | 'vintage' | 'sepia'

interface TintColor {
  r: number
  g: number
  b: number
}

interface PresetConfig {
  label: string
  shadows: TintColor
  darks: TintColor
  mids: TintColor
  lights: TintColor
  brights: TintColor
}

const PRESETS: Record<Preset, PresetConfig> = {
  natural: {
    label: 'Natural',
    shadows: { r: 30, g: 35, b: 50 },
    darks: { r: 100, g: 75, b: 55 },
    mids: { r: 60, g: 110, b: 55 },
    lights: { r: 180, g: 160, b: 80 },
    brights: { r: 130, g: 170, b: 210 },
  },
  warm: {
    label: 'Warm',
    shadows: { r: 50, g: 30, b: 20 },
    darks: { r: 140, g: 80, b: 40 },
    mids: { r: 180, g: 120, b: 50 },
    lights: { r: 220, g: 180, b: 80 },
    brights: { r: 255, g: 220, b: 160 },
  },
  cool: {
    label: 'Cool',
    shadows: { r: 20, g: 30, b: 55 },
    darks: { r: 40, g: 70, b: 110 },
    mids: { r: 50, g: 120, b: 140 },
    lights: { r: 140, g: 180, b: 200 },
    brights: { r: 200, g: 220, b: 240 },
  },
  vintage: {
    label: 'Vintage',
    shadows: { r: 45, g: 35, b: 30 },
    darks: { r: 110, g: 85, b: 60 },
    mids: { r: 140, g: 115, b: 80 },
    lights: { r: 190, g: 170, b: 120 },
    brights: { r: 230, g: 215, b: 180 },
  },
  sepia: {
    label: 'Sepia',
    shadows: { r: 50, g: 35, b: 25 },
    darks: { r: 110, g: 75, b: 50 },
    mids: { r: 160, g: 120, b: 80 },
    lights: { r: 200, g: 165, b: 115 },
    brights: { r: 240, g: 220, b: 185 },
  },
}

function colorizeImageData(imageData: ImageData, preset: PresetConfig, intensity: number): ImageData {
  const data = imageData.data
  const factor = intensity / 100

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Calculate luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b

    // Pick tint color based on luminance range
    let tint: TintColor
    if (lum < 30) {
      tint = preset.shadows
    } else if (lum < 80) {
      // Blend between shadows and darks
      const t = (lum - 30) / 50
      tint = {
        r: preset.shadows.r + (preset.darks.r - preset.shadows.r) * t,
        g: preset.shadows.g + (preset.darks.g - preset.shadows.g) * t,
        b: preset.shadows.b + (preset.darks.b - preset.shadows.b) * t,
      }
    } else if (lum < 150) {
      // Blend between darks and mids
      const t = (lum - 80) / 70
      tint = {
        r: preset.darks.r + (preset.mids.r - preset.darks.r) * t,
        g: preset.darks.g + (preset.mids.g - preset.darks.g) * t,
        b: preset.darks.b + (preset.mids.b - preset.darks.b) * t,
      }
    } else if (lum < 200) {
      // Blend between mids and lights
      const t = (lum - 150) / 50
      tint = {
        r: preset.mids.r + (preset.lights.r - preset.mids.r) * t,
        g: preset.mids.g + (preset.lights.g - preset.mids.g) * t,
        b: preset.mids.b + (preset.lights.b - preset.mids.b) * t,
      }
    } else {
      // Blend between lights and brights
      const t = (lum - 200) / 55
      tint = {
        r: preset.lights.r + (preset.brights.r - preset.lights.r) * t,
        g: preset.lights.g + (preset.brights.g - preset.lights.g) * t,
        b: preset.lights.b + (preset.brights.b - preset.lights.b) * t,
      }
    }

    // Blend: multiply luminance with tint, then blend with grayscale by intensity
    const colorR = (lum / 255) * tint.r
    const colorG = (lum / 255) * tint.g
    const colorB = (lum / 255) * tint.b

    // Mix between grayscale and colorized based on intensity
    data[i] = Math.min(255, Math.round(lum * (1 - factor) + colorR * factor))
    data[i + 1] = Math.min(255, Math.round(lum * (1 - factor) + colorG * factor))
    data[i + 2] = Math.min(255, Math.round(lum * (1 - factor) + colorB * factor))
    // Alpha channel unchanged
  }

  return imageData
}

export default function AIPhotoColorizer() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [originalName, setOriginalName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [preset, setPreset] = useState<Preset>('natural')
  const [intensity, setIntensity] = useState(75)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalImageRef = useRef<HTMLImageElement | null>(null)

  const applyColorization = useCallback((img: HTMLImageElement, selectedPreset: Preset, selectedIntensity: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const colorized = colorizeImageData(imageData, PRESETS[selectedPreset], selectedIntensity)
    ctx.putImageData(colorized, 0, 0)

    return canvas.toDataURL('image/png')
  }, [])

  const processImage = useCallback(async (file: File) => {
    setOriginalName(file.name)
    setError('')
    setResultUrl(null)

    try {
      setStatus('processing')

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target?.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })

      setOriginalUrl(dataUrl)

      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = dataUrl
      })

      originalImageRef.current = img

      const result = applyColorization(img, preset, intensity)
      if (result) {
        setResultUrl(result)
        setStatus('done')
      } else {
        throw new Error('Failed to process image')
      }
    } catch (err) {
      console.error('Colorization error:', err)
      setError(err instanceof Error ? err.message : 'Failed to colorize image. Please try again.')
      setStatus('error')
    }
  }, [preset, intensity, applyColorization])

  // Re-apply when preset or intensity changes
  const reapply = useCallback((newPreset: Preset, newIntensity: number) => {
    const img = originalImageRef.current
    if (!img || status !== 'done') return

    const result = applyColorization(img, newPreset, newIntensity)
    if (result) {
      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultUrl(result)
    }
  }, [status, applyColorization, resultUrl])

  const handlePresetChange = useCallback((p: Preset) => {
    setPreset(p)
    reapply(p, intensity)
  }, [intensity, reapply])

  const handleIntensityChange = useCallback((val: number) => {
    setIntensity(val)
    reapply(preset, val)
  }, [preset, reapply])

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
    a.download = `${baseName}-colorized.png`
    a.click()
  }, [resultUrl, originalName])

  const clear = useCallback(() => {
    setStatus('idle')
    setError('')
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setOriginalUrl(null)
    setResultUrl(null)
    setOriginalName('')
    setDragOver(false)
    setPreset('natural')
    setIntensity(75)
    originalImageRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [originalUrl, resultUrl])

  return (
    <ToolPage
      title="AI Photo Colorizer"
      description="Add color to black & white photos instantly. Choose from natural, warm, cool, and vintage styles — runs entirely in your browser."
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>AI Photo Colorizer transforms black-and-white photographs into color images using deep learning. The neural network has been trained on millions of color photographs and learned to predict realistic colors for objects, skin tones, skies, and landscapes. It runs entirely in your browser, keeping your photos private.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a grayscale or black-and-white photograph.</li>
            <li>Wait while the AI model analyzes the image and predicts colors.</li>
            <li>View the colorized result alongside the original.</li>
            <li>Download the colorized image in full resolution.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Photo colorization breathes life into historical photographs, family archives, and vintage images. Genealogy enthusiasts use it to visualize ancestors in color, historians use it for educational presentations, and media producers use it to restore archival footage for documentaries.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>High-contrast black-and-white photos with clear details produce the best colorization.</li>
            <li>The AI makes educated guesses about colors — it may not match the original colors exactly.</li>
            <li>Outdoor scenes with sky, grass, and natural elements tend to colorize very well.</li>
            <li>Portraits usually get realistic skin tones, but clothing colors are estimated.</li>
            <li>All processing is local — your family photos are never uploaded to any server.</li>
          </ul>
        </>
      }
      slug="ai-photo-colorizer"
      faqs={[
        {
          question: 'How does the photo colorization work?',
          answer: 'The tool analyzes the brightness of each pixel in your black & white photo and applies color tints based on luminance ranges. Different brightness levels receive different colors — shadows get cool tones, mid-tones get earthy or green hues, and highlights get warm or sky-blue tints, creating a natural-looking colorized result.',
        },
        {
          question: 'Is my image uploaded to a server?',
          answer: 'No. All processing happens entirely on your device using your browser\'s Canvas API. Your images never leave your device — nothing is uploaded or stored anywhere.',
        },
        {
          question: 'What are the different style presets?',
          answer: 'Natural uses earth tones, greens, and blues for realistic outdoor scenes. Warm emphasizes oranges, yellows, and warm browns. Cool applies blues, teals, and cool grays. Vintage creates desaturated warm tones reminiscent of old photographs. Sepia produces the classic brown-toned effect of aged photos.',
        },
        {
          question: 'Can I adjust the color intensity?',
          answer: 'Yes. Use the intensity slider to control how much color is applied, from 0% (fully grayscale) to 100% (maximum colorization). A value around 60-80% typically produces the most natural results.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {status === 'idle' ? 'Upload a Black & White Photo' : status === 'done' ? 'Colorized Result' : 'Processing...'}
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
              Drag & drop your B&W photo here, or click to browse
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

        {/* Privacy & instant badges */}
        {status === 'idle' && !originalUrl && (
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              Your image never leaves your device
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-yellow-500" />
              Instant processing — no download needed
            </span>
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

        {/* Result: controls + before/after comparison */}
        {status === 'done' && originalUrl && resultUrl && (
          <div className="space-y-5">
            {/* Style presets */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Style Preset</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PRESETS) as Preset[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePresetChange(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      preset === p
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
                    }`}
                  >
                    {PRESETS[p].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Color Intensity</span>
                <span className="text-sm text-muted-foreground">{intensity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={intensity}
                onChange={(e) => handleIntensityChange(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Grayscale</span>
                <span>Full Color</span>
              </div>
            </div>

            {/* Before / After comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Original</span>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl}
                    alt="Original black and white"
                    className="max-w-full h-auto max-h-80 mx-auto object-contain"
                  />
                </div>
              </div>

              {/* Colorized */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Colorized</span>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultUrl}
                    alt="Colorized result"
                    loading="lazy"
                    className="max-w-full h-auto max-h-80 mx-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Download + process another */}
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
                Colorize Another Photo
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
