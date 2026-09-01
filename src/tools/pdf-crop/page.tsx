'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, Shield, Loader2, FileText, Crop } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

type ApplyTo = 'all' | 'current' | 'custom'

interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export default function PDFCropTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [pdfPageWidth, setPdfPageWidth] = useState(0)
  const [pdfPageHeight, setPdfPageHeight] = useState(0)
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 })
  const [applyTo, setApplyTo] = useState<ApplyTo>('all')
  const [customRange, setCustomRange] = useState('1')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultSize, setResultSize] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<{ active: boolean; startX: number; startY: number; mode: 'create' | 'move'; origRect: CropRect } | null>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const loadFile = useCallback(async (f: File) => {
    setError(null)
    setResultUrl(null)
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.')
      return
    }
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const count = pdf.getPageCount()
      setPageCount(count)
      setFile(f)

      // Render first page preview
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
      const pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise
      const page = await pdfDoc.getPage(1)
      const viewport = page.getViewport({ scale: 1 })
      setPdfPageWidth(viewport.width)
      setPdfPageHeight(viewport.height)

      const scale = Math.min(600 / viewport.width, 800 / viewport.height, 1.5)
      const scaledViewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      await page.render({ canvas, viewport: scaledViewport }).promise
      setPreviewDataUrl(canvas.toDataURL())

      // Default crop: full page
      setCropRect({ x: 0, y: 0, width: scaledViewport.width, height: scaledViewport.height })
    } catch {
      setError('Could not read this PDF. It may be corrupted.')
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) loadFile(files[0])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [loadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) loadFile(e.dataTransfer.files[0])
  }, [loadFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  // Interactive crop handlers
  const getRelativePos = (e: React.MouseEvent | MouseEvent) => {
    if (!previewRef.current) return { x: 0, y: 0 }
    const rect = previewRef.current.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(e.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(e.clientY - rect.top, rect.height)),
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const pos = getRelativePos(e)
    // Check if clicking inside existing crop rect to move it
    if (
      pos.x >= cropRect.x && pos.x <= cropRect.x + cropRect.width &&
      pos.y >= cropRect.y && pos.y <= cropRect.y + cropRect.height &&
      cropRect.width > 10 && cropRect.height > 10
    ) {
      setDragState({ active: true, startX: pos.x, startY: pos.y, mode: 'move', origRect: { ...cropRect } })
    } else {
      setCropRect({ x: pos.x, y: pos.y, width: 0, height: 0 })
      setDragState({ active: true, startX: pos.x, startY: pos.y, mode: 'create', origRect: { x: pos.x, y: pos.y, width: 0, height: 0 } })
    }
  }

  useEffect(() => {
    if (!dragState?.active) return
    const handleMouseMove = (e: MouseEvent) => {
      const pos = getRelativePos(e)
      if (!previewRef.current) return
      const bounds = previewRef.current.getBoundingClientRect()
      if (dragState.mode === 'create') {
        const x = Math.min(pos.x, dragState.startX)
        const y = Math.min(pos.y, dragState.startY)
        const w = Math.abs(pos.x - dragState.startX)
        const h = Math.abs(pos.y - dragState.startY)
        setCropRect({
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: Math.min(w, bounds.width - Math.max(0, x)),
          height: Math.min(h, bounds.height - Math.max(0, y)),
        })
      } else {
        const dx = pos.x - dragState.startX
        const dy = pos.y - dragState.startY
        const newX = Math.max(0, Math.min(dragState.origRect.x + dx, bounds.width - dragState.origRect.width))
        const newY = Math.max(0, Math.min(dragState.origRect.y + dy, bounds.height - dragState.origRect.height))
        setCropRect({ ...dragState.origRect, x: newX, y: newY })
      }
    }
    const handleMouseUp = () => setDragState(null)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState])

  const parsePageRange = (range: string, total: number): number[] => {
    const pages = new Set<number>()
    for (const part of range.split(',')) {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [a, b] = trimmed.split('-').map(Number)
        if (!isNaN(a) && !isNaN(b)) {
          for (let i = Math.max(1, a); i <= Math.min(total, b); i++) pages.add(i - 1)
        }
      } else {
        const n = parseInt(trimmed)
        if (!isNaN(n) && n >= 1 && n <= total) pages.add(n - 1)
      }
    }
    return Array.from(pages).sort((a, b) => a - b)
  }

  const cropPDF = useCallback(async () => {
    if (!file || !previewRef.current) return
    setIsProcessing(true)
    setError(null)
    setResultUrl(null)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const pages = pdf.getPages()
      const bounds = previewRef.current.getBoundingClientRect()

      // Scale crop rect from preview coordinates to PDF coordinates
      const scaleX = pdfPageWidth / bounds.width
      const scaleY = pdfPageHeight / bounds.height

      const pdfCropX = cropRect.x * scaleX
      const pdfCropY = cropRect.y * scaleY
      const pdfCropW = cropRect.width * scaleX
      const pdfCropH = cropRect.height * scaleY

      let indicesToCrop: number[]
      if (applyTo === 'all') {
        indicesToCrop = pages.map((_, i) => i)
      } else if (applyTo === 'current') {
        indicesToCrop = [0]
      } else {
        indicesToCrop = parsePageRange(customRange, pages.length)
      }

      for (const i of indicesToCrop) {
        if (i < pages.length) {
          const page = pages[i]
          const { height } = page.getSize()
          // PDF coordinates are bottom-up
          page.setCropBox(
            pdfCropX,
            height - pdfCropY - pdfCropH,
            pdfCropW,
            pdfCropH
          )
        }
      }

      const savedBytes = await pdf.save()
      const blob = new Blob([new Uint8Array(savedBytes)], { type: 'application/pdf' })
      setResultSize(blob.size)
      setResultUrl(URL.createObjectURL(blob))
    } catch {
      setError('Failed to crop PDF. The file may be corrupted.')
    } finally {
      setIsProcessing(false)
    }
  }, [file, cropRect, applyTo, customRange, pdfPageWidth, pdfPageHeight])

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = file.name.replace(/\.pdf$/i, '') + '_cropped.pdf'
    a.click()
  }, [resultUrl, file])

  const clear = () => {
    setFile(null)
    setPageCount(0)
    setPreviewDataUrl(null)
    setPdfPageWidth(0)
    setPdfPageHeight(0)
    setCropRect({ x: 0, y: 0, width: 0, height: 0 })
    setApplyTo('all')
    setCustomRange('1')
    setResultUrl(null)
    setResultSize(0)
    setError(null)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Crop PDF"
      description="Visually crop PDF pages with an interactive drag rectangle. Free, no upload, runs in your browser."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'Does cropping remove content outside the crop area?', answer: 'Cropping sets the visible area (CropBox) of each page. The content outside is hidden but still exists in the file. To permanently remove it, print the cropped PDF to a new PDF.' },
        { question: 'Can I crop different areas on different pages?', answer: 'Currently the tool applies the same crop rectangle to all selected pages. For page-specific crops, process one page at a time using the "Current page only" option.' },
        { question: 'Are my files uploaded to a server?', answer: 'No. All processing happens in your browser using pdf-lib and pdfjs-dist. Your files never leave your device.' },
        { question: 'Will this change image quality?', answer: 'No. Cropping only changes the viewable area — no re-encoding or compression occurs. All content retains its original quality.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Crop?</h2>
          <p>
            PDF Crop lets you visually select a rectangular area on a PDF page and set it as the visible region.
            This is useful for removing margins, trimming whitespace, or isolating a specific section of a document.
            The tool runs entirely in your browser — no file uploads required.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a PDF file by clicking the upload area or dragging and dropping.</li>
            <li>The first page is displayed as a preview. Click and drag to draw a crop rectangle.</li>
            <li>Adjust the rectangle by dragging it to a new position, or redraw by clicking outside it.</li>
            <li>Choose which pages to apply the crop to: all pages, current page only, or a custom range.</li>
            <li>Click <strong>Crop PDF</strong> to apply, then download the result.</li>
          </ol>

          <h2>When to Use PDF Crop</h2>
          <ul>
            <li>Remove large margins from scanned documents.</li>
            <li>Trim whitespace around slides exported from presentations.</li>
            <li>Isolate a chart or table from a larger page.</li>
            <li>Standardize page dimensions across a multi-page document.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>The preview shows the first page. The crop area is applied proportionally to all selected pages.</li>
            <li>Use "Custom range" to crop only specific pages (e.g., "1-3, 5, 7-10").</li>
            <li>Click and drag inside the crop rectangle to reposition it without resizing.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header row */}
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        )}

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-green-500" />
          Your files never leave your device
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* File loaded — preview & crop */}
        {file && previewDataUrl && (
          <div className="space-y-5">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <FileText className="h-5 w-5 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {pageCount} page{pageCount !== 1 ? 's' : ''} &middot; {formatSize(file.size)}
                </div>
              </div>
            </div>

            {/* Preview with crop overlay */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Crop className="h-4 w-4" /> Draw crop area on preview
              </label>
              <div
                ref={previewRef}
                className="relative inline-block border border-border rounded-lg overflow-hidden cursor-crosshair select-none"
                onMouseDown={handleMouseDown}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewDataUrl} alt="PDF preview" className="block max-w-full" draggable={false} />
                {/* Crop overlay */}
                {cropRect.width > 0 && cropRect.height > 0 && (
                  <>
                    {/* Darkened areas outside crop */}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <div
                        className="absolute"
                        style={{
                          left: cropRect.x,
                          top: cropRect.y,
                          width: cropRect.width,
                          height: cropRect.height,
                          background: 'transparent',
                          boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
                        }}
                      />
                    </div>
                    {/* Crop border */}
                    <div
                      className="absolute border-2 border-primary pointer-events-none"
                      style={{
                        left: cropRect.x,
                        top: cropRect.y,
                        width: cropRect.width,
                        height: cropRect.height,
                      }}
                    >
                      {/* Corner handles */}
                      {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                        <div
                          key={pos}
                          className="absolute w-3 h-3 bg-primary border border-white rounded-sm"
                          style={{
                            ...(pos.includes('top') ? { top: -6 } : { bottom: -6 }),
                            ...(pos.includes('left') ? { left: -6 } : { right: -6 }),
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {cropRect.width > 0 && cropRect.height > 0 && (
                <div className="text-xs text-muted-foreground">
                  Crop: {Math.round(cropRect.width * (pdfPageWidth / (previewRef.current?.getBoundingClientRect().width || 1)))} x {Math.round(cropRect.height * (pdfPageHeight / (previewRef.current?.getBoundingClientRect().height || 1)))} pt
                </div>
              )}
            </div>

            {/* Apply to */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Apply to</label>
              <div className="flex flex-wrap gap-2">
                {([['all', 'All pages'], ['current', 'First page only'], ['custom', 'Custom range']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setApplyTo(val)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${applyTo === val ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {applyTo === 'custom' && (
                <input
                  type="text"
                  value={customRange}
                  onChange={e => setCustomRange(e.target.value)}
                  placeholder="e.g., 1-3, 5, 7-10"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={cropPDF}
                disabled={isProcessing || cropRect.width < 10 || cropRect.height < 10}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? 'Cropping...' : 'Crop PDF'}
              </button>
              {resultUrl && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              )}
            </div>

            {/* Result */}
            {resultUrl && (
              <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
                <div>PDF cropped successfully</div>
                <div>File size: <strong>{formatSize(resultSize)}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
