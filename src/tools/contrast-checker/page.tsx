'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let clean = hex.replace('#', '').trim()
  if (/^[0-9a-f]{3}$/i.test(clean)) clean = clean[0]+clean[0]+clean[1]+clean[1]+clean[2]+clean[2]
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null
  return { r: parseInt(clean.substring(0, 2), 16), g: parseInt(clean.substring(2, 4), 16), b: parseInt(clean.substring(4, 6), 16) }
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

interface WcagResult {
  ratio: number
  aaLargeText: boolean
  aaSmallText: boolean
  aaaLargeText: boolean
  aaaSmallText: boolean
}

function checkWcag(fg: string, bg: string): WcagResult | null {
  const fgRgb = hexToRgb(fg)
  const bgRgb = hexToRgb(bg)
  if (!fgRgb || !bgRgb) return null
  const fgLum = relativeLuminance(fgRgb.r, fgRgb.g, fgRgb.b)
  const bgLum = relativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b)
  const ratio = contrastRatio(fgLum, bgLum)
  return {
    ratio: Math.round(ratio * 100) / 100,
    aaLargeText: ratio >= 3,
    aaSmallText: ratio >= 4.5,
    aaaLargeText: ratio >= 4.5,
    aaaSmallText: ratio >= 7,
  }
}

function Badge({ pass }: { pass: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${pass ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'}`}>
      {pass ? 'PASS' : 'FAIL'}
    </span>
  )
}

export default function ContrastCheckerTool() {
  const [fg, setFg] = useState('#ffffff')
  const [bg, setBg] = useState('#3b82f6')

  const result = useMemo(() => checkWcag(fg, bg), [fg, bg])

  const swapColors = () => { setFg(bg); setBg(fg) }

  return (
    <ToolPage
      title="Contrast Checker"
      description="Check WCAG color contrast ratio between foreground and background colors."
      category="color"
      categoryLabel="Color Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>WCAG Contrast Checker is a free browser-based tool that lets you test foreground and background color combinations against WCAG 2.1 accessibility standards for contrast ratio compliance. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Pick a color using the visual color picker or enter a value in any format (HEX, RGB, HSL).</li>
            <li>View instant conversions across all supported color formats.</li>
            <li>Use the generated palette, contrast ratios, or name suggestions as needed.</li>
            <li>Copy any color value with one click for use in your design or code.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when ensuring your website meets accessibility requirements, passing WCAG AA and AAA contrast standards. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this accessibility tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is WCAG contrast ratio?', answer: 'WCAG contrast ratio measures the luminance difference between text and background colors. A higher ratio means better readability and accessibility.' },
        { question: 'What contrast ratio do I need for WCAG AA compliance?', answer: 'WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18px+ bold or 24px+ regular).' },
        { question: 'What is the difference between WCAG AA and AAA?', answer: 'AA is the standard accessibility level requiring 4.5:1 for normal text, while AAA is the enhanced level requiring 7:1 for normal text and 4.5:1 for large text.' },
        { question: 'Why is color contrast important for web design?', answer: 'Sufficient contrast ensures that text is readable for users with low vision or color blindness, and is a legal requirement under many accessibility laws.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Foreground (Text) Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={fg}
                onChange={e => setFg(e.target.value)}
                className="w-12 h-12 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={fg}
                onChange={e => setFg(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={swapColors}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Swap Colors
            </button>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={bg}
                onChange={e => setBg(e.target.value)}
                className="w-12 h-12 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={bg}
                onChange={e => setBg(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Live Preview */}
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div className="rounded-lg border border-border p-6" style={{ backgroundColor: bg }}>
              <p className="text-2xl font-bold mb-2" style={{ color: fg }}>Large Text (24px+)</p>
              <p className="text-base mb-2" style={{ color: fg }}>Normal body text at standard size (16px). This is what most of your content will look like.</p>
              <p className="text-sm" style={{ color: fg }}>Small text example for captions and fine print.</p>
            </div>
          </div>

          {result && (
            <>
              {/* Ratio */}
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Contrast Ratio</p>
                <p className="text-4xl font-bold">{result.ratio}:1</p>
                <CopyButton text={`${result.ratio}:1`} />
              </div>

              {/* WCAG Results */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">AA - Large Text</p>
                      <p className="text-xs text-muted-foreground">Min 3:1</p>
                    </div>
                    <Badge pass={result.aaLargeText} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">AA - Small Text</p>
                      <p className="text-xs text-muted-foreground">Min 4.5:1</p>
                    </div>
                    <Badge pass={result.aaSmallText} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">AAA - Large Text</p>
                      <p className="text-xs text-muted-foreground">Min 4.5:1</p>
                    </div>
                    <Badge pass={result.aaaLargeText} />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">AAA - Small Text</p>
                      <p className="text-xs text-muted-foreground">Min 7:1</p>
                    </div>
                    <Badge pass={result.aaaSmallText} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
