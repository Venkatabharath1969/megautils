'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ToolPage } from '@/components/tool-page'
import { Download, RotateCcw } from 'lucide-react'

// ── Icon library: curated emoji/symbols that render well on canvas ──
const ICONS: { label: string; char: string }[] = [
  { label: 'Lightning', char: '\u26A1' },
  { label: 'Wrench', char: '\uD83D\uDD27' },
  { label: 'Bulb', char: '\uD83D\uDCA1' },
  { label: 'Target', char: '\uD83C\uDFAF' },
  { label: 'Chart', char: '\uD83D\uDCCA' },
  { label: 'Star', char: '\u2B50' },
  { label: 'Glowing Star', char: '\uD83C\uDF1F' },
  { label: 'Lock', char: '\uD83D\uDD12' },
  { label: 'Shield', char: '\uD83D\uDEE1\uFE0F' },
  { label: 'Palette', char: '\uD83C\uDFA8' },
  { label: 'Ruler', char: '\uD83D\uDCD0' },
  { label: 'Laptop', char: '\uD83D\uDCBB' },
  { label: 'Globe', char: '\uD83C\uDF10' },
  { label: 'Rocket', char: '\uD83D\uDE80' },
  { label: 'Phone', char: '\uD83D\uDCF1' },
  { label: 'Sparkles', char: '\u2728' },
  { label: 'Trophy', char: '\uD83C\uDFC6' },
  { label: 'Graduation', char: '\uD83C\uDF93' },
  { label: 'Microscope', char: '\uD83D\uDD2C' },
  { label: 'Diamond', char: '\uD83D\uDC8E' },
  { label: 'Fire', char: '\uD83D\uDD25' },
  { label: 'Heart', char: '\u2764\uFE0F' },
  { label: 'Crown', char: '\uD83D\uDC51' },
  { label: 'Gear', char: '\u2699\uFE0F' },
  { label: 'Leaf', char: '\uD83C\uDF3F' },
  { label: 'Sun', char: '\u2600\uFE0F' },
  { label: 'Mountain', char: '\uD83C\uDFD4\uFE0F' },
  { label: 'Wave', char: '\uD83C\uDF0A' },
  { label: 'Music', char: '\uD83C\uDFB5' },
  { label: 'Camera', char: '\uD83D\uDCF7' },
  { label: 'Pen', char: '\uD83D\uDD8A\uFE0F' },
  { label: 'Cube', char: '\uD83D\uDDFB' },
]

const FONTS = [
  { label: 'Sans-serif', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Monospace', value: '"Courier New", Courier, monospace' },
  { label: 'Rounded', value: '"Trebuchet MS", Verdana, sans-serif' },
]

const LAYOUTS = [
  { label: 'Icon + Text (horizontal)', value: 'horizontal' },
  { label: 'Icon above Text (vertical)', value: 'vertical' },
  { label: 'Text Only', value: 'text-only' },
  { label: 'Icon Only', value: 'icon-only' },
] as const

type LayoutType = typeof LAYOUTS[number]['value']

const SIZES = [
  { label: '500 x 500', value: 500 },
  { label: '1024 x 1024', value: 1024 },
  { label: 'Favicon (64 x 64)', value: 64 },
]

const BG_PRESETS = [
  { label: 'Transparent', value: 'transparent' },
  { label: 'White', value: '#ffffff' },
  { label: 'Black', value: '#000000' },
  { label: 'Custom', value: 'custom' },
]

function drawLogo(
  canvas: HTMLCanvasElement,
  opts: {
    icon: string
    iconColor: string
    iconSizePct: number
    text: string
    fontFamily: string
    textColor: string
    layout: LayoutType
    bgColor: string
    size: number
  }
) {
  const ctx = canvas.getContext('2d')!
  const s = opts.size
  canvas.width = s
  canvas.height = s

  // Clear
  ctx.clearRect(0, 0, s, s)

  // Background
  if (opts.bgColor !== 'transparent') {
    ctx.fillStyle = opts.bgColor
    ctx.fillRect(0, 0, s, s)
  }

  const iconSize = Math.round(s * (opts.iconSizePct / 100))
  const textSize = Math.max(12, Math.round(s * 0.10))
  const showIcon = opts.layout !== 'text-only'
  const showText = opts.layout !== 'icon-only' && opts.text.trim()

  if (opts.layout === 'horizontal') {
    // Icon on left, text on right
    const totalWidth = (showIcon ? iconSize : 0) + (showIcon && showText ? s * 0.04 : 0) + (showText ? ctx.measureText?.(opts.text)?.width || s * 0.5 : 0)
    void totalWidth
    const cy = s / 2

    if (showIcon) {
      ctx.font = `${iconSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = opts.iconColor
      const iconX = showText ? s * 0.32 : s / 2
      ctx.fillText(opts.icon, iconX, cy)
    }

    if (showText) {
      ctx.font = `bold ${textSize}px ${opts.fontFamily}`
      ctx.fillStyle = opts.textColor
      ctx.textAlign = showIcon ? 'left' : 'center'
      ctx.textBaseline = 'middle'
      const textX = showIcon ? s * 0.50 : s / 2
      ctx.fillText(opts.text, textX, cy, s * 0.48)
    }
  } else if (opts.layout === 'vertical') {
    // Icon above text
    const gap = s * 0.04
    const totalH = (showIcon ? iconSize : 0) + (showText ? textSize : 0) + (showIcon && showText ? gap : 0)
    let startY = (s - totalH) / 2

    if (showIcon) {
      ctx.font = `${iconSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = opts.iconColor
      ctx.fillText(opts.icon, s / 2, startY)
      startY += iconSize + gap
    }

    if (showText) {
      ctx.font = `bold ${textSize}px ${opts.fontFamily}`
      ctx.fillStyle = opts.textColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(opts.text, s / 2, startY, s * 0.9)
    }
  } else if (opts.layout === 'text-only') {
    const bigText = Math.max(16, Math.round(s * 0.14))
    ctx.font = `bold ${bigText}px ${opts.fontFamily}`
    ctx.fillStyle = opts.textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(opts.text || 'Logo', s / 2, s / 2, s * 0.9)
  } else {
    // icon-only
    ctx.font = `${iconSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = opts.iconColor
    ctx.fillText(opts.icon, s / 2, s / 2)
  }
}

export default function LogoMakerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [icon, setIcon] = useState(ICONS[0].char)
  const [iconColor, setIconColor] = useState('#2563eb')
  const [iconSizePct, setIconSizePct] = useState(35)
  const [text, setText] = useState('My Brand')
  const [fontFamily, setFontFamily] = useState(FONTS[0].value)
  const [textColor, setTextColor] = useState('#1e293b')
  const [layout, setLayout] = useState<LayoutType>('vertical')
  const [bgPreset, setBgPreset] = useState('transparent')
  const [customBg, setCustomBg] = useState('#f0f4ff')
  const [size, setSize] = useState(500)

  const bgColor = bgPreset === 'custom' ? customBg : bgPreset

  const redraw = useCallback(() => {
    if (!canvasRef.current) return
    drawLogo(canvasRef.current, {
      icon, iconColor, iconSizePct, text, fontFamily, textColor, layout, bgColor, size,
    })
  }, [icon, iconColor, iconSizePct, text, fontFamily, textColor, layout, bgColor, size])

  useEffect(() => { redraw() }, [redraw])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `logo-${size}x${size}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const handleReset = () => {
    setIcon(ICONS[0].char)
    setIconColor('#2563eb')
    setIconSizePct(35)
    setText('My Brand')
    setFontFamily(FONTS[0].value)
    setTextColor('#1e293b')
    setLayout('vertical')
    setBgPreset('transparent')
    setCustomBg('#f0f4ff')
    setSize(500)
  }

  return (
    <ToolPage
      title="Logo Maker"
      description="Create a simple logo with icons, text, and custom colors — download as PNG for free"
      category="generators"
      categoryLabel="Generators"
      helpContent={
        <div>
          <h2>Free Online Logo Maker</h2>
          <p>
            Create a professional-looking logo in seconds. Choose from 30+ icons, pick your colors,
            add your company name, and download as a high-resolution PNG. No sign-up, no watermarks,
            completely free.
          </p>
          <h3>How to Use</h3>
          <ol>
            <li><strong>Pick an icon</strong> from the icon grid that represents your brand.</li>
            <li><strong>Type your brand name</strong> in the text input field.</li>
            <li><strong>Choose a layout</strong>: horizontal (icon + text side by side), vertical (icon above text), text only, or icon only.</li>
            <li><strong>Customize colors</strong> for the icon, text, and background.</li>
            <li><strong>Adjust icon size</strong> with the slider.</li>
            <li><strong>Select a font style</strong>: Sans-serif, Serif, Monospace, or Rounded.</li>
            <li><strong>Pick your canvas size</strong>: 500x500 for social media, 1024x1024 for high-res, or 64x64 for favicons.</li>
            <li><strong>Download as PNG</strong> — the file is created right in your browser.</li>
          </ol>
          <h3>When to Use This Tool</h3>
          <ul>
            <li>Quick logo for a startup or side project</li>
            <li>Favicon for a website</li>
            <li>Profile picture for social media accounts</li>
            <li>Placeholder logo during development</li>
            <li>Simple branding for presentations or documents</li>
          </ul>
          <h3>Competitors Charge for This</h3>
          <p>
            Canva charges $15/month for premium logo features, Looka charges $20 per logo download,
            and Hatchful has limited options. This tool is 100% free with no limits.
          </p>
        </div>
      }
      faqs={[
        { question: 'Is this logo maker really free?', answer: 'Yes — no sign-up, no watermarks, no limits. Download as many logos as you want.' },
        { question: 'Can I use the logo commercially?', answer: 'The icons are standard emoji/unicode symbols that are free to use. The logo you create is yours to use however you like.' },
        { question: 'What formats can I download?', answer: 'Logos download as PNG files. Choose 500x500 for social media, 1024x1024 for high resolution, or 64x64 for favicons.' },
        { question: 'Can I make a transparent background logo?', answer: 'Yes! Select "Transparent" in the background options to get a PNG with no background.' },
        { question: 'How does this compare to Canva or Looka?', answer: 'This is a simpler, faster alternative for basic logos. For complex designs with custom illustrations, a full design tool may be better — but for quick branding, this does the job for free.' },
      ]}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Controls ── */}
        <div className="space-y-5">
          {/* Icon selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Icon</label>
            <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto p-2 rounded-lg border border-border bg-muted/30">
              {ICONS.map((ic) => (
                <button
                  key={ic.label}
                  onClick={() => setIcon(ic.char)}
                  title={ic.label}
                  className={`w-9 h-9 flex items-center justify-center rounded text-xl transition-colors ${
                    icon === ic.char ? 'bg-primary text-primary-foreground ring-2 ring-primary' : 'hover:bg-muted'
                  }`}
                >
                  {ic.char}
                </button>
              ))}
            </div>
          </div>

          {/* Icon color + size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Icon Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={iconColor} onChange={e => setIconColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border-0 p-0" />
                <input type="text" value={iconColor} onChange={e => setIconColor(e.target.value)} className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Icon Size: {iconSizePct}%</label>
              <input type="range" min={10} max={70} value={iconSizePct} onChange={e => setIconSizePct(+e.target.value)} className="w-full mt-2" />
            </div>
          </div>

          {/* Text */}
          <div>
            <label className="text-sm font-medium mb-1 block">Company Name</label>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="My Brand"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              maxLength={30}
            />
          </div>

          {/* Font + text color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Font Style</label>
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm">
                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Text Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border-0 p-0" />
                <input type="text" value={textColor} onChange={e => setTextColor(e.target.value)} className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
              </div>
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className="text-sm font-medium mb-1 block">Layout</label>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUTS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLayout(l.value)}
                  className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                    layout === l.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="text-sm font-medium mb-1 block">Background</label>
            <div className="flex flex-wrap gap-2">
              {BG_PRESETS.map(bg => (
                <button
                  key={bg.value}
                  onClick={() => setBgPreset(bg.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    bgPreset === bg.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
            {bgPreset === 'custom' && (
              <div className="flex items-center gap-2 mt-2">
                <input type="color" value={customBg} onChange={e => setCustomBg(e.target.value)} className="w-9 h-9 rounded cursor-pointer border-0 p-0" />
                <input type="text" value={customBg} onChange={e => setCustomBg(e.target.value)} className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
              </div>
            )}
          </div>

          {/* Canvas size */}
          <div>
            <label className="text-sm font-medium mb-1 block">Canvas Size</label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSize(s.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    size === s.value ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Download className="h-4 w-4" /> Download PNG
            </button>
            <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>

        {/* ── Preview ── */}
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm font-medium">Preview</label>
          <div
            className="rounded-xl border border-border shadow-sm flex items-center justify-center overflow-hidden"
            style={{
              width: Math.min(size, 400),
              height: Math.min(size, 400),
              background: bgColor === 'transparent'
                ? 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 0 0 / 20px 20px'
                : bgColor,
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: Math.min(size, 400),
                height: Math.min(size, 400),
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{size} x {size}px &bull; PNG</span>
        </div>
      </div>
    </ToolPage>
  )
}
