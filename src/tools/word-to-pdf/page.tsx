'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage } from '@/components/tool-page'
import { Upload, FileText, Download, Eye, AlertTriangle, Loader2 } from 'lucide-react'

interface ConversionResult {
  html: string
  warnings: string[]
  wordCount: number
  charCount: number
  paragraphCount: number
  fileName: string
}

export default function WordToPdfTool() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.match(/\.docx?$/i)) {
      setError('Please upload a .docx file')
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50 MB.')
      return
    }

    setFile(f)
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const mammoth = await import('mammoth')
      const arrayBuffer = await f.arrayBuffer()
      const res = await mammoth.convertToHtml({ arrayBuffer })
      const html = res.value
      const warnings = res.messages.map((m: { message: string }) => m.message)

      const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      const words = textContent ? textContent.split(/\s+/) : []

      setResult({
        html,
        warnings,
        wordCount: words.length,
        charCount: textContent.length,
        paragraphCount: (html.match(/<p[\s>]/g) || []).length,
        fileName: f.name,
      })
    } catch {
      setError('Failed to convert document. Make sure it is a valid .docx file.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const downloadPdf = async () => {
    if (!result) return
    setDownloading(true)

    try {
      const html2pdf = (await import('html2pdf.js')).default
      const container = document.createElement('div')
      container.innerHTML = result.html
      container.style.padding = '40px'
      container.style.fontFamily = 'Arial, Helvetica, sans-serif'
      container.style.fontSize = '12pt'
      container.style.lineHeight = '1.6'
      container.style.maxWidth = '700px'
      container.style.color = '#000'
      container.style.background = '#fff'
      document.body.appendChild(container)

      const pdfName = result.fileName.replace(/\.docx?$/i, '.pdf')

      await html2pdf().set({
        margin: [15, 15, 15, 15],
        filename: pdfName,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      }).from(container).save()

      document.body.removeChild(container)
    } catch {
      setError('PDF generation failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <ToolPage
      title="Word to PDF Converter"
      description="Convert Word documents (.docx) to PDF format instantly in your browser. Free, private, and no upload to servers."
      category="pdf"
      categoryLabel="PDF Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Word to PDF Converter is a free browser-based tool that converts Microsoft Word (.docx) documents to PDF format. It uses mammoth.js to parse the document structure and html2pdf.js to generate a clean PDF. All processing happens locally in your browser — your documents are never uploaded to any server.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Drag and drop a .docx file onto the upload area, or click to browse and select one.</li>
            <li>The tool automatically converts the Word document and shows a preview of the content.</li>
            <li>Review the document statistics: word count, character count, and paragraph count.</li>
            <li>Click &quot;Download PDF&quot; to save the converted PDF file to your computer.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Use this tool when you need to quickly convert a Word document to PDF without installing software or creating an account. It is ideal for converting resumes, reports, essays, contracts, and other documents. Since everything runs in your browser, your sensitive documents remain completely private. No file size limits beyond 50 MB, no watermarks, and no daily conversion caps.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>This tool works best with .docx files (Office 2007+). Older .doc files may not convert correctly.</li>
            <li>Complex formatting like tables, images, and custom fonts may appear slightly different in the PDF output.</li>
            <li>For best results, use standard fonts like Arial, Times New Roman, or Calibri in your Word document.</li>
            <li>The preview shows exactly what will appear in your PDF — review it before downloading.</li>
            <li>Large documents with many images may take a few seconds to process.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'Is my document uploaded to a server?', answer: 'No. All conversion happens locally in your browser using JavaScript. Your document never leaves your device, making it completely safe for sensitive content like contracts, resumes, and financial documents.' },
        { question: 'What file formats are supported?', answer: 'This tool supports .docx files (Microsoft Word 2007 and later). Older .doc format files are not supported. For best results, save your document as .docx before converting.' },
        { question: 'Are images preserved in the conversion?', answer: 'Yes, embedded images in .docx files are extracted and included in both the preview and the PDF output. However, very large images may be scaled to fit the page.' },
        { question: 'Is there a file size limit?', answer: 'The tool supports files up to 50 MB. Since processing happens in your browser, very large files may take longer to convert depending on your device performance.' },
        { question: 'How does this compare to Adobe Acrobat or Smallpdf?', answer: 'Unlike Adobe ($13/mo) or Smallpdf ($9/mo), this tool is completely free with no usage limits, no watermarks, and no account required. The key advantage is privacy — your files never leave your device.' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".docx,.doc"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">Drop your .docx file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Supports .docx files up to 50 MB</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 p-6 rounded-xl bg-muted/30 border border-border">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Converting document...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <>
            {/* File info */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm font-medium">{result.fileName}</div>
                  <div className="text-xs text-muted-foreground">{file && formatSize(file.size)}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-card border border-border text-center">
                  <div className="text-lg font-bold text-primary">{result.wordCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border text-center">
                  <div className="text-lg font-bold text-primary">{result.charCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Characters</div>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border text-center">
                  <div className="text-lg font-bold text-primary">{result.paragraphCount}</div>
                  <div className="text-xs text-muted-foreground">Paragraphs</div>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                <div className="font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Conversion Warnings</div>
                {result.warnings.slice(0, 5).map((w, i) => (
                  <div key={i}>{w}</div>
                ))}
                {result.warnings.length > 5 && (
                  <div className="text-muted-foreground">...and {result.warnings.length - 5} more</div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={downloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? 'Generating PDF...' : 'Download PDF'}
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors border border-border"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b border-border text-xs text-muted-foreground font-medium">
                  Document Preview
                </div>
                <div
                  className="p-6 bg-white text-black max-h-[600px] overflow-y-auto prose prose-sm max-w-none"
                  style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12pt', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: result.html }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </ToolPage>
  )
}
