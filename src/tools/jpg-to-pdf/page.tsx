'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, Trash2, ChevronUp, ChevronDown, FileText, Shield, Loader2 } from 'lucide-react'

interface ImageItem {
  id: string
  file: File
  dataUrl: string
  width: number
  height: number
}

const PAGE_SIZES = [
  { value: 'a4', label: 'A4 (210 × 297 mm)' },
  { value: 'letter', label: 'Letter (8.5 × 11 in)' },
  { value: 'original', label: 'Original (fit to image)' },
]

const ORIENTATIONS = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'auto', label: 'Auto-detect' },
]

const MARGINS = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small (18pt)' },
  { value: 'medium', label: 'Medium (36pt)' },
]

function getMarginPt(margin: string): number {
  if (margin === 'small') return 18
  if (margin === 'medium') return 36
  return 0
}

export default function JpgToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [pageSize, setPageSize] = useState('a4')
  const [orientation, setOrientation] = useState('portrait')
  const [margin, setMargin] = useState('none')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfSize, setPdfSize] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadImage = useCallback((file: File): Promise<ImageItem> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        const img = new Image()
        img.onload = () => {
          resolve({
            id: crypto.randomUUID(),
            file,
            dataUrl,
            width: img.width,
            height: img.height,
          })
        }
        img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`))
        img.src = dataUrl
      }
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
      reader.readAsDataURL(file)
    })
  }, [])

  const addFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    const validFiles = Array.from(files).filter(f =>
      f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/webp' || f.type === 'image/jpg'
    )
    if (validFiles.length === 0) {
      setError('Please upload JPG, PNG, or WebP images.')
      return
    }
    try {
      const loaded = await Promise.all(validFiles.map(loadImage))
      setImages(prev => [...prev, ...loaded])
      setPdfUrl(null)
    } catch {
      setError('Failed to load one or more images.')
    }
  }, [loadImage])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [addFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const moveImage = useCallback((index: number, direction: -1 | 1) => {
    setImages(prev => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setPdfUrl(null)
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
    setPdfUrl(null)
  }, [])

  const convertToPdf = useCallback(async () => {
    if (images.length === 0) return
    setConverting(true)
    setError(null)
    setPdfUrl(null)

    try {
      const { PDFDocument } = await import('pdf-lib')
      const pdf = await PDFDocument.create()
      const marginPt = getMarginPt(margin)

      for (const img of images) {
        // Convert image to ArrayBuffer
        const response = await fetch(img.dataUrl)
        const arrayBuffer = await response.arrayBuffer()
        const data = new Uint8Array(arrayBuffer)

        // Embed image - WebP needs canvas conversion to PNG first
        let pdfImage
        if (img.file.type === 'image/png') {
          pdfImage = await pdf.embedPng(data)
        } else if (img.file.type === 'image/jpeg' || img.file.type === 'image/jpg') {
          pdfImage = await pdf.embedJpg(data)
        } else {
          // WebP or other: convert to PNG via canvas
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')!
          const bitmap = await createImageBitmap(img.file)
          ctx.drawImage(bitmap, 0, 0)
          const pngBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png')
          })
          const pngBuffer = new Uint8Array(await pngBlob.arrayBuffer())
          pdfImage = await pdf.embedPng(pngBuffer)
        }

        // Calculate page dimensions
        let pageWidth: number
        let pageHeight: number

        if (pageSize === 'original') {
          pageWidth = pdfImage.width + marginPt * 2
          pageHeight = pdfImage.height + marginPt * 2
        } else {
          // Standard page sizes in points
          let stdW: number, stdH: number
          if (pageSize === 'a4') {
            stdW = 595.28; stdH = 841.89
          } else {
            stdW = 612; stdH = 792
          }

          // Determine orientation
          let usePortrait: boolean
          if (orientation === 'auto') {
            usePortrait = pdfImage.height >= pdfImage.width
          } else {
            usePortrait = orientation === 'portrait'
          }

          if (usePortrait) {
            pageWidth = stdW; pageHeight = stdH
          } else {
            pageWidth = stdH; pageHeight = stdW
          }
        }

        const page = pdf.addPage([pageWidth, pageHeight])
        const drawArea = {
          w: pageWidth - marginPt * 2,
          h: pageHeight - marginPt * 2,
        }
        const scale = Math.min(drawArea.w / pdfImage.width, drawArea.h / pdfImage.height)
        const drawW = pdfImage.width * scale
        const drawH = pdfImage.height * scale
        const x = marginPt + (drawArea.w - drawW) / 2
        const y = marginPt + (drawArea.h - drawH) / 2

        page.drawImage(pdfImage, { x, y, width: drawW, height: drawH })
      }

      const pdfBytes = await pdf.save()
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      setPdfUrl(URL.createObjectURL(blob))
      setPdfSize(blob.size)
      setPageCount(images.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create PDF. Please try different images.')
    } finally {
      setConverting(false)
    }
  }, [images, pageSize, orientation, margin])

  const handleDownload = useCallback(() => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = 'images.pdf'
    a.click()
  }, [pdfUrl])

  const clear = () => {
    setImages([])
    setPdfUrl(null)
    setPdfSize(0)
    setPageCount(0)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <ToolPage
      title="JPG to PDF"
      description="Convert JPG, PNG, and WebP images to a single PDF document"
      category="pdf"
      categoryLabel="PDF Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>JPG to PDF is a free browser-based tool that converts your images into a multi-page PDF document. Upload multiple JPG, PNG, or WebP images, arrange them in order, customize page size and margins, and download a ready-to-share PDF. Everything runs locally in your browser — your images are never uploaded to any server.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Drag and drop images or click to upload JPG, PNG, or WebP files.</li>
            <li>Reorder images using the up/down arrows, or remove unwanted ones.</li>
            <li>Choose page size (A4, Letter, or Original), orientation, and margin.</li>
            <li>Click <strong>Convert to PDF</strong> to generate the document.</li>
            <li>Download the PDF to your device.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is perfect for combining scanned documents, photos, receipts, or screenshots into a single PDF for sharing, printing, or archiving. Since it runs entirely in your browser, it works offline after the page loads and keeps your files completely private.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For best quality, use high-resolution images. JPEG images embed directly without re-encoding.</li>
            <li>WebP images are automatically converted to PNG before embedding in the PDF.</li>
            <li>Use &quot;Original&quot; page size to match each page to its image dimensions — great for photos.</li>
            <li>The &quot;Auto-detect&quot; orientation rotates the page to best fit each image.</li>
            <li>Your images never leave your device — all processing happens locally using pdf-lib.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How many images can I convert at once?', answer: 'There is no hard limit. You can add as many images as your browser memory allows. For very large batches (100+ high-res images), you may experience slower processing.' },
        { question: 'Does this tool compress my images?', answer: 'JPEG images are embedded directly into the PDF without re-compression, preserving original quality. PNG images are also embedded losslessly. WebP images are converted to PNG before embedding.' },
        { question: 'Can I reorder pages after uploading?', answer: 'Yes! Use the up and down arrow buttons next to each thumbnail to rearrange pages before converting.' },
        { question: 'Does this tool upload my images to a server?', answer: 'No. All conversion happens locally in your browser using the pdf-lib library. Your images never leave your device.' },
        { question: 'What page sizes are supported?', answer: 'A4 (210 × 297 mm), US Letter (8.5 × 11 inches), and Original (page size matches the image dimensions).' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload Images</span>
          {images.length > 0 && <ClearButton onClear={clear} />}
        </div>

        {/* Upload area */}
        <label
          className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Drag & drop images or click to upload</span>
          <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP supported</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </label>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image list */}
            <div className="lg:col-span-2 space-y-3">
              <span className="text-sm font-medium">{images.length} image{images.length !== 1 ? 's' : ''} added</span>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {images.map((img, i) => (
                  <div key={img.id} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.dataUrl}
                      alt={img.file.name}
                      className="w-16 h-16 object-cover rounded border border-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{img.file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {img.width} × {img.height} &middot; {formatSize(img.file.size)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => moveImage(i, -1)}
                        disabled={i === 0}
                        className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveImage(i, 1)}
                        disabled={i === images.length - 1}
                        className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(e.target.value); setPdfUrl(null) }}
                  className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PAGE_SIZES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {pageSize !== 'original' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Orientation</label>
                  <div className="flex gap-2">
                    {ORIENTATIONS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => { setOrientation(o.value); setPdfUrl(null) }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${orientation === o.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Margin</label>
                <div className="flex gap-2">
                  {MARGINS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => { setMargin(m.value); setPdfUrl(null) }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${margin === m.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                Your files never leave your device
              </div>

              <button
                onClick={convertToPdf}
                disabled={converting || images.length === 0}
                className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {converting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Convert to PDF
                  </>
                )}
              </button>

              {pdfUrl && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
                    <div>PDF created successfully!</div>
                    <div>Pages: <strong>{pageCount}</strong></div>
                    <div>Size: <strong>{formatSize(pdfSize)}</strong></div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
