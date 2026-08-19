'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

export default function CssColumnsGeneratorTool() {
  const [columnCount, setColumnCount] = useState(3)
  const [columnGap, setColumnGap] = useState(20)
  const [ruleStyle, setRuleStyle] = useState('solid')
  const [ruleWidth, setRuleWidth] = useState(1)
  const [ruleColor, setRuleColor] = useState('#e2e8f0')
  const [columnWidth, setColumnWidth] = useState('')

  const sampleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`

  const css = useMemo(() => {
    const rules: string[] = []
    if (columnWidth) {
      rules.push(`column-width: ${columnWidth};`)
    } else {
      rules.push(`column-count: ${columnCount};`)
    }
    rules.push(`column-gap: ${columnGap}px;`)
    if (ruleStyle !== 'none') {
      rules.push(`column-rule: ${ruleWidth}px ${ruleStyle} ${ruleColor};`)
    }
    return `.multi-column {\n  ${rules.join('\n  ')}\n}`
  }, [columnCount, columnGap, ruleStyle, ruleWidth, ruleColor, columnWidth])

  const previewStyle: React.CSSProperties = useMemo(() => {
    const style: React.CSSProperties = {
      columnGap: `${columnGap}px`,
    }
    if (columnWidth) {
      style.columnWidth = columnWidth
    } else {
      style.columnCount = columnCount
    }
    if (ruleStyle !== 'none') {
      style.columnRuleStyle = ruleStyle
      style.columnRuleWidth = `${ruleWidth}px`
      style.columnRuleColor = ruleColor
    }
    return style
  }, [columnCount, columnGap, ruleStyle, ruleWidth, ruleColor, columnWidth])

  return (
    <ToolPage
      title="CSS Columns Generator"
      description="Generate multi-column CSS layouts with live preview"
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSS Columns Generator is a free browser-based tool that lets you create multi-column text layouts using CSS columns with configurable column count, gap, and rule properties. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Use the visual controls (sliders, color pickers, toggles) to design your effect.</li>
            <li>See the <strong>live preview</strong> update in real time as you adjust settings.</li>
            <li>Review the generated <strong>CSS code</strong> in the code panel below.</li>
            <li>Click <strong>Copy CSS</strong> to paste the code directly into your stylesheet.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating newspaper-style layouts, multi-column text sections, or masonry-like content arrangements. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is the CSS multi-column layout?', answer: 'CSS multi-column layout splits content into multiple columns similar to a newspaper, using properties like column-count, column-gap, and column-rule.' },
        { question: 'What is the difference between column-count and column-width?', answer: 'column-count sets a fixed number of columns, while column-width sets a minimum width and lets the browser create as many columns as fit. Setting column-width overrides column-count.' },
        { question: 'How do I add dividers between CSS columns?', answer: 'Use the column-rule property (shorthand for column-rule-width, column-rule-style, and column-rule-color) to add a visible line between columns.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Column Count: {columnCount}</label>
            <input type="range" min={1} max={6} value={columnCount} onChange={(e) => { setColumnCount(Number(e.target.value)); setColumnWidth('') }} className="w-full" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Column Width (optional)</label>
            <input
              type="text"
              value={columnWidth}
              onChange={(e) => setColumnWidth(e.target.value)}
              placeholder="e.g. 200px, 15em"
              className="w-full px-3 py-1.5 rounded-md border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">Overrides column count if set</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Column Gap: {columnGap}px</label>
            <input type="range" min={0} max={60} value={columnGap} onChange={(e) => setColumnGap(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Rule Style</label>
            <select value={ruleStyle} onChange={(e) => setRuleStyle(e.target.value)} className="w-full px-3 py-1.5 rounded-md border border-input bg-tool-bg text-sm">
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
              <option value="groove">Groove</option>
              <option value="ridge">Ridge</option>
            </select>
          </div>
          {ruleStyle !== 'none' && (
            <>
              <div>
                <label className="text-sm font-medium block mb-1">Rule Width: {ruleWidth}px</label>
                <input type="range" min={1} max={10} value={ruleWidth} onChange={(e) => setRuleWidth(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Rule Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={ruleColor} onChange={(e) => setRuleColor(e.target.value)} className="w-10 h-8 rounded border border-input cursor-pointer" />
                  <input type="text" value={ruleColor} onChange={(e) => setRuleColor(e.target.value)} className="flex-1 px-3 py-1.5 rounded-md border border-input bg-tool-bg text-sm font-mono" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Preview & CSS */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Live Preview</span>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card" style={previewStyle}>
              <p className="text-sm leading-relaxed whitespace-pre-line">{sampleText}</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Generated CSS</span>
              <CopyButton text={css} />
            </div>
            <pre className="p-4 rounded-lg bg-muted text-sm font-mono overflow-x-auto">{css}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
