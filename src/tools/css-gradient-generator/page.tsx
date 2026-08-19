'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

interface ColorStop {
  id: number
  color: string
  position: number
}

let nextId = 3

const GRADIENT_PRESETS = [
  { name: 'Sunset', stops: [{ color: '#FF512F', position: 0 }, { color: '#DD2476', position: 100 }] },
  { name: 'Ocean', stops: [{ color: '#2193b0', position: 0 }, { color: '#6dd5ed', position: 100 }] },
  { name: 'Forest', stops: [{ color: '#11998e', position: 0 }, { color: '#38ef7d', position: 100 }] },
  { name: 'Purple Dream', stops: [{ color: '#8E2DE2', position: 0 }, { color: '#4A00E0', position: 100 }] },
  { name: 'Peach', stops: [{ color: '#ED4264', position: 0 }, { color: '#FFEDBC', position: 100 }] },
  { name: 'Sky', stops: [{ color: '#2980B9', position: 0 }, { color: '#6DD5FA', position: 50 }, { color: '#FFFFFF', position: 100 }] },
  { name: 'Fire', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
  { name: 'Midnight', stops: [{ color: '#232526', position: 0 }, { color: '#414345', position: 100 }] },
  { name: 'Warm', stops: [{ color: '#F2994A', position: 0 }, { color: '#F2C94C', position: 100 }] },
  { name: 'Cool', stops: [{ color: '#56CCF2', position: 0 }, { color: '#2F80ED', position: 100 }] },
  { name: 'Cotton Candy', stops: [{ color: '#D4145A', position: 0 }, { color: '#FBB03B', position: 100 }] },
  { name: 'Emerald', stops: [{ color: '#348F50', position: 0 }, { color: '#56B4D3', position: 100 }] },
  { name: 'Slate', stops: [{ color: '#141E30', position: 0 }, { color: '#243B55', position: 100 }] },
  { name: 'Rose', stops: [{ color: '#ee9ca7', position: 0 }, { color: '#ffdde1', position: 100 }] },
  { name: 'Aqua', stops: [{ color: '#00d2ff', position: 0 }, { color: '#3a7bd5', position: 100 }] },
]

export default function CssGradientGeneratorTool() {
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear')
  const [angle, setAngle] = useState(135)
  const [repeating, setRepeating] = useState(false)
  const [stops, setStops] = useState<ColorStop[]>([
    { id: 1, color: '#3b82f6', position: 0 },
    { id: 2, color: '#8b5cf6', position: 100 },
  ])

  const presetDirections = [
    { label: 'to right', angle: 90 },
    { label: 'to left', angle: 270 },
    { label: 'to bottom', angle: 180 },
    { label: 'to top', angle: 0 },
    { label: 'to bottom right', angle: 135 },
    { label: 'to top left', angle: 315 },
  ]

  const updateStop = (id: number, field: 'color' | 'position', value: string | number) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const addStop = () => {
    setStops(prev => [...prev, { id: nextId++, color: '#10b981', position: 50 }])
  }

  const removeStop = (id: number) => {
    if (stops.length <= 2) return
    setStops(prev => prev.filter(s => s.id !== id))
  }

  const applyPreset = (presetIndex: number) => {
    if (presetIndex < 0) return
    const preset = GRADIENT_PRESETS[presetIndex]
    const newStops = preset.stops.map((s, i) => ({ id: nextId++, color: s.color, position: s.position }))
    setStops(newStops)
  }

  const sortedStops = useMemo(() => [...stops].sort((a, b) => a.position - b.position), [stops])

  const gradientCSS = useMemo(() => {
    const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')
    const prefix = repeating ? 'repeating-' : ''
    if (gradientType === 'linear') return `${prefix}linear-gradient(${angle}deg, ${stopsStr})`
    if (gradientType === 'radial') return `${prefix}radial-gradient(circle, ${stopsStr})`
    return `${prefix}conic-gradient(from ${angle}deg, ${stopsStr})`
  }, [gradientType, angle, sortedStops, repeating])

  const cssCode = `background: ${gradientCSS};`

  return (
    <ToolPage
      title="CSS Gradient Generator"
      description="Build beautiful CSS gradients with live preview. Supports linear and radial gradients."
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is a CSS Gradient Generator?</h2>
          <p>
            A CSS gradient generator is a visual tool that helps you design smooth color transitions — either along a straight line (linear gradient) or radiating from a center point (radial gradient) — and outputs the exact CSS code needed to reproduce the effect in any web page. Writing gradient syntax by hand is error-prone because you must specify the type, angle or shape, and every color stop with its position. This generator lets you adjust all those parameters interactively while a live preview updates in real time, so you can craft pixel-perfect gradients without memorising the specification.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Choose a <strong>gradient type</strong>: <strong>Linear</strong> transitions along a line at a given angle, while <strong>Radial</strong> radiates outward from the center in a circular pattern.</li>
            <li>For linear gradients, set the <strong>angle</strong> using the slider or select a preset direction like "to right" or "to bottom left."</li>
            <li>Adjust the <strong>color stops</strong>: click a color swatch to change its color, drag its position slider to move it along the gradient, or type a HEX value directly. Click <strong>+ Add Stop</strong> to introduce additional colors.</li>
            <li>Watch the <strong>preview panel</strong> update live as you make changes.</li>
            <li>When you are happy with the result, click <strong>Copy</strong> next to the generated CSS code and paste it into your stylesheet.</li>
          </ol>

          <h2>When to Use a CSS Gradient Generator</h2>
          <p>
            Gradients are used for hero section backgrounds, button hover states, overlay effects on images, progress bars, and decorative dividers. They load instantly (no image download required) and scale perfectly to any screen size, making them an excellent performance-friendly alternative to background images. The CSS gradient generator on utilsnow.com is especially handy when you need to experiment with multi-stop gradients or translate a designer's mockup into production-ready code quickly.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Keep gradients <strong>subtle</strong> for backgrounds — large contrast jumps can look garish and distract from content.</li>
            <li>Use <strong>two or three stops</strong> for most UI elements. Adding too many stops increases complexity and can create muddy midtones.</li>
            <li>For smooth transitions between very different hues, add an intermediate stop in a complementary color to avoid a grey "dead zone" in the middle.</li>
            <li>CSS gradients are <strong>treated as images</strong>, so you can layer multiple gradients using comma-separated values in the <code>background</code> property.</li>
            <li>All modern browsers — Chrome, Firefox, Safari, and Edge — support CSS gradients without vendor prefixes, so the generated code works out of the box.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is the difference between linear and radial gradients?', answer: 'A linear gradient transitions colors along a straight line at a specified angle, while a radial gradient radiates colors outward from a center point in a circular or elliptical shape.' },
        { question: 'Are CSS gradients supported in all browsers?', answer: 'Yes. CSS gradients are supported in all modern browsers including Chrome, Firefox, Safari, and Edge. No vendor prefixes are needed for current browser versions.' },
        { question: 'How many color stops can I add to a gradient?', answer: 'There is no practical limit. You can add as many color stops as you need, and each stop can be positioned at a specific percentage along the gradient to create complex color transitions.' },
        { question: 'Can I use a CSS gradient as a background image?', answer: 'Yes. CSS gradients are treated as background images, so you can use them with background-size, combine them with other backgrounds, and even layer multiple gradients together.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="text-sm font-medium mb-2 block">Gradient Type</label>
            <div className="flex gap-2">
              <button onClick={() => setGradientType('linear')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${gradientType === 'linear' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Linear</button>
              <button onClick={() => setGradientType('radial')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${gradientType === 'radial' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Radial</button>
              <button onClick={() => setGradientType('conic')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${gradientType === 'conic' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Conic</button>
            </div>
          </div>

          {/* Repeating Toggle */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={repeating} onChange={e => setRepeating(e.target.checked)} className="rounded" />
              Repeating
            </label>
          </div>

          {/* Angle (linear & conic) */}
          {(gradientType === 'linear' || gradientType === 'conic') && (
            <div>
              <label className="text-sm font-medium mb-2 block">Angle: {angle}deg</label>
              <input type="range" min={0} max={360} value={angle} onChange={e => setAngle(+e.target.value)} className="w-full" />
              {gradientType === 'linear' && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {presetDirections.map(d => (
                    <button key={d.label} onClick={() => setAngle(d.angle)} className="px-2 py-1 rounded text-xs border border-border bg-secondary text-secondary-foreground hover:bg-muted transition-colors">
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="text-sm font-medium mb-2 block">Presets</label>
            <select
              onChange={e => applyPreset(+e.target.value)}
              defaultValue="-1"
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="-1" disabled>Select a preset...</option>
              {GRADIENT_PRESETS.map((p, i) => (
                <option key={p.name} value={i}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Color Stops */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Color Stops</label>
              <button onClick={addStop} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                + Add Stop
              </button>
            </div>
            <div className="space-y-2">
              {stops.map(stop => (
                <div key={stop.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                  <input type="color" value={stop.color} onChange={e => updateStop(stop.id, 'color', e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer" />
                  <input type="text" value={stop.color} onChange={e => updateStop(stop.id, 'color', e.target.value)} className="w-24 rounded border border-input bg-transparent px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
                  <div className="flex-1">
                    <input type="range" min={0} max={100} value={stop.position} onChange={e => updateStop(stop.id, 'position', +e.target.value)} className="w-full" />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{stop.position}%</span>
                  {stops.length > 2 && (
                    <button onClick={() => removeStop(stop.id)} className="text-red-500 hover:text-red-700 text-sm font-bold px-1">X</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div className="w-full h-48 rounded-lg border border-border" style={{ background: gradientCSS }} />
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
