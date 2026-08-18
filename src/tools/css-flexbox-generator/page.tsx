'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

export default function CssFlexboxGeneratorTool() {
  const [direction, setDirection] = useState('row')
  const [wrap, setWrap] = useState('nowrap')
  const [justifyContent, setJustifyContent] = useState('flex-start')
  const [alignItems, setAlignItems] = useState('stretch')
  const [gap, setGap] = useState(10)
  const [childCount, setChildCount] = useState(5)

  const directions = ['row', 'row-reverse', 'column', 'column-reverse']
  const wraps = ['nowrap', 'wrap', 'wrap-reverse']
  const justifyOptions = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']
  const alignOptions = ['stretch', 'flex-start', 'flex-end', 'center', 'baseline']

  const cssCode = useMemo(() => {
    return [
      'display: flex;',
      `flex-direction: ${direction};`,
      `flex-wrap: ${wrap};`,
      `justify-content: ${justifyContent};`,
      `align-items: ${alignItems};`,
      `gap: ${gap}px;`,
    ].join('\n')
  }, [direction, wrap, justifyContent, alignItems, gap])

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
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating responsive navigation bars, card grids, centering elements, and flexible page layouts. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need css flexbox layout.</li>
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
            <input type="range" min={1} max={10} value={childCount} onChange={e => setChildCount(+e.target.value)} className="w-full" />
          </div>
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div style={containerStyle}>
              {Array.from({ length: childCount }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center text-white text-sm font-bold rounded"
                  style={{
                    backgroundColor: childColors[i % childColors.length],
                    padding: '12px 20px',
                    minWidth: 50,
                    minHeight: 50,
                  }}
                >
                  {i + 1}
                </div>
              ))}
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
