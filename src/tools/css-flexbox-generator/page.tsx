'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

interface ChildFlexProps {
  flexGrow: number
  flexShrink: number
  flexBasis: string
  alignSelf: string
}

const defaultChildProps = (): ChildFlexProps => ({
  flexGrow: 0,
  flexShrink: 1,
  flexBasis: 'auto',
  alignSelf: 'auto',
})

export default function CssFlexboxGeneratorTool() {
  const [direction, setDirection] = useState('row')
  const [wrap, setWrap] = useState('nowrap')
  const [justifyContent, setJustifyContent] = useState('flex-start')
  const [alignItems, setAlignItems] = useState('stretch')
  const [gap, setGap] = useState(10)
  const [childCount, setChildCount] = useState(5)
  const [customizeChildren, setCustomizeChildren] = useState(false)
  const [selectedChild, setSelectedChild] = useState<number | null>(null)
  const [childProps, setChildProps] = useState<ChildFlexProps[]>(
    () => Array.from({ length: 10 }, () => defaultChildProps())
  )

  const directions = ['row', 'row-reverse', 'column', 'column-reverse']
  const wraps = ['nowrap', 'wrap', 'wrap-reverse']
  const justifyOptions = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']
  const alignOptions = ['stretch', 'flex-start', 'flex-end', 'center', 'baseline']
  const alignSelfOptions = ['auto', 'flex-start', 'flex-end', 'center', 'stretch']
  const flexBasisOptions = ['auto', '0', '50px', '100px', '150px', '200px']

  const handleChildCountChange = (val: number) => {
    setChildCount(val)
    setChildProps(prev => {
      const next = [...prev]
      while (next.length < val) next.push(defaultChildProps())
      return next
    })
    if (selectedChild !== null && selectedChild >= val) {
      setSelectedChild(null)
    }
  }

  const updateChildProp = (index: number, field: keyof ChildFlexProps, value: string | number) => {
    setChildProps(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const containerCssCode = useMemo(() => {
    return [
      'display: flex;',
      `flex-direction: ${direction};`,
      `flex-wrap: ${wrap};`,
      `justify-content: ${justifyContent};`,
      `align-items: ${alignItems};`,
      `gap: ${gap}px;`,
    ].join('\n')
  }, [direction, wrap, justifyContent, alignItems, gap])

  const getChildCssLines = (i: number): string[] => {
    const p = childProps[i]
    if (!p) return []
    const lines: string[] = []
    if (p.flexGrow !== 0) lines.push(`flex-grow: ${p.flexGrow};`)
    if (p.flexShrink !== 1) lines.push(`flex-shrink: ${p.flexShrink};`)
    if (p.flexBasis !== 'auto') lines.push(`flex-basis: ${p.flexBasis};`)
    if (p.alignSelf !== 'auto') lines.push(`align-self: ${p.alignSelf};`)
    return lines
  }

  const fullCodeOutput = useMemo(() => {
    const containerLines = [
      '.container {',
      '  display: flex;',
      `  flex-direction: ${direction};`,
      `  flex-wrap: ${wrap};`,
      `  justify-content: ${justifyContent};`,
      `  align-items: ${alignItems};`,
      `  gap: ${gap}px;`,
      '}',
    ]

    // Collect unique child CSS rules
    const childCssBlocks: string[] = []
    if (customizeChildren) {
      for (let i = 0; i < childCount; i++) {
        const lines = getChildCssLines(i)
        if (lines.length > 0) {
          childCssBlocks.push('')
          childCssBlocks.push(`.container > .item-${i + 1} {`)
          lines.forEach(l => childCssBlocks.push(`  ${l}`))
          childCssBlocks.push('}')
        }
      }
    }

    const cssSection = [...containerLines, ...childCssBlocks].join('\n')

    const htmlLines = ['<div class="container">']
    for (let i = 0; i < childCount; i++) {
      const hasCustom = customizeChildren && getChildCssLines(i).length > 0
      const cls = hasCustom ? `item item-${i + 1}` : 'item'
      htmlLines.push(`  <div class="${cls}">${i + 1}</div>`)
    }
    htmlLines.push('</div>')
    const htmlSection = htmlLines.join('\n')

    return `/* CSS */\n${cssSection}\n\n<!-- HTML -->\n${htmlSection}`
  }, [direction, wrap, justifyContent, alignItems, gap, childCount, customizeChildren, childProps])

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction as React.CSSProperties['flexDirection'],
    flexWrap: wrap as React.CSSProperties['flexWrap'],
    justifyContent,
    alignItems,
    gap: `${gap}px`,
    minHeight: 250,
    padding: 16,
    border: '2px dashed',
    borderColor: 'var(--border)',
    borderRadius: 8,
    backgroundColor: 'var(--muted)',
  }

  const childColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

  return (
    <ToolPage
      title="CSS Flexbox Generator"
      description="Visual flexbox playground with live preview and generated CSS."
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSS Flexbox Generator is a free browser-based tool that lets you build flexbox layouts visually by adjusting properties like direction, wrap, justify-content, align-items, and gap. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Use the visual controls (sliders, color pickers, toggles) to design your effect.</li>
            <li>See the <strong>live preview</strong> update in real time as you adjust settings.</li>
            <li>Review the generated <strong>CSS code</strong> in the code panel below.</li>
            <li>Click <strong>Copy CSS</strong> to paste the code directly into your stylesheet.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating responsive navigation bars, card grids, centering elements, and flexible page layouts. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is CSS Flexbox used for?', answer: 'CSS Flexbox is a one-dimensional layout model for distributing space and aligning items in a container, making it ideal for navigation bars, card layouts, and centering content.' },
        { question: 'What is the difference between justify-content and align-items?', answer: 'justify-content controls spacing along the main axis (horizontal by default), while align-items controls alignment along the cross axis (vertical by default).' },
        { question: 'When should I use Flexbox vs CSS Grid?', answer: 'Use Flexbox for one-dimensional layouts (a single row or column) and CSS Grid for two-dimensional layouts where you need control over both rows and columns simultaneously.' },
        { question: 'What does flex-wrap do?', answer: 'flex-wrap controls whether flex items are forced onto a single line or can wrap onto multiple lines when they overflow the container.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">flex-direction</label>
            <div className="flex gap-2 flex-wrap">
              {directions.map(d => (
                <button key={d} onClick={() => setDirection(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${direction === d ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>{d}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">flex-wrap</label>
            <div className="flex gap-2 flex-wrap">
              {wraps.map(w => (
                <button key={w} onClick={() => setWrap(w)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${wrap === w ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>{w}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">justify-content</label>
            <div className="flex gap-2 flex-wrap">
              {justifyOptions.map(j => (
                <button key={j} onClick={() => setJustifyContent(j)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${justifyContent === j ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>{j}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">align-items</label>
            <div className="flex gap-2 flex-wrap">
              {alignOptions.map(a => (
                <button key={a} onClick={() => setAlignItems(a)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${alignItems === a ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>{a}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">gap: {gap}px</label>
            <input type="range" min={0} max={50} value={gap} onChange={e => setGap(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Child Items: {childCount}</label>
            <input type="range" min={1} max={10} value={childCount} onChange={e => handleChildCountChange(+e.target.value)} className="w-full" />
          </div>

          {/* Customize Children Toggle */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" checked={customizeChildren} onChange={e => { setCustomizeChildren(e.target.checked); if (!e.target.checked) setSelectedChild(null) }} className="rounded" />
              Customize Children
            </label>
            {customizeChildren && (
              <p className="text-xs text-muted-foreground mt-1">Click a child item in the preview to edit its flex properties.</p>
            )}
          </div>

          {/* Per-child settings panel */}
          {customizeChildren && selectedChild !== null && selectedChild < childCount && (
            <div className="p-3 rounded-lg border border-border bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Item {selectedChild + 1} Properties</label>
                <button onClick={() => setSelectedChild(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">flex-grow: {childProps[selectedChild].flexGrow}</label>
                  <input type="range" min={0} max={5} value={childProps[selectedChild].flexGrow} onChange={e => updateChildProp(selectedChild, 'flexGrow', +e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">flex-shrink: {childProps[selectedChild].flexShrink}</label>
                  <input type="range" min={0} max={5} value={childProps[selectedChild].flexShrink} onChange={e => updateChildProp(selectedChild, 'flexShrink', +e.target.value)} className="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">flex-basis</label>
                  <select value={childProps[selectedChild].flexBasis} onChange={e => updateChildProp(selectedChild, 'flexBasis', e.target.value)} className="w-full rounded-lg border border-input bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                    {flexBasisOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">align-self</label>
                  <select value={childProps[selectedChild].alignSelf} onChange={e => updateChildProp(selectedChild, 'alignSelf', e.target.value)} className="w-full rounded-lg border border-input bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                    {alignSelfOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview {customizeChildren && <span className="text-xs text-muted-foreground font-normal">(click an item to customize)</span>}</label>
            <div style={containerStyle}>
              {Array.from({ length: childCount }, (_, i) => {
                const cp = childProps[i]
                const childStyle: React.CSSProperties = {
                  backgroundColor: childColors[i % childColors.length],
                  padding: '12px 20px',
                  minWidth: 50,
                  minHeight: 50,
                  ...(customizeChildren && cp ? {
                    flexGrow: cp.flexGrow,
                    flexShrink: cp.flexShrink,
                    flexBasis: cp.flexBasis,
                    alignSelf: cp.alignSelf === 'auto' ? undefined : cp.alignSelf,
                  } : {}),
                }
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-white text-sm font-bold rounded ${customizeChildren ? 'cursor-pointer' : ''} ${customizeChildren && selectedChild === i ? 'ring-2 ring-white ring-offset-2 ring-offset-background' : ''}`}
                    style={childStyle}
                    onClick={() => { if (customizeChildren) setSelectedChild(i) }}
                  >
                    {i + 1}
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">CSS Code</label>
              <CopyButton text={containerCssCode} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre">{containerCssCode}</pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">HTML + CSS</label>
              <CopyButton text={fullCodeOutput} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre overflow-x-auto max-h-64 overflow-y-auto">{fullCodeOutput}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
