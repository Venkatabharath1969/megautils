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
  const [stepCount, setStepCount] = useState(10)
  const [copiedVars, setCopiedVars] = useState(false)

  const tints = useMemo(() => generateTints(baseColor, stepCount), [baseColor, stepCount])
  const shades = useMemo(() => generateShades(baseColor, stepCount), [baseColor, stepCount])

  const allTintsHex = tints.map(c => c.toUpperCase()).join(', ')
  const allShadesHex = shades.map(c => c.toUpperCase()).join(', ')
  const fullScale = [...[...shades].reverse(), baseColor, ...tints]

  const cssCustomProperties = useMemo(() => {
    const allColors = [...[...shades].reverse(), baseColor, ...tints]
    const totalSteps = allColors.length
    const lines: string[] = []
    allColors.forEach((color, i) => {
      const step = Math.round((i / (totalSteps - 1)) * 900) + 50
      lines.push(`  --color-${step}: ${color.toUpperCase()};`)
    })
    return `:root {\n${lines.join('\n')}\n}`
  }, [shades, baseColor, tints])

  const copyCSSVars = async () => {
    await navigator.clipboard.writeText(cssCustomProperties)
    setCopiedVars(true)
    setTimeout(() => setCopiedVars(false), 2000)
  }

  return (
    <ToolPage
      title="Tint & Shade Generator"
      description="Generate 10 tints (lighter) and 10 shades (darker) from any base color."
      category="color"
      categoryLabel="Color Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Tint & Shade Generator is a free browser-based tool that lets you generate lighter tints and darker shades of any color in precise percentage steps for design systems. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Pick a color using the visual color picker or enter a value in any format (HEX, RGB, HSL).</li>
            <li>View instant conversions across all supported color formats.</li>
            <li>Use the generated palette, contrast ratios, or name suggestions as needed.</li>
            <li>Copy any color value with one click for use in your design or code.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating consistent color scales for UI design, building design system color tokens, or selecting hover/active state colors. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this design tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is the difference between a tint and a shade?', answer: 'A tint is created by adding white to a base color to make it lighter, while a shade is created by adding black to make it darker.' },
        { question: 'How many tints and shades does this tool generate?', answer: 'This tool generates 10 tints (progressively lighter) and 10 shades (progressively darker) from any base hex color you provide.' },
        { question: 'Can I use the generated tints and shades in my design system?', answer: 'Yes, each generated color includes its hex code which you can copy and use directly in CSS, Figma, Sketch, or any design tool.' },
        { question: 'How are tints and shades calculated?', answer: 'Tints are calculated by linearly interpolating each RGB channel toward 255 (white), and shades by interpolating toward 0 (black), at evenly spaced intervals.' },
      ]}
    >
      <div className="space-y-6">
        {/* Base Color Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div>
            <label className="text-sm font-medium mb-2 block">Steps: {stepCount}</label>
            <div className="flex items-center gap-2">
              {[5, 10, 15, 20].map(v => (
                <button key={v} onClick={() => setStepCount(v)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${stepCount === v ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>{v}</button>
              ))}
            </div>
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
                    {(((i + 1) / (stepCount + 1)) * 100).toFixed(0)}%
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
                    {(((i + 1) / (stepCount + 1)) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-1 text-center">
                  <p className="text-[9px] font-mono truncate">{color.toUpperCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CSS Custom Properties Export */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">CSS Custom Properties</label>
            <button onClick={copyCSSVars} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
              {copiedVars ? 'Copied!' : 'Copy CSS Variables'}
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre overflow-x-auto max-h-48">{cssCustomProperties}</pre>
        </div>
      </div>
    </ToolPage>
  )
}
