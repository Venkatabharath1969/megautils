'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, FileText, Shield, Loader2, Hash } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

type Position = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right'
type NumberFormat = 'plain' | 'page' | 'of' | 'dash'

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
]

const FORMATS: { value: NumberFormat; label: string; example: string }[] = [
  { value: 'plain', label: 'Plain', example: '1' },
  { value: 'page', label: 'Page N', example: 'Page 1' },
  { value: 'of', label: 'N of Total', example: '1 of 10' },
  { value: 'dash', label: '- N -', example: '- 1 -' },
]

export default function PDFPageNumbersTool() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [position, setPosition] = useState<Position>('bottom-center')
  const [format, setFormat] = useState<NumberFormat>('plain')
  const [startNum, setStartNum] = useState(1)
  const [skipFirst, setSkipFirst] = useState(false)
  const [fontSize, setFontSize] = useState(12)
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

  const formatNumber = (num: number, total: number): string => {
    switch (format) {
      case 'page': return `Page ${num}`
      case 'of': return `${num} of ${total}`
      case 'dash': return `- ${num} -`
      default: return `${num}`
    }
  }

  const addPageNumbers = useCallback(async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setResultUrl(null)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const pages = pdf.getPages()
      const total = pages.length
      const margin = 36 // 0.5 inch

      let pageNum = startNum
      pages.forEach((page, i) => {
        if (skipFirst && i === 0) return
        const num = pageNum
        pageNum++
        const text = formatNumber(num, skipFirst ? total - 1 : total)
        const { width, height } = page.getSize()
        const textWidth = font.widthOfTextAtSize(text, fontSize)

        let x: number
        let y: number

        // Horizontal position
        if (position.endsWith('-left')) {
          x = margin
        } else if (position.endsWith('-right')) {
          x = width - textWidth - margin
        } else {
          x = (width - textWidth) / 2
        }

        // Vertical position
        if (position.startsWith('top')) {
          y = height - margin - fontSize
        } else {
          y = margin
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.3, 0.3, 0.3),
        })
      })

      const savedBytes = await pdf.save()
      const blob = new Blob([new Uint8Array(savedBytes)], { type: 'application/pdf' })
      setResultSize(blob.size)
      setResultUrl(URL.createObjectURL(blob))
    } catch {
      setError('Failed to add page numbers. The file may be corrupted.')
    } finally {
      setIsProcessing(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, position, format, startNum, skipFirst, fontSize])

  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = fileName.replace(/\.pdf$/i, '') + '_numbered.pdf'
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

  // Preview text for the settings section
  const previewText = formatNumber(startNum, pageCount > 0 ? (skipFirst ? pageCount - 1 : pageCount) : 10)

  return (
    <ToolPage
      title="Add Page Numbers to PDF"
      description="Insert page numbers on every page of a PDF. Choose position, format, and starting number. Free, private, in-browser."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'Can I skip the cover page?', answer: 'Yes. Toggle "Skip first page" and the cover page will remain unnumbered. Numbering starts on page two with your chosen starting number.' },
        { question: 'What number formats are available?', answer: 'Four formats: plain number (1), "Page 1", "1 of 10", and "- 1 -". Each format can start at any number you choose.' },
        { question: 'Where can I place the page numbers?', answer: 'Six positions are available: bottom center, bottom left, bottom right, top center, top left, and top right.' },
        { question: 'Are my files uploaded to a server?', answer: 'No. All processing runs locally in your browser using pdf-lib. Your files never leave your device.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Page Numbers?</h2>
          <p>
            This tool adds page numbers to every page of an existing PDF document. You control the position (top or bottom,
            left, center, or right), the number format, font size, and starting number. It is perfect for manuscripts,
            reports, and contracts that lack pagination. Everything runs locally in your browser.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a PDF by clicking the upload area or dragging it in.</li>
            <li>Choose a position for the page numbers (e.g. Bottom Center).</li>
            <li>Pick a number format: plain, &ldquo;Page N&rdquo;, &ldquo;N of Total&rdquo;, or &ldquo;- N -&rdquo;.</li>
            <li>Optionally change the starting number or enable &ldquo;Skip first page&rdquo;.</li>
            <li>Adjust the font size with the slider.</li>
            <li>Click <strong>Add Page Numbers</strong> and download the result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <ul>
            <li>Add page numbers to a thesis or dissertation before printing.</li>
            <li>Number the pages of a contract or legal document.</li>
            <li>Paginate scanned documents that were saved without numbers.</li>
            <li>Prepare a multi-page report for professional distribution.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Use &ldquo;Skip first page&rdquo; to leave a title page unnumbered.</li>
            <li>The &ldquo;N of Total&rdquo; format is helpful for large documents so readers know the full length.</li>
            <li>A font size of 10-12 works well for most documents; go larger for presentations.</li>
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

            {/* Position */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPosition(p.value)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-colors ${position === p.value ? 'border-primary bg-primary/10 font-medium' : 'border-border hover:bg-muted/50'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number Format</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FORMATS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={`p-2 rounded-lg border text-center transition-colors ${format === f.value ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
                  >
                    <div className="text-xs font-medium">{f.label}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{f.example}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Starting number + skip first */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Starting Number</label>
                <input
                  type="number"
                  min={0}
                  value={startNum}
                  onChange={e => setStartNum(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <label className="flex items-center gap-2 pb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipFirst}
                  onChange={e => setSkipFirst(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm">Skip first page</span>
              </label>
            </div>

            {/* Font size */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Font Size: {fontSize}pt</label>
              <input
                type="range"
                min={8}
                max={24}
                value={fontSize}
                onChange={e => setFontSize(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>8pt</span>
                <span>24pt</span>
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <div className="text-xs text-muted-foreground mb-1">Preview</div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm" style={{ fontSize: `${Math.min(fontSize, 18)}px` }}>
                  {previewText}
                </span>
                <span className="text-xs text-muted-foreground">
                  &mdash; {POSITIONS.find(p => p.value === position)?.label}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={addPageNumbers}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Hash className="h-4 w-4" />}
                {isProcessing ? 'Processing...' : 'Add Page Numbers'}
              </button>
            </div>

            {/* Result */}
            {resultUrl && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
                  <div>Page numbers added successfully</div>
                  <div><strong>{pageCount}</strong> page{pageCount !== 1 ? 's' : ''} &middot; {formatFileSize(resultSize)}</div>
                </div>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
