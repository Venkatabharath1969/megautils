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

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  h /= 360
  if (s === 0) { const v = Math.round(l * 255); return rgbToHex(v, v, v) }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return rgbToHex(
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
  )
}

type PaletteType = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic'

function generatePalette(hex: string, type: PaletteType): { hex: string; label: string }[] {
  const { r, g, b } = hexToRgb(hex)
  const [h, s, l] = rgbToHsl(r, g, b)

  switch (type) {
    case 'complementary':
      return [
        { hex: hex, label: 'Base' },
        { hex: hslToHex(h + 180, s, l), label: 'Complementary' },
      ]
    case 'analogous':
      return [
        { hex: hslToHex(h - 30, s, l), label: '-30deg' },
        { hex: hex, label: 'Base' },
        { hex: hslToHex(h + 30, s, l), label: '+30deg' },
      ]
    case 'triadic':
      return [
        { hex: hex, label: 'Base' },
        { hex: hslToHex(h + 120, s, l), label: '+120deg' },
        { hex: hslToHex(h + 240, s, l), label: '+240deg' },
      ]
    case 'tetradic':
      return [
        { hex: hex, label: 'Base' },
        { hex: hslToHex(h + 90, s, l), label: '+90deg' },
        { hex: hslToHex(h + 180, s, l), label: '+180deg' },
        { hex: hslToHex(h + 270, s, l), label: '+270deg' },
      ]
    case 'monochromatic':
      return [
        { hex: hslToHex(h, s, Math.max(0, l - 0.3)), label: 'Darkest' },
        { hex: hslToHex(h, s, Math.max(0, l - 0.15)), label: 'Darker' },
        { hex: hex, label: 'Base' },
        { hex: hslToHex(h, s, Math.min(1, l + 0.15)), label: 'Lighter' },
        { hex: hslToHex(h, s, Math.min(1, l + 0.3)), label: 'Lightest' },
      ]
  }
}

export default function ColorPaletteGeneratorTool() {
  const [baseColor, setBaseColor] = useState('#3b82f6')
  const [paletteType, setPaletteType] = useState<PaletteType>('complementary')

  const paletteTypes: { value: PaletteType; label: string }[] = [
    { value: 'complementary', label: 'Complementary' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'tetradic', label: 'Tetradic' },
    { value: 'monochromatic', label: 'Monochromatic' },
  ]

  const palette = useMemo(() => generatePalette(baseColor, paletteType), [baseColor, paletteType])
  const paletteHexes = palette.map(p => p.hex.toUpperCase()).join(', ')

  return (
    <ToolPage
      title="Color Palette Generator"
      description="Generate complementary, analogous, triadic, tetradic, and monochromatic palettes from a base color."
      category="color"
      categoryLabel="Color Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Color Palette Generator is a free browser-based tool that lets you generate harmonious color palettes using color theory rules like complementary, analogous, triadic, and split-complementary schemes. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Pick a color using the visual color picker or enter a value in any format (HEX, RGB, HSL).</li>
            <li>View instant conversions across all supported color formats.</li>
            <li>Use the generated palette, contrast ratios, or name suggestions as needed.</li>
            <li>Copy any color value with one click for use in your design or code.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating cohesive color schemes for websites, apps, brand identities, or interior design. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this design tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Use the HEX format for CSS and web design, RGB for programmatic color manipulation, and HSL for intuitive hue adjustments.</li>
            <li>Always check contrast ratios against WCAG guidelines when choosing text and background color combinations.</li>
            <li>Save color palettes by bookmarking the page or copying values to your design system documentation.</li>
            <li>Consider color blindness accessibility — test your palette with a contrast checker tool.</li>
            <li>All color processing runs locally with no server communication required.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is a complementary color palette?', answer: 'A complementary palette uses two colors opposite each other on the color wheel (180 degrees apart), creating high contrast and visual impact.' },
        { question: 'What is the difference between analogous, triadic, and tetradic palettes?', answer: 'Analogous uses neighboring hues (30 degrees apart), triadic uses three evenly spaced hues (120 degrees), and tetradic uses four hues (90 degrees apart).' },
        { question: 'How do I generate a color palette from a base color?', answer: 'Pick or enter a base color, then select a palette type. The tool instantly generates harmonious colors based on color theory relationships.' },
        { question: 'What is a monochromatic color palette?', answer: 'A monochromatic palette uses different shades, tints, and tones of a single hue by varying its lightness while keeping the same base color.' },
      ]}
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
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

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Palette Type</label>
            <div className="flex gap-2 flex-wrap">
              {paletteTypes.map(pt => (
                <button
                  key={pt.value}
                  onClick={() => setPaletteType(pt.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${paletteType === pt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Palette Display */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Generated Palette</label>
            <CopyButton text={paletteHexes} />
          </div>

          {/* Color Strip */}
          <div className="flex rounded-lg overflow-hidden border border-border h-24">
            {palette.map((color, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: color.hex }} />
            ))}
          </div>

          {/* Individual Colors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
            {palette.map((color, i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden">
                <div className="h-16" style={{ backgroundColor: color.hex }} />
                <div className="p-2 text-center">
                  <p className="text-xs text-muted-foreground">{color.label}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <p className="text-xs font-mono font-semibold">{color.hex.toUpperCase()}</p>
                    <CopyButton text={color.hex.toUpperCase()} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
