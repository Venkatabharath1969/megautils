'use client'

import { useState, useCallback } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, FileText, Shield, Loader2 } from 'lucide-react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

type FontFamily = 'helvetica' | 'times' | 'courier'
type PageSize = 'a4' | 'letter'
type MarginType = 'normal' | 'narrow' | 'wide'
type LineSpacing = 1 | 1.5 | 2

const PAGE_SIZES: Record<PageSize, { width: number; height: number; label: string }> = {
  a4: { width: 595.28, height: 841.89, label: 'A4' },
  letter: { width: 612, height: 792, label: 'Letter' },
}

const MARGINS: Record<MarginType, { value: number; label: string }> = {
  narrow: { value: 36, label: 'Narrow' },
  normal: { value: 54, label: 'Normal' },
  wide: { value: 72, label: 'Wide' },
}

const FONT_SIZES = [10, 11, 12, 14, 16, 18, 24]

export default function TextToPdfTool() {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [fontFamily, setFontFamily] = useState<FontFamily>('helvetica')
  const [fontSize, setFontSize] = useState(12)
  const [pageSize, setPageSize] = useState<PageSize>('a4')
  const [marginType, setMarginType] = useState<MarginType>('normal')
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>(1.5)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultInfo, setResultInfo] = useState<{ pages: number; size: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const wrapText = (text: string, font: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>>, size: number, maxWidth: number): string[] => {
    const lines: string[] = []
    const paragraphs = text.split('\n')

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push('')
        continue
      }
      const words = paragraph.split(/\s+/)
      let currentLine = ''

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const testWidth = font.widthOfTextAtSize(testLine, size)
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      if (currentLine) lines.push(currentLine)
    }

    return lines
  }

  const generatePdf = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter some text to convert.')
      return
    }
    setIsProcessing(true)
    setError(null)
    setResultUrl(null)
    setResultInfo(null)

    try {
      const pdf = await PDFDocument.create()
      const fontEnum = fontFamily === 'times' ? StandardFonts.TimesRoman
        : fontFamily === 'courier' ? StandardFonts.Courier
        : StandardFonts.Helvetica
      const font = await pdf.embedFont(fontEnum)

      let boldFont: Awaited<ReturnType<typeof PDFDocument.prototype.embedFont>> | null = null
      if (title.trim()) {
        const boldEnum = fontFamily === 'times' ? StandardFonts.TimesRomanBold
          : fontFamily === 'courier' ? StandardFonts.CourierBold
          : StandardFonts.HelveticaBold
        boldFont = await pdf.embedFont(boldEnum)
      }

      const { width: pageWidth, height: pageHeight } = PAGE_SIZES[pageSize]
      const margin = MARGINS[marginType].value
      const lineHeight = fontSize * lineSpacing
      const maxWidth = pageWidth - margin * 2

      const lines = wrapText(text, font, fontSize, maxWidth)
      let page = pdf.addPage([pageWidth, pageHeight])
      let y = pageHeight - margin

      // Draw title if provided
      if (title.trim() && boldFont) {
        const titleSize = Math.min(fontSize + 6, 30)
        page.drawText(title, {
          x: margin,
          y,
          size: titleSize,
          font: boldFont,
          color: rgb(0, 0, 0),
        })
        y -= titleSize * 2
      }

      for (const line of lines) {
        if (y < margin + lineHeight) {
          page = pdf.addPage([pageWidth, pageHeight])
          y = pageHeight - margin
        }
        if (line === '') {
          y -= lineHeight
          continue
        }
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })
        y -= lineHeight
      }

      const pdfBytes = await pdf.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      setResultUrl(URL.createObjectURL(blob))
      setResultInfo({ pages: pdf.getPageCount(), size: blob.size })
    } catch {
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [text, title, fontFamily, fontSize, pageSize, marginType, lineSpacing])

  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = title.trim() ? `${title.trim().replace(/[^a-zA-Z0-9-_ ]/g, '').substring(0, 50)}.pdf` : 'document.pdf'
    a.click()
  }, [resultUrl, title])

  const clear = () => {
    setText('')
    setTitle('')
    setResultUrl(null)
    setResultInfo(null)
    setError(null)
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

  return (
    <ToolPage
      title="Text to PDF"
      description="Convert plain text into a professionally formatted PDF document with customizable fonts, margins, and page size."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'What fonts are available?', answer: 'Three standard PDF fonts: Helvetica (sans-serif), Times New Roman (serif), and Courier (monospace). These are built into every PDF reader and require no embedding, keeping the file small.' },
        { question: 'Is there a text length limit?', answer: 'No hard limit. The tool runs in your browser and automatically paginates text across as many pages as needed. Very long texts may take a moment to process.' },
        { question: 'Are my files uploaded?', answer: 'No. The PDF is generated entirely in your browser using the pdf-lib library. Your text never leaves your device.' },
        { question: 'Can I add a title to the document?', answer: 'Yes. Enter a title in the optional Title field and it will appear in larger bold text at the top of the first page.' },
        { question: 'What page sizes are supported?', answer: 'A4 (210 x 297 mm, standard worldwide) and US Letter (8.5 x 11 inches). Choose the one your printer or recipient expects.' },
      ]}
      helpContent={
        <>
          <h2>What is Text to PDF?</h2>
          <p>
            Text to PDF converts plain text into a clean, formatted PDF document. It is useful for creating printable
            documents from notes, code snippets, articles, or any plain text content. Everything runs in your browser
            — no server upload, no file limits.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your text into the text area.</li>
            <li>Optionally set a document title (appears bold at the top of the first page).</li>
            <li>Choose your formatting preferences: font, size, page size, margins, and line spacing.</li>
            <li>Click <strong>Generate PDF</strong>.</li>
            <li>Click <strong>Download</strong> to save the PDF to your device.</li>
          </ol>

          <h2>Formatting Options</h2>
          <ul>
            <li><strong>Font Family:</strong> Helvetica (clean sans-serif), Times New Roman (classic serif), Courier (monospace, great for code)</li>
            <li><strong>Font Size:</strong> 10pt to 24pt</li>
            <li><strong>Page Size:</strong> A4 (international) or Letter (US)</li>
            <li><strong>Margins:</strong> Narrow (0.5in), Normal (0.75in), Wide (1in)</li>
            <li><strong>Line Spacing:</strong> Single, 1.5x, or Double</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Enter Your Text</label>
          {text && <ClearButton onClear={clear} />}
        </div>

        {/* Title input */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Document Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setResultUrl(null) }}
            placeholder="My Document"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          />
        </div>

        {/* Text area */}
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setResultUrl(null) }}
          placeholder="Paste or type your text here..."
          rows={14}
          className="w-full px-3 py-2 text-sm font-mono border border-border rounded-lg bg-card resize-y focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
        />

        {/* Word / char count */}
        {text && (
          <div className="text-xs text-muted-foreground">
            {wordCount.toLocaleString()} word{wordCount !== 1 ? 's' : ''} &middot; {charCount.toLocaleString()} character{charCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Options grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Font family */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => { setFontFamily(e.target.value as FontFamily); setResultUrl(null) }}
              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg bg-card"
            >
              <option value="helvetica">Helvetica</option>
              <option value="times">Times New Roman</option>
              <option value="courier">Courier</option>
            </select>
          </div>

          {/* Font size */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Size</label>
            <select
              value={fontSize}
              onChange={(e) => { setFontSize(Number(e.target.value)); setResultUrl(null) }}
              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg bg-card"
            >
              {FONT_SIZES.map(s => (
                <option key={s} value={s}>{s}pt</option>
              ))}
            </select>
          </div>

          {/* Page size */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Page Size</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(e.target.value as PageSize); setResultUrl(null) }}
              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg bg-card"
            >
              {Object.entries(PAGE_SIZES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Margins */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Margins</label>
            <select
              value={marginType}
              onChange={(e) => { setMarginType(e.target.value as MarginType); setResultUrl(null) }}
              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg bg-card"
            >
              {Object.entries(MARGINS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Line spacing */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Line Spacing</label>
            <select
              value={lineSpacing}
              onChange={(e) => { setLineSpacing(Number(e.target.value) as LineSpacing); setResultUrl(null) }}
              className="w-full px-2 py-1.5 text-sm border border-border rounded-lg bg-card"
            >
              <option value={1}>Single</option>
              <option value={1.5}>1.5</option>
              <option value={2}>Double</option>
            </select>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-green-500" />
          Your text never leaves your device
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generatePdf}
            disabled={isProcessing || !text.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            <FileText className="h-4 w-4" />
            {isProcessing ? 'Generating...' : 'Generate PDF'}
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
        {resultInfo && (
          <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
            <div>PDF generated: <strong>{resultInfo.pages} page{resultInfo.pages !== 1 ? 's' : ''}</strong></div>
            <div>File size: <strong>{formatSize(resultInfo.size)}</strong></div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
