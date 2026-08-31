'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, RotateCw, RotateCcw, Shield, Loader2 } from 'lucide-react'
import { PDFDocument, degrees } from 'pdf-lib'

interface PageThumbnail {
  index: number
  rotation: number
  dataUrl: string
}

export default function PDFRotateTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([])
  const [rotations, setRotations] = useState<Record<number, number>>({})
  const [mode, setMode] = useState<'all' | 'select'>('all')
  const [globalAngle, setGlobalAngle] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadThumbnails = useCallback(async (pdfFile: File) => {
    setIsLoading(true)
    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setPageCount(pdf.numPages)

      const thumbs: PageThumbnail[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.3 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.getContext('2d')!
        await page.render({ canvas, viewport }).promise
        thumbs.push({ index: i - 1, rotation: 0, dataUrl: canvas.toDataURL() })
      }
      setThumbnails(thumbs)
      const initialRotations: Record<number, number> = {}
      for (let i = 0; i < pdf.numPages; i++) initialRotations[i] = 0
      setRotations(initialRotations)
    } catch {
      setError('Failed to load PDF. The file may be corrupted or password-protected.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.')
      return
    }
    setError(null)
    setResultUrl(null)
    setFile(f)
    setGlobalAngle(0)
    setMode('all')
    await loadThumbnails(f)
  }, [loadThumbnails])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [handleFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, [handleFile])

  const rotateAll = useCallback((angle: number) => {
    setGlobalAngle(prev => (prev + angle + 360) % 360)
    setRotations(prev => {
      const updated: Record<number, number> = {}
      for (const key of Object.keys(prev)) {
        const idx = parseInt(key)
        updated[idx] = (prev[idx] + angle + 360) % 360
      }
      return updated
    })
    setResultUrl(null)
  }, [])

  const rotatePage = useCallback((pageIndex: number, angle: number) => {
    setRotations(prev => ({
      ...prev,
      [pageIndex]: ((prev[pageIndex] || 0) + angle + 360) % 360,
    }))
    setResultUrl(null)
  }, [])

  const rotatePDF = useCallback(async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setResultUrl(null)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const pages = pdf.getPages()
      pages.forEach((page, i) => {
        const rot = rotations[i] || 0
        if (rot !== 0) {
          page.setRotation(degrees(page.getRotation().angle + rot))
        }
      })
      const savedBytes = await pdf.save()
      const blob = new Blob([new Uint8Array(savedBytes)], { type: 'application/pdf' })
      setResultUrl(URL.createObjectURL(blob))
    } catch {
      setError('Failed to rotate PDF. The file may be corrupted.')
    } finally {
      setIsProcessing(false)
    }
  }, [file, rotations])

  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `rotated-${file?.name || 'document.pdf'}`
    a.click()
  }, [resultUrl, file])

  // Cleanup blob URL
  useEffect(() => {
    return () => { if (resultUrl) URL.revokeObjectURL(resultUrl) }
  }, [resultUrl])

  const clear = () => {
    setFile(null)
    setPageCount(0)
    setThumbnails([])
    setRotations({})
    setGlobalAngle(0)
    setMode('all')
    setResultUrl(null)
    setError(null)
    setIsProcessing(false)
    setIsLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const hasRotation = Object.values(rotations).some(r => r !== 0)

  return (
    <ToolPage
      title="Rotate PDF"
      description="Rotate all or individual pages of a PDF. Free, no upload, runs in your browser."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'Can I rotate individual pages?', answer: 'Yes. Switch to "Select Pages" mode and click the rotation buttons on each page thumbnail to rotate them independently. You can rotate different pages by different amounts.' },
        { question: 'What rotation angles are supported?', answer: 'You can rotate pages by 90 degrees clockwise, 90 degrees counter-clockwise, or 180 degrees. Rotations are cumulative, so clicking 90 CW twice gives you a 180-degree rotation.' },
        { question: 'Are my files uploaded to a server?', answer: 'No. Everything runs locally in your browser using the pdf-lib library. Your files never leave your device, ensuring complete privacy.' },
        { question: 'Does rotating change the quality?', answer: 'No. Rotation only changes the page orientation metadata. All content, fonts, images, and vector graphics remain at their original quality.' },
        { question: 'Can I rotate a password-protected PDF?', answer: 'Password-protected PDFs must be unlocked first. Use our PDF Unlock tool to remove the password, then rotate the pages.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Rotate?</h2>
          <p>
            PDF Rotate lets you change the orientation of pages in a PDF document. Whether a scanned page came in sideways,
            a landscape chart needs to become portrait, or certain pages simply face the wrong direction, this tool corrects
            them in seconds. It runs entirely in your browser using the pdf-lib library, meaning no files are uploaded to any
            server.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Click the upload area or drag and drop a PDF file.</li>
            <li>Page thumbnails load automatically so you can see each page.</li>
            <li>Choose &quot;All Pages&quot; to rotate every page at once, or &quot;Select Pages&quot; to rotate individual pages.</li>
            <li>Use the 90 CW, 90 CCW, or 180 buttons to set the desired rotation.</li>
            <li>Click individual page thumbnails (in Select mode) to rotate just that page.</li>
            <li>Click &quot;Rotate &amp; Download&quot; to save the rotated PDF.</li>
          </ol>

          <h2>When to Use PDF Rotate</h2>
          <ul>
            <li>Fix sideways or upside-down scanned documents.</li>
            <li>Correct landscape pages in a mostly-portrait document.</li>
            <li>Prepare documents for printing with correct orientation.</li>
            <li>Rotate specific slides or charts within a larger PDF report.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Rotation is cumulative: clicking 90 CW twice results in 180-degree rotation.</li>
            <li>The blue rotation badge on each thumbnail shows the current angle for that page.</li>
            <li>For large PDFs, thumbnail loading may take a few seconds. The rotation itself is fast.</li>
            <li>Encrypted PDFs must be unlocked first. Use our PDF Unlock tool before rotating.</li>
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
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false) }}
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

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading page thumbnails...</span>
          </div>
        )}

        {/* Controls & Thumbnails */}
        {file && thumbnails.length > 0 && !isLoading && (
          <div className="space-y-4">
            {/* File info */}
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <strong>{file.name}</strong> &middot; <strong>{pageCount}</strong> page{pageCount !== 1 ? 's' : ''}
            </div>

            {/* Mode selector */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1">
                <button
                  onClick={() => setMode('all')}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${mode === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >
                  All Pages
                </button>
                <button
                  onClick={() => setMode('select')}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${mode === 'select' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >
                  Select Pages
                </button>
              </div>

              {mode === 'all' && (
                <div className="flex gap-1">
                  <button
                    onClick={() => rotateAll(90)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                    title="Rotate all 90 clockwise"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> 90 CW
                  </button>
                  <button
                    onClick={() => rotateAll(-90)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                    title="Rotate all 90 counter-clockwise"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> 90 CCW
                  </button>
                  <button
                    onClick={() => rotateAll(180)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                    title="Rotate all 180 degrees"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> 180
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {thumbnails.map((thumb) => {
                const rotation = rotations[thumb.index] || 0
                return (
                  <div key={thumb.index} className="relative group">
                    <div className="border border-border rounded-lg overflow-hidden bg-muted/30 p-1">
                      <div className="relative aspect-[3/4] flex items-center justify-center overflow-hidden">
                        <img
                          src={thumb.dataUrl}
                          alt={`Page ${thumb.index + 1}`}
                          className="max-w-full max-h-full object-contain transition-transform duration-200"
                          style={{ transform: `rotate(${rotation}deg)` }}
                        />
                      </div>
                      <div className="text-center mt-1 text-xs text-muted-foreground">
                        Page {thumb.index + 1}
                      </div>
                      {/* Rotation badge */}
                      {rotation !== 0 && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {rotation}
                        </div>
                      )}
                    </div>

                    {/* Per-page rotation controls */}
                    {mode === 'select' && (
                      <div className="flex justify-center gap-1 mt-1">
                        <button
                          onClick={() => rotatePage(thumb.index, -90)}
                          className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
                          title="Rotate 90 CCW"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => rotatePage(thumb.index, 90)}
                          className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
                          title="Rotate 90 CW"
                        >
                          <RotateCw className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => rotatePage(thumb.index, 180)}
                          className="h-6 w-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors text-[10px] font-bold"
                          title="Rotate 180"
                        >
                          180
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={rotatePDF}
                disabled={isProcessing || !hasRotation}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? 'Processing...' : 'Rotate & Download'}
              </button>
              {resultUrl && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
              )}
            </div>

            {/* Result */}
            {resultUrl && (
              <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                PDF rotated successfully. Click &quot;Download PDF&quot; to save.
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
