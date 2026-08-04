'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

type ShapeType = 'flat' | 'concave' | 'convex' | 'pressed'
type LightSource = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export default function NeumorphismGeneratorTool() {
  const [baseColor, setBaseColor] = useState('#e0e0e0')
  const [size, setSize] = useState(200)
  const [borderRadius, setBorderRadius] = useState(30)
  const [distance, setDistance] = useState(10)
  const [intensity, setIntensity] = useState(15)
  const [blur, setBlur] = useState(20)
  const [shape, setShape] = useState<ShapeType>('flat')
  const [lightSource, setLightSource] = useState<LightSource>('top-left')

  const result = useMemo(() => {
    const hsl = hexToHSL(baseColor)

    const lightColor = hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + intensity))
    const darkColor = hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - intensity))

    // Direction offsets based on light source
    const dirMap: Record<LightSource, { x: number; y: number }> = {
      'top-left': { x: -1, y: -1 },
      'top-right': { x: 1, y: -1 },
      'bottom-left': { x: -1, y: 1 },
      'bottom-right': { x: 1, y: 1 },
    }
    const dir = dirMap[lightSource]

    let boxShadow: string
    let background: string

    if (shape === 'pressed') {
      boxShadow = `inset ${dir.x * distance}px ${dir.y * distance}px ${blur}px ${darkColor}, inset ${-dir.x * distance}px ${-dir.y * distance}px ${blur}px ${lightColor}`
      background = baseColor
    } else {
      boxShadow = `${dir.x * distance}px ${dir.y * distance}px ${blur}px ${darkColor}, ${-dir.x * distance}px ${-dir.y * distance}px ${blur}px ${lightColor}`

      if (shape === 'concave') {
        background = `linear-gradient(${lightSource === 'top-left' ? '145deg' : lightSource === 'top-right' ? '215deg' : lightSource === 'bottom-left' ? '35deg' : '325deg'}, ${darkColor}, ${lightColor})`
      } else if (shape === 'convex') {
        background = `linear-gradient(${lightSource === 'top-left' ? '145deg' : lightSource === 'top-right' ? '215deg' : lightSource === 'bottom-left' ? '35deg' : '325deg'}, ${lightColor}, ${darkColor})`
      } else {
        background = baseColor
      }
    }

    const cssCode = [
      `border-radius: ${borderRadius}px;`,
      `background: ${background};`,
      `box-shadow: ${boxShadow};`,
    ].join('\n')

    return { boxShadow, background, cssCode, lightColor, darkColor }
  }, [baseColor, borderRadius, distance, intensity, blur, shape, lightSource])

  const shapes: { value: ShapeType; label: string }[] = [
    { value: 'flat', label: 'Flat' },
    { value: 'concave', label: 'Concave' },
    { value: 'convex', label: 'Convex' },
    { value: 'pressed', label: 'Pressed' },
  ]

  const lightSources: { value: LightSource; label: string }[] = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ]

  return (
    <ToolPage
      title="Neumorphism Generator"
      description="Generate soft UI (neumorphism) CSS with customizable shadows, shapes, and light direction. Live preview included."
      category="css"
      categoryLabel="CSS Tools"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Base Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer" />
              <input type="text" value={baseColor} onChange={e => setBaseColor(e.target.value)} className="w-28 rounded border border-input bg-transparent px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Shape</label>
            <div className="flex gap-2 flex-wrap">
              {shapes.map(s => (
                <button key={s.value} onClick={() => setShape(s.value)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${shape === s.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Light Source</label>
            <div className="grid grid-cols-2 gap-2 w-32">
              {lightSources.map(ls => (
                <button key={ls.value} onClick={() => setLightSource(ls.value)} className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${lightSource === ls.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                  {ls.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Size: {size}px</label>
            <input type="range" min={80} max={400} value={size} onChange={e => setSize(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Border Radius: {borderRadius}px</label>
            <input type="range" min={0} max={100} value={borderRadius} onChange={e => setBorderRadius(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Distance: {distance}px</label>
            <input type="range" min={1} max={50} value={distance} onChange={e => setDistance(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Intensity: {intensity}%</label>
            <input type="range" min={1} max={40} value={intensity} onChange={e => setIntensity(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Blur: {blur}px</label>
            <input type="range" min={0} max={80} value={blur} onChange={e => setBlur(+e.target.value)} className="w-full" />
          </div>
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div className="rounded-lg border border-border p-8 flex items-center justify-center" style={{ background: baseColor, minHeight: 320 }}>
              <div
                style={{
                  width: size,
                  height: size,
                  borderRadius: borderRadius,
                  background: result.background,
                  boxShadow: result.boxShadow,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">CSS Code</label>
              <CopyButton text={result.cssCode} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre overflow-x-auto">{result.cssCode}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
