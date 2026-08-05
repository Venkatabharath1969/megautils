'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export default function CssTextShadowGeneratorTool() {
  const [offsetX, setOffsetX] = useState(2)
  const [offsetY, setOffsetY] = useState(2)
  const [blur, setBlur] = useState(4)
  const [color, setColor] = useState('#000000')
  const [opacity, setOpacity] = useState(0.5)
  const [textColor, setTextColor] = useState('#1f2937')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog')
  const [fontSize, setFontSize] = useState(32)

  const shadowCSS = useMemo(
    () => `${offsetX}px ${offsetY}px ${blur}px ${hexToRgba(color, opacity)}`,
    [offsetX, offsetY, blur, color, opacity]
  )

  const cssCode = `text-shadow: ${shadowCSS};`

  return (
    <ToolPage
      title="CSS Text Shadow Generator"
      description="Design CSS text shadows visually with live preview."
      category="css"
      categoryLabel="CSS Tools"
      faqs={[
        { question: 'What is the CSS text-shadow property?', answer: 'The text-shadow property adds shadow effects to text, defined by horizontal offset, vertical offset, blur radius, and color values.' },
        { question: 'Can I add multiple text shadows to one element?', answer: 'Yes, you can apply multiple text shadows by separating each shadow definition with a comma, which is useful for creating glow effects or 3D text.' },
        { question: 'How do I create a text glow effect with CSS?', answer: 'Set both offsets to 0 and use a large blur radius with a bright color to create a glow effect around your text.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Offset X: {offsetX}px</label>
            <input type="range" min={-50} max={50} value={offsetX} onChange={e => setOffsetX(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Offset Y: {offsetY}px</label>
            <input type="range" min={-50} max={50} value={offsetY} onChange={e => setOffsetY(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Blur: {blur}px</label>
            <input type="range" min={0} max={50} value={blur} onChange={e => setBlur(+e.target.value)} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Shadow Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
                <input type="text" value={color} onChange={e => setColor(e.target.value)} className="w-20 rounded border border-input bg-transparent px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Opacity: {Math.round(opacity * 100)}%</label>
              <input type="range" min={0} max={100} value={opacity * 100} onChange={e => setOpacity(+e.target.value / 100)} className="w-full mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Text Color</label>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Background Color</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Font Size: {fontSize}px</label>
            <input type="range" min={12} max={72} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Sample Text</label>
            <input type="text" value={sampleText} onChange={e => setSampleText(e.target.value)} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div
              className="rounded-lg border border-border p-8 min-h-[200px] flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <p
                className="font-bold text-center break-words max-w-full"
                style={{
                  color: textColor,
                  textShadow: shadowCSS,
                  fontSize: `${fontSize}px`,
                  lineHeight: 1.3,
                }}
              >
                {sampleText}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">CSS Code</label>
              <CopyButton text={cssCode} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">{cssCode}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
