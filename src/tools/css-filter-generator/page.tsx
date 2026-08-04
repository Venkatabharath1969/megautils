'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

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

  const updateValue = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  const resetAll = () => {
    const init: Record<string, number> = {}
    filters.forEach(f => { init[f.key] = f.defaultVal })
    setValues(init)
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
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-3">
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
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div className="w-full rounded-lg border border-border overflow-hidden" style={filterStyle}>
              <div className="w-full h-64" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
              }}>
                <div className="h-full flex flex-col items-center justify-center text-white p-6">
                  <div className="text-2xl font-bold mb-2">Sample Content</div>
                  <p className="text-sm text-center text-white/80">This gradient preview shows how your CSS filters will affect visual content.</p>
                  <div className="flex gap-3 mt-4">
                    <div className="w-12 h-12 rounded-full bg-white/30" />
                    <div className="w-12 h-12 rounded-lg bg-white/20" />
                    <div className="w-12 h-12 rounded-full bg-white/30" />
                  </div>
                </div>
              </div>
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
