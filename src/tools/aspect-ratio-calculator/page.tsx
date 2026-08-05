'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  while (b) { [a, b] = [b, a % b] }
  return a
}

const PRESETS = [
  { label: '16:9', w: 16, h: 9, desc: 'Widescreen (HD, 4K)' },
  { label: '4:3', w: 4, h: 3, desc: 'Traditional TV' },
  { label: '1:1', w: 1, h: 1, desc: 'Square (Instagram)' },
  { label: '21:9', w: 21, h: 9, desc: 'Ultra-wide' },
  { label: '3:2', w: 3, h: 2, desc: 'Classic film / DSLR' },
  { label: '9:16', w: 9, h: 16, desc: 'Vertical video (Reels, TikTok)' },
  { label: '2:1', w: 2, h: 1, desc: 'Univisium' },
  { label: '5:4', w: 5, h: 4, desc: 'Old monitors' },
]

export default function AspectRatioCalculatorTool() {
  const [width, setWidth] = useState('1920')
  const [height, setHeight] = useState('1080')
  const [ratioW, setRatioW] = useState('')
  const [ratioH, setRatioH] = useState('')
  const [calcDim, setCalcDim] = useState<'width' | 'height'>('height')
  const [knownValue, setKnownValue] = useState('1920')

  const ratio = useMemo(() => {
    const w = parseFloat(width)
    const h = parseFloat(height)
    if (!w || !h || w <= 0 || h <= 0) return null
    const d = gcd(w, h)
    return { w: w / d, h: h / d, decimal: (w / h).toFixed(4) }
  }, [width, height])

  const calculatedDim = useMemo(() => {
    const rw = parseFloat(ratioW)
    const rh = parseFloat(ratioH)
    const known = parseFloat(knownValue)
    if (!rw || !rh || !known || rw <= 0 || rh <= 0 || known <= 0) return null
    if (calcDim === 'height') {
      return Math.round(known * (rh / rw))
    }
    return Math.round(known * (rw / rh))
  }, [ratioW, ratioH, calcDim, knownValue])

  return (
    <ToolPage title="Aspect Ratio Calculator" description="Calculate aspect ratios from dimensions or find missing dimensions from a ratio" category="math" categoryLabel="Math & Science"
      faqs={[
        { question: 'What is the aspect ratio of 1920x1080?', answer: '1920x1080 has an aspect ratio of 16:9, which is the standard widescreen format used for HD and 4K displays, YouTube videos, and most modern monitors.' },
        { question: 'What aspect ratio is best for Instagram?', answer: 'Instagram supports 1:1 (square) for feed posts, 4:5 (portrait) for maximum feed visibility, and 9:16 (vertical) for Stories and Reels.' },
        { question: 'How do I calculate aspect ratio from pixel dimensions?', answer: 'Divide both the width and height by their greatest common divisor (GCD). For example, 1920/120 = 16 and 1080/120 = 9, giving a 16:9 ratio.' },
      ]}
    >
      <div className="space-y-8">
        {/* Section 1: Calculate Ratio */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Calculate Aspect Ratio</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-32 px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="1920"
              />
            </div>
            <span className="text-lg font-bold pb-2">x</span>
            <div>
              <label className="text-sm font-medium block mb-1">Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-32 px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="1080"
              />
            </div>
            {ratio && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div>
                  <div className="text-2xl font-bold text-primary">{ratio.w}:{ratio.h}</div>
                  <div className="text-xs text-muted-foreground">Decimal: {ratio.decimal}</div>
                </div>
                <CopyButton text={`${ratio.w}:${ratio.h}`} />
              </div>
            )}
          </div>

          {/* Visual preview */}
          {ratio && (
            <div className="mt-4 flex items-center gap-4">
              <div
                className="border-2 border-primary bg-primary/10 rounded"
                style={{
                  width: `${Math.min(200, ratio.w * 10)}px`,
                  height: `${Math.min(200, ratio.h * 10)}px`,
                  maxWidth: '200px',
                  maxHeight: '200px',
                }}
              />
              <span className="text-sm text-muted-foreground">{width} x {height}</span>
            </div>
          )}
        </div>

        {/* Section 2: Calculate Missing Dimension */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Calculate Missing Dimension</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Ratio Width</label>
              <input
                type="number"
                value={ratioW}
                onChange={(e) => setRatioW(e.target.value)}
                className="w-24 px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="16"
              />
            </div>
            <span className="text-lg font-bold pb-2">:</span>
            <div>
              <label className="text-sm font-medium block mb-1">Ratio Height</label>
              <input
                type="number"
                value={ratioH}
                onChange={(e) => setRatioH(e.target.value)}
                className="w-24 px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="9"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Known {calcDim === 'height' ? 'Width' : 'Height'}</label>
              <input
                type="number"
                value={knownValue}
                onChange={(e) => setKnownValue(e.target.value)}
                className="w-32 px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={() => setCalcDim(calcDim === 'height' ? 'width' : 'height')}
              className="px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
            >
              Find {calcDim === 'height' ? 'Height' : 'Width'}
            </button>
            {calculatedDim !== null && (
              <div className="p-3 rounded-lg bg-muted">
                <span className="text-sm text-muted-foreground">{calcDim === 'height' ? 'Height' : 'Width'}: </span>
                <span className="text-xl font-bold text-primary">{calculatedDim}px</span>
              </div>
            )}
          </div>
        </div>

        {/* Presets */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Common Aspect Ratios</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => { setWidth(String(p.w * 100)); setHeight(String(p.h * 100)) }}
                className="p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
              >
                <div className="text-lg font-bold text-primary">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
