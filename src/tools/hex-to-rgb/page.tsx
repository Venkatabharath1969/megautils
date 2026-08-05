'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let clean = hex.replace('#', '').trim()
  if (/^[0-9a-f]{3}$/i.test(clean)) clean = clean[0]+clean[0]+clean[1]+clean[1]+clean[2]+clean[2]
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
}

export default function HexToRgbTool() {
  const [mode, setMode] = useState<'hex2rgb' | 'rgb2hex'>('hex2rgb')
  const [hexInput, setHexInput] = useState('#3b82f6')
  const [rInput, setRInput] = useState('59')
  const [gInput, setGInput] = useState('130')
  const [bInput, setBInput] = useState('246')

  const hexResult = useMemo(() => {
    if (mode !== 'hex2rgb') return null
    return hexToRgb(hexInput)
  }, [mode, hexInput])

  const rgbResult = useMemo(() => {
    if (mode !== 'rgb2hex') return null
    const r = parseInt(rInput), g = parseInt(gInput), b = parseInt(bInput)
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null
    return rgbToHex(r, g, b).toUpperCase()
  }, [mode, rInput, gInput, bInput])

  const previewColor = mode === 'hex2rgb'
    ? (hexResult ? hexInput : null)
    : rgbResult

  return (
    <ToolPage
      title="HEX to RGB Converter"
      description="Convert HEX color codes to RGB values and vice versa with live preview."
      category="color"
      categoryLabel="Color Tools"
      faqs={[
        { question: 'How do I convert a HEX color to RGB?', answer: 'Enter a hex code like #3b82f6 and the tool instantly shows the RGB values (e.g., rgb(59, 130, 246)) with a live color preview.' },
        { question: 'What is the difference between HEX and RGB color formats?', answer: 'HEX uses a 6-character hexadecimal string (#RRGGBB), while RGB specifies red, green, and blue as decimal numbers from 0 to 255. Both represent the same colors.' },
        { question: 'Can I convert RGB back to HEX?', answer: 'Yes, switch to "RGB to HEX" mode, enter R, G, and B values (0-255 each), and the hex code is generated automatically.' },
        { question: 'Do I need the # symbol when entering a hex code?', answer: 'The # symbol is optional. The tool accepts hex codes with or without it, and also supports 3-digit shorthand like #f00.' },
      ]}
    >
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode('hex2rgb')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'hex2rgb' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
          HEX to RGB
        </button>
        <button onClick={() => setMode('rgb2hex')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'rgb2hex' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
          RGB to HEX
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {mode === 'hex2rgb' ? (
            <div>
              <label className="text-sm font-medium mb-2 block">HEX Value</label>
              <input
                type="text"
                value={hexInput}
                onChange={e => setHexInput(e.target.value)}
                placeholder="#3b82f6"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium block">RGB Values</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">R (0-255)</label>
                  <input type="number" min={0} max={255} value={rInput} onChange={e => setRInput(e.target.value)} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">G (0-255)</label>
                  <input type="number" min={0} max={255} value={gInput} onChange={e => setGInput(e.target.value)} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">B (0-255)</label>
                  <input type="number" min={0} max={255} value={bInput} onChange={e => setBInput(e.target.value)} className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </div>
          )}

          {previewColor && (
            <div>
              <label className="text-sm font-medium mb-2 block">Preview</label>
              <div className="w-full h-24 rounded-lg border border-border" style={{ backgroundColor: previewColor }} />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium block">Result</label>
          {mode === 'hex2rgb' ? (
            hexResult ? (
              <>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">RGB</span>
                    <CopyButton text={`rgb(${hexResult.r}, ${hexResult.g}, ${hexResult.b})`} />
                  </div>
                  <p className="text-sm font-mono">rgb({hexResult.r}, {hexResult.g}, {hexResult.b})</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">Individual Values</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm font-mono">
                    <div><span className="text-red-500 font-semibold">R:</span> {hexResult.r}</div>
                    <div><span className="text-green-500 font-semibold">G:</span> {hexResult.g}</div>
                    <div><span className="text-blue-500 font-semibold">B:</span> {hexResult.b}</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">CSS rgba()</span>
                    <CopyButton text={`rgba(${hexResult.r}, ${hexResult.g}, ${hexResult.b}, 1)`} />
                  </div>
                  <p className="text-sm font-mono">rgba({hexResult.r}, {hexResult.g}, {hexResult.b}, 1)</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Enter a valid HEX color code.</p>
            )
          ) : (
            rgbResult ? (
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground">HEX</span>
                  <CopyButton text={rgbResult} />
                </div>
                <p className="text-sm font-mono">{rgbResult}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Enter valid RGB values (0-255).</p>
            )
          )}
        </div>
      </div>
    </ToolPage>
  )
}
