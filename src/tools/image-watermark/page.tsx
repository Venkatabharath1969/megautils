'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, Shield, Loader2, Type, ImageIcon } from 'lucide-react'

type WatermarkMode = 'text' | 'image'
type Position = 'center' | 'tile' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface WatermarkOptions {
  mode: WatermarkMode
  text: string
  fontSize: number
  fontFamily: string
  color: string
  opacity: number
  rotation: number
  position: Position
}

export default function ImageWatermarkTool() {
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null)
  const [watermarkImg, setWatermarkImg] = useState<HTMLImageElement | null>(null)
  const [options, setOptions] = useState<WatermarkOptions>({
    mode: 'text',
    text: 'WATERMARK',
    fontSize: 48,
    fontFamily: 'Arial',
    color: '#000000',
    opacity: 0.3,
    rotation: -30,
    position: 'center',
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const watermarkInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleSourceFile = useCallback(async (f: File) => {
    setError(null)
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, etc.).')
      return
    }
    try {
      const img = await loadImage(f)
      setSourceFile(f)
      setSourceImg(img)
    } catch {
      setError('Could not load this image.')
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) handleSourceFile(files[0])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [handleSourceFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) handleSourceFile(e.dataTransfer.files[0])
  }, [handleSourceFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleWatermarkFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      try {
        const img = await loadImage(files[0])
        setWatermarkImg(img)
      } catch {
        setError('Could not load watermark image.')
      }
    }
    if (watermarkInputRef.current) watermarkInputRef.current.value = ''
  }, [])

  const updateOption = <K extends keyof WatermarkOptions>(key: K, value: WatermarkOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  // Render preview whenever source or options change
  useEffect(() => {
    if (!sourceImg) return
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = sourceImg.naturalWidth
    canvas.height = sourceImg.naturalHeight
    const ctx = canvas.getContext('2d')!

    // Draw source image
    ctx.drawImage(sourceImg, 0, 0)

    // Apply watermark
    ctx.globalAlpha = options.opacity

    if (options.mode === 'text') {
      ctx.font = `bold ${options.fontSize}px ${options.fontFamily}`
      ctx.fillStyle = options.color

      if (options.position === 'tile') {
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((options.rotation * Math.PI) / 180)
        const textWidth = ctx.measureText(options.text).width
        const spacingX = textWidth + 80
        const spacingY = options.fontSize * 3
        for (let y = -canvas.height * 2; y < canvas.height * 2; y += spacingY) {
          for (let x = -canvas.width * 2; x < canvas.width * 2; x += spacingX) {
            ctx.fillText(options.text, x, y)
          }
        }
        ctx.restore()
      } else {
        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        let tx = canvas.width / 2
        let ty = canvas.height / 2
        const pad = options.fontSize

        if (options.position === 'top-left') { tx = pad + ctx.measureText(options.text).width / 2; ty = pad + options.fontSize / 2 }
        else if (options.position === 'top-right') { tx = canvas.width - pad - ctx.measureText(options.text).width / 2; ty = pad + options.fontSize / 2 }
        else if (options.position === 'bottom-left') { tx = pad + ctx.measureText(options.text).width / 2; ty = canvas.height - pad - options.fontSize / 2 }
        else if (options.position === 'bottom-right') { tx = canvas.width - pad - ctx.measureText(options.text).width / 2; ty = canvas.height - pad - options.fontSize / 2 }

        ctx.translate(tx, ty)
        ctx.rotate((options.rotation * Math.PI) / 180)
        ctx.fillText(options.text, 0, 0)
        ctx.restore()
      }
    } else if (options.mode === 'image' && watermarkImg) {
      const wmW = watermarkImg.naturalWidth
      const wmH = watermarkImg.naturalHeight
      // Scale watermark to 30% of source width
      const scale = Math.min((canvas.width * 0.3) / wmW, (canvas.height * 0.3) / wmH)
      const scaledW = wmW * scale
      const scaledH = wmH * scale

      if (options.position === 'tile') {
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((options.rotation * Math.PI) / 180)
        const spacingX = scaledW + 60
        const spacingY = scaledH + 60
        for (let y = -canvas.height * 2; y < canvas.height * 2; y += spacingY) {
          for (let x = -canvas.width * 2; x < canvas.width * 2; x += spacingX) {
            ctx.drawImage(watermarkImg, x, y, scaledW, scaledH)
          }
        }
        ctx.restore()
      } else {
        let dx = (canvas.width - scaledW) / 2
        let dy = (canvas.height - scaledH) / 2
        const pad = 20

        if (options.position === 'top-left') { dx = pad; dy = pad }
        else if (options.position === 'top-right') { dx = canvas.width - scaledW - pad; dy = pad }
        else if (options.position === 'bottom-left') { dx = pad; dy = canvas.height - scaledH - pad }
        else if (options.position === 'bottom-right') { dx = canvas.width - scaledW - pad; dy = canvas.height - scaledH - pad }

        ctx.save()
        ctx.translate(dx + scaledW / 2, dy + scaledH / 2)
        ctx.rotate((options.rotation * Math.PI) / 180)
        ctx.drawImage(watermarkImg, -scaledW / 2, -scaledH / 2, scaledW, scaledH)
        ctx.restore()
      }
    }

    ctx.globalAlpha = 1
    setPreviewUrl(canvas.toDataURL('image/png'))
  }, [sourceImg, watermarkImg, options])

  const handleDownload = useCallback(() => {
    if (!canvasRef.current || !sourceFile) return
    const link = document.createElement('a')
    const ext = sourceFile.type === 'image/png' ? 'png' : 'jpg'
    const mimeType = sourceFile.type === 'image/png' ? 'image/png' : 'image/jpeg'
    link.download = sourceFile.name.replace(/\.[^.]+$/, '') + `_watermarked.${ext}`
    link.href = canvasRef.current.toDataURL(mimeType, 0.92)
    link.click()
  }, [sourceFile])

  const clear = () => {
    setSourceFile(null)
    setSourceImg(null)
    setWatermarkImg(null)
    setPreviewUrl(null)
    setError(null)
    setOptions({
      mode: 'text',
      text: 'WATERMARK',
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#000000',
      opacity: 0.3,
      rotation: -30,
      position: 'center',
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (watermarkInputRef.current) watermarkInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Image Watermark"
      description="Add text or image watermarks to photos with live preview. Free, no upload, runs in your browser."
      category="image"
      categoryLabel="Image Tools"
      faqs={[
        { question: 'What image formats are supported?', answer: 'You can upload JPG, PNG, WebP, GIF, BMP, and most common image formats. The output is saved as PNG (for PNG inputs) or JPG (for all others) to preserve quality.' },
        { question: 'Can I tile the watermark across the entire image?', answer: 'Yes. Choose the "Tile" position option to repeat the watermark across the entire image. This is commonly used for stock photo protection.' },
        { question: 'Are my images uploaded to a server?', answer: 'No. All processing happens locally in your browser using the Canvas API. Your images never leave your device.' },
        { question: 'Can I use my logo as a watermark?', answer: 'Yes. Switch to "Image" mode and upload your logo file. The tool supports PNG logos with transparency for the best results.' },
      ]}
      helpContent={
        <>
          <h2>What is Image Watermark?</h2>
          <p>
            Image Watermark lets you overlay text or an image (like a logo) onto your photos. This is useful for
            protecting intellectual property, branding images, or marking drafts. The tool runs entirely in your
            browser with a live preview — no uploads required.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload an image by clicking the upload area or dragging and dropping.</li>
            <li>Choose watermark mode: Text or Image.</li>
            <li>For text: enter your watermark text, adjust font size, color, opacity, and rotation.</li>
            <li>For image: upload a logo or watermark image file.</li>
            <li>Select position: Center, Tile (repeat), or a corner.</li>
            <li>Preview updates live. Click <strong>Download</strong> when satisfied.</li>
          </ol>

          <h2>When to Use Image Watermark</h2>
          <ul>
            <li>Protect portfolio images shared online.</li>
            <li>Brand product photos with your company logo.</li>
            <li>Mark draft designs with "DRAFT" or "PROOF" text.</li>
            <li>Add copyright notices to photographs.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Use low opacity (0.2-0.4) for subtle watermarks that do not distract from the image.</li>
            <li>Tile mode with diagonal rotation is the most effective way to prevent watermark removal.</li>
            <li>Use a PNG logo with transparent background for the cleanest image watermark.</li>
            <li>For large images, processing may take a moment. The preview updates automatically.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upload Image</label>
          {sourceFile && <ClearButton onClear={clear} />}
        </div>

        {/* Upload zone */}
        {!sourceFile && (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {isDragging ? 'Drop your image here' : 'Click to upload or drag an image'}
            </span>
            <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        )}

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-green-500" />
          Your files never leave your device
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Hidden canvas for rendering */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Settings + Preview */}
        {sourceFile && sourceImg && (
          <div className="space-y-5">
            {/* Mode toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Watermark Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateOption('mode', 'text')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors inline-flex items-center justify-center gap-1.5 ${options.mode === 'text' ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
                >
                  <Type className="h-4 w-4" /> Text
                </button>
                <button
                  onClick={() => updateOption('mode', 'image')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors inline-flex items-center justify-center gap-1.5 ${options.mode === 'image' ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
                >
                  <ImageIcon className="h-4 w-4" /> Image
                </button>
              </div>
            </div>

            {/* Text options */}
            {options.mode === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Watermark Text</label>
                  <input
                    type="text"
                    value={options.text}
                    onChange={e => updateOption('text', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Font Size</label>
                    <input
                      type="number"
                      min={12}
                      max={200}
                      value={options.fontSize}
                      onChange={e => updateOption('fontSize', Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Font Family</label>
                    <select
                      value={options.fontFamily}
                      onChange={e => updateOption('fontFamily', e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Impact">Impact</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={options.color}
                      onChange={e => updateOption('color', e.target.value)}
                      className="w-10 h-10 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={options.color}
                      onChange={e => updateOption('color', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Image watermark upload */}
            {options.mode === 'image' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Watermark Image (Logo)</label>
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors border-border hover:bg-muted/50">
                  {watermarkImg ? (
                    <span className="text-sm text-green-600">Watermark loaded. Click to change.</span>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-sm text-muted-foreground">Upload watermark image</span>
                    </>
                  )}
                  <input
                    ref={watermarkInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleWatermarkFile}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Shared options */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Opacity: {options.opacity.toFixed(2)}</label>
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={options.opacity}
                  onChange={e => updateOption('opacity', Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rotation: {options.rotation}&deg;</label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={5}
                  value={options.rotation}
                  onChange={e => updateOption('rotation', Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Position</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {([
                    ['top-left', 'Top Left'],
                    ['center', 'Center'],
                    ['top-right', 'Top Right'],
                    ['bottom-left', 'Bottom Left'],
                    ['tile', 'Tile (Repeat)'],
                    ['bottom-right', 'Bottom Right'],
                  ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => updateOption('position', val)}
                      className={`px-2 py-1.5 text-xs font-medium rounded-md border transition-colors ${options.position === val ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live preview */}
            {previewUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <div className="border border-border rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Watermarked preview" className="block max-w-full max-h-[500px] mx-auto" />
                </div>
              </div>
            )}

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={!previewUrl}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Download Watermarked Image
            </button>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
