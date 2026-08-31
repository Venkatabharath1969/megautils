'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, FileImage, Shield, Loader2, PackageOpen } from 'lucide-react'

interface PageImage {
  pageNum: number
  blob: Blob
  url: string
  width: number
  height: number
}

const DPI_OPTIONS = [
  { value: 72, label: '72 DPI (Screen)' },
  { value: 150, label: '150 DPI (Medium)' },
  { value: 300, label: '300 DPI (Print)' },
]

const FORMAT_OPTIONS = [
  { value: 'jpeg', label: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
  { value: 'png', label: 'PNG', mime: 'image/png', ext: 'png' },
]

export default function PdfToJpgTool() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [pages, setPages] = useState<PageImage[]>([])
  const [outputFormat, setOutputFormat] = useState('jpeg')
  const [quality, setQuality] = useState(0.92)
  const [dpi, setDpi] = useState(150)
  const [pageRange, setPageRange] = useState('all')
  const [customRange, setCustomRange] = useState('')
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [zipping, setZipping] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parsePageRange = useCallback((rangeStr: string, max: number): number[] => {
    if (!rangeStr.trim()) return Array.from({ length: max }, (_, i) => i + 1)
    const pages = new Set<number>()
    const parts = rangeStr.split(',')
    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-')
        const start = parseInt(startStr)
        const end = parseInt(endStr)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(max, end); i++) {
            pages.add(i)
          }
        }
      } else {
        const num = parseInt(trimmed)
        if (!isNaN(num) && num >= 1 && num <= max) {
          pages.add(num)
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b)
  }, [])

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    setError(null)
    setPdfFile(file)
    setPages([])
    setProgress({ current: 0, total: 0 })

    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setTotalPages(pdf.numPages)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to read PDF'
      if (msg.toLowerCase().includes('password')) {
        setError('This PDF is password-protected. Please unlock it first.')
      } else {
        setError('Failed to read PDF. The file may be corrupted or unsupported.')
      }
      setPdfFile(null)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [handleFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const convertPages = useCallback(async () => {
    if (!pdfFile || totalPages === 0) return
    setConverting(true)
    setError(null)
    setPages([])

    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      const targetPages = pageRange === 'all'
        ? Array.from({ length: totalPages }, (_, i) => i + 1)
        : parsePageRange(customRange, totalPages)

      if (targetPages.length === 0) {
        setError('No valid pages in the specified range.')
        setConverting(false)
        return
      }

      setProgress({ current: 0, total: targetPages.length })
      const results: PageImage[] = []
      const scale = dpi / 72
      const fmt = FORMAT_OPTIONS.find(f => f.value === outputFormat)!

      for (let i = 0; i < targetPages.length; i++) {
        const pageNum = targetPages[i]
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')!

        // White background for JPEG (no transparency)
        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        await page.render({ canvas, viewport }).promise

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (b) => resolve(b!),
            fmt.mime,
            outputFormat === 'jpeg' ? quality : undefined
          )
        })

        const url = URL.createObjectURL(blob)
        results.push({
          pageNum,
          blob,
          url,
          width: canvas.width,
          height: canvas.height,
        })

        setProgress({ current: i + 1, total: targetPages.length })
      }

      setPages(results)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Conversion failed'
      setError(`Failed to convert PDF: ${msg}`)
    } finally {
      setConverting(false)
    }
  }, [pdfFile, totalPages, pageRange, customRange, dpi, outputFormat, quality, parsePageRange])

  const downloadPage = useCallback((page: PageImage) => {
    const fmt = FORMAT_OPTIONS.find(f => f.value === outputFormat)!
    const a = document.createElement('a')
    a.href = page.url
    a.download = `page-${page.pageNum}.${fmt.ext}`
    a.click()
  }, [outputFormat])

  const downloadAll = useCallback(async () => {
    if (pages.length === 0) return

    if (pages.length === 1) {
      downloadPage(pages[0])
      return
    }

    setZipping(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const fmt = FORMAT_OPTIONS.find(f => f.value === outputFormat)!

      for (const page of pages) {
        zip.file(`page-${page.pageNum}.${fmt.ext}`, page.blob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pdf-pages.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to create ZIP file.')
    } finally {
      setZipping(false)
    }
  }, [pages, outputFormat, downloadPage])

  const clear = () => {
    // Revoke old URLs
    pages.forEach(p => URL.revokeObjectURL(p.url))
    setPdfFile(null)
    setTotalPages(0)
    setPages([])
    setProgress({ current: 0, total: 0 })
    setError(null)
    setPageRange('all')
    setCustomRange('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <ToolPage
      title="PDF to JPG"
      description="Convert PDF pages to JPG or PNG images"
      category="pdf"
      categoryLabel="PDF Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>PDF to JPG is a free browser-based converter that renders each page of a PDF document as a high-quality image. Choose between JPG and PNG output, select specific pages, and adjust resolution up to 300 DPI. Everything runs locally in your browser — your PDF is never uploaded to any server.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a PDF file by dragging and dropping or clicking the upload area.</li>
            <li>Configure output settings: format (JPG/PNG), quality, DPI, and page range.</li>
            <li>Click <strong>Convert Pages</strong> to render the selected pages.</li>
            <li>Preview the converted pages and download individually or as a ZIP archive.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is ideal for extracting images from PDF presentations, converting PDF pages for social media posts, creating image previews of documents, or converting PDF reports into images for embedding in websites. It works offline after loading and keeps your files completely private.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Use 72 DPI for screen/web use, 150 DPI for general purposes, and 300 DPI for print quality.</li>
            <li>JPG produces smaller files but with slight quality loss. PNG is lossless but larger.</li>
            <li>Use the page range field to convert only specific pages (e.g., &quot;1-3, 5, 8-10&quot;).</li>
            <li>For large PDFs, converting a few pages at a time will be faster and use less memory.</li>
            <li>Your PDF is processed entirely in your browser using pdf.js — no server uploads.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What DPI should I use?', answer: '72 DPI is good for screen display and web use. 150 DPI is a good balance of quality and file size. 300 DPI produces high-quality images suitable for printing.' },
        { question: 'Can I convert specific pages only?', answer: 'Yes! Select "Custom range" and enter page numbers like "1-3, 5, 8-10". This is useful for large PDFs where you only need certain pages.' },
        { question: 'What is the difference between JPG and PNG output?', answer: 'JPG uses lossy compression, producing smaller files with slight quality reduction. PNG is lossless, preserving all details but creating larger files. Use JPG for photos and PNG for text-heavy documents or when transparency is needed.' },
        { question: 'Does this tool support encrypted PDFs?', answer: 'Password-protected PDFs are not supported. You will need to remove the password protection before converting. Unprotected PDFs with standard encryption work fine.' },
        { question: 'Are my files uploaded to a server?', answer: 'No. All PDF rendering happens locally in your browser using pdf.js. Your PDF file never leaves your device.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload PDF</span>
          {pdfFile && <ClearButton onClear={clear} />}
        </div>

        {/* Upload area */}
        {!pdfFile ? (
          <label
            className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Drag & drop a PDF or click to upload</span>
            <span className="text-xs text-muted-foreground mt-1">PDF files only</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-6">
            {/* File info */}
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div>File: <strong>{pdfFile.name}</strong></div>
              <div>Size: <strong>{formatSize(pdfFile.size)}</strong></div>
              <div>Pages: <strong>{totalPages}</strong></div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Output Format</label>
                  <div className="flex gap-2">
                    {FORMAT_OPTIONS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => { setOutputFormat(f.value); setPages([]) }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${outputFormat === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {outputFormat === 'jpeg' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Quality: {Math.round(quality * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={quality}
                      onChange={(e) => { setQuality(Number(e.target.value)); setPages([]) }}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Resolution</label>
                  <select
                    value={dpi}
                    onChange={(e) => { setDpi(Number(e.target.value)); setPages([]) }}
                    className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {DPI_OPTIONS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Pages</label>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => { setPageRange('all'); setPages([]) }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pageRange === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                    >
                      All Pages
                    </button>
                    <button
                      onClick={() => { setPageRange('custom'); setPages([]) }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pageRange === 'custom' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                    >
                      Custom Range
                    </button>
                  </div>
                  {pageRange === 'custom' && (
                    <input
                      type="text"
                      value={customRange}
                      onChange={(e) => { setCustomRange(e.target.value); setPages([]) }}
                      placeholder="e.g., 1-3, 5, 8-10"
                      className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    />
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <Shield className="h-3.5 w-3.5 text-green-500" />
                  Your files never leave your device
                </div>

                <button
                  onClick={convertPages}
                  disabled={converting}
                  className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {converting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Converting {progress.current}/{progress.total}...
                    </>
                  ) : (
                    <>
                      <FileImage className="h-4 w-4" />
                      Convert Pages
                    </>
                  )}
                </button>

                {/* Progress bar */}
                {converting && progress.total > 0 && (
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                )}

                {pages.length > 1 && (
                  <button
                    onClick={downloadAll}
                    disabled={zipping}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {zipping ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating ZIP...
                      </>
                    ) : (
                      <>
                        <PackageOpen className="h-4 w-4" />
                        Download All as ZIP ({pages.length} pages)
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Page previews */}
              {pages.length > 0 && (
                <div className="lg:col-span-2 space-y-3">
                  <span className="text-sm font-medium">{pages.length} page{pages.length !== 1 ? 's' : ''} converted</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {pages.map((page) => (
                      <div key={page.pageNum} className="border border-border rounded-lg overflow-hidden bg-muted/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={page.url}
                          alt={`Page ${page.pageNum}`}
                          className="w-full h-auto"
                        />
                        <div className="p-2 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            <div>Page {page.pageNum}</div>
                            <div>{page.width} × {page.height} &middot; {formatSize(page.blob.size)}</div>
                          </div>
                          <button
                            onClick={() => downloadPage(page)}
                            className="p-1.5 rounded hover:bg-muted transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
