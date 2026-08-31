'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, FileText, Shield, Loader2, Scissors, Package } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

type SplitMode = 'pages' | 'every' | 'each'

export default function PDFSplitTool() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [fileSize, setFileSize] = useState(0)
  const [splitMode, setSplitMode] = useState<SplitMode>('pages')
  const [pageInput, setPageInput] = useState('')
  const [everyN, setEveryN] = useState(1)
  const [results, setResults] = useState<{ name: string; url: string; pages: number; size: number }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  /** Parse a page-range string like "1,3,5-8" into an array of 1-based page numbers */
  const parsePages = (input: string, total: number): number[] => {
    const pages = new Set<number>()
    const parts = input.split(',').map(s => s.trim()).filter(Boolean)
    for (const part of parts) {
      if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number)
        if (isNaN(a) || isNaN(b)) continue
        const start = Math.max(1, Math.min(a, b))
        const end = Math.min(total, Math.max(a, b))
        for (let i = start; i <= end; i++) pages.add(i)
      } else {
        const n = Number(part)
        if (!isNaN(n) && n >= 1 && n <= total) pages.add(n)
      }
    }
    return Array.from(pages).sort((a, b) => a - b)
  }

  const processFile = useCallback(async (f: File) => {
    setError(null)
    setResults([])
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.')
      return
    }
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setFile(f)
      setFileName(f.name)
      setPageCount(pdf.getPageCount())
      setFileSize(f.size)
      setPageInput(`1-${pdf.getPageCount()}`)
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

  /** Create a new PDF from a subset of pages (0-based indices) */
  const extractPages = async (srcBytes: ArrayBuffer, indices: number[]): Promise<Uint8Array> => {
    const src = await PDFDocument.load(srcBytes)
    const dest = await PDFDocument.create()
    const copied = await dest.copyPages(src, indices)
    copied.forEach(p => dest.addPage(p))
    return dest.save()
  }

  const splitPDF = useCallback(async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setResults([])
    try {
      const bytes = await file.arrayBuffer()
      const baseName = fileName.replace(/\.pdf$/i, '')
      const outputs: { name: string; url: string; pages: number; size: number }[] = []

      if (splitMode === 'pages') {
        const pages = parsePages(pageInput, pageCount)
        if (pages.length === 0) { setError('No valid pages specified.'); setIsProcessing(false); return }
        const data = await extractPages(bytes, pages.map(p => p - 1))
        const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' })
        outputs.push({ name: `${baseName}_pages.pdf`, url: URL.createObjectURL(blob), pages: pages.length, size: blob.size })
      } else if (splitMode === 'every') {
        const n = Math.max(1, everyN)
        for (let start = 0; start < pageCount; start += n) {
          const end = Math.min(start + n, pageCount)
          const indices = Array.from({ length: end - start }, (_, i) => start + i)
          const data = await extractPages(bytes, indices)
          const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' })
          outputs.push({ name: `${baseName}_${start + 1}-${end}.pdf`, url: URL.createObjectURL(blob), pages: indices.length, size: blob.size })
        }
      } else {
        // each page separately
        for (let i = 0; i < pageCount; i++) {
          const data = await extractPages(bytes, [i])
          const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' })
          outputs.push({ name: `${baseName}_page${i + 1}.pdf`, url: URL.createObjectURL(blob), pages: 1, size: blob.size })
        }
      }
      setResults(outputs)
    } catch {
      setError('Failed to split PDF. The file may be corrupted.')
    } finally {
      setIsProcessing(false)
    }
  }, [file, fileName, splitMode, pageInput, everyN, pageCount])

  const downloadOne = (url: string, name: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
  }

  const downloadAll = useCallback(async () => {
    // Download individually (ZIP would require jszip which isn't installed)
    for (const r of results) {
      downloadOne(r.url, r.name)
      // Small delay so browser doesn't block multiple downloads
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }, [results])

  const clear = () => {
    results.forEach(r => URL.revokeObjectURL(r.url))
    setFile(null)
    setFileName('')
    setPageCount(0)
    setFileSize(0)
    setPageInput('')
    setResults([])
    setError(null)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Split PDF"
      description="Extract pages from a PDF — pick specific pages, split every N pages, or separate each page. Free, private, in-browser."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'Can I extract non-consecutive pages?', answer: 'Yes. Use comma-separated numbers and ranges, e.g. "1,3,5-8,12" to pull exactly the pages you need into a single new PDF.' },
        { question: 'What does "Split every N pages" do?', answer: 'It divides the document into chunks of N pages each. For example, a 10-page PDF split every 3 pages produces files of 3, 3, 3, and 1 page.' },
        { question: 'Are my files uploaded anywhere?', answer: 'No. All splitting happens locally in your browser using the pdf-lib library. Your files never leave your device.' },
        { question: 'Is there a page or file-size limit?', answer: 'No hard limit. The tool runs entirely in your browser, so the practical limit depends on your device\'s memory. Most documents up to several hundred pages work without issues.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Split?</h2>
          <p>
            PDF Split lets you extract specific pages from a PDF, divide a document into smaller chunks, or separate every
            page into its own file. It runs entirely in your browser using pdf-lib — no upload, no server, no watermarks.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a PDF file by clicking the upload area or dragging it in.</li>
            <li>Choose a split mode: extract specific pages, split every N pages, or extract each page separately.</li>
            <li>For &ldquo;Extract pages&rdquo;, enter page numbers and ranges like &ldquo;1,3,5-8&rdquo;.</li>
            <li>Click <strong>Split PDF</strong> to process.</li>
            <li>Download individual result files or click <strong>Download All</strong>.</li>
          </ol>

          <h2>When to Use PDF Split</h2>
          <ul>
            <li>Pull a single chapter from a long report.</li>
            <li>Extract signature pages from a contract.</li>
            <li>Break a large scanned document into per-page files.</li>
            <li>Remove unwanted pages by extracting only the ones you need.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Use ranges (e.g. &ldquo;5-20&rdquo;) for long consecutive sections.</li>
            <li>The &ldquo;Each page separately&rdquo; mode is handy for batch processing later.</li>
            <li>Original formatting, fonts, and images are preserved exactly.</li>
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
                <div className="text-xs text-muted-foreground">{pageCount} page{pageCount !== 1 ? 's' : ''} &middot; {formatSize(fileSize)}</div>
              </div>
            </div>

            {/* Page thumbnails */}
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: Math.min(pageCount, 50) }, (_, i) => (
                <span key={i} className="inline-flex items-center justify-center w-8 h-8 text-xs rounded border border-border bg-muted/50 font-mono">
                  {i + 1}
                </span>
              ))}
              {pageCount > 50 && <span className="inline-flex items-center text-xs text-muted-foreground ml-1">+{pageCount - 50} more</span>}
            </div>

            {/* Split mode */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Split Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {([
                  ['pages', 'Extract Pages', 'Pick specific pages & ranges'],
                  ['every', 'Every N Pages', 'Split into equal chunks'],
                  ['each', 'Each Page', 'One file per page'],
                ] as const).map(([value, label, desc]) => (
                  <button
                    key={value}
                    onClick={() => setSplitMode(value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${splitMode === value ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
                  >
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode-specific controls */}
            {splitMode === 'pages' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Pages to Extract</label>
                <input
                  type="text"
                  value={pageInput}
                  onChange={e => setPageInput(e.target.value)}
                  placeholder="e.g. 1,3,5-8,12"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground">Use commas and ranges. Valid pages: 1–{pageCount}</p>
              </div>
            )}

            {splitMode === 'every' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Pages per Chunk</label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={everyN}
                  onChange={e => setEveryN(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-28 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground">
                  Produces {Math.ceil(pageCount / Math.max(1, everyN))} file{Math.ceil(pageCount / Math.max(1, everyN)) !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {splitMode === 'each' && (
              <p className="text-sm text-muted-foreground">
                Each of the {pageCount} pages will be saved as a separate PDF.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={splitPDF}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
                {isProcessing ? 'Splitting...' : 'Split PDF'}
              </button>
              {results.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors inline-flex items-center gap-1.5"
                >
                  <Package className="h-3.5 w-3.5" /> Download All
                </button>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                  Split into <strong>{results.length}</strong> file{results.length !== 1 ? 's' : ''}
                </div>
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                    <FileText className="h-4 w-4 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.pages} page{r.pages !== 1 ? 's' : ''} &middot; {formatSize(r.size)}</div>
                    </div>
                    <button
                      onClick={() => downloadOne(r.url, r.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
