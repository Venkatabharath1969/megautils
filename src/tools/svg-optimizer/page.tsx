'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'
import { Upload } from 'lucide-react'

function optimizeSvg(svg: string, options: {
  removeComments: boolean
  removeMetadata: boolean
  removeEmptyAttrs: boolean
  minifyWhitespace: boolean
  removeXmlDecl: boolean
  removeDoctype: boolean
}): string {
  let result = svg

  // Remove XML declaration
  if (options.removeXmlDecl) {
    result = result.replace(/<\?xml[^?]*\?>\s*/gi, '')
  }

  // Remove DOCTYPE
  if (options.removeDoctype) {
    result = result.replace(/<!DOCTYPE[^>]*>\s*/gi, '')
  }

  // Remove comments
  if (options.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '')
  }

  // Remove metadata elements
  if (options.removeMetadata) {
    result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
    result = result.replace(/<desc[\s\S]*?<\/desc>/gi, '')
    result = result.replace(/<title[\s\S]*?<\/title>/gi, '')
  }

  // Remove empty attributes (attr="")
  if (options.removeEmptyAttrs) {
    result = result.replace(/\s+[\w-]+=""\s*/g, ' ')
  }

  // Remove editor data attributes
  result = result.replace(/\s+(data-name|inkscape:[^\s=]+|sodipodi:[^\s=]+|xmlns:inkscape|xmlns:sodipodi|xmlns:rdf|xmlns:cc|xmlns:dc)="[^"]*"/g, '')

  // Minify whitespace
  if (options.minifyWhitespace) {
    // Collapse multiple spaces/newlines
    result = result.replace(/\s{2,}/g, ' ')
    // Remove spaces between tags
    result = result.replace(/>\s+</g, '><')
    // Trim
    result = result.trim()
  }

  return result
}

export default function SvgOptimizerTool() {
  const [input, setInput] = useState('')
  const [removeComments, setRemoveComments] = useState(true)
  const [removeMetadata, setRemoveMetadata] = useState(true)
  const [removeEmptyAttrs, setRemoveEmptyAttrs] = useState(true)
  const [minifyWhitespace, setMinifyWhitespace] = useState(true)
  const [removeXmlDecl, setRemoveXmlDecl] = useState(true)
  const [removeDoctype, setRemoveDoctype] = useState(true)

  const output = useMemo(() => {
    if (!input.trim()) return ''
    return optimizeSvg(input, {
      removeComments,
      removeMetadata,
      removeEmptyAttrs,
      minifyWhitespace,
      removeXmlDecl,
      removeDoctype,
    })
  }, [input, removeComments, removeMetadata, removeEmptyAttrs, minifyWhitespace, removeXmlDecl, removeDoctype])

  const originalSize = new Blob([input]).size
  const optimizedSize = new Blob([output]).size
  const savings = originalSize > 0 ? ((1 - optimizedSize / originalSize) * 100).toFixed(1) : '0'

  const svgFileRef = useRef<HTMLInputElement>(null)
  const handleSvgFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setInput(ev.target?.result as string)
    reader.readAsText(file)
  }, [])

  const clear = () => { setInput(''); if (svgFileRef.current) svgFileRef.current.value = '' }

  const options = [
    { label: 'Remove comments', checked: removeComments, set: setRemoveComments },
    { label: 'Remove metadata', checked: removeMetadata, set: setRemoveMetadata },
    { label: 'Remove empty attributes', checked: removeEmptyAttrs, set: setRemoveEmptyAttrs },
    { label: 'Minify whitespace', checked: minifyWhitespace, set: setMinifyWhitespace },
    { label: 'Remove XML declaration', checked: removeXmlDecl, set: setRemoveXmlDecl },
    { label: 'Remove DOCTYPE', checked: removeDoctype, set: setRemoveDoctype },
  ]

  return (
    <ToolPage
      title="SVG Optimizer"
      description="Optimize and minify SVG code by removing unnecessary data"
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>SVG Optimizer is a free browser-based tool that lets you optimize SVG files by removing unnecessary metadata, comments, and whitespace to reduce file size. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload your image using the <strong>file picker</strong> or drag and drop.</li>
            <li>Configure output settings such as size, format, or quality level.</li>
            <li>Preview the result and compare it with the original if available.</li>
            <li>Download the processed image to your device.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when reducing SVG file sizes for faster web loading, cleaning up exported SVGs from design tools, or preparing icons for production. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web optimization tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Supported input formats typically include JPEG, PNG, WebP, and GIF — check specific format notes below the tool.</li>
            <li>Larger images produce higher quality output but take longer to process in the browser.</li>
            <li>The original image is never modified — all processing creates a new output file.</li>
            <li>For batch processing, use the tool repeatedly — each image is handled independently.</li>
            <li>Your images are never uploaded to any server — all processing happens on your device.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How much can SVG optimization reduce file size?', answer: 'SVG optimization typically reduces file size by 20-60%, depending on the source. SVGs exported from editors like Illustrator or Inkscape often contain significant metadata and comments that can be safely removed.' },
        { question: 'Does optimizing SVG affect image quality?', answer: 'No. SVG optimization removes unnecessary metadata, comments, and whitespace without changing the visual appearance of the image.' },
        { question: 'What does removing XML declarations do?', answer: 'The XML declaration (<?xml ...?>) is optional when SVGs are embedded directly in HTML. Removing it saves a few bytes and is safe for web use.' },
        { question: 'Is it safe to remove SVG metadata?', answer: 'Yes, for web use. Metadata elements like <title>, <desc>, and editor-specific attributes are not needed for rendering and can be safely stripped.' },
      ]}
    >
      {/* File upload */}
      <div className="mb-4">
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted cursor-pointer transition-colors text-sm font-medium">
          <Upload className="h-4 w-4" />
          Upload SVG File
          <input ref={svgFileRef} type="file" accept=".svg" onChange={handleSvgFile} className="hidden" />
        </label>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
        {options.map((opt) => (
          <label key={opt.label} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={opt.checked}
              onChange={(e) => opt.set(e.target.checked)}
              className="rounded accent-primary"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">SVG Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea
            value={input}
            onChange={setInput}
            placeholder={'Paste SVG code here...\n<svg xmlns="http://www.w3.org/2000/svg" ...>'}
            rows={14}
          />
          {input && (
            <div className="mt-1 text-xs text-muted-foreground">
              Original: {originalSize.toLocaleString()} bytes
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Optimized Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="optimized.svg" mimeType="image/svg+xml" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Optimized SVG will appear here..." rows={14} />
          {output && (
            <div className="mt-1 text-xs text-muted-foreground">
              Optimized: {optimizedSize.toLocaleString()} bytes
              {' '}({savings}% smaller)
            </div>
          )}
        </div>
      </div>

      {output && (
        <div className="mt-4 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
          Saved <strong>{(originalSize - optimizedSize).toLocaleString()} bytes</strong> ({savings}% reduction)
        </div>
      )}

      {/* Before/After SVG preview */}
      {input && output && input.includes('<svg') && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-1 block">Before</span>
            <div className="border border-border rounded-lg p-3 bg-white dark:bg-gray-950 flex items-center justify-center min-h-[120px]" dangerouslySetInnerHTML={{ __html: input }} />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-1 block">After</span>
            <div className="border border-border rounded-lg p-3 bg-white dark:bg-gray-950 flex items-center justify-center min-h-[120px]" dangerouslySetInnerHTML={{ __html: output }} />
          </div>
        </div>
      )}
    </ToolPage>
  )
}
