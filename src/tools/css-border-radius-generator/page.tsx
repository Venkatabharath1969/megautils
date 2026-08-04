'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

export default function CssBorderRadiusGeneratorTool() {
  const [linked, setLinked] = useState(true)
  const [allCorners, setAllCorners] = useState(16)
  const [topLeft, setTopLeft] = useState(16)
  const [topRight, setTopRight] = useState(16)
  const [bottomRight, setBottomRight] = useState(16)
  const [bottomLeft, setBottomLeft] = useState(16)
  const [boxSize] = useState(200)
  const [boxColor, setBoxColor] = useState('#3b82f6')

  const handleAllChange = (val: number) => {
    setAllCorners(val)
    if (linked) {
      setTopLeft(val)
      setTopRight(val)
      setBottomRight(val)
      setBottomLeft(val)
    }
  }

  const values = linked
    ? { tl: allCorners, tr: allCorners, br: allCorners, bl: allCorners }
    : { tl: topLeft, tr: topRight, br: bottomRight, bl: bottomLeft }

  const borderRadiusValue = useMemo(() => {
    const { tl, tr, br, bl } = values
    if (tl === tr && tr === br && br === bl) return `${tl}px`
    return `${tl}px ${tr}px ${br}px ${bl}px`
  }, [values])

  const shorthandCSS = `border-radius: ${borderRadiusValue};`
  const longhandCSS = [
    `border-top-left-radius: ${values.tl}px;`,
    `border-top-right-radius: ${values.tr}px;`,
    `border-bottom-right-radius: ${values.br}px;`,
    `border-bottom-left-radius: ${values.bl}px;`,
  ].join('\n')

  return (
    <ToolPage title="CSS Border Radius Generator" description="Visually design border radius with individual corner controls and live preview." category="css" categoryLabel="CSS Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={linked} onChange={e => { setLinked(e.target.checked); if (e.target.checked) handleAllChange(allCorners) }} className="rounded" />
              Link all corners
            </label>
          </div>

          {linked ? (
            <div>
              <label className="text-sm font-medium mb-2 block">All Corners: {allCorners}px</label>
              <input type="range" min={0} max={100} value={allCorners} onChange={e => handleAllChange(+e.target.value)} className="w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Top Left: {topLeft}px</label>
                <input type="range" min={0} max={100} value={topLeft} onChange={e => setTopLeft(+e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Top Right: {topRight}px</label>
                <input type="range" min={0} max={100} value={topRight} onChange={e => setTopRight(+e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Bottom Left: {bottomLeft}px</label>
                <input type="range" min={0} max={100} value={bottomLeft} onChange={e => setBottomLeft(+e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Bottom Right: {bottomRight}px</label>
                <input type="range" min={0} max={100} value={bottomRight} onChange={e => setBottomRight(+e.target.value)} className="w-full" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Box Color:</label>
            <input type="color" value={boxColor} onChange={e => setBoxColor(e.target.value)} className="w-8 h-8 rounded border border-border cursor-pointer" />
          </div>
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div className="flex items-center justify-center p-8 rounded-lg bg-muted">
              <div
                style={{
                  width: boxSize,
                  height: boxSize,
                  backgroundColor: boxColor,
                  borderRadius: borderRadiusValue,
                  transition: 'border-radius 0.2s ease',
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Shorthand CSS</label>
              <CopyButton text={shorthandCSS} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono">{shorthandCSS}</pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Longhand CSS</label>
              <CopyButton text={longhandCSS} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre">{longhandCSS}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
