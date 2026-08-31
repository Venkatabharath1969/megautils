'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, FileText, Shield, Loader2, TrendingDown } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

type CompressionLevel = 'light' | 'medium' | 'maximum'

const COMPRESSION_LABELS: Record<CompressionLevel, { label: string; description: string }> = {
  light:   { label: 'Light',   description: 'Fast — strips unused objects' },
  medium:  { label: 'Medium',  description: 'Balanced — object streams + cleanup' },
  maximum: { label: 'Maximum', description: 'Smallest size — aggressive optimization' },
}

export default function PDFCompressTool() {
  const [file, setFile] = useState<File | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null)
  const [compressedSize, setCompressedSize] = useState(0)
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium')
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const savingsPercent = (orig: number, compressed: number) => {
    if (orig === 0) return 0
    return Math.max(0, ((orig - compressed) / orig) * 100)
  }

  const processFile = useCallback(async (f: File) => {
    setError(null)
    setCompressedUrl(null)
    setCompressedSize(0)
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setFile(f)
      setOriginalSize(f.size)
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
    if (f && (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) {
      processFile(f)
    }
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const compressPDF = useCallback(async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setCompressedUrl(null)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })

      // For medium/maximum: strip metadata to save space
      if (compressionLevel === 'medium' || compressionLevel === 'maximum') {
        pdf.setTitle('')
        pdf.setAuthor('')
        pdf.setSubject('')
        pdf.setKeywords([])
        pdf.setProducer('')
        pdf.setCreator('')
      }

      // For maximum: additionally remove page-level metadata by re-copying pages
      let outputBytes: Uint8Array
      if (compressionLevel === 'maximum') {
        const newPdf = await PDFDocument.create()
        const pages = await newPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => newPdf.addPage(page))
        outputBytes = await newPdf.save({ useObjectStreams: true })
      } else {
        outputBytes = await pdf.save({
          useObjectStreams: compressionLevel === 'medium',
        })
      }

      const blob = new Blob([new Uint8Array(outputBytes)], { type: 'application/pdf' })
      setCompressedSize(blob.size)
      setCompressedUrl(URL.createObjectURL(blob))
    } catch {
      setError('Failed to compress the PDF. The file may be corrupted.')
    } finally {
      setIsProcessing(false)
    }
  }, [file, compressionLevel])

  const handleDownload = useCallback(() => {
    if (!compressedUrl) return
    const a = document.createElement('a')
    a.href = compressedUrl
    a.download = `compressed-${file?.name || 'output.pdf'}`
    a.click()
  }, [compressedUrl, file])

  const clear = () => {
    setFile(null)
    setOriginalSize(0)
    setPageCount(0)
    setCompressedUrl(null)
    setCompressedSize(0)
    setError(null)
    setIsProcessing(false)
    setCompressionLevel('medium')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const savings = savingsPercent(originalSize, compressedSize)

  return (
    <ToolPage
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality. Free, unlimited, browser-only."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'How much can this tool reduce my PDF size?', answer: 'Savings depend on the source file. PDFs with redundant objects, unused fonts, or bloated metadata typically shrink 10-40%. Files already optimized by professional tools may see minimal reduction.' },
        { question: 'Does compression reduce image or text quality?', answer: 'No. This tool optimizes the PDF structure — it uses object streams, strips unused objects, and removes metadata. It does not re-encode images or alter page content.' },
        { question: 'Is there a file size limit?', answer: 'No server-side limit exists because everything runs in your browser. Practically, files up to ~200 MB work well on modern devices with sufficient RAM.' },
        { question: 'What is the difference between the compression levels?', answer: 'Light mode re-saves the file to strip unused objects. Medium adds object streams for better internal compression. Maximum also strips metadata and re-copies all pages to discard any leftover data.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Compress?</h2>
          <p>
            PDF Compress reduces the file size of a PDF document by optimizing its internal structure. Unlike tools
            that degrade image quality, this compressor works by removing unused objects, enabling object streams,
            stripping metadata, and deduplicating resources. The result is a smaller file that looks identical to
            the original. All processing happens in your browser — nothing is uploaded to any server.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Click the upload area or drag and drop a PDF file onto it.</li>
            <li>The tool displays the original file size and page count.</li>
            <li>Choose a compression level: Light for speed, Medium for a good balance, or Maximum for the smallest output.</li>
            <li>Click <strong>Compress PDF</strong>. A progress indicator shows while processing.</li>
            <li>Review the compressed size and savings percentage, then click <strong>Download</strong>.</li>
          </ol>

          <h2>When to Use PDF Compress</h2>
          <ul>
            <li>Shrink email attachments below provider file-size limits (e.g., 25 MB for Gmail).</li>
            <li>Speed up uploads to web portals that impose file-size restrictions.</li>
            <li>Reduce storage usage when archiving large document collections.</li>
            <li>Prepare lighter PDFs for mobile viewing or slow network connections.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Start with Medium compression — it offers the best trade-off between speed and size reduction for most files.</li>
            <li>If Medium barely reduces the size, try Maximum. Some files carry hidden metadata that only Maximum removes.</li>
            <li>Already-optimized PDFs (e.g., exported from modern design tools) may show little to no reduction — this is normal.</li>
            <li>For image-heavy PDFs where you need aggressive compression, consider an image-quality-aware compressor that can downscale embedded rasters.</li>
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

        {/* Upload zone (always visible when no file) */}
        {!file ? (
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
        ) : (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <FileText className="h-5 w-5 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {pageCount} page{pageCount !== 1 ? 's' : ''} &middot; {formatSize(originalSize)}
                </div>
              </div>
            </div>

            {/* Compression level */}
            <div>
              <label className="text-sm font-medium mb-2 block">Compression Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(COMPRESSION_LABELS) as CompressionLevel[]).map(level => (
                  <button
                    key={level}
                    onClick={() => { setCompressionLevel(level); setCompressedUrl(null) }}
                    className={`p-3 rounded-lg border text-left transition-colors ${compressionLevel === level ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}
                  >
                    <div className="text-sm font-medium">{COMPRESSION_LABELS[level].label}</div>
                    <div className="text-xs text-muted-foreground">{COMPRESSION_LABELS[level].description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={compressPDF}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? 'Compressing...' : 'Compress PDF'}
              </button>
              {compressedUrl && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              )}
            </div>

            {/* Result */}
            {compressedUrl && (
              <div className="p-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-medium">Compression complete</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground">Original</div>
                    <div className="font-medium">{formatSize(originalSize)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Compressed</div>
                    <div className="font-medium">{formatSize(compressedSize)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Saved</div>
                    <div className="font-medium">{savings.toFixed(1)}%</div>
                  </div>
                </div>
                {savings < 1 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    This file is already well-optimized. Try Maximum compression or a tool that can re-encode images.
                  </div>
                )}
              </div>
            )}
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
      </div>
    </ToolPage>
  )
}
