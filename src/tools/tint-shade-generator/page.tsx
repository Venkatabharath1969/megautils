'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  return { r: parseInt(clean.substring(0, 2), 16), g: parseInt(clean.substring(2, 4), 16), b: parseInt(clean.substring(4, 6), 16) }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function generateTints(hex: string, count: number): string[] {
  const { r, g, b } = hexToRgb(hex)
  return Array.from({ length: count }, (_, i) => {
    const factor = (i + 1) / (count + 1)
    return rgbToHex(
      r + (255 - r) * factor,
      g + (255 - g) * factor,
      b + (255 - b) * factor
    )
  })
}

function generateShades(hex: string, count: number): string[] {
  const { r, g, b } = hexToRgb(hex)
  return Array.from({ length: count }, (_, i) => {
    const factor = (i + 1) / (count + 1)
    return rgbToHex(
      r * (1 - factor),
      g * (1 - factor),
      b * (1 - factor)
    )
  })
}

function textColorForBg(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

export default function TintShadeGeneratorTool() {
  const [baseColor, setBaseColor] = useState('#3b82f6')

  const tints = useMemo(() => generateTints(baseColor, 10), [baseColor])
  const shades = useMemo(() => generateShades(baseColor, 10), [baseColor])

  const allTintsHex = tints.map(c => c.toUpperCase()).join(', ')
  const allShadesHex = shades.map(c => c.toUpperCase()).join(', ')
  const fullScale = [...shades.reverse(), baseColor, ...tints]

  return (
    <ToolPage title="Tint & Shade Generator" description="Generate 10 tints (lighter) and 10 shades (darker) from any base color." category="color" categoryLabel="Color Tools">
      <div className="space-y-6">
        {/* Base Color Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">Base Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={baseColor}
              onChange={e => setBaseColor(e.target.value)}
              className="w-12 h-12 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={baseColor}
              onChange={e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setBaseColor(e.target.value) }}
              className="w-28 rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Full Scale Strip */}
        <div>
          <label className="text-sm font-medium mb-2 block">Full Scale (Darkest to Lightest)</label>
          <div className="flex rounded-lg overflow-hidden border border-border h-16">
            {fullScale.map((color, i) => (
              <div key={i} className="flex-1 relative group" style={{ backgroundColor: color }}>
                {color === baseColor && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/80" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tints */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Tints (Lighter)</label>
            <CopyButton text={allTintsHex} />
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {tints.map((color, i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden">
                <div
                  className="h-16 flex items-end justify-center pb-1"
                  style={{ backgroundColor: color }}
                >
                  <span className="text-[9px] font-mono font-bold" style={{ color: textColorForBg(color) }}>
                    {(((i + 1) / 11) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-1 text-center">
                  <p className="text-[9px] font-mono truncate">{color.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shades */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Shades (Darker)</label>
            <CopyButton text={allShadesHex} />
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {shades.map((color, i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden">
                <div
                  className="h-16 flex items-end justify-center pb-1"
                  style={{ backgroundColor: color }}
                >
                  <span className="text-[9px] font-mono font-bold" style={{ color: textColorForBg(color) }}>
                    {(((i + 1) / 11) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-1 text-center">
                  <p className="text-[9px] font-mono truncate">{color.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
