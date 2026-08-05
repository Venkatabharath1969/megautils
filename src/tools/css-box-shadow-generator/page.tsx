'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

interface ShadowLayer {
  id: number
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

let nextId = 2

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function shadowToCSS(layer: ShadowLayer): string {
  const inset = layer.inset ? 'inset ' : ''
  return `${inset}${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.spread}px ${hexToRgba(layer.color, layer.opacity)}`
}

export default function CssBoxShadowGeneratorTool() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: 1, offsetX: 4, offsetY: 4, blur: 15, spread: 0, color: '#000000', opacity: 0.2, inset: false },
  ])
  const [boxColor, setBoxColor] = useState('#ffffff')

  const addLayer = () => {
    setLayers(prev => [...prev, { id: nextId++, offsetX: 0, offsetY: 4, blur: 10, spread: 0, color: '#000000', opacity: 0.15, inset: false }])
  }

  const removeLayer = (id: number) => {
    if (layers.length <= 1) return
    setLayers(prev => prev.filter(l => l.id !== id))
  }

  const updateLayer = (id: number, field: keyof ShadowLayer, value: number | string | boolean) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const shadowCSS = useMemo(() => layers.map(shadowToCSS).join(', '), [layers])
  const cssCode = `box-shadow: ${shadowCSS};`

  return (
    <ToolPage
      title="CSS Box Shadow Generator"
      description="Build CSS box shadows visually with multiple layers and live preview."
      category="css"
      categoryLabel="CSS Tools"
      faqs={[
        { question: 'What is the CSS box-shadow property?', answer: 'The box-shadow property adds shadow effects around an element\'s frame, defined by horizontal and vertical offsets, blur radius, spread radius, and color.' },
        { question: 'Can I add multiple box shadows to one element?', answer: 'Yes, CSS supports multiple comma-separated box-shadow values on a single element. This generator lets you add and configure multiple shadow layers.' },
        { question: 'What does the inset keyword do in box-shadow?', answer: 'The inset keyword changes the shadow from an outer shadow (outset) to an inner shadow, making it appear inside the element\'s border.' },
        { question: 'What is the spread value in box-shadow?', answer: 'The spread value controls the size of the shadow. Positive values make the shadow larger than the element, while negative values shrink it.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Shadow Layers</label>
            <button onClick={addLayer} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
              + Add Layer
            </button>
          </div>

          {layers.map((layer, idx) => (
            <div key={layer.id} className="p-3 rounded-lg bg-muted space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Layer {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={layer.inset} onChange={e => updateLayer(layer.id, 'inset', e.target.checked)} className="rounded" />
                    Inset
                  </label>
                  {layers.length > 1 && (
                    <button onClick={() => removeLayer(layer.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Offset X: {layer.offsetX}px</label>
                  <input type="range" min={-50} max={50} value={layer.offsetX} onChange={e => updateLayer(layer.id, 'offsetX', +e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Offset Y: {layer.offsetY}px</label>
                  <input type="range" min={-50} max={50} value={layer.offsetY} onChange={e => updateLayer(layer.id, 'offsetY', +e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Blur: {layer.blur}px</label>
                  <input type="range" min={0} max={100} value={layer.blur} onChange={e => updateLayer(layer.id, 'blur', +e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Spread: {layer.spread}px</label>
                  <input type="range" min={-50} max={50} value={layer.spread} onChange={e => updateLayer(layer.id, 'spread', +e.target.value)} className="w-full" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input type="color" value={layer.color} onChange={e => updateLayer(layer.id, 'color', e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                    <input type="text" value={layer.color} onChange={e => updateLayer(layer.id, 'color', e.target.value)} className="w-20 rounded border border-input bg-transparent px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Opacity: {Math.round(layer.opacity * 100)}%</label>
                  <input type="range" min={0} max={100} value={layer.opacity * 100} onChange={e => updateLayer(layer.id, 'opacity', +e.target.value / 100)} className="w-full mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div className="flex items-center justify-center p-12 rounded-lg" style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50%/20px 20px' }}>
              <div
                className="w-48 h-48 rounded-lg"
                style={{ backgroundColor: boxColor, boxShadow: shadowCSS }}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <label className="text-xs text-muted-foreground">Box Color:</label>
              <input type="color" value={boxColor} onChange={e => setBoxColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">CSS Code</label>
              <CopyButton text={cssCode} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">{cssCode}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
