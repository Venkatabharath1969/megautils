'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Copy, Check, Shield, Palette, RotateCcw } from 'lucide-react'

interface GradientStop {
  color: string
}

interface GradientPreset {
  name: string
  colors: string[]
  direction: string
}

const DIRECTIONS = [
  { value: '90deg', label: 'Left to Right' },
  { value: '270deg', label: 'Right to Left' },
  { value: '180deg', label: 'Top to Bottom' },
  { value: '0deg', label: 'Bottom to Top' },
  { value: '135deg', label: 'Diagonal (TL to BR)' },
  { value: '315deg', label: 'Diagonal (BR to TL)' },
  { value: '45deg', label: 'Diagonal (BL to TR)' },
]

const PRESETS: GradientPreset[] = [
  { name: 'Sunset', colors: ['#ff6b35', '#f7931e', '#ff1744'], direction: '90deg' },
  { name: 'Ocean', colors: ['#667eea', '#764ba2'], direction: '90deg' },
  { name: 'Forest', colors: ['#11998e', '#38ef7d'], direction: '90deg' },
  { name: 'Neon', colors: ['#f72585', '#7209b7', '#3a0ca3'], direction: '90deg' },
  { name: 'Galaxy', colors: ['#0f0c29', '#302b63', '#24243e'], direction: '135deg' },
  { name: 'Fire', colors: ['#f12711', '#f5af19'], direction: '90deg' },
  { name: 'Rainbow', colors: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff'], direction: '90deg' },
  { name: 'Cotton Candy', colors: ['#ee9ca7', '#ffdde1'], direction: '90deg' },
  { name: 'Mint', colors: ['#00b09b', '#96c93d'], direction: '90deg' },
  { name: 'Peach', colors: ['#ed6ea0', '#ec8c69'], direction: '90deg' },
]

const FONT_FAMILIES = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Playfair Display", Georgia, serif', label: 'Playfair Display' },
  { value: '"Courier New", monospace', label: 'Courier New' },
]

const BG_OPTIONS = [
  { value: 'transparent', label: 'Transparent' },
  { value: '#ffffff', label: 'White' },
  { value: '#1a1a2e', label: 'Dark' },
  { value: '#f5f5f5', label: 'Light Gray' },
]

export default function TextGradientGeneratorTool() {
  const [text, setText] = useState('Gradient Text')
  const [stops, setStops] = useState<GradientStop[]>([{ color: '#667eea' }, { color: '#764ba2' }])
  const [direction, setDirection] = useState('90deg')
  const [fontSize, setFontSize] = useState(72)
  const [fontFamily, setFontFamily] = useState('Inter, system-ui, sans-serif')
  const [fontWeight, setFontWeight] = useState(800)
  const [bgColor, setBgColor] = useState('transparent')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  const gradientValue = useMemo(() => {
    const colors = stops.map(s => s.color).join(', ')
    return `linear-gradient(${direction}, ${colors})`
  }, [stops, direction])

  const cssCode = useMemo(() => {
    return `.gradient-text {
  background: ${gradientValue};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: ${fontSize}px;
  font-weight: ${fontWeight};
  font-family: ${fontFamily};
}`
  }, [gradientValue, fontSize, fontWeight, fontFamily])

  const updateStop = (index: number, color: string) => {
    setStops(prev => prev.map((s, i) => i === index ? { color } : s))
  }

  const addStop = () => {
    if (stops.length >= 6) return
    setStops(prev => [...prev, { color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0') }])
  }

  const removeStop = (index: number) => {
    if (stops.length <= 2) return
    setStops(prev => prev.filter((_, i) => i !== index))
  }

  const applyPreset = (preset: GradientPreset) => {
    setStops(preset.colors.map(color => ({ color })))
    setDirection(preset.direction)
  }

  const copyCSS = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = cssCode
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [cssCode])

  const downloadPng = useCallback(() => {
    const canvas = document.createElement('canvas')
    const padding = 40
    const ctx = canvas.getContext('2d')!

    // Measure text
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily.split(',')[0].replace(/"/g, '')}, sans-serif`
    const metrics = ctx.measureText(text || 'Gradient Text')
    const textWidth = metrics.width
    const textHeight = fontSize * 1.3

    canvas.width = Math.ceil(textWidth + padding * 2)
    canvas.height = Math.ceil(textHeight + padding * 2)

    // Background
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // Create gradient
    const angle = parseFloat(direction) * (Math.PI / 180)
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const len = Math.max(canvas.width, canvas.height)
    const x1 = cx - Math.cos(angle) * len / 2
    const y1 = cy - Math.sin(angle) * len / 2
    const x2 = cx + Math.cos(angle) * len / 2
    const y2 = cy + Math.sin(angle) * len / 2

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    stops.forEach((s, i) => {
      gradient.addColorStop(i / Math.max(1, stops.length - 1), s.color)
    })

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily.split(',')[0].replace(/"/g, '')}, sans-serif`
    ctx.textBaseline = 'top'
    ctx.fillStyle = gradient
    ctx.fillText(text || 'Gradient Text', padding, padding + (textHeight - fontSize) / 2)

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gradient-text-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }, [text, stops, direction, fontSize, fontFamily, fontWeight, bgColor])

  const clear = () => {
    setText('Gradient Text')
    setStops([{ color: '#667eea' }, { color: '#764ba2' }])
    setDirection('90deg')
    setFontSize(72)
    setFontFamily('Inter, system-ui, sans-serif')
    setFontWeight(800)
    setBgColor('transparent')
    setCopied(false)
  }

  return (
    <ToolPage
      title="Text Gradient Generator"
      description="Create beautiful CSS gradient text with live preview, copy CSS code, and download as PNG"
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text Gradient Generator is a free browser-based tool for creating stunning gradient text effects. Choose colors, direction, font, and size — see a live preview, copy the CSS code, and download the text as a PNG image. Perfect for headings, logos, social media graphics, and web design.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Type your text in the <strong>text input</strong> field.</li>
            <li>Choose colors using the <strong>color stops</strong> — add up to 6 colors. Click the color swatch to change each color.</li>
            <li>Select a <strong>gradient direction</strong> (left-to-right, diagonal, etc.).</li>
            <li>Or pick a <strong>preset gradient</strong> like Sunset, Ocean, Neon, or Rainbow.</li>
            <li>Adjust the <strong>font size</strong> (24-120px), <strong>font family</strong>, and <strong>font weight</strong>.</li>
            <li>Choose a <strong>background color</strong> for the PNG download (Transparent, White, Dark, or Light Gray).</li>
            <li>See the <strong>live preview</strong> update in real-time.</li>
            <li>Click <strong>Copy CSS</strong> to copy the gradient CSS code to your clipboard.</li>
            <li>Click <strong>Download PNG</strong> to save the gradient text as an image.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Use this tool to create eye-catching gradient headings for websites, social media posts, thumbnails, presentations, or branding. It generates the exact CSS code you need for web development, and the PNG download is perfect for design tools. A great free alternative to paid design tools.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Two-color gradients are the most readable and elegant. Three or more colors create more vibrant effects.</li>
            <li>Use high-contrast color combinations for maximum visual impact.</li>
            <li>The CSS <code>background-clip: text</code> technique works in all modern browsers.</li>
            <li>For social media graphics, use the PNG download with a dark or white background.</li>
            <li>All processing happens in your browser — nothing is uploaded.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How does CSS gradient text work?', answer: 'The technique applies a CSS gradient as the background, then uses background-clip: text to clip the background to the text shape, and sets the text fill color to transparent. This makes the gradient show through the text.' },
        { question: 'Does gradient text work in all browsers?', answer: 'Yes! The -webkit-background-clip: text and background-clip: text properties are supported in all modern browsers including Chrome, Firefox, Safari, and Edge.' },
        { question: 'Can I download the gradient text as an image?', answer: 'Yes! Click "Download PNG" to save the gradient text as a transparent or solid-background PNG image, rendered using the Canvas API.' },
        { question: 'How many colors can I use?', answer: 'You can use 2 to 6 color stops in the gradient. Two colors create smooth transitions, while more colors create rainbow-like effects.' },
        { question: 'Is this tool free?', answer: 'Yes! It is 100% free with no limits, no sign-up, and no watermarks. Everything runs in your browser.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Create Gradient Text</span>
          {text !== 'Gradient Text' && <ClearButton onClear={clear} />}
        </div>

        {/* Text input */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Text</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here..."
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Preset gradients */}
        <div>
          <label className="text-sm font-medium mb-2 block">Preset Gradients</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group relative px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-primary transition-colors overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${preset.colors.join(', ')})` }}
                />
                <span className="relative">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color stops */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Color Stops ({stops.length})</label>
            {stops.length < 6 && (
              <button onClick={addStop} className="text-xs text-primary hover:underline">+ Add Color</button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/20">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(i, e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <div className="text-xs">
                  <div className="font-mono text-muted-foreground">{stop.color}</div>
                  <div className="text-muted-foreground">Stop {i + 1}</div>
                </div>
                {stops.length > 2 && (
                  <button
                    onClick={() => removeStop(i)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    title="Remove color stop"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Direction, Font, Size controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
            >
              {DIRECTIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
            >
              {FONT_FAMILIES.map(f => (
                <option key={f.label} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min={24}
              max={120}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Font Weight: {fontWeight}
            </label>
            <input
              type="range"
              min={300}
              max={900}
              step={100}
              value={fontWeight}
              onChange={(e) => setFontWeight(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Background (for PNG)</label>
            <div className="flex flex-wrap gap-2">
              {BG_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setBgColor(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${bgColor === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Live Preview</span>
          <div
            className="border border-border rounded-lg p-8 flex items-center justify-center min-h-[160px] overflow-hidden"
            style={{
              background: bgColor === 'transparent'
                ? 'repeating-conic-gradient(#e0e0e0 0% 25%, #fff 0% 50%) 0 0 / 20px 20px'
                : bgColor,
            }}
          >
            <div
              ref={textRef}
              style={{
                background: gradientValue,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: `${Math.min(fontSize, 80)}px`,
                fontWeight,
                fontFamily,
                lineHeight: 1.2,
                textAlign: 'center',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              {text || 'Gradient Text'}
            </div>
          </div>
        </div>

        {/* Gradient bar preview */}
        <div className="h-3 rounded-full" style={{ background: gradientValue }} />

        {/* CSS Code Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">CSS Code</span>
            <button
              onClick={copyCSS}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {copied ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy CSS</>}
            </button>
          </div>
          <pre className="p-4 rounded-lg bg-muted/50 border border-border text-xs font-mono overflow-x-auto whitespace-pre">
            {cssCode}
          </pre>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyCSS}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy CSS'}
          </button>
          <button
            onClick={downloadPng}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
          <button
            onClick={clear}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Shield className="h-3.5 w-3.5" />
          <span>All processing happens locally in your browser. Nothing is uploaded to any server.</span>
        </div>
      </div>
    </ToolPage>
  )
}
