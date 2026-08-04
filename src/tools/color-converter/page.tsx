'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max
  let h = 0
  if (max !== min) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v } }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  }
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; v /= 100
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s), q2 = v * (1 - f * s), t = v * (1 - (1 - f) * s)
  let r = 0, g = 0, b = 0
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break
    case 1: r = q2; g = v; b = p; break
    case 2: r = p; g = v; b = t; break
    case 3: r = p; g = q2; b = v; break
    case 4: r = t; g = p; b = v; break
    case 5: r = v; g = p; b = q2; break
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

type Format = 'hex' | 'rgb' | 'hsl' | 'hsv'

function parseInput(format: Format, value: string): { r: number; g: number; b: number } | null {
  value = value.trim()
  if (format === 'hex') {
    let clean = value.replace('#', '')
    if (/^[0-9a-f]{3}$/i.test(clean)) clean = clean[0]+clean[0]+clean[1]+clean[1]+clean[2]+clean[2]
    if (!/^[0-9a-f]{6}$/i.test(clean)) return null
    return hexToRgb('#' + clean)
  }
  if (format === 'rgb') {
    const m = value.match(/^(?:rgb\s*\()?\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)?$/i)
    if (!m) return null
    return { r: Math.min(255, +m[1]), g: Math.min(255, +m[2]), b: Math.min(255, +m[3]) }
  }
  if (format === 'hsl') {
    const m = value.match(/^(?:hsl\s*\()?\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*\)?$/i)
    if (!m) return null
    return hslToRgb(+m[1], +m[2], +m[3])
  }
  if (format === 'hsv') {
    const m = value.match(/^(?:hsv\s*\()?\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*\)?$/i)
    if (!m) return null
    return hsvToRgb(+m[1], +m[2], +m[3])
  }
  return null
}

export default function ColorConverterTool() {
  const [format, setFormat] = useState<Format>('hex')
  const [input, setInput] = useState('#3b82f6')

  const rgb = useMemo(() => parseInput(format, input), [format, input])

  const formats: Format[] = ['hex', 'rgb', 'hsl', 'hsv']
  const placeholders: Record<Format, string> = {
    hex: '#3b82f6',
    rgb: '59, 130, 246',
    hsl: '217, 91%, 60%',
    hsv: '217, 76%, 96%',
  }

  const results = useMemo(() => {
    if (!rgb) return null
    const { r, g, b } = rgb
    const hsl = rgbToHsl(r, g, b)
    const hsv = rgbToHsv(r, g, b)
    return {
      hex: rgbToHex(r, g, b).toUpperCase(),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    }
  }, [rgb])

  return (
    <ToolPage title="Color Converter" description="Convert colors between HEX, RGB, HSL, and HSV formats with live preview." category="color" categoryLabel="Color Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Input Format</label>
            <div className="flex gap-2 flex-wrap">
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => { setFormat(f); setInput('') }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${format === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Input Value</label>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={placeholders[format]}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {rgb && (
            <div>
              <label className="text-sm font-medium mb-2 block">Preview</label>
              <div
                className="w-full h-24 rounded-lg border border-border"
                style={{ backgroundColor: results?.hex || '#000' }}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium block">Converted Values</label>
          {!rgb && <p className="text-sm text-muted-foreground">Enter a valid color to see conversions.</p>}
          {results && Object.entries(results).map(([key, value]) => (
            <div key={key} className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">{key.toUpperCase()}</span>
                <CopyButton text={value} />
              </div>
              <p className="text-sm font-mono">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  )
}
