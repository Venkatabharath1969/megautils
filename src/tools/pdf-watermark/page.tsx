'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, FileText, Shield, Loader2, Droplets } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'

type ApplyTo = 'all' | 'first' | 'custom'

export default function PDFWatermarkTool() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL')
  const [fontSize, setFontSize] = useState(48)
  const [hexColor, setHexColor] = useState('#888888')
  const [opacity, setOpacity] = useState(0.2)
  const [rotation, setRotation] = useState(-45)
  const [applyTo, setApplyTo] = useState<ApplyTo>('all')
  const [customRange, setCustomRange] = useState('')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultSize, setResultSize] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  /** Parse hex color to 0-1 RGB components */
  const hexToRgb = (hex: string): [number, number, number] => {
    const h = hex.replace('#', '')
    const r = parseInt(h.substring(0, 2), 16) / 255
    const g = parseInt(h.substring(2, 4), 16) / 255
    const b = parseInt(h.substring(4, 6), 16) / 255
    return [r, g, b]
  }

  /** Parse a page range string into a Set of 0-based indices */
  const parseRange = (input: string, total: number): Set<number> => {
    const indices = new Set<number>()
    const parts = input.split(',').map(s => s.trim()).filter(Boolean)
    for (const part of parts) {
      if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number)
        if (isNaN(a) || isNaN(b)) continue
        const start = Math.max(1, Math.min(a, b))
        const end = Math.min(total, Math.max(a, b))
        for (let i = start; i <= end; i++) indices.add(i - 1)
      } else {
        const n = Number(part)
        if (!isNaN(n) && n >= 1 && n <= total) indices.add(n - 1)
      }
    }
    return indices
  }

  const processFile = useCallback(async (f: File) => {
    setError(null)
    setResultUrl(null)
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.')
      return
    }
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setFile(f)
      setFileName(f.name)
      setFileSize(f.size)
      setPageCount(pdf.getPageCount())
      setCustomRange(`1-${pdf.getPageCount()}`)
    } catch {
      setError('Could not read this PDF. It may be corrupted or password-protected.')
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [processFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])

  const addWatermark = useCallback(async () => {
    if (!file || !watermarkText.trim()) {
      setError('Please enter watermark text.')
      return
    }
    setIsProcessing(true)
    setError(null)
    setResultUrl(null)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const pages = pdf.getPages()
      const [r, g, b] = hexToRgb(hexColor)

      // Determine which pages to watermark
      let targetIndices: Set<number>
      if (applyTo === 'first') {
        targetIndices = new Set([0])
      } else if (applyTo === 'custom') {
        targetIndices = parseRange(customRange, pages.length)
      } else {
        targetIndices = new Set(pages.map((_, i) => i))
      }

      pages.forEach((page, i) => {
        if (!targetIndices.has(i)) return
        const { width, height } = page.getSize()
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize)
        const textHeight = font.heightAtSize(fontSize)

        // Center the watermark on the page
        const x = (width - textWidth) / 2
        const y = (height - textHeight) / 2

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity,
          rotate: degrees(rotation),
        })
      })

      const savedBytes = await pdf.save()
      const blob = new Blob([new Uint8Array(savedBytes)], { type: 'application/pdf' })
      setResultSize(blob.size)
      setResultUrl(URL.createObjectURL(blob))
    } catch {
      setError('Failed to add watermark. The file may be corrupted.')
    } finally {
      setIsProcessing(false)
    }
  }, [file, watermarkText, fontSize, hexColor, opacity, rotation, applyTo, customRange])

  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = fileName.replace(/\.pdf$/i, '') + '_watermarked.pdf'
    a.click()
  }, [resultUrl, fileName])

  const clear = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null)
    setFileName('')
    setFileSize(0)
    setPageCount(0)
    setResultUrl(null)
    setResultSize(0)
    setError(null)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Add Watermark to PDF"
      description="Stamp custom watermark text on PDF pages. Choose color, size, opacity, and rotation. Free, private, in-browser."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'Can I use any text as a watermark?', answer: 'Yes. Type any text — "CONFIDENTIAL", "DRAFT", your company name, a date, or anything you like. The text is rendered with the Helvetica font.' },
        { question: 'Can I control which pages get the watermark?', answer: 'Yes. Choose "All pages", "First page only", or "Custom range" to apply the watermark to specific pages using comma-separated numbers and ranges.' },
        { question: 'Are my files uploaded to a server?', answer: 'No. All watermarking happens locally in your browser using pdf-lib. Your files never leave your device.' },
        { question: 'Can I remove a watermark added by this tool?', answer: 'No — the watermark is permanently drawn onto the page content. Always keep your original un-watermarked file as a backup.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Watermark?</h2>
          <p>
            This tool stamps a text watermark onto PDF pages. Use it to mark documents as &ldquo;DRAFT&rdquo;,
            &ldquo;CONFIDENTIAL&rdquo;, or add your company name as a visual deterrent against unauthorized use.
            You control the text, color, opacity, font size, rotation angle, and which pages receive the mark.
            Everything runs locally in your browser.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a PDF by clicking the upload area or dragging it in.</li>
            <li>Enter your watermark text (e.g. &ldquo;CONFIDENTIAL&rdquo;).</li>
            <li>Adjust font size, color, opacity, and rotation to your liking.</li>
            <li>Choose which pages to apply the watermark to.</li>
            <li>Click <strong>Add Watermark</strong> and download the result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <ul>
            <li>Mark draft documents so recipients know the content is not final.</li>
            <li>Stamp &ldquo;CONFIDENTIAL&rdquo; on sensitive business documents.</li>
            <li>Add your company name to documents shared externally.</li>
            <li>Label review copies with a date or version number.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Keep opacity low (0.1–0.3) so the watermark is visible but does not obscure content.</li>
            <li>A rotation of -45° creates the classic diagonal watermark look.</li>
            <li>Use a light gray color for subtle branding or a bold red for strong warnings.</li>
            <li>The watermark is permanent — always keep a backup of the original file.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upload PDF File</label>
          {file && <ClearButton onClear={clear} />}
        </div>

        {/* Upload zone */}
        {!file && (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {isDragging ? 'Drop your PDF here' : 'Click to upload or drag a PDF file'}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Single PDF file</span>
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileInput} className="hidden" />
          </label>
        )}

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-green-500" />
          Your files never leave your device
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        {/* File info + controls */}
        {file && (
          <div className="space-y-4">
            {/* File card */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <FileText className="h-5 w-5 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{fileName}</div>
                <div className="text-xs text-muted-foreground">{pageCount} page{pageCount !== 1 ? 's' : ''} &middot; {formatFileSize(fileSize)}</div>
              </div>
            </div>

            {/* Watermark text */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Watermark Text</label>
              <input
                type="text"
                value={watermarkText}
                onChange={e => setWatermarkText(e.target.value)}
                placeholder="CONFIDENTIAL"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex flex-wrap gap-1.5 mt-1">
                {['CONFIDENTIAL', 'DRAFT', 'SAMPLE', 'DO NOT COPY'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => setWatermarkText(preset)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${watermarkText === preset ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Font Size: {fontSize}pt</label>
              <input
                type="range"
                min={20}
                max={100}
                value={fontSize}
                onChange={e => setFontSize(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20pt</span>
                <span>100pt</span>
              </div>
            </div>

            {/* Color + Opacity row */}
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={hexColor}
                    onChange={e => setHexColor(e.target.value)}
                    className="h-9 w-9 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={hexColor}
                    onChange={e => setHexColor(e.target.value)}
                    className="w-24 px-2 py-1.5 text-sm rounded-lg border border-border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="space-y-1.5 flex-1 min-w-[180px]">
                <label className="text-sm font-medium">Opacity: {(opacity * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={opacity * 100}
                  onChange={e => setOpacity(parseInt(e.target.value) / 100)}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Rotation: {rotation}°</label>
              <input
                type="range"
                min={-45}
                max={45}
                value={rotation}
                onChange={e => setRotation(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>-45°</span>
                <span>0°</span>
                <span>45°</span>
              </div>
            </div>

            {/* Apply to */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Apply To</label>
              <div className="flex flex-wrap gap-2">
                {([
                  ['all', 'All Pages'],
                  ['first', 'First Page Only'],
                  ['custom', 'Custom Range'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setApplyTo(value)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-colors ${applyTo === value ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:bg-muted/50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {applyTo === 'custom' && (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={customRange}
                    onChange={e => setCustomRange(e.target.value)}
                    placeholder="e.g. 1,3,5-8"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated page numbers and ranges. Valid: 1–{pageCount}</p>
                </div>
              )}
            </div>

            {/* Watermark preview */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 flex items-center justify-center min-h-[80px]">
              <span
                className="font-sans select-none"
                style={{
                  fontSize: `${Math.min(fontSize, 36)}px`,
                  color: hexColor,
                  opacity,
                  transform: `rotate(${rotation}deg)`,
                  display: 'inline-block',
                }}
              >
                {watermarkText || 'Preview'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={addWatermark}
                disabled={isProcessing || !watermarkText.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Droplets className="h-4 w-4" />}
                {isProcessing ? 'Processing...' : 'Add Watermark'}
              </button>
            </div>

            {/* Result */}
            {resultUrl && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
                  <div>Watermark added successfully</div>
                  <div><strong>{pageCount}</strong> page{pageCount !== 1 ? 's' : ''} &middot; {formatFileSize(resultSize)}</div>
                </div>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" /> Download Watermarked PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
