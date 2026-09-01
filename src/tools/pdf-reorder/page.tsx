'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, Shield, Loader2, FileText, ChevronUp, ChevronDown, X, GripVertical } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

interface PageThumb {
  index: number
  dataUrl: string
  label: string
}

export default function PDFReorderTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageThumb[]>([])
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultSize, setResultSize] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setIsLoading(true)
    try {
      const bytes = await f.arrayBuffer()

      // Render thumbnails via pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
      const pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise

      const thumbs: PageThumb[] = []
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: 0.3 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.getContext('2d')!
        await page.render({ canvas, viewport }).promise
        thumbs.push({ index: i - 1, dataUrl: canvas.toDataURL(), label: `Page ${i}` })
      }

      setPages(thumbs)
      setFile(f)
    } catch {
      setError('Could not read this PDF. It may be corrupted.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) loadFile(files[0])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [loadFile])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
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

  const movePage = useCallback((index: number, direction: -1 | 1) => {
    setPages(prev => {
      const arr = [...prev]
      const target = index + direction
      if (target < 0 || target >= arr.length) return prev
      ;[arr[index], arr[target]] = [arr[target], arr[index]]
      return arr
    })
    setResultUrl(null)
  }, [])

  const removePage = useCallback((index: number) => {
    setPages(prev => prev.filter((_, i) => i !== index))
    setResultUrl(null)
  }, [])

  // Drag-and-drop reorder
  const handlePageDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handlePageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handlePageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    setPages(prev => {
      const arr = [...prev]
      const [moved] = arr.splice(dragIndex, 1)
      arr.splice(dropIndex, 0, moved)
      return arr
    })
    setDragIndex(null)
    setDragOverIndex(null)
    setResultUrl(null)
  }

  const handlePageDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const reorderPDF = useCallback(async () => {
    if (!file || pages.length === 0) return
    setIsProcessing(true)
    setError(null)
    setResultUrl(null)
    try {
      const bytes = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const newPdf = await PDFDocument.create()

      const newOrder = pages.map(p => p.index)
      for (const pageIndex of newOrder) {
        const [page] = await newPdf.copyPages(srcPdf, [pageIndex])
        newPdf.addPage(page)
      }

      const savedBytes = await newPdf.save()
      const blob = new Blob([new Uint8Array(savedBytes)], { type: 'application/pdf' })
      setResultSize(blob.size)
      setResultUrl(URL.createObjectURL(blob))
    } catch {
      setError('Failed to reorder PDF. The file may be corrupted.')
    } finally {
      setIsProcessing(false)
    }
  }, [file, pages])

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = file.name.replace(/\.pdf$/i, '') + '_reordered.pdf'
    a.click()
  }, [resultUrl, file])

  const clear = () => {
    setFile(null)
    setPages([])
    setResultUrl(null)
    setResultSize(0)
    setError(null)
    setIsLoading(false)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Reorder PDF Pages"
      description="Drag-and-drop to rearrange, reorder, or delete pages in a PDF. Free, no upload, runs in your browser."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'Can I delete pages while reordering?', answer: 'Yes. Click the X button on any page thumbnail to remove it from the output. Only the remaining pages in the displayed order will appear in the final PDF.' },
        { question: 'Is there a page limit?', answer: 'There is no hard limit. Processing happens in your browser, so the practical limit depends on available memory. Documents with hundreds of pages work fine on most devices.' },
        { question: 'Are my files uploaded to a server?', answer: 'No. All processing happens locally in your browser using pdf-lib and pdfjs-dist. Your files never leave your device.' },
        { question: 'Does reordering change page content or quality?', answer: 'No. Pages are copied exactly as they are. No re-encoding, compression, or quality loss occurs.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Reorder?</h2>
          <p>
            PDF Reorder lets you rearrange the page order of a PDF document by dragging and dropping page thumbnails.
            You can also delete individual pages you do not need. The tool runs entirely in your browser — no upload required.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a PDF file by clicking the upload area or dragging and dropping.</li>
            <li>Page thumbnails appear in a grid. Drag a page to a new position, or use the arrow buttons.</li>
            <li>Click the X button on a thumbnail to remove that page.</li>
            <li>Click <strong>Save Reordered PDF</strong> to generate the new document.</li>
            <li>Click <strong>Download</strong> to save the result.</li>
          </ol>

          <h2>When to Use PDF Reorder</h2>
          <ul>
            <li>Fix page order in a scanned document.</li>
            <li>Move an appendix or cover page to a different position.</li>
            <li>Remove blank or unnecessary pages before sharing.</li>
            <li>Rearrange slides exported from a presentation.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Drag pages by their thumbnail or the grip handle for precise placement.</li>
            <li>Use the up/down buttons for single-position moves.</li>
            <li>Deleted pages cannot be recovered — they are simply excluded from the output.</li>
            <li>The original file is never modified; a new PDF is created.</li>
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
        {!file && !isLoading && (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
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

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg border-border">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-sm text-muted-foreground">Loading page thumbnails...</span>
          </div>
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

        {/* Page thumbnails */}
        {file && pages.length > 0 && (
          <div className="space-y-5">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <FileText className="h-5 w-5 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {pages.length} page{pages.length !== 1 ? 's' : ''} &middot; {formatSize(file.size)}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">Drag pages to reorder, or use the arrow buttons. Click X to remove a page.</p>

            {/* Thumbnail grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {pages.map((page, index) => (
                <div
                  key={`${page.index}-${index}`}
                  draggable
                  onDragStart={e => handlePageDragStart(e, index)}
                  onDragOver={e => handlePageDragOver(e, index)}
                  onDrop={e => handlePageDrop(e, index)}
                  onDragEnd={handlePageDragEnd}
                  className={`relative group border rounded-lg overflow-hidden transition-all cursor-grab active:cursor-grabbing ${
                    dragIndex === index ? 'opacity-40 scale-95' : ''
                  } ${dragOverIndex === index && dragIndex !== index ? 'ring-2 ring-primary' : 'border-border'} bg-card`}
                >
                  {/* Grip handle */}
                  <div className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Page label */}
                  <div className="absolute top-1 right-1 z-10 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {page.label}
                  </div>

                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={page.dataUrl} alt={page.label} className="w-full" draggable={false} />

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-1 p-1.5 bg-card border-t border-border">
                    <button
                      onClick={() => movePage(index, -1)}
                      disabled={index === 0}
                      className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors disabled:opacity-30"
                      title="Move left"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => movePage(index, 1)}
                      disabled={index === pages.length - 1}
                      className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors disabled:opacity-30"
                      title="Move right"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removePage(index)}
                      className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors text-red-500"
                      title="Remove page"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={reorderPDF}
                disabled={isProcessing || pages.length === 0}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? 'Processing...' : 'Save Reordered PDF'}
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
                <div>PDF reordered successfully: <strong>{pages.length} pages</strong></div>
                <div>File size: <strong>{formatSize(resultSize)}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
