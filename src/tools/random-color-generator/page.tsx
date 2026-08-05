'use client'

import { useState, useCallback } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function randomHex(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgb(${r}, ${g}, ${b})`
}

function hexToHsl(hex: string): string {
  const clean = hex.replace('#', '')
  let r = parseInt(clean.substring(0, 2), 16) / 255
  let g = parseInt(clean.substring(2, 4), 16) / 255
  let b = parseInt(clean.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return `hsl(0, 0%, ${Math.round(l * 100)}%)`
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function textColorForBg(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

export default function RandomColorGeneratorTool() {
  const [singleColor, setSingleColor] = useState(randomHex())
  const [bulkColors, setBulkColors] = useState<string[]>([])

  const generateSingle = useCallback(() => setSingleColor(randomHex()), [])
  const generateBulk = useCallback((count: number) => {
    setBulkColors(Array.from({ length: count }, () => randomHex()))
  }, [])

  return (
    <ToolPage
      title="Random Color Generator"
      description="Generate random colors with HEX, RGB, and HSL values."
      category="color"
      categoryLabel="Color Tools"
      faqs={[
        { question: 'How do I generate a random color?', answer: 'Click the "Generate" button and a random color is created instantly with its HEX, RGB, and HSL values ready to copy.' },
        { question: 'Can I generate multiple random colors at once?', answer: 'Yes, use the bulk generate buttons to create 5, 10, or 20 random colors simultaneously for palette inspiration.' },
        { question: 'Are the generated colors truly random?', answer: 'Yes, each color is generated using a random number across the full 16.7 million color spectrum (0x000000 to 0xFFFFFF).' },
        { question: 'How do I copy a generated color code?', answer: 'Click the copy button next to any HEX, RGB, or HSL value to copy it to your clipboard for use in your design or code.' },
      ]}
    >
      <div className="space-y-6">
        {/* Single Color */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Random Color</label>
            <button
              onClick={generateSingle}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Generate
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="h-40 rounded-lg border border-border flex items-center justify-center"
              style={{ backgroundColor: singleColor }}
            >
              <span className="text-2xl font-bold font-mono" style={{ color: textColorForBg(singleColor) }}>
                {singleColor.toUpperCase()}
              </span>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">HEX</span>
                  <CopyButton text={singleColor.toUpperCase()} />
                </div>
                <p className="text-sm font-mono mt-1">{singleColor.toUpperCase()}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">RGB</span>
                  <CopyButton text={hexToRgb(singleColor)} />
                </div>
                <p className="text-sm font-mono mt-1">{hexToRgb(singleColor)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">HSL</span>
                  <CopyButton text={hexToHsl(singleColor)} />
                </div>
                <p className="text-sm font-mono mt-1">{hexToHsl(singleColor)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Generate */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Bulk Generate</label>
            <div className="flex gap-2">
              {[5, 10, 20].map(count => (
                <button
                  key={count}
                  onClick={() => generateBulk(count)}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  {count} Colors
                </button>
              ))}
            </div>
          </div>

          {bulkColors.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{bulkColors.length} colors generated</span>
                <CopyButton text={bulkColors.map(c => c.toUpperCase()).join('\n')} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {bulkColors.map((color, i) => (
                  <div key={i} className="rounded-lg border border-border overflow-hidden">
                    <div
                      className="h-20 flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-xs font-mono font-bold" style={{ color: textColorForBg(color) }}>
                        {color.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-2 flex justify-center">
                      <CopyButton text={color.toUpperCase()} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
