'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
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

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
}

function parseColorInput(value: string): string | null {
  value = value.trim()
  // HEX
  if (/^#?[0-9a-f]{6}$/i.test(value)) {
    return value.startsWith('#') ? value : '#' + value
  }
  if (/^#?[0-9a-f]{3}$/i.test(value)) {
    const short = value.replace('#', '')
    return '#' + short[0] + short[0] + short[1] + short[1] + short[2] + short[2]
  }
  // RGB
  const rgbMatch = value.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]))
  }
  // HSL
  const hslMatch = value.match(/^hsl\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*\)$/i)
  if (hslMatch) {
    const { r, g, b } = hslToRgb(parseInt(hslMatch[1]), parseInt(hslMatch[2]), parseInt(hslMatch[3]))
    return rgbToHex(r, g, b)
  }
  return null
}

export default function ColorPickerTool() {
  const [hex, setHex] = useState('#3b82f6')
  const [manualInput, setManualInput] = useState('')

  const rgb = useMemo(() => hexToRgb(hex), [hex])
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null, [rgb])

  const hexStr = hex.toUpperCase()
  const rgbStr = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ''
  const hslStr = hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : ''

  const handleManualApply = () => {
    const parsed = parseColorInput(manualInput)
    if (parsed) setHex(parsed)
  }

  return (
    <ToolPage
      title="Color Picker"
      description="Pick a color and get HEX, RGB, and HSL values. Copy any format."
      category="color"
      categoryLabel="Color Tools"
      helpContent={
        <>
          <h2>What is a Color Picker?</h2>
          <p>
            A color picker is a design utility that lets you select a color visually and instantly receive its value in multiple formats — HEX, RGB, and HSL — ready to paste into CSS, design software, or any application that accepts color codes. Colors on the web are defined numerically, but the relationship between those numbers and what you actually see on screen is not intuitive. A visual picker bridges that gap by letting you choose the exact shade you want and translating it into every format you might need.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Click the <strong>color swatch</strong> on the left to open your browser's native color picker and drag to the exact shade you want.</li>
            <li>Alternatively, type a color value into the <strong>Manual Input</strong> field — you can enter HEX (<code>#ff5733</code>), RGB (<code>rgb(255, 87, 51)</code>), or HSL (<code>hsl(11, 100%, 60%)</code>) — then press <strong>Enter</strong> or click <strong>Apply</strong>.</li>
            <li>All three format cards on the right — <strong>HEX</strong>, <strong>RGB</strong>, and <strong>HSL</strong> — update instantly, along with the individual R, G, and B channel values.</li>
            <li>Click the <strong>Copy</strong> button next to any format to send it directly to your clipboard for use in stylesheets, design files, or code.</li>
          </ol>

          <h2>When to Use a Color Picker</h2>
          <p>
            Designers and front-end developers reach for a color picker when building a brand palette, matching colors from a mockup, checking contrast ratios for accessibility, or converting between formats for different tools. It is especially useful when a client provides a color in one format (say, a Pantone or HEX code) and your project requires another (HSL for programmatic theming, for example). The color picker on utilsnow.com converts instantly between all three web-standard formats in your browser.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li><strong>HEX</strong> is the most common format in CSS and design tools. Use it for static color definitions.</li>
            <li>Choose <strong>RGB/RGBA</strong> when you need an alpha (transparency) channel — e.g., <code>rgba(59, 130, 246, 0.5)</code>.</li>
            <li><strong>HSL</strong> is ideal for generating tints and shades programmatically: keep the hue constant and adjust saturation and lightness to build a cohesive scale.</li>
            <li>Ensure your chosen color meets <strong>WCAG contrast requirements</strong> (at least 4.5:1 for normal text) to keep your content accessible to all users.</li>
            <li>When sampling a color from an image or screenshot, open the image in a new tab and use your operating system's eyedropper, then paste the result into the manual input field to get all formats at once.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is the difference between HEX, RGB, and HSL?', answer: 'HEX uses a 6-digit hexadecimal code (e.g., #3B82F6), RGB defines color by red/green/blue intensity (0-255), and HSL describes color by hue, saturation, and lightness — all represent the same color in different formats.' },
        { question: 'Which color format should I use in CSS?', answer: 'HEX is most common for solid colors, RGB/RGBA is best when you need transparency, and HSL is ideal when you want to programmatically adjust hue, saturation, or lightness.' },
        { question: 'Can I enter a color code manually instead of using the picker?', answer: 'Yes. Use the manual input field to type any HEX, RGB, or HSL value and click Apply (or press Enter) to convert it to all formats instantly.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Picker */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Pick a Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={hex}
                onChange={e => setHex(e.target.value)}
                className="w-20 h-20 rounded-lg border border-border cursor-pointer"
              />
              <div
                className="flex-1 h-20 rounded-lg border border-border"
                style={{ backgroundColor: hex }}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Manual Input (HEX, RGB, or HSL)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualApply()}
                placeholder="e.g. #ff5733, rgb(255,87,51), hsl(11,100%,60%)"
                className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleManualApply}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Right: Values */}
        <div className="space-y-3">
          <label className="text-sm font-medium block">Color Values</label>

          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground">HEX</span>
              <CopyButton text={hexStr} />
            </div>
            <p className="text-sm font-mono">{hexStr}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground">RGB</span>
              <CopyButton text={rgbStr} />
            </div>
            <p className="text-sm font-mono">{rgbStr}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground">HSL</span>
              <CopyButton text={hslStr} />
            </div>
            <p className="text-sm font-mono">{hslStr}</p>
          </div>

          {rgb && (
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">RGB Values</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div><span className="text-red-500">R:</span> {rgb.r}</div>
                <div><span className="text-green-500">G:</span> {rgb.g}</div>
                <div><span className="text-blue-500">B:</span> {rgb.b}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
