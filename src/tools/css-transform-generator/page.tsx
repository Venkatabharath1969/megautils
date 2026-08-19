'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const originXOptions = ['left', 'center', 'right']
const originYOptions = ['top', 'center', 'bottom']

export default function CSSTransformGeneratorTool() {
  const [rotate, setRotate] = useState(0)
  const [scaleX, setScaleX] = useState(1)
  const [scaleY, setScaleY] = useState(1)
  const [skewX, setSkewX] = useState(0)
  const [skewY, setSkewY] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [originX, setOriginX] = useState('center')
  const [originY, setOriginY] = useState('center')
  const [perspective, setPerspective] = useState(0)

  const resetAll = () => {
    setRotate(0)
    setScaleX(1)
    setScaleY(1)
    setSkewX(0)
    setSkewY(0)
    setTranslateX(0)
    setTranslateY(0)
    setOriginX('center')
    setOriginY('center')
    setPerspective(0)
  }

  const transformCSS = useMemo(() => {
    const parts: string[] = []
    if (perspective > 0) parts.push(`perspective(${perspective}px)`)
    if (rotate !== 0) parts.push(`rotate(${rotate}deg)`)
    if (scaleX !== 1 || scaleY !== 1) parts.push(`scale(${scaleX}, ${scaleY})`)
    if (skewX !== 0 || skewY !== 0) parts.push(`skew(${skewX}deg, ${skewY}deg)`)
    if (translateX !== 0 || translateY !== 0) parts.push(`translate(${translateX}px, ${translateY}px)`)
    return parts.length > 0 ? parts.join(' ') : 'none'
  }, [rotate, scaleX, scaleY, skewX, skewY, translateX, translateY, perspective])

  const transformOriginValue = `${originX} ${originY}`
  const originCSS = originX === 'center' && originY === 'center' ? '' : `\ntransform-origin: ${transformOriginValue};`
  const cssCode = `transform: ${transformCSS};${originCSS}`

  const controls = [
    { label: 'Rotate', value: rotate, set: setRotate, min: -360, max: 360, step: 1, unit: 'deg' },
    { label: 'Scale X', value: scaleX, set: setScaleX, min: 0, max: 3, step: 0.1, unit: '' },
    { label: 'Scale Y', value: scaleY, set: setScaleY, min: 0, max: 3, step: 0.1, unit: '' },
    { label: 'Skew X', value: skewX, set: setSkewX, min: -90, max: 90, step: 1, unit: 'deg' },
    { label: 'Skew Y', value: skewY, set: setSkewY, min: -90, max: 90, step: 1, unit: 'deg' },
    { label: 'Translate X', value: translateX, set: setTranslateX, min: -200, max: 200, step: 1, unit: 'px' },
    { label: 'Translate Y', value: translateY, set: setTranslateY, min: -200, max: 200, step: 1, unit: 'px' },
  ]

  return (
    <ToolPage
      title="CSS Transform Generator"
      description="Build CSS transforms visually. Adjust rotate, scale, skew, and translate with a live preview."
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSS Transform Generator is a free browser-based tool that lets you apply 2D and 3D CSS transforms including translate, rotate, scale, skew, and perspective with visual preview. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Use the visual controls (sliders, color pickers, toggles) to design your effect.</li>
            <li>See the <strong>live preview</strong> update in real time as you adjust settings.</li>
            <li>Review the generated <strong>CSS code</strong> in the code panel below.</li>
            <li>Click <strong>Copy CSS</strong> to paste the code directly into your stylesheet.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating hover effects, card flips, parallax elements, and interactive UI animations. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What does the CSS transform property do?', answer: 'The CSS transform property lets you rotate, scale, skew, or translate an element without affecting the normal document flow or surrounding elements.' },
        { question: 'Can I combine multiple CSS transforms?', answer: 'Yes, you can chain multiple transform functions in a single declaration like transform: rotate(45deg) scale(1.5) translateX(20px), and they are applied in order from right to left.' },
        { question: 'Does CSS transform affect page layout?', answer: 'No, transforms are applied in the visual rendering layer only. The element still occupies its original space in the document flow.' },
        { question: 'What is the difference between translate and position in CSS?', answer: 'translate moves an element visually without changing layout, while position properties (top, left, etc.) can alter document flow and affect other elements.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Transform Controls</label>
            <button onClick={resetAll} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted transition-colors">
              Reset All
            </button>
          </div>

          {controls.map(c => (
            <div key={c.label}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">{c.label}</label>
                <span className="text-xs text-muted-foreground font-mono">{c.value}{c.unit}</span>
              </div>
              <input
                type="range"
                min={c.min}
                max={c.max}
                step={c.step}
                value={c.value}
                onChange={e => c.set(+e.target.value)}
                className="w-full"
              />
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Perspective</label>
              <span className="text-xs text-muted-foreground font-mono">{perspective === 0 ? 'none' : `${perspective}px`}</span>
            </div>
            <input type="range" min={0} max={2000} step={10} value={perspective} onChange={e => setPerspective(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Transform Origin</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">X Axis</label>
                <select value={originX} onChange={e => setOriginX(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {originXOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Y Axis</label>
                <select value={originY} onChange={e => setOriginY(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {originYOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div className="w-full h-72 rounded-lg border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
              {/* Guide lines */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-border/50" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-px bg-border/50" />
                </div>

                {/* Ghost element (original position) */}
                <div className="absolute w-24 h-24 rounded-xl border-2 border-dashed border-border/40" />

                {/* Transformed element */}
                <div
                  className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-lg transition-transform duration-200"
                  style={{ transform: transformCSS === 'none' ? undefined : transformCSS, transformOrigin: transformOriginValue }}
                >
                  Element
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">CSS Code</label>
              <CopyButton text={cssCode} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre overflow-x-auto">{cssCode}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
