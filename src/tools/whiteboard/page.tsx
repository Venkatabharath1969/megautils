'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ToolPage } from '@/components/tool-page'
import { Download, RotateCcw, Undo2, Redo2, Pencil, Minus, Square, Circle, Eraser, Trash2 } from 'lucide-react'

type DrawTool = 'pen' | 'line' | 'rect' | 'circle' | 'eraser'
type BgType = 'white' | 'grid' | 'dotted'

const PRESET_COLORS = ['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

const TOOL_META: { id: DrawTool; icon: typeof Pencil; label: string }[] = [
  { id: 'pen', icon: Pencil, label: 'Pen' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
]

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, bg: BgType) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)

  if (bg === 'grid') {
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 0.5
    const step = 20
    for (let x = step; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
    }
    for (let y = step; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
    }
  } else if (bg === 'dotted') {
    ctx.fillStyle = '#d1d5db'
    const step = 20
    for (let x = step; x < w; x += step) {
      for (let y = step; y < h; y += step) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill()
      }
    }
  }
}

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tool, setTool] = useState<DrawTool>('pen')
  const [color, setColor] = useState('#000000')
  const [customColor, setCustomColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [fillShapes, setFillShapes] = useState(false)
  const [bgType, setBgType] = useState<BgType>('white')

  // History
  const historyRef = useRef<ImageData[]>([])
  const historyIdxRef = useRef(-1)
  // We use refs for history to avoid re-renders on every stroke; use a state counter to force UI update for undo/redo button enable/disable
  const [historyLen, setHistoryLen] = useState(0)
  const [historyIdx, setHistoryIdx] = useState(-1)

  // Drawing state
  const isDrawing = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const snapshotBeforeShape = useRef<ImageData | null>(null)

  const canvasW = 1200
  const canvasH = 800

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvasW
    canvas.height = canvasH
    const ctx = canvas.getContext('2d')!
    drawBackground(ctx, canvasW, canvasH, bgType)
    saveState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveState = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const data = ctx.getImageData(0, 0, canvasW, canvasH)
    const newHist = historyRef.current.slice(0, historyIdxRef.current + 1)
    newHist.push(data)
    // Cap history at 50 entries
    if (newHist.length > 50) newHist.shift()
    historyRef.current = newHist
    historyIdxRef.current = newHist.length - 1
    setHistoryLen(newHist.length)
    setHistoryIdx(historyIdxRef.current)
  }, [])

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current--
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.putImageData(historyRef.current[historyIdxRef.current], 0, 0)
    setHistoryIdx(historyIdxRef.current)
  }, [])

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    historyIdxRef.current++
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.putImageData(historyRef.current[historyIdxRef.current], 0, 0)
    setHistoryIdx(historyIdxRef.current)
  }, [])

  const clearCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    drawBackground(ctx, canvasW, canvasH, bgType)
    saveState()
  }, [bgType, saveState])

  // Redraw background when bg changes (preserves drawings via history)
  const changeBg = useCallback((newBg: BgType) => {
    setBgType(newBg)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    drawBackground(ctx, canvasW, canvasH, newBg)
    saveState()
  }, [saveState])

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvasW / rect.width
    const scaleY = canvasH / rect.height
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }, [])

  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    isDrawing.current = true
    const pos = getPos(e)
    startPos.current = pos

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    } else {
      // For shapes, snapshot current state
      snapshotBeforeShape.current = ctx.getImageData(0, 0, canvasW, canvasH)
    }
  }, [getPos, tool, strokeWidth, color])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else if (snapshotBeforeShape.current) {
      // Restore snapshot then draw preview shape
      ctx.putImageData(snapshotBeforeShape.current, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const sx = startPos.current.x
      const sy = startPos.current.y
      const dx = pos.x - sx
      const dy = pos.y - sy

      if (tool === 'line') {
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      } else if (tool === 'rect') {
        if (fillShapes) {
          ctx.fillRect(sx, sy, dx, dy)
        } else {
          ctx.strokeRect(sx, sy, dx, dy)
        }
      } else if (tool === 'circle') {
        const rx = Math.abs(dx) / 2
        const ry = Math.abs(dy) / 2
        const cx = sx + dx / 2
        const cy = sy + dy / 2
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        if (fillShapes) ctx.fill()
        else ctx.stroke()
      }
    }
  }, [getPos, tool, color, strokeWidth, fillShapes])

  const endDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing.current) return
    isDrawing.current = false
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) ctx.globalCompositeOperation = 'source-over'
    snapshotBeforeShape.current = null
    saveState()
  }, [saveState])

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'whiteboard.png'
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  return (
    <ToolPage
      title="Whiteboard / Drawing Pad"
      description="Free online drawing canvas with pen, shapes, colors, undo/redo, and PNG export"
      category="generators"
      categoryLabel="Generators"
      helpContent={
        <div>
          <h2>Free Online Whiteboard &amp; Drawing Pad</h2>
          <p>
            A simple yet powerful drawing canvas that runs entirely in your browser. Draw freehand,
            create shapes, pick colors, and download your creation as a PNG. Perfect for quick
            sketches, diagrams, brainstorming, and teaching.
          </p>
          <h3>Drawing Tools</h3>
          <ul>
            <li><strong>Pen</strong> — Freehand drawing with smooth strokes.</li>
            <li><strong>Line</strong> — Straight lines from point A to B.</li>
            <li><strong>Rectangle</strong> — Draw rectangles (toggle fill for filled shapes).</li>
            <li><strong>Circle</strong> — Draw ellipses/circles (toggle fill for filled shapes).</li>
            <li><strong>Eraser</strong> — Erase parts of your drawing.</li>
          </ul>
          <h3>Features</h3>
          <ul>
            <li><strong>8 preset colors</strong> plus a custom color picker.</li>
            <li><strong>Adjustable stroke width</strong> (1-20px).</li>
            <li><strong>Fill toggle</strong> for shapes (rectangles and circles).</li>
            <li><strong>Undo/Redo</strong> — up to 50 history states (Ctrl+Z / Ctrl+Shift+Z).</li>
            <li><strong>3 backgrounds</strong>: Plain white, grid, or dotted.</li>
            <li><strong>Touch support</strong> — works on tablets and touch screens.</li>
            <li><strong>Download as PNG</strong> — 1200x800 resolution.</li>
          </ul>
          <h3>Keyboard Shortcuts</h3>
          <ul>
            <li><strong>Ctrl+Z</strong> — Undo</li>
            <li><strong>Ctrl+Shift+Z</strong> — Redo</li>
          </ul>
        </div>
      }
      faqs={[
        { question: 'Is this whiteboard free to use?', answer: 'Yes — no sign-up, no limits. Draw and download as many times as you want.' },
        { question: 'What resolution is the canvas?', answer: 'The canvas is 1200x800 pixels. The downloaded PNG is full resolution.' },
        { question: 'Does it support touch / stylus?', answer: 'Yes! The canvas supports touch events, so you can draw with your finger on a tablet or phone, or use a stylus.' },
        { question: 'Is my drawing saved?', answer: 'Drawings are not saved to any server. Everything stays in your browser. If you refresh the page, your drawing is lost — download it first!' },
        { question: 'Can I undo mistakes?', answer: 'Yes — use the Undo button or Ctrl+Z. You can undo up to 50 steps. Ctrl+Shift+Z to redo.' },
      ]}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Tools */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
          {TOOL_META.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                title={t.label}
                className={`p-2 rounded-md transition-colors ${
                  tool === t.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setCustomColor(c) }}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                color === c ? 'border-primary scale-110' : 'border-border'
              }`}
              style={{ background: c }}
              title={c}
            />
          ))}
          <input
            type="color"
            value={customColor}
            onChange={e => { setColor(e.target.value); setCustomColor(e.target.value) }}
            className="w-7 h-7 rounded cursor-pointer border-0 p-0"
            title="Custom color"
          />
        </div>

        {/* Stroke width */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Width: {strokeWidth}px</span>
          <input type="range" min={1} max={20} value={strokeWidth} onChange={e => setStrokeWidth(+e.target.value)} className="w-20" />
        </div>

        {/* Fill toggle */}
        {(tool === 'rect' || tool === 'circle') && (
          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
            <input type="checkbox" checked={fillShapes} onChange={e => setFillShapes(e.target.checked)} className="rounded" />
            Fill
          </label>
        )}

        {/* Background */}
        <div className="flex items-center gap-1 ml-auto">
          {(['white', 'grid', 'dotted'] as BgType[]).map(b => (
            <button
              key={b}
              onClick={() => changeBg(b)}
              className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                bgType === b ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'
              }`}
            >
              {b.charAt(0).toUpperCase() + b.slice(1)}
            </button>
          ))}
        </div>

        {/* Undo / Redo / Clear / Download */}
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={historyIdx <= 0} title="Undo (Ctrl+Z)" className="p-2 rounded-md hover:bg-muted disabled:opacity-30 transition-colors">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={redo} disabled={historyIdx >= historyLen - 1} title="Redo (Ctrl+Shift+Z)" className="p-2 rounded-md hover:bg-muted disabled:opacity-30 transition-colors">
            <Redo2 className="h-4 w-4" />
          </button>
          <button onClick={clearCanvas} title="Clear canvas" className="p-2 rounded-md hover:bg-muted text-red-500 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
          <button onClick={handleDownload} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div ref={containerRef} className="w-full overflow-auto rounded-lg border border-border shadow-sm bg-white">
        <canvas
          ref={canvasRef}
          className="block w-full cursor-crosshair touch-none"
          style={{ maxHeight: '70vh' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
    </ToolPage>
  )
}
