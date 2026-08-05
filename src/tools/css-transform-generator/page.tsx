'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

export default function CSSTransformGeneratorTool() {
  const [rotate, setRotate] = useState(0)
  const [scaleX, setScaleX] = useState(1)
  const [scaleY, setScaleY] = useState(1)
  const [skewX, setSkewX] = useState(0)
  const [skewY, setSkewY] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)

  const resetAll = () => {
    setRotate(0)
    setScaleX(1)
    setScaleY(1)
    setSkewX(0)
    setSkewY(0)
    setTranslateX(0)
    setTranslateY(0)
  }

  const transformCSS = useMemo(() => {
    const parts: string[] = []
    if (rotate !== 0) parts.push(`rotate(${rotate}deg)`)
    if (scaleX !== 1 || scaleY !== 1) parts.push(`scale(${scaleX}, ${scaleY})`)
    if (skewX !== 0 || skewY !== 0) parts.push(`skew(${skewX}deg, ${skewY}deg)`)
    if (translateX !== 0 || translateY !== 0) parts.push(`translate(${translateX}px, ${translateY}px)`)
    return parts.length > 0 ? parts.join(' ') : 'none'
  }, [rotate, scaleX, scaleY, skewX, skewY, translateX, translateY])

  const cssCode = `transform: ${transformCSS};`

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
                  style={{ transform: transformCSS === 'none' ? undefined : transformCSS }}
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
