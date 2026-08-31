'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload, Type, Shield, Image as ImageIcon } from 'lucide-react'

interface MemeOptions {
  fontSize: number
  fontFamily: string
  textColor: string
  strokeColor: string
  strokeWidth: number
  textPosition: 'top-bottom' | 'top-only' | 'bottom-only' | 'custom'
  customY: number
}

const FONT_FAMILIES = [
  { value: 'Impact, Haettenschweiler, sans-serif', label: 'Impact' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: '"Comic Sans MS", cursive', label: 'Comic Sans' },
]

const MEME_TEMPLATES = [
  { name: 'Drake Hotline Bling', desc: 'Two panel: rejection (top) vs approval (bottom)', color: '#f0d0a0' },
  { name: 'Distracted Boyfriend', desc: 'Man looking at another woman, girlfriend shocked', color: '#c0d8f0' },
  { name: 'Change My Mind', desc: 'Man sitting at table with sign', color: '#a0e0a0' },
  { name: 'Two Buttons', desc: 'Sweating choosing between two buttons', color: '#f0a0a0' },
  { name: 'Expanding Brain', desc: 'Four panels of increasing enlightenment', color: '#d0c0f0' },
  { name: 'Is This a Pigeon?', desc: 'Man pointing at butterfly asking if it is something else', color: '#f0f0a0' },
  { name: 'One Does Not Simply', desc: 'Boromir explaining something is not easy', color: '#c8a080' },
  { name: 'Stonks', desc: 'Meme man in front of stock chart going up', color: '#a0f0d0' },
  { name: 'This Is Fine', desc: 'Dog sitting in room on fire', color: '#f0c0a0' },
  { name: 'Surprised Pikachu', desc: 'Pikachu with shocked open mouth face', color: '#f0e080' },
]

function createTemplatePlaceholder(template: typeof MEME_TEMPLATES[0], width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = template.color
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#00000030'
  ctx.fillRect(0, 0, width, height)

  ctx.font = 'bold 28px Arial, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(template.name, width / 2, height / 2 - 15)

  ctx.font = '16px Arial, sans-serif'
  ctx.fillStyle = '#ffffffcc'
  ctx.fillText(template.desc, width / 2, height / 2 + 20)

  ctx.font = '13px Arial, sans-serif'
  ctx.fillStyle = '#ffffff99'
  ctx.fillText('(Upload your own image for best results)', width / 2, height / 2 + 50)

  return canvas
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

function drawMeme(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement | HTMLCanvasElement,
  topText: string,
  bottomText: string,
  options: MemeOptions
) {
  const ctx = canvas.getContext('2d')!
  const w = 'naturalWidth' in img ? img.naturalWidth : img.width
  const h = 'naturalHeight' in img ? img.naturalHeight : img.height
  canvas.width = w
  canvas.height = h
  ctx.drawImage(img, 0, 0, w, h)

  ctx.font = `bold ${options.fontSize}px ${options.fontFamily}`
  ctx.fillStyle = options.textColor
  ctx.strokeStyle = options.strokeColor
  ctx.lineWidth = options.strokeWidth
  ctx.textAlign = 'center'
  ctx.lineJoin = 'round'

  const maxTextWidth = w * 0.9
  const padding = 20

  // Top text
  if (topText && (options.textPosition === 'top-bottom' || options.textPosition === 'top-only' || options.textPosition === 'custom')) {
    ctx.textBaseline = 'top'
    const lines = wrapText(ctx, topText.toUpperCase(), maxTextWidth)
    const yStart = options.textPosition === 'custom' ? (options.customY / 100) * h : padding
    lines.forEach((line, i) => {
      const y = yStart + i * (options.fontSize + 4)
      ctx.strokeText(line, w / 2, y)
      ctx.fillText(line, w / 2, y)
    })
  }

  // Bottom text
  if (bottomText && (options.textPosition === 'top-bottom' || options.textPosition === 'bottom-only')) {
    ctx.textBaseline = 'bottom'
    const lines = wrapText(ctx, bottomText.toUpperCase(), maxTextWidth)
    const yEnd = h - padding
    lines.reverse().forEach((line, i) => {
      const y = yEnd - i * (options.fontSize + 4)
      ctx.strokeText(line, w / 2, y)
      ctx.fillText(line, w / 2, y)
    })
  }
}

export default function MemeGeneratorTool() {
  const [imageSource, setImageSource] = useState<'upload' | 'template'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [options, setOptions] = useState<MemeOptions>({
    fontSize: 48,
    fontFamily: 'Impact, Haettenschweiler, sans-serif',
    textColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 3,
    textPosition: 'top-bottom',
    customY: 10,
  })
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const templateCanvasRef = useRef<HTMLCanvasElement | null>(null)

  const updateOption = <K extends keyof MemeOptions>(key: K, value: MemeOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    const url = URL.createObjectURL(f)
    setImageUrl(url)
    setImageSource('upload')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  // Redraw canvas on every change
  useEffect(() => {
    if (!canvasRef.current) return

    if (imageSource === 'upload' && imageUrl) {
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        drawMeme(canvasRef.current!, img, topText, bottomText, options)
      }
      img.src = imageUrl
    } else if (imageSource === 'template') {
      const template = MEME_TEMPLATES[selectedTemplate]
      const placeholder = createTemplatePlaceholder(template, 800, 600)
      templateCanvasRef.current = placeholder
      drawMeme(canvasRef.current!, placeholder, topText, bottomText, options)
    }
  }, [imageUrl, imageSource, selectedTemplate, topText, bottomText, options])

  const downloadMeme = useCallback(() => {
    if (!canvasRef.current) return
    canvasRef.current.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meme-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [])

  const clear = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setFile(null)
    setImageUrl('')
    setTopText('')
    setBottomText('')
    setImageSource('upload')
    setSelectedTemplate(0)
    setOptions({
      fontSize: 48,
      fontFamily: 'Impact, Haettenschweiler, sans-serif',
      textColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 3,
      textPosition: 'top-bottom',
      customY: 10,
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const hasImage = (imageSource === 'upload' && imageUrl) || imageSource === 'template'

  return (
    <ToolPage
      title="Meme Generator"
      description="Create memes with custom text, fonts, and styles — free, no watermark, runs in your browser"
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Meme Generator is a free browser-based tool for creating memes with custom text overlays. Upload your own image or pick a template, add top/bottom text with Impact font, adjust colors and sizes, and download a high-quality PNG — all without watermarks or sign-ups.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Choose <strong>Upload Image</strong> to use your own picture, or <strong>Use Template</strong> to pick a popular meme format.</li>
            <li>Enter text in the <strong>Top Text</strong> and <strong>Bottom Text</strong> fields. Text automatically wraps.</li>
            <li>Adjust the <strong>font size</strong> with the slider (20-80px).</li>
            <li>Pick <strong>text color</strong> and <strong>stroke color</strong> using the color pickers.</li>
            <li>Choose a font family: Impact (classic meme font), Arial, or Comic Sans.</li>
            <li>Set text position: Top & Bottom, Top Only, Bottom Only, or Custom Y.</li>
            <li>See your meme update in real-time in the preview.</li>
            <li>Click <strong>Download PNG</strong> to save the meme.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Create memes for social media, group chats, presentations, marketing campaigns, or just for fun. This is a free alternative to imgflip, Canva meme maker, or Kapwing — with no watermarks, no account required, and full privacy since nothing leaves your browser.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Impact font with white text and black stroke is the classic meme style — it works on any background.</li>
            <li>Keep text short and punchy. The best memes have fewer than 10 words total.</li>
            <li>For best quality, upload a high-resolution source image (the meme will export at full resolution).</li>
            <li>Use the text position options to place text exactly where you need it.</li>
            <li>Your images are never uploaded — everything runs locally in your browser.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'Is this meme generator really free?', answer: 'Yes! It is 100% free with no watermarks, no limits, and no sign-up required. Your memes are created entirely in your browser.' },
        { question: 'Can I use my own images?', answer: 'Absolutely! Upload any JPG, PNG, or WebP image. You can also start with one of the 10 popular meme template placeholders.' },
        { question: 'What font should I use for memes?', answer: 'Impact is the classic meme font — bold, white text with a black outline. It is the default and works great on any background. Arial and Comic Sans are also available.' },
        { question: 'Does this add a watermark?', answer: 'No. The downloaded meme is a clean PNG with no watermarks or branding added.' },
        { question: 'Does this upload my images to a server?', answer: 'No. All processing happens locally in your browser using the HTML Canvas API. Your images never leave your device.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Create Meme</span>
          {(file || topText || bottomText) && <ClearButton onClear={clear} />}
        </div>

        {/* Source selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setImageSource('upload')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${imageSource === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
          >
            <Upload className="h-4 w-4 inline mr-1.5" /> Upload Image
          </button>
          <button
            onClick={() => setImageSource('template')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${imageSource === 'template' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
          >
            <ImageIcon className="h-4 w-4 inline mr-1.5" /> Use Template
          </button>
        </div>

        {/* Upload area */}
        {imageSource === 'upload' && !imageUrl && (
          <label
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
            className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Drag & drop an image, or click to upload</span>
            <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
              className="hidden"
            />
          </label>
        )}

        {/* Template picker */}
        {imageSource === 'template' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {MEME_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => setSelectedTemplate(i)}
                className={`p-3 rounded-lg text-left transition-colors border ${selectedTemplate === i ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
              >
                <div className="w-full h-12 rounded mb-2" style={{ backgroundColor: t.color }} />
                <div className="text-xs font-medium truncate">{t.name}</div>
              </button>
            ))}
          </div>
        )}

        {/* Text inputs and controls */}
        {hasImage && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Top Text</label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Enter top text..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Bottom Text</label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Enter bottom text..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Style controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Font Size: {options.fontSize}px
                </label>
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={options.fontSize}
                  onChange={(e) => updateOption('fontSize', Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Font Family</label>
                <select
                  value={options.fontFamily}
                  onChange={(e) => updateOption('fontFamily', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                >
                  {FONT_FAMILIES.map(f => (
                    <option key={f.label} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.textColor}
                    onChange={(e) => updateOption('textColor', e.target.value)}
                    className="w-8 h-8 rounded border border-border cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">{options.textColor}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Stroke Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={options.strokeColor}
                    onChange={(e) => updateOption('strokeColor', e.target.value)}
                    className="w-8 h-8 rounded border border-border cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">{options.strokeColor}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Stroke Width: {options.strokeWidth}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={options.strokeWidth}
                  onChange={(e) => updateOption('strokeWidth', Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Text Position</label>
                <select
                  value={options.textPosition}
                  onChange={(e) => updateOption('textPosition', e.target.value as MemeOptions['textPosition'])}
                  className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="top-bottom">Top & Bottom</option>
                  <option value="top-only">Top Only</option>
                  <option value="bottom-only">Bottom Only</option>
                  <option value="custom">Custom Y Position</option>
                </select>
              </div>
              {options.textPosition === 'custom' && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Y Position: {options.customY}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={options.customY}
                    onChange={(e) => updateOption('customY', Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              )}
            </div>

            {/* Live preview */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Live Preview</span>
              <div className="border border-border rounded-lg p-2 bg-muted/20 flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto max-h-96 object-contain"
                />
              </div>
            </div>

            {/* Download */}
            <button
              onClick={downloadMeme}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" /> Download PNG
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Shield className="h-3.5 w-3.5" />
          <span>Your images never leave your device. All meme creation happens locally in your browser.</span>
        </div>
      </div>
    </ToolPage>
  )
}
