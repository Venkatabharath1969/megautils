'use client'

import { useState, useMemo, useRef } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

interface FilterPreset {
  name: string
  values: Record<string, number>
}

const filterPresets: FilterPreset[] = [
  { name: 'Vintage', values: { blur: 0, brightness: 110, contrast: 85, grayscale: 20, hueRotate: 0, invert: 0, opacity: 100, saturate: 80, sepia: 40 } },
  { name: 'B&W', values: { blur: 0, brightness: 100, contrast: 120, grayscale: 100, hueRotate: 0, invert: 0, opacity: 100, saturate: 0, sepia: 0 } },
  { name: 'Warm', values: { blur: 0, brightness: 105, contrast: 100, grayscale: 0, hueRotate: 10, invert: 0, opacity: 100, saturate: 130, sepia: 20 } },
  { name: 'Cool', values: { blur: 0, brightness: 100, contrast: 105, grayscale: 0, hueRotate: 190, invert: 0, opacity: 100, saturate: 110, sepia: 0 } },
  { name: 'High Contrast', values: { blur: 0, brightness: 110, contrast: 200, grayscale: 0, hueRotate: 0, invert: 0, opacity: 100, saturate: 120, sepia: 0 } },
  { name: 'Faded', values: { blur: 0, brightness: 115, contrast: 85, grayscale: 10, hueRotate: 0, invert: 0, opacity: 90, saturate: 75, sepia: 15 } },
]

interface FilterConfig {
  key: string
  label: string
  unit: string
  min: number
  max: number
  step: number
  defaultVal: number
}

const filters: FilterConfig[] = [
  { key: 'blur', label: 'Blur', unit: 'px', min: 0, max: 20, step: 0.5, defaultVal: 0 },
  { key: 'brightness', label: 'Brightness', unit: '%', min: 0, max: 300, step: 5, defaultVal: 100 },
  { key: 'contrast', label: 'Contrast', unit: '%', min: 0, max: 300, step: 5, defaultVal: 100 },
  { key: 'grayscale', label: 'Grayscale', unit: '%', min: 0, max: 100, step: 1, defaultVal: 0 },
  { key: 'hueRotate', label: 'Hue Rotate', unit: 'deg', min: 0, max: 360, step: 1, defaultVal: 0 },
  { key: 'invert', label: 'Invert', unit: '%', min: 0, max: 100, step: 1, defaultVal: 0 },
  { key: 'opacity', label: 'Opacity', unit: '%', min: 0, max: 100, step: 1, defaultVal: 100 },
  { key: 'saturate', label: 'Saturate', unit: '%', min: 0, max: 300, step: 5, defaultVal: 100 },
  { key: 'sepia', label: 'Sepia', unit: '%', min: 0, max: 100, step: 1, defaultVal: 0 },
]

export default function CSSFilterGeneratorTool() {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    filters.forEach(f => { init[f.key] = f.defaultVal })
    return init
  })
  const [customImage, setCustomImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateValue = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const resetAll = () => {
    const init: Record<string, number> = {}
    filters.forEach(f => { init[f.key] = f.defaultVal })
    setValues(init)
  }

  const applyPreset = (preset: FilterPreset) => {
    setValues({ ...preset.values })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCustomImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const filterCSS = useMemo(() => {
    const parts: string[] = []
    if (values.blur !== 0) parts.push(`blur(${values.blur}px)`)
    if (values.brightness !== 100) parts.push(`brightness(${values.brightness}%)`)
    if (values.contrast !== 100) parts.push(`contrast(${values.contrast}%)`)
    if (values.grayscale !== 0) parts.push(`grayscale(${values.grayscale}%)`)
    if (values.hueRotate !== 0) parts.push(`hue-rotate(${values.hueRotate}deg)`)
    if (values.invert !== 0) parts.push(`invert(${values.invert}%)`)
    if (values.opacity !== 100) parts.push(`opacity(${values.opacity}%)`)
    if (values.saturate !== 100) parts.push(`saturate(${values.saturate}%)`)
    if (values.sepia !== 0) parts.push(`sepia(${values.sepia}%)`)
    return parts.length > 0 ? parts.join(' ') : 'none'
  }, [values])

  const cssCode = `filter: ${filterCSS};`

  const filterStyle = useMemo(() => {
    return {
      filter: filterCSS === 'none' ? undefined : filterCSS,
    }
  }, [filterCSS])

  return (
    <ToolPage
      title="CSS Filter Generator"
      description="Build CSS filter effects visually. Adjust blur, brightness, contrast, grayscale, hue-rotate, and more with live preview."
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSS Filter Generator is a free browser-based tool that lets you apply and combine CSS filter effects like blur, brightness, contrast, grayscale, hue-rotate, invert, saturate, and sepia. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Use the visual controls (sliders, color pickers, toggles) to design your effect.</li>
            <li>See the <strong>live preview</strong> update in real time as you adjust settings.</li>
            <li>Review the generated <strong>CSS code</strong> in the code panel below.</li>
            <li>Click <strong>Copy CSS</strong> to paste the code directly into your stylesheet.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when applying visual effects to images and elements without image editing software. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Copy the generated CSS directly into your project stylesheet — it is production-ready.</li>
            <li>Test the effect in multiple browsers since some CSS properties have varying support.</li>
            <li>Combine multiple generators (e.g., gradient + box-shadow) for layered visual effects.</li>
            <li>Use CSS custom properties (variables) to make generated values easy to update later.</li>
            <li>All code generation happens in your browser — no external dependencies required.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is the CSS filter property?', answer: 'The CSS filter property applies graphical effects like blur, brightness, contrast, and grayscale to an element, similar to photo editing filters.' },
        { question: 'Can I combine multiple CSS filters?', answer: 'Yes, you can chain multiple filter functions in a single declaration like filter: blur(2px) brightness(120%) contrast(110%), and they are applied in the order listed.' },
        { question: 'What is the difference between filter and backdrop-filter?', answer: 'filter applies effects to the element itself and its contents, while backdrop-filter applies effects to the area behind the element, commonly used for frosted glass effects.' },
        { question: 'Does CSS filter affect performance?', answer: 'Filters are GPU-accelerated in modern browsers and perform well for most uses, but heavy blur effects on large elements or many filtered elements at once can impact rendering performance.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Filter Presets</label>
            <div className="flex flex-wrap gap-2">
              {filterPresets.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors">{p.name}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Filter Controls</label>
            <button onClick={resetAll} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted transition-colors">
              Reset All
            </button>
          </div>

          {filters.map(f => (
            <div key={f.key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">{f.label}</label>
                <span className="text-xs text-muted-foreground font-mono">{values[f.key]}{f.unit}</span>
              </div>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={values[f.key]}
                onChange={e => updateValue(f.key, +e.target.value)}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Preview</label>
              <div className="flex items-center gap-2">
                {customImage && (
                  <button onClick={() => { setCustomImage(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted transition-colors">Remove Image</button>
                )}
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">Upload Image</button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>
            <div className="w-full rounded-lg border border-border overflow-hidden" style={filterStyle}>
              {customImage ? (
                <img src={customImage} alt="Custom preview" className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                }}>
                  <div className="h-full flex flex-col items-center justify-center text-white p-6">
                    <div className="text-2xl font-bold mb-2">Sample Content</div>
                    <p className="text-sm text-center text-white/80">Upload an image or use this gradient to preview your CSS filters.</p>
                    <div className="flex gap-3 mt-4">
                      <div className="w-12 h-12 rounded-full bg-white/30" />
                      <div className="w-12 h-12 rounded-lg bg-white/20" />
                      <div className="w-12 h-12 rounded-full bg-white/30" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">CSS Code</label>
              <CopyButton text={cssCode} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre overflow-x-auto">{cssCode}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
