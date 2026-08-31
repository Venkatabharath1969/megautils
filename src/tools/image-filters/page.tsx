'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload, RotateCcw, Shield, Eye, EyeOff } from 'lucide-react'

// ---------------------------------------------------------------------------
// Filter state
// ---------------------------------------------------------------------------
interface FilterState {
  brightness: number   // % (100 = normal)
  contrast: number     // % (100 = normal)
  saturation: number   // % (100 = normal)
  hue: number          // deg (0 = normal)
  blur: number         // px (0 = none)
  grayscale: number    // % (0 = none)
  sepia: number        // % (0 = none)
  invert: number       // % (0 = none)
}

const DEFAULT_FILTERS: FilterState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
}

// ---------------------------------------------------------------------------
// Presets (like Instagram filters)
// ---------------------------------------------------------------------------
interface Preset {
  name: string
  filters: FilterState
}

const PRESETS: Preset[] = [
  { name: 'Original',      filters: { ...DEFAULT_FILTERS } },
  { name: 'Vivid',         filters: { ...DEFAULT_FILTERS, brightness: 110, contrast: 120, saturation: 140 } },
  { name: 'Warm',          filters: { ...DEFAULT_FILTERS, brightness: 105, contrast: 105, saturation: 110, hue: 10, sepia: 15 } },
  { name: 'Cool',          filters: { ...DEFAULT_FILTERS, brightness: 105, contrast: 110, saturation: 90, hue: -15 } },
  { name: 'Vintage',       filters: { ...DEFAULT_FILTERS, brightness: 110, contrast: 85, saturation: 70, sepia: 40 } },
  { name: 'B&W',           filters: { ...DEFAULT_FILTERS, grayscale: 100 } },
  { name: 'Sepia',         filters: { ...DEFAULT_FILTERS, sepia: 80 } },
  { name: 'High Contrast', filters: { ...DEFAULT_FILTERS, contrast: 150, brightness: 105, saturation: 110 } },
  { name: 'Fade',          filters: { ...DEFAULT_FILTERS, brightness: 120, contrast: 80, saturation: 80 } },
  { name: 'Film',          filters: { ...DEFAULT_FILTERS, brightness: 105, contrast: 90, saturation: 85, sepia: 20, hue: 5 } },
]

// ---------------------------------------------------------------------------
// Slider config
// ---------------------------------------------------------------------------
interface SliderDef {
  key: keyof FilterState
  label: string
  min: number
  max: number
  step: number
  unit: string
  defaultVal: number
}

const SLIDERS: SliderDef[] = [
  { key: 'brightness',  label: 'Brightness',  min: 0, max: 200, step: 1, unit: '%', defaultVal: 100 },
  { key: 'contrast',    label: 'Contrast',    min: 0, max: 200, step: 1, unit: '%', defaultVal: 100 },
  { key: 'saturation',  label: 'Saturation',  min: 0, max: 200, step: 1, unit: '%', defaultVal: 100 },
  { key: 'hue',         label: 'Hue Rotate',  min: -180, max: 180, step: 1, unit: '\u00B0', defaultVal: 0 },
  { key: 'blur',        label: 'Blur',        min: 0, max: 20, step: 0.1, unit: 'px', defaultVal: 0 },
  { key: 'grayscale',   label: 'Grayscale',   min: 0, max: 100, step: 1, unit: '%', defaultVal: 0 },
  { key: 'sepia',       label: 'Sepia',       min: 0, max: 100, step: 1, unit: '%', defaultVal: 0 },
  { key: 'invert',      label: 'Invert',      min: 0, max: 100, step: 1, unit: '%', defaultVal: 0 },
]

// ---------------------------------------------------------------------------
// Build CSS filter string
// ---------------------------------------------------------------------------
function buildFilterCSS(f: FilterState): string {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) hue-rotate(${f.hue}deg) blur(${f.blur}px) grayscale(${f.grayscale}%) sepia(${f.sepia}%) invert(${f.invert}%)`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ImageFiltersTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS })
  const [activePreset, setActivePreset] = useState<string>('Original')
  const [showOriginal, setShowOriginal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filterCSS = useMemo(() => buildFilterCSS(filters), [filters])

  // ── File handling ────────────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      setImageSrc(src)
      const img = new Image()
      img.onload = () => setImageEl(img)
      img.src = src
    }
    reader.readAsDataURL(file)
    setFilters({ ...DEFAULT_FILTERS })
    setActivePreset('Original')
  }, [])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])

  // ── Update a single slider ───────────────────────────────────────────────
  const updateFilter = (key: keyof FilterState, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setActivePreset('')
  }

  // ── Apply preset ─────────────────────────────────────────────────────────
  const applyPreset = (preset: Preset) => {
    setFilters({ ...preset.filters })
    setActivePreset(preset.name)
  }

  // ── Reset ────────────────────────────────────────────────────────────────
  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS })
    setActivePreset('Original')
  }

  // ── Download (apply CSS filter to Canvas) ────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!imageEl) return
    const canvas = document.createElement('canvas')
    canvas.width = imageEl.width
    canvas.height = imageEl.height
    const ctx = canvas.getContext('2d')!
    ctx.filter = buildFilterCSS(filters)
    ctx.drawImage(imageEl, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `filtered-image.png`
      a.click()
    }, 'image/png')
  }, [imageEl, filters])

  // ── Clear ────────────────────────────────────────────────────────────────
  const clear = () => {
    setImageSrc(null)
    setImageEl(null)
    setFilters({ ...DEFAULT_FILTERS })
    setActivePreset('Original')
    setShowOriginal(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const isModified = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS)

  return (
    <ToolPage
      title="Image Filters"
      description="Apply professional photo filters and adjustments — replaces PicMonkey & Canva Pro editing"
      category="image"
      categoryLabel="Image Tools"
      faqs={[
        { question: 'How does the live preview work?', answer: 'The preview uses CSS filters applied directly to the image element in your browser. This gives you instant real-time feedback as you adjust sliders, with zero delay.' },
        { question: 'Does the downloaded image match the preview?', answer: 'Yes. When you download, the same CSS filter values are applied to an HTML Canvas at the original image resolution, so the output matches what you see in the preview.' },
        { question: 'Can I combine presets with manual adjustments?', answer: 'Yes. Click a preset to start with its values, then fine-tune any slider. The preset name will clear once you make manual changes.' },
        { question: 'Is my image uploaded to a server?', answer: 'No. All filtering happens locally in your browser using CSS filters and the Canvas API. Your images are never uploaded anywhere.' },
        { question: 'What is the output format?', answer: 'Filtered images are downloaded as PNG files at the original image resolution for maximum quality.' },
      ]}
      helpContent={
        <>
          <h2>What is the Image Filters Tool?</h2>
          <p>
            This tool lets you apply professional-quality photo adjustments and Instagram-style filter presets to any
            image directly in your browser. Adjust brightness, contrast, saturation, hue, blur, grayscale, sepia,
            and invert with real-time sliders, or pick from 10 curated presets. Everything runs locally — your photos
            are never uploaded to any server, keeping them completely private.
          </p>

          <h2>How to Use</h2>
          <ol>
            <li>Upload an image by clicking the drop zone or dragging a file onto it.</li>
            <li>Use the preset buttons for quick Instagram-style filters, or adjust individual sliders for fine control.</li>
            <li>Toggle the <strong>Before/After</strong> button to compare your filtered image with the original.</li>
            <li>Click <strong>Reset All</strong> to return to the original unfiltered state.</li>
            <li>Click <strong>Download Filtered Image</strong> to save the result as a high-resolution PNG.</li>
          </ol>

          <h2>Available Presets</h2>
          <ul>
            <li><strong>Vivid</strong> — Boosted saturation and contrast for punchy colours</li>
            <li><strong>Warm</strong> — Slight warmth with golden tones</li>
            <li><strong>Cool</strong> — Blue-shifted, crisp, and clean</li>
            <li><strong>Vintage</strong> — Low contrast with sepia tones for a retro feel</li>
            <li><strong>B&W</strong> — Full grayscale conversion</li>
            <li><strong>Sepia</strong> — Classic sepia-toned black and white</li>
            <li><strong>High Contrast</strong> — Dramatic contrast boost</li>
            <li><strong>Fade</strong> — Lifted shadows with muted colours</li>
            <li><strong>Film</strong> — Simulates analog film with subtle desaturation</li>
          </ul>

          <h2>Adjustment Sliders</h2>
          <ul>
            <li><strong>Brightness</strong> — Controls overall lightness (100% = original)</li>
            <li><strong>Contrast</strong> — Controls tonal range between lights and darks</li>
            <li><strong>Saturation</strong> — Controls colour intensity (0% = grayscale)</li>
            <li><strong>Hue Rotate</strong> — Shifts all colours around the colour wheel</li>
            <li><strong>Blur</strong> — Applies Gaussian blur in pixels</li>
            <li><strong>Grayscale</strong> — Converts to greyscale (100% = full B&W)</li>
            <li><strong>Sepia</strong> — Applies sepia-tone effect</li>
            <li><strong>Invert</strong> — Inverts all colours (100% = full negative)</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls column */}
            <div className="space-y-5 order-2 lg:order-1">
              {/* Presets */}
              <div>
                <label className="text-sm font-medium mb-2 block">Presets</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      className={`px-2.5 py-1.5 text-xs rounded-md border transition-colors ${activePreset === p.name ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                <label className="text-sm font-medium block">Adjustments</label>
                {SLIDERS.map((s) => (
                  <div key={s.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {filters[s.key]}{s.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={filters[s.key]}
                      onChange={(e) => updateFilter(s.key, Number(e.target.value))}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary bg-muted"
                    />
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {isModified && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset All
                  </button>
                )}
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                >
                  {showOriginal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showOriginal ? 'Show Filtered' : 'Show Original'}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download Filtered Image
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <Shield className="h-3.5 w-3.5" /> Processed locally — never uploaded
              </div>
            </div>

            {/* Preview column */}
            <div className="space-y-3 order-1 lg:order-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {showOriginal ? 'Original' : (activePreset || 'Custom')}
                </span>
                {isModified && !showOriginal && (
                  <span className="text-xs text-muted-foreground">Filtered</span>
                )}
              </div>
              <div className="border border-border rounded-lg p-2 bg-muted/20 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Preview"
                  className="max-w-full h-auto max-h-[500px] mx-auto object-contain transition-[filter] duration-200"
                  style={{ filter: showOriginal ? 'none' : filterCSS }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
