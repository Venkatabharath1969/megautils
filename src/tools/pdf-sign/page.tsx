'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, Shield, Loader2, Pen, Type, Trash2, Move } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

type SignatureMode = 'draw' | 'type'
type SignatureColor = '#000000' | '#1a3b8a' | '#b91c1c'

interface PlacedSignature {
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  pageIndex: number
}

export default function PDFSignTool() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfPages, setPdfPages] = useState<string[]>([])
  const [pdfPageDims, setPdfPageDims] = useState<{ w: number; h: number }[]>([])
  const [activePageIndex, setActivePageIndex] = useState(0)
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw')
  const [signatureColor, setSignatureColor] = useState<SignatureColor>('#000000')
  const [typedText, setTypedText] = useState('')
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [placedSignature, setPlacedSignature] = useState<PlacedSignature | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  // Render PDF pages as images
  const renderPdfPages = useCallback(async (file: File) => {
    setIsRendering(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
      const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise
      const pages: string[] = []
      const dims: { w: number; h: number }[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const scale = 1.5
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.getContext('2d')!
        await page.render({ canvas, viewport }).promise
        pages.push(canvas.toDataURL('image/png'))
        dims.push({ w: viewport.width / scale, h: viewport.height / scale })
      }

      setPdfPages(pages)
      setPdfPageDims(dims)
    } catch {
      setError('Failed to render PDF. The file may be corrupted or password-protected.')
    } finally {
      setIsRendering(false)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.')
      return
    }
    setError(null)
    setSignedUrl(null)
    setPlacedSignature(null)
    setPdfFile(file)
    renderPdfPages(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [renderPdfPages])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.')
      return
    }
    setError(null)
    setSignedUrl(null)
    setPlacedSignature(null)
    setPdfFile(file)
    renderPdfPages(file)
  }, [renderPdfPages])

  // ── Drawing signature pad ──
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = signatureColor
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const endDraw = () => {
    if (isDrawing && canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL('image/png'))
    }
    setIsDrawing(false)
  }

  // Touch events
  const startDrawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    ctx.beginPath()
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top)
    setIsDrawing(true)
  }

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top)
    ctx.strokeStyle = signatureColor
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const endDrawTouch = () => {
    if (isDrawing && canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL('image/png'))
    }
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureDataUrl(null)
  }

  // ── Typed signature ──
  useEffect(() => {
    if (signatureMode !== 'type' || !typedText.trim()) {
      if (signatureMode === 'type') setSignatureDataUrl(null)
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 100
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 400, 100)
    ctx.font = '40px "Dancing Script", "Segoe Script", "Brush Script MT", cursive'
    ctx.fillStyle = signatureColor
    ctx.textBaseline = 'middle'
    ctx.fillText(typedText, 10, 50)
    setSignatureDataUrl(canvas.toDataURL('image/png'))
  }, [typedText, signatureColor, signatureMode])

  // ── Place signature on page ──
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!signatureDataUrl) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - 75
    const y = e.clientY - rect.top - 25
    setPlacedSignature({
      dataUrl: signatureDataUrl,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: 150,
      height: 50,
      pageIndex: activePageIndex,
    })
    setSignedUrl(null)
  }

  // ── Drag placed signature ──
  const handleSigMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!placedSignature) return
    setDragOffset({
      x: e.clientX - (e.currentTarget as HTMLElement).offsetLeft,
      y: e.clientY - (e.currentTarget as HTMLElement).offsetTop,
    })

    const handleMouseMove = (ev: MouseEvent) => {
      if (!previewContainerRef.current) return
      const containerRect = previewContainerRef.current.getBoundingClientRect()
      setPlacedSignature(prev => prev ? {
        ...prev,
        x: Math.max(0, Math.min(ev.clientX - containerRect.left - (e.clientX - (e.currentTarget as HTMLElement).offsetLeft - (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect().left), containerRect.width - prev.width)),
        y: Math.max(0, Math.min(ev.clientY - containerRect.top - (e.clientY - (e.currentTarget as HTMLElement).offsetTop - (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect().top), containerRect.height - prev.height)),
      } : null)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // ── Apply signature and download ──
  const applySignature = useCallback(async () => {
    if (!pdfFile || !placedSignature) return
    setIsProcessing(true)
    setError(null)
    try {
      const bytes = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true })

      const sigResponse = await fetch(placedSignature.dataUrl)
      const sigBytes = await sigResponse.arrayBuffer()
      const signatureImage = await pdfDoc.embedPng(new Uint8Array(sigBytes))

      const page = pdfDoc.getPages()[placedSignature.pageIndex]
      const pageWidth = page.getWidth()
      const pageHeight = page.getHeight()

      // Get the preview container to calculate scale
      const container = previewContainerRef.current
      if (!container) throw new Error('Preview not available')
      const img = container.querySelector('img')
      if (!img) throw new Error('Page image not found')
      const displayWidth = img.clientWidth
      const displayHeight = img.clientHeight

      const scaleX = pageWidth / displayWidth
      const scaleY = pageHeight / displayHeight

      const sigX = placedSignature.x * scaleX
      const sigY = pageHeight - (placedSignature.y + placedSignature.height) * scaleY
      const sigW = placedSignature.width * scaleX
      const sigH = placedSignature.height * scaleY

      page.drawImage(signatureImage, {
        x: sigX,
        y: sigY,
        width: sigW,
        height: sigH,
      })

      const savedBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(savedBytes)], { type: 'application/pdf' })
      setSignedUrl(URL.createObjectURL(blob))
    } catch {
      setError('Failed to apply signature. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [pdfFile, placedSignature])

  const handleDownload = useCallback(() => {
    if (!signedUrl) return
    const a = document.createElement('a')
    a.href = signedUrl
    a.download = `signed-${pdfFile?.name || 'document.pdf'}`
    a.click()
  }, [signedUrl, pdfFile])

  const clear = () => {
    setPdfFile(null)
    setPdfPages([])
    setPdfPageDims([])
    setActivePageIndex(0)
    setSignatureDataUrl(null)
    setPlacedSignature(null)
    setSignedUrl(null)
    setTypedText('')
    setError(null)
    clearCanvas()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const colors: { value: SignatureColor; label: string }[] = [
    { value: '#000000', label: 'Black' },
    { value: '#1a3b8a', label: 'Blue' },
    { value: '#b91c1c', label: 'Red' },
  ]

  return (
    <ToolPage
      title="Sign PDF"
      description="Add your signature to any PDF. Draw or type your signature and place it exactly where you need it. Free, private, no upload."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'Is my PDF uploaded to a server?', answer: 'No. Everything runs in your browser using the pdf-lib library. Your document and signature never leave your device.' },
        { question: 'Can I draw my signature with a stylus or finger?', answer: 'Yes. The signature pad supports mouse, touch, and stylus input. Draw naturally on the canvas and it captures your stroke.' },
        { question: 'Can I type my signature instead of drawing?', answer: 'Yes. Switch to the "Type" tab, enter your name, and it renders in a cursive signature-style font. You can change the color too.' },
        { question: 'How do I position the signature on the page?', answer: 'After creating your signature, click anywhere on the PDF page preview to place it. You can then drag it to reposition.' },
        { question: 'Does this create a legally binding signature?', answer: 'This tool adds a visual signature image to the PDF. For legally binding e-signatures with audit trails, you may need a dedicated e-signature service. However, in many jurisdictions a typed or drawn signature on a PDF is acceptable for informal agreements.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Sign?</h2>
          <p>
            PDF Sign lets you add your handwritten or typed signature to any PDF document directly in your browser. No account, no upload, no watermark. Competitors like DocuSign ($10/mo) and Adobe Sign ($13/mo) charge monthly fees for the same basic feature.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a PDF file by clicking the upload area or dragging it in.</li>
            <li>Create your signature: draw it on the pad or type your name in the Type tab.</li>
            <li>Pick a signature color (black, blue, or red).</li>
            <li>Click on the PDF page preview to place your signature.</li>
            <li>Drag to reposition the signature precisely.</li>
            <li>Click &quot;Apply Signature&quot; to embed it permanently into the PDF.</li>
            <li>Download your signed document.</li>
          </ol>

          <h2>Features</h2>
          <ul>
            <li>Draw signature with mouse, touch, or stylus</li>
            <li>Type signature with cursive font rendering</li>
            <li>Three color options: black, blue, red</li>
            <li>Click-to-place on any page with drag repositioning</li>
            <li>Multi-page PDF support with page navigation</li>
            <li>100% browser-based, your files never leave your device</li>
          </ul>
        </>
      }
    >
      {/* Google Fonts for cursive signature */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap" rel="stylesheet" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upload PDF to Sign</label>
          {pdfFile && <ClearButton onClear={clear} />}
        </div>

        {/* Upload zone */}
        {!pdfFile && (
          <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload or drag a PDF file</span>
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
        {isRendering && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Rendering PDF pages...
          </div>
        )}

        {/* Main editor */}
        {pdfFile && pdfPages.length > 0 && (
          <div className="space-y-6">
            {/* Signature creation */}
            <div className="border border-border rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold">Create Your Signature</h3>

              {/* Mode tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSignatureMode('draw')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${signatureMode === 'draw' ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
                >
                  <Pen className="h-3.5 w-3.5" /> Draw
                </button>
                <button
                  onClick={() => setSignatureMode('type')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${signatureMode === 'type' ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
                >
                  <Type className="h-3.5 w-3.5" /> Type
                </button>
              </div>

              {/* Color picker */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Color:</span>
                {colors.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setSignatureColor(c.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${signatureColor === c.value ? 'border-primary scale-110' : 'border-border'}`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>

              {/* Draw pad */}
              {signatureMode === 'draw' && (
                <div className="space-y-2">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={120}
                    /* bg-white intentional: signature pad needs white background for clean PNG export */
                    className="w-full border border-border rounded-lg bg-white cursor-crosshair touch-none"
                    style={{ maxWidth: 400 }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDrawTouch}
                    onTouchMove={drawTouch}
                    onTouchEnd={endDrawTouch}
                  />
                  <button
                    onClick={clearCanvas}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-border hover:bg-muted transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                </div>
              )}

              {/* Type signature */}
              {signatureMode === 'type' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder="Type your name..."
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                  {/* bg-white intentional: typed signature preview needs white background to match document */}
                  {typedText && (
                    <div className="p-4 border border-border rounded-lg bg-white">
                      <span style={{ fontFamily: '"Dancing Script", cursive', fontSize: '2rem', color: signatureColor }}>
                        {typedText}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {signatureDataUrl && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Signature ready — click on the PDF page below to place it.
                </p>
              )}
            </div>

            {/* Page navigation */}
            {pdfPages.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Page:</span>
                {pdfPages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePageIndex(i)}
                    className={`w-8 h-8 text-xs font-medium rounded border transition-colors ${activePageIndex === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

            {/* PDF page preview */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div
                ref={previewContainerRef}
                className="relative cursor-crosshair"
                onClick={handlePageClick}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pdfPages[activePageIndex]}
                  alt={`Page ${activePageIndex + 1}`}
                  className="w-full h-auto"
                  draggable={false}
                />
                {/* Placed signature overlay */}
                {placedSignature && placedSignature.pageIndex === activePageIndex && (
                  <div
                    className="absolute border-2 border-dashed border-primary/60 bg-primary/5 cursor-move"
                    style={{
                      left: placedSignature.x,
                      top: placedSignature.y,
                      width: placedSignature.width,
                      height: placedSignature.height,
                    }}
                    onMouseDown={handleSigMouseDown}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={placedSignature.dataUrl}
                      alt="Signature"
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                    <div className="absolute -top-5 left-0 text-[10px] text-primary font-medium flex items-center gap-0.5">
                      <Move className="h-3 w-3" /> Drag to move
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPlacedSignature(null); setSignedUrl(null) }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] hover:bg-red-600"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={applySignature}
                disabled={isProcessing || !placedSignature}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? 'Applying...' : 'Apply Signature'}
              </button>
              {signedUrl && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download Signed PDF
                </button>
              )}
            </div>

            {/* Result */}
            {signedUrl && (
              <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
                Signature applied successfully. Click Download to save your signed PDF.
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
