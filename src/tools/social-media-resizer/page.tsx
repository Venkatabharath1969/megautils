'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload, Check, Package, Shield } from 'lucide-react'
import JSZip from 'jszip'

// ---------------------------------------------------------------------------
// Social-media platform presets
// ---------------------------------------------------------------------------
interface Preset {
  id: string
  platform: string
  label: string
  w: number
  h: number
}

const PRESETS: Preset[] = [
  { id: 'ig-post',      platform: 'Instagram', label: 'Post',           w: 1080, h: 1080 },
  { id: 'ig-story',     platform: 'Instagram', label: 'Story / Reels',  w: 1080, h: 1920 },
  { id: 'ig-portrait',  platform: 'Instagram', label: 'Portrait',       w: 1080, h: 1350 },
  { id: 'fb-post',      platform: 'Facebook',  label: 'Post',           w: 1200, h: 630  },
  { id: 'fb-cover',     platform: 'Facebook',  label: 'Cover',          w: 820,  h: 312  },
  { id: 'tw-post',      platform: 'Twitter/X', label: 'Post',           w: 1200, h: 675  },
  { id: 'tw-header',    platform: 'Twitter/X', label: 'Header',         w: 1500, h: 500  },
  { id: 'li-post',      platform: 'LinkedIn',  label: 'Post',           w: 1200, h: 627  },
  { id: 'li-cover',     platform: 'LinkedIn',  label: 'Cover',          w: 1584, h: 396  },
  { id: 'yt-thumb',     platform: 'YouTube',   label: 'Thumbnail',      w: 1280, h: 720  },
  { id: 'yt-art',       platform: 'YouTube',   label: 'Channel Art',    w: 2560, h: 1440 },
  { id: 'pin',          platform: 'Pinterest',  label: 'Pin',           w: 1000, h: 1500 },
  { id: 'tiktok',       platform: 'TikTok',     label: 'Video',         w: 1080, h: 1920 },
  { id: 'whatsapp',     platform: 'WhatsApp',   label: 'Status',        w: 1080, h: 1920 },
]

type FitMode = 'fill' | 'fit' | 'stretch'

// ---------------------------------------------------------------------------
// Resize helper — pure Canvas API
// ---------------------------------------------------------------------------
function resizeImage(
  img: HTMLImageElement,
  tw: number,
  th: number,
  mode: FitMode,
  bgColor: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = tw
    canvas.height = th
    const ctx = canvas.getContext('2d')!

    // Background (visible in "fit" mode)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, tw, th)

    let sx = 0, sy = 0, sw = img.width, sh = img.height
    let dx = 0, dy = 0, dw = tw, dh = th

    if (mode === 'fill') {
      // Crop to cover target, centred
      const srcRatio = img.width / img.height
      const tgtRatio = tw / th
      if (srcRatio > tgtRatio) {
        sw = Math.round(img.height * tgtRatio)
        sx = Math.round((img.width - sw) / 2)
      } else {
        sh = Math.round(img.width / tgtRatio)
        sy = Math.round((img.height - sh) / 2)
      }
    } else if (mode === 'fit') {
      // Scale to fit within target, pad remainder
      const scale = Math.min(tw / img.width, th / img.height)
      dw = Math.round(img.width * scale)
      dh = Math.round(img.height * scale)
      dx = Math.round((tw - dw) / 2)
      dy = Math.round((th - dh) / 2)
    }
    // "stretch" uses defaults: draw full source to full target

    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/png',
    )
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SocialMediaResizerTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [fitMode, setFitMode] = useState<FitMode>('fill')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [results, setResults] = useState<Map<string, string>>(new Map()) // id -> objectURL
  const [processing, setProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── File handling ────────────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    setResults(new Map())
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      setImageSrc(src)
      const img = new Image()
      img.onload = () => setImageEl(img)
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) processFile(file)
    },
    [processFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  // ── Selection helpers ────────────────────────────────────────────────────
  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setResults(new Map())
  }

  const selectAll = () => {
    setSelected(new Set(PRESETS.map((p) => p.id)))
    setResults(new Map())
  }

  const selectNone = () => {
    setSelected(new Set())
    setResults(new Map())
  }

  // ── Generate resized images ──────────────────────────────────────────────
  const generate = useCallback(async () => {
    if (!imageEl || selected.size === 0) return
    setProcessing(true)
    const map = new Map<string, string>()
    for (const preset of PRESETS) {
      if (!selected.has(preset.id)) continue
      try {
        const blob = await resizeImage(imageEl, preset.w, preset.h, fitMode, bgColor)
        map.set(preset.id, URL.createObjectURL(blob))
      } catch {
        /* skip on error */
      }
    }
    setResults(map)
    setProcessing(false)
  }, [imageEl, selected, fitMode, bgColor])

  // ── Download helpers ─────────────────────────────────────────────────────
  const downloadOne = (id: string) => {
    const url = results.get(id)
    if (!url) return
    const preset = PRESETS.find((p) => p.id === id)!
    const a = document.createElement('a')
    a.href = url
    a.download = `${preset.platform}-${preset.label.replace(/[\s/]+/g, '-')}-${preset.w}x${preset.h}.png`
    a.click()
  }

  const downloadAll = useCallback(async () => {
    if (results.size === 0) return
    const zip = new JSZip()
    for (const [id, url] of results) {
      const preset = PRESETS.find((p) => p.id === id)!
      const resp = await fetch(url)
      const blob = await resp.blob()
      zip.file(`${preset.platform}-${preset.label.replace(/[\s/]+/g, '-')}-${preset.w}x${preset.h}.png`, blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(content)
    a.download = 'social-media-images.zip'
    a.click()
  }, [results])

  // ── Clear ────────────────────────────────────────────────────────────────
  const clear = () => {
    setImageSrc(null)
    setImageEl(null)
    setSelected(new Set())
    setResults(new Map())
    setProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Group presets by platform for the grid
  const grouped = PRESETS.reduce<Record<string, Preset[]>>((acc, p) => {
    ;(acc[p.platform] ??= []).push(p)
    return acc
  }, {})

  return (
    <ToolPage
      title="Social Media Image Resizer"
      description="Resize images for every social media platform in one click — replaces Canva Pro & SizeCraft"
      category="image"
      categoryLabel="Image Tools"
      faqs={[
        { question: 'What fit modes are available?', answer: 'Fill crops the image to cover the target dimensions, Fit scales the image to fit inside the target and pads the rest with a background color, and Stretch distorts the image to exactly match the target size.' },
        { question: 'Can I download all sizes at once?', answer: 'Yes. After generating your images, click "Download All as ZIP" to get every selected size in a single ZIP file.' },
        { question: 'Is my image uploaded to a server?', answer: 'No. All resizing happens locally in your browser using the Canvas API. Your images never leave your device.' },
        { question: 'What image formats can I upload?', answer: 'You can upload any browser-supported format: PNG, JPEG, WebP, GIF, SVG, and more. Output is PNG for maximum compatibility.' },
        { question: 'Why are some sizes the same (e.g. Story, Reels, TikTok, WhatsApp)?', answer: 'Many platforms share the 1080x1920 vertical format. We list them separately so you can quickly select only the platforms you need.' },
      ]}
      helpContent={
        <>
          <h2>What is the Social Media Image Resizer?</h2>
          <p>
            This tool lets you take a single image and instantly resize it for every major social media platform.
            Instead of manually creating separate files in Canva or Photoshop, select the platforms you need,
            choose a fit mode, and download everything in one click. All processing happens in your browser
            — your images stay private and are never uploaded.
          </p>

          <h2>How to Use</h2>
          <ol>
            <li>Upload an image by clicking the drop zone or dragging a file onto it.</li>
            <li>Select the social media sizes you need from the grid. Use "Select All" for a full set.</li>
            <li>Choose a fit mode: <strong>Fill</strong> (crops to fit), <strong>Fit</strong> (pads with background), or <strong>Stretch</strong>.</li>
            <li>If using Fit mode, pick a background color for the padding area.</li>
            <li>Click <strong>Generate All Sizes</strong> to create your images.</li>
            <li>Preview each result, download individually, or click <strong>Download All as ZIP</strong>.</li>
          </ol>

          <h2>Supported Platforms</h2>
          <ul>
            <li><strong>Instagram</strong> — Post (1080x1080), Story/Reels (1080x1920), Portrait (1080x1350)</li>
            <li><strong>Facebook</strong> — Post (1200x630), Cover (820x312)</li>
            <li><strong>Twitter/X</strong> — Post (1200x675), Header (1500x500)</li>
            <li><strong>LinkedIn</strong> — Post (1200x627), Cover (1584x396)</li>
            <li><strong>YouTube</strong> — Thumbnail (1280x720), Channel Art (2560x1440)</li>
            <li><strong>Pinterest</strong> — Pin (1000x1500)</li>
            <li><strong>TikTok</strong> — Video (1080x1920)</li>
            <li><strong>WhatsApp</strong> — Status (1080x1920)</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Start with the highest resolution source image you have for the best quality across all sizes.</li>
            <li><strong>Fill</strong> mode works best when your subject is centred — edges may be cropped.</li>
            <li><strong>Fit</strong> mode preserves the entire image; use a brand-coloured background for a polished look.</li>
            <li>Download the ZIP to quickly batch-upload to scheduling tools like Buffer or Hootsuite.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Upload */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upload Image</label>
          {imageSrc && <ClearButton onClear={clear} />}
        </div>

        {!imageSrc ? (
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
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        ) : (
          <div className="space-y-6">
            {/* Original preview */}
            <div className="flex items-start gap-4">
              <div className="border border-border rounded-lg p-2 bg-muted/20 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc} alt="Original" className="max-h-32 max-w-[200px] object-contain" />
              </div>
              <div className="text-sm text-muted-foreground space-y-1 pt-1">
                {imageEl && (
                  <>
                    <div>Original size: <strong>{imageEl.width} x {imageEl.height}</strong></div>
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <Shield className="h-3.5 w-3.5" /> Processed locally — never uploaded
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Fit mode + BG colour */}
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Fit Mode</label>
                <div className="flex gap-1.5">
                  {(['fill', 'fit', 'stretch'] as FitMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setFitMode(m); setResults(new Map()) }}
                      className={`px-3 py-1.5 text-xs rounded-md border capitalize transition-colors ${fitMode === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                    >
                      {m === 'fill' ? 'Fill (Crop)' : m === 'fit' ? 'Fit (Pad)' : 'Stretch'}
                    </button>
                  ))}
                </div>
              </div>

              {fitMode === 'fit' && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => { setBgColor(e.target.value); setResults(new Map()) }}
                      className="h-9 w-9 rounded border border-border cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground font-mono">{bgColor}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Platform grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Select Sizes</label>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-primary hover:underline">Select All</button>
                  <button onClick={selectNone} className="text-xs text-muted-foreground hover:underline">Clear</button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(grouped).map(([platform, presets]) => (
                  <div key={platform} className="border border-border rounded-lg p-3 space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{platform}</span>
                    {presets.map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors ${selected.has(p.id) ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                      >
                        <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${selected.has(p.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-border'}`}>
                          {selected.has(p.id) && <Check className="h-3 w-3" />}
                        </div>
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="hidden" />
                        <span className="text-sm flex-1">{p.label}</span>
                        <span className="text-xs text-muted-foreground font-mono">{p.w}x{p.h}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={generate}
                disabled={processing || selected.size === 0}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : `Generate ${selected.size} Size${selected.size !== 1 ? 's' : ''}`}
              </button>

              {results.size > 1 && (
                <button
                  onClick={downloadAll}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Package className="h-4 w-4" /> Download All as ZIP
                </button>
              )}
            </div>

            {/* Results */}
            {results.size > 0 && (
              <div className="space-y-3">
                <span className="text-sm font-medium">Results</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PRESETS.filter((p) => results.has(p.id)).map((p) => (
                    <div key={p.id} className="border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{p.platform} {p.label}</span>
                        <span className="text-xs text-muted-foreground font-mono">{p.w}x{p.h}</span>
                      </div>
                      <div className="bg-muted/20 rounded-md overflow-hidden flex items-center justify-center" style={{ minHeight: 80 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={results.get(p.id)} alt={`${p.platform} ${p.label}`} className="max-w-full max-h-40 object-contain" />
                      </div>
                      <button
                        onClick={() => downloadOne(p.id)}
                        className="inline-flex items-center gap-1.5 w-full justify-center px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
