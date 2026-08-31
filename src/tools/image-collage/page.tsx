'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage } from '@/components/tool-page'
import { Upload, Download, Trash2, Image as ImageIcon, Grid3X3, Loader2 } from 'lucide-react'

interface LoadedImage {
  id: string
  file: File
  url: string
  el: HTMLImageElement
}

type LayoutId = '2-h' | '2-v' | '3-top' | '3-bottom' | '4-grid' | '6-grid' | '9-grid'

interface LayoutDef {
  id: LayoutId
  label: string
  minImages: number
  icon: string
}

const LAYOUTS: LayoutDef[] = [
  { id: '2-h', label: 'Side by Side', minImages: 2, icon: '▌▐' },
  { id: '2-v', label: 'Top / Bottom', minImages: 2, icon: '▀▄' },
  { id: '3-top', label: '1 Top + 2 Bottom', minImages: 3, icon: '█ ▄▄' },
  { id: '3-bottom', label: '2 Top + 1 Bottom', minImages: 3, icon: '▀▀ █' },
  { id: '4-grid', label: '2x2 Grid', minImages: 4, icon: '▞▞' },
  { id: '6-grid', label: '2x3 Grid', minImages: 6, icon: '▞▞▞' },
  { id: '9-grid', label: '3x3 Grid', minImages: 9, icon: '▞▞▞' },
]

const OUTPUT_SIZES = [
  { value: 800, label: '800px' },
  { value: 1080, label: '1080px' },
  { value: 1200, label: '1200px' },
  { value: 1920, label: '1920px' },
  { value: 2400, label: '2400px' },
]

interface Cell { x: number; y: number; w: number; h: number }

function getLayoutCells(layout: LayoutId, totalW: number, gap: number, imageCount: number): { cells: Cell[]; totalW: number; totalH: number } {
  const cells: Cell[] = []
  let totalH = totalW

  switch (layout) {
    case '2-h': {
      const cellW = (totalW - gap) / 2
      const cellH = totalW * 0.667
      totalH = cellH
      cells.push({ x: 0, y: 0, w: cellW, h: cellH })
      cells.push({ x: cellW + gap, y: 0, w: cellW, h: cellH })
      break
    }
    case '2-v': {
      const cellH = (totalW - gap) / 2
      totalH = totalW
      cells.push({ x: 0, y: 0, w: totalW, h: cellH })
      cells.push({ x: 0, y: cellH + gap, w: totalW, h: cellH })
      break
    }
    case '3-top': {
      const topH = totalW * 0.55
      const botW = (totalW - gap) / 2
      const botH = totalW * 0.4
      totalH = topH + gap + botH
      cells.push({ x: 0, y: 0, w: totalW, h: topH })
      cells.push({ x: 0, y: topH + gap, w: botW, h: botH })
      cells.push({ x: botW + gap, y: topH + gap, w: botW, h: botH })
      break
    }
    case '3-bottom': {
      const topW = (totalW - gap) / 2
      const topH = totalW * 0.4
      const botH = totalW * 0.55
      totalH = topH + gap + botH
      cells.push({ x: 0, y: 0, w: topW, h: topH })
      cells.push({ x: topW + gap, y: 0, w: topW, h: topH })
      cells.push({ x: 0, y: topH + gap, w: totalW, h: botH })
      break
    }
    case '4-grid': {
      const cellW = (totalW - gap) / 2
      const cellH = (totalW - gap) / 2
      totalH = totalW
      cells.push({ x: 0, y: 0, w: cellW, h: cellH })
      cells.push({ x: cellW + gap, y: 0, w: cellW, h: cellH })
      cells.push({ x: 0, y: cellH + gap, w: cellW, h: cellH })
      cells.push({ x: cellW + gap, y: cellH + gap, w: cellW, h: cellH })
      break
    }
    case '6-grid': {
      const cols = 3
      const rows = 2
      const cellW = (totalW - gap * (cols - 1)) / cols
      const cellH = cellW
      totalH = cellH * rows + gap * (rows - 1)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({ x: c * (cellW + gap), y: r * (cellH + gap), w: cellW, h: cellH })
        }
      }
      break
    }
    case '9-grid': {
      const cols = 3
      const rows = 3
      const cellW = (totalW - gap * (cols - 1)) / cols
      const cellH = cellW
      totalH = cellH * rows + gap * (rows - 1)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({ x: c * (cellW + gap), y: r * (cellH + gap), w: cellW, h: cellH })
        }
      }
      break
    }
  }

  return { cells: cells.slice(0, imageCount), totalW, totalH }
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw = w / scale
  const sh = h / scale
  const sx = (img.naturalWidth - sw) / 2
  const sy = (img.naturalHeight - sh) / 2
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}

export default function ImageCollageTool() {
  const [images, setImages] = useState<LoadedImage[]>([])
  const [layout, setLayout] = useState<LayoutId>('2-h')
  const [gap, setGap] = useState(8)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [outputSize, setOutputSize] = useState(1200)
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('png')
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'))
    const remaining = 9 - images.length
    const toAdd = fileArr.slice(0, remaining)

    const newImages: LoadedImage[] = []
    for (const f of toAdd) {
      try {
        const el = await loadImage(f)
        newImages.push({ id: crypto.randomUUID(), file: f, url: URL.createObjectURL(f), el })
      } catch { /* skip invalid */ }
    }
    setImages(prev => [...prev, ...newImages])
  }, [images.length])

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img) URL.revokeObjectURL(img.url)
      return prev.filter(i => i.id !== id)
    })
  }

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.url))
    setImages([])
    setPreviewUrl(null)
  }

  // Auto-select best layout when image count changes
  useEffect(() => {
    const count = images.length
    if (count >= 9) setLayout('9-grid')
    else if (count >= 6) setLayout('6-grid')
    else if (count >= 4) setLayout('4-grid')
    else if (count >= 3) setLayout('3-top')
    else if (count >= 2) setLayout('2-h')
  }, [images.length])

  // Render preview whenever settings change
  useEffect(() => {
    if (images.length < 2) { setPreviewUrl(null); return }
    const selectedLayout = LAYOUTS.find(l => l.id === layout)
    if (!selectedLayout || images.length < selectedLayout.minImages) { setPreviewUrl(null); return }

    const scaledGap = Math.round(gap * (outputSize / 1200))
    const { cells, totalW, totalH } = getLayoutCells(layout, outputSize, scaledGap, images.length)

    const canvas = canvasRef.current || document.createElement('canvas')
    canvas.width = totalW
    canvas.height = totalH
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, totalW, totalH)

    cells.forEach((cell, i) => {
      if (images[i]) {
        drawImageCover(ctx, images[i].el, cell.x, cell.y, cell.w, cell.h)
      }
    })

    setPreviewUrl(canvas.toDataURL('image/png', 0.9))
  }, [images, layout, gap, bgColor, outputSize])

  const downloadCollage = () => {
    if (!previewUrl || images.length < 2) return
    const selectedLayout = LAYOUTS.find(l => l.id === layout)
    if (!selectedLayout || images.length < selectedLayout.minImages) return

    const scaledGap = Math.round(gap * (outputSize / 1200))
    const { cells, totalW, totalH } = getLayoutCells(layout, outputSize, scaledGap, images.length)

    const canvas = document.createElement('canvas')
    canvas.width = totalW
    canvas.height = totalH
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, totalW, totalH)

    cells.forEach((cell, i) => {
      if (images[i]) {
        drawImageCover(ctx, images[i].el, cell.x, cell.y, cell.w, cell.h)
      }
    })

    const mime = outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png'
    const ext = outputFormat === 'jpeg' ? 'jpg' : 'png'
    const quality = outputFormat === 'jpeg' ? 0.92 : undefined

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `collage-${Date.now()}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    }, mime, quality)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const availableLayouts = LAYOUTS.filter(l => l.minImages <= images.length)

  return (
    <ToolPage
      title="Image Collage Maker"
      description="Create beautiful photo collages with multiple layout templates. Combine 2-9 images into a single collage — free, private, no watermark."
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Image Collage Maker is a free browser-based tool that lets you combine multiple photos into a single collage with customizable layouts, spacing, and background colors. It uses HTML5 Canvas to render high-quality collages directly in your browser — no uploads, no account, no watermarks.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload 2 to 9 images by dragging and dropping or clicking the upload area.</li>
            <li>Choose a layout template — the tool auto-selects the best layout for your image count.</li>
            <li>Adjust the gap spacing, background color, and output size to your liking.</li>
            <li>Preview the collage in real-time and download it as PNG or JPG.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is perfect for creating social media posts, photo grids for Instagram, event photo compilations, product comparisons, before/after photos, and family photo collections. Unlike Canva ($15/mo) or Fotor ($8/mo), this tool is completely free and processes everything locally — your photos never leave your device.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Images are automatically cropped to fit their cells (cover mode), centering on the image.</li>
            <li>Use PNG format for collages with text overlays or sharp edges; use JPG for photo-only collages with smaller file sizes.</li>
            <li>Higher output sizes produce better quality but larger files — 1200px is ideal for social media.</li>
            <li>The gap color can be used as a design element — try matching it to your brand color.</li>
            <li>You can reorder images by removing and re-adding them in the desired order.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How many images can I use?', answer: 'You can add between 2 and 9 images. The tool offers different layout templates depending on the number of images: side-by-side (2), 1+2 or 2+1 arrangements (3), 2x2 grid (4), 2x3 grid (6), and 3x3 grid (9).' },
        { question: 'Are my photos uploaded to a server?', answer: 'No. All image processing happens entirely in your browser using HTML5 Canvas. Your photos are never uploaded anywhere, making this tool completely private and safe for personal photos.' },
        { question: 'What image formats are supported?', answer: 'You can upload JPG, PNG, WebP, GIF, and BMP images. The output can be downloaded as either PNG (lossless, larger file) or JPG (compressed, smaller file).' },
        { question: 'Can I adjust the spacing between images?', answer: 'Yes! Use the gap slider to set spacing from 0px (no gap) to 20px. You can also choose the background color that appears in the gaps between images.' },
        { question: 'How does this compare to Canva or Fotor?', answer: 'Unlike Canva ($15/mo) or Fotor ($8/mo), this tool is 100% free with no watermarks, no account required, and no usage limits. It focuses on quick collage creation with clean layouts — ideal when you do not need advanced design features.' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <canvas ref={canvasRef} className="hidden" />

        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
          } ${images.length >= 9 ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Drop images here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">{images.length}/9 images added — supports JPG, PNG, WebP</p>
        </div>

        {/* Image thumbnails */}
        {images.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{images.length} image{images.length > 1 ? 's' : ''} added</span>
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Clear all
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={img.id} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border">
                  <img src={img.url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center">{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        {images.length >= 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-muted/20">
            {/* Layout selector */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Layout</label>
              <div className="flex flex-wrap gap-1.5">
                {availableLayouts.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLayout(l.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      layout === l.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80'
                    }`}
                    title={l.label}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gap slider */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Gap: {gap}px</label>
              <input
                type="range"
                min={0}
                max={20}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Background color */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Gap Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-24 h-8 px-2 rounded-lg border border-input bg-tool-bg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-1">
                  {['#ffffff', '#000000', '#f5f5f5', '#1a1a1a'].map(c => (
                    <button
                      key={c}
                      onClick={() => setBgColor(c)}
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Output size */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Output Width</label>
              <select
                value={outputSize}
                onChange={(e) => setOutputSize(Number(e.target.value))}
                className="w-full h-8 px-2 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {OUTPUT_SIZES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
              <div className="bg-muted/50 px-4 py-2 border-b border-border text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Grid3X3 className="w-3.5 h-3.5" /> Collage Preview
              </div>
              <div className="p-4 flex justify-center">
                <img
                  src={previewUrl}
                  alt="Collage preview"
                  className="max-w-full max-h-[500px] rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Download buttons */}
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Format:</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpeg')}
                  className="h-8 px-2 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPG</option>
                </select>
              </div>
              <button
                onClick={downloadCollage}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Collage
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {images.length < 2 && images.length > 0 && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border text-center text-sm text-muted-foreground">
            <ImageIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
            Add at least {2 - images.length} more image{2 - images.length > 1 ? 's' : ''} to create a collage
          </div>
        )}
      </div>
    </ToolPage>
  )
}
