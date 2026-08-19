'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function GlassmorphismGeneratorTool() {
  const [blur, setBlur] = useState(10)
  const [transparency, setTransparency] = useState(0.25)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [borderOpacity, setBorderOpacity] = useState(0.18)
  const [borderRadius, setBorderRadius] = useState(16)
  const [saturation, setSaturation] = useState(180)
  const [sceneBg, setSceneBg] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
  const [sceneBgPreset, setSceneBgPreset] = useState(0)

  const bgPresets = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  ]

  const glassBackground = hexToRgba(bgColor, transparency)
  const glassBorder = hexToRgba(bgColor, borderOpacity)

  const backdropValue = saturation !== 100
    ? `blur(${blur}px) saturate(${saturation}%)`
    : `blur(${blur}px)`

  const cssCode = useMemo(() => [
    `background: ${glassBackground};`,
    `backdrop-filter: ${backdropValue};`,
    `-webkit-backdrop-filter: ${backdropValue};`,
    `border-radius: ${borderRadius}px;`,
    `border: 1px solid ${glassBorder};`,
  ].join('\n'), [glassBackground, backdropValue, borderRadius, glassBorder])

  return (
    <ToolPage
      title="Glassmorphism Generator"
      description="Create beautiful glass-effect CSS with backdrop blur, transparency, and live preview."
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Glassmorphism Generator is a free browser-based tool that lets you create frosted glass UI effects with adjustable transparency, blur, and border properties. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Use the visual controls (sliders, color pickers, toggles) to design your effect.</li>
            <li>See the <strong>live preview</strong> update in real time as you adjust settings.</li>
            <li>Review the generated <strong>CSS code</strong> in the code panel below.</li>
            <li>Click <strong>Copy CSS</strong> to paste the code directly into your stylesheet.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when designing modern UI components with the popular glassmorphism trend using backdrop-filter and transparency. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web design tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Copy the generated CSS directly into your project stylesheet — it is production-ready.</li>
            <li>Test the effect in multiple browsers since some CSS properties have varying support.</li>
            <li>Combine multiple generators (e.g., gradient + box-shadow) for layered visual effects.</li>
            <li>Use CSS custom properties (variables) to make generated values easy to update later.</li>
            <li>All code generation happens in your browser — no external dependencies required.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is glassmorphism in UI design?', answer: 'Glassmorphism is a design trend that creates a frosted glass effect using CSS backdrop-filter blur, semi-transparent backgrounds, and subtle borders to give elements a translucent appearance.' },
        { question: 'How does CSS backdrop-filter work?', answer: 'backdrop-filter applies graphical effects like blur to the area behind an element, allowing content beneath a semi-transparent background to appear frosted or blurred.' },
        { question: 'Is glassmorphism supported in all browsers?', answer: 'backdrop-filter is supported in all modern browsers including Chrome, Firefox, Safari, and Edge. Use the -webkit-backdrop-filter prefix for broader Safari compatibility.' },
        { question: 'What background color works best for glassmorphism?', answer: 'White with low opacity (10-30%) works best for light themes, while dark colors with similar opacity suit dark themes. The effect works best over colorful or image backgrounds.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Blur: {blur}px</label>
            <input type="range" min={0} max={30} value={blur} onChange={e => setBlur(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Saturation: {saturation}%</label>
            <input type="range" min={0} max={300} step={5} value={saturation} onChange={e => setSaturation(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Transparency: {Math.round(transparency * 100)}%</label>
            <input type="range" min={0} max={100} value={transparency * 100} onChange={e => setTransparency(+e.target.value / 100)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Border Opacity: {Math.round(borderOpacity * 100)}%</label>
            <input type="range" min={0} max={100} value={borderOpacity * 100} onChange={e => setBorderOpacity(+e.target.value / 100)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Border Radius: {borderRadius}px</label>
            <input type="range" min={0} max={50} value={borderRadius} onChange={e => setBorderRadius(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Glass Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
              <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-24 rounded border border-input bg-transparent px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Scene Background</label>
            <div className="flex gap-2 flex-wrap">
              {bgPresets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => { setSceneBg(preset); setSceneBgPreset(i) }}
                  className={`w-10 h-10 rounded-lg border-2 ${sceneBgPreset === i ? 'border-primary' : 'border-border'}`}
                  style={{ background: preset }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div
              className="relative rounded-lg overflow-hidden"
              style={{ background: sceneBg, minHeight: 320, padding: 32 }}
            >
              {/* Decorative shapes behind the glass */}
              <div className="absolute top-6 left-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
              <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
              <div className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-lg rotate-45" style={{ background: 'rgba(255,255,255,0.25)' }} />

              {/* Glass Card */}
              <div
                className="relative z-10 p-6 mx-auto max-w-xs"
                style={{
                  background: glassBackground,
                  backdropFilter: backdropValue,
                  WebkitBackdropFilter: backdropValue,
                  borderRadius: `${borderRadius}px`,
                  border: `1px solid ${glassBorder}`,
                }}
              >
                <h3 className="text-lg font-bold text-white mb-2">Glass Card</h3>
                <p className="text-sm text-white/80">This is a glassmorphism effect created with CSS backdrop-filter and transparency.</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">CSS Code</label>
              <CopyButton text={cssCode} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre">{cssCode}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
