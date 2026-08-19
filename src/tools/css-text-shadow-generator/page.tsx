'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

interface TextShadowLayer {
  id: number
  offsetX: number
  offsetY: number
  blur: number
  color: string
  opacity: number
}

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function layerToCSS(l: TextShadowLayer): string {
  return `${l.offsetX}px ${l.offsetY}px ${l.blur}px ${hexToRgba(l.color, l.opacity)}`
}

let nextLayerId = 2

interface TextShadowPreset {
  name: string
  layers: Omit<TextShadowLayer, 'id'>[]
  textColor?: string
  bgColor?: string
}

const textShadowPresets: TextShadowPreset[] = [
  { name: 'Neon Glow', layers: [{ offsetX: 0, offsetY: 0, blur: 7, color: '#00ff00', opacity: 1 }, { offsetX: 0, offsetY: 0, blur: 10, color: '#00ff00', opacity: 0.8 }, { offsetX: 0, offsetY: 0, blur: 21, color: '#00ff00', opacity: 0.6 }, { offsetX: 0, offsetY: 0, blur: 42, color: '#00ff00', opacity: 0.4 }], textColor: '#ffffff', bgColor: '#111111' },
  { name: '3D Emboss', layers: [{ offsetX: 1, offsetY: 1, blur: 0, color: '#ffffff', opacity: 0.6 }, { offsetX: -1, offsetY: -1, blur: 0, color: '#000000', opacity: 0.3 }], textColor: '#888888', bgColor: '#cccccc' },
  { name: 'Long Shadow', layers: [{ offsetX: 1, offsetY: 1, blur: 0, color: '#000000', opacity: 0.15 }, { offsetX: 2, offsetY: 2, blur: 0, color: '#000000', opacity: 0.13 }, { offsetX: 3, offsetY: 3, blur: 0, color: '#000000', opacity: 0.11 }, { offsetX: 4, offsetY: 4, blur: 0, color: '#000000', opacity: 0.09 }, { offsetX: 5, offsetY: 5, blur: 0, color: '#000000', opacity: 0.07 }], textColor: '#ffffff', bgColor: '#3b82f6' },
  { name: 'Letterpress', layers: [{ offsetX: 0, offsetY: 1, blur: 0, color: '#ffffff', opacity: 0.5 }, { offsetX: 0, offsetY: -1, blur: 0, color: '#000000', opacity: 0.3 }], textColor: '#555555', bgColor: '#aaaaaa' },
  { name: 'Outline', layers: [{ offsetX: -1, offsetY: -1, blur: 0, color: '#000000', opacity: 1 }, { offsetX: 1, offsetY: -1, blur: 0, color: '#000000', opacity: 1 }, { offsetX: -1, offsetY: 1, blur: 0, color: '#000000', opacity: 1 }, { offsetX: 1, offsetY: 1, blur: 0, color: '#000000', opacity: 1 }], textColor: '#ffffff', bgColor: '#3b82f6' },
]

export default function CssTextShadowGeneratorTool() {
  const [layers, setLayers] = useState<TextShadowLayer[]>([
    { id: 1, offsetX: 2, offsetY: 2, blur: 4, color: '#000000', opacity: 0.5 },
  ])
  const [textColor, setTextColor] = useState('#1f2937')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog')
  const [fontSize, setFontSize] = useState(32)

  const addLayer = () => {
    setLayers(prev => [...prev, { id: nextLayerId++, offsetX: 0, offsetY: 2, blur: 4, color: '#000000', opacity: 0.3 }])
  }

  const removeLayer = (id: number) => {
    if (layers.length <= 1) return
    setLayers(prev => prev.filter(l => l.id !== id))
  }

  const updateLayer = (id: number, field: keyof TextShadowLayer, value: number | string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const applyPreset = (preset: TextShadowPreset) => {
    setLayers(preset.layers.map(l => ({ ...l, id: nextLayerId++ })))
    if (preset.textColor) setTextColor(preset.textColor)
    if (preset.bgColor) setBgColor(preset.bgColor)
  }

  const shadowCSS = useMemo(
    () => layers.map(layerToCSS).join(', '),
    [layers]
  )

  const cssCode = `text-shadow: ${shadowCSS};`

  return (
    <ToolPage
      title="CSS Text Shadow Generator"
      description="Design CSS text shadows visually with live preview."
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSS Text Shadow Generator is a free browser-based tool that lets you create text shadow effects visually by adjusting offset, blur radius, and color for one or multiple shadow layers. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Use the visual controls (sliders, color pickers, toggles) to design your effect.</li>
            <li>See the <strong>live preview</strong> update in real time as you adjust settings.</li>
            <li>Review the generated <strong>CSS code</strong> in the code panel below.</li>
            <li>Click <strong>Copy CSS</strong> to paste the code directly into your stylesheet.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when adding depth to headings, creating neon glow effects, or making text stand out against complex backgrounds. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is the CSS text-shadow property?', answer: 'The text-shadow property adds shadow effects to text, defined by horizontal offset, vertical offset, blur radius, and color values.' },
        { question: 'Can I add multiple text shadows to one element?', answer: 'Yes, you can apply multiple text shadows by separating each shadow definition with a comma, which is useful for creating glow effects or 3D text.' },
        { question: 'How do I create a text glow effect with CSS?', answer: 'Set both offsets to 0 and use a large blur radius with a bright color to create a glow effect around your text.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Effect Presets</label>
            <div className="flex flex-wrap gap-2">
              {textShadowPresets.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors">{p.name}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Shadow Layers</label>
            <button onClick={addLayer} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">+ Add Layer</button>
          </div>

          {layers.map((layer, idx) => (
            <div key={layer.id} className="p-3 rounded-lg bg-muted space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Layer {idx + 1}</span>
                {layers.length > 1 && (
                  <button onClick={() => removeLayer(layer.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                )}
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
                  <input type="range" min={0} max={50} value={layer.blur} onChange={e => updateLayer(layer.id, 'blur', +e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Opacity: {Math.round(layer.opacity * 100)}%</label>
                  <input type="range" min={0} max={100} value={layer.opacity * 100} onChange={e => updateLayer(layer.id, 'opacity', +e.target.value / 100)} className="w-full" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Color</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={layer.color} onChange={e => updateLayer(layer.id, 'color', e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                  <input type="text" value={layer.color} onChange={e => updateLayer(layer.id, 'color', e.target.value)} className="w-20 rounded border border-input bg-transparent px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Text Color</label>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Background Color</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Font Size: {fontSize}px</label>
            <input type="range" min={12} max={72} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Sample Text</label>
            <input type="text" value={sampleText} onChange={e => setSampleText(e.target.value)} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div
              className="rounded-lg border border-border p-8 min-h-[200px] flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <p
                className="font-bold text-center break-words max-w-full"
                style={{
                  color: textColor,
                  textShadow: shadowCSS,
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.3,
                }}
              >
                {sampleText}
              </p>
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
