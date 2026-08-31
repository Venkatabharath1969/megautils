'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, Shield, Loader2, Copy, Check, FileText } from 'lucide-react'

export default function PdfToTextTool() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [pageCount, setPageCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractText = useCallback(async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setExtractedText('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise
      const numPages = pdf.numPages
      setPageCount(numPages)

      let fullText = ''
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => (item.str || ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        fullText += `--- Page ${i} ---\n${pageText}\n\n`
      }

      const trimmed = fullText.trim()
      setExtractedText(trimmed)
      const words = trimmed.split(/\s+/).filter(w => w.length > 0 && !w.startsWith('---'))
      setWordCount(words.length)
      setCharCount(trimmed.length)
    } catch {
      setError('Failed to extract text. The PDF may be corrupted, password-protected, or contain only scanned images (use OCR for scanned PDFs).')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.')
      return
    }
    setPdfFile(file)
    extractText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [extractText])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.')
      return
    }
    setPdfFile(file)
    extractText(file)
  }, [extractText])

  const handleCopy = useCallback(async () => {
    if (!extractedText) return
    try {
      await navigator.clipboard.writeText(extractedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = extractedText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [extractedText])

  const handleDownloadTxt = useCallback(() => {
    if (!extractedText) return
    const blob = new Blob([extractedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = pdfFile ? pdfFile.name.replace(/\.pdf$/i, '.txt') : 'extracted-text.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [extractedText, pdfFile])

  const clear = () => {
    setPdfFile(null)
    setExtractedText('')
    setPageCount(0)
    setWordCount(0)
    setCharCount(0)
    setError(null)
    setCopied(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <ToolPage
      title="PDF to Text"
      description="Extract all text from a PDF file. View, copy, or download as a .txt file. Free, private, browser-based."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'Can this extract text from scanned PDFs?', answer: 'No. This tool extracts embedded text content from digital PDFs. For scanned documents or image-based PDFs, use an OCR (Optical Character Recognition) tool like our AI OCR tool.' },
        { question: 'Is my PDF uploaded to a server?', answer: 'No. The text extraction runs entirely in your browser using the pdfjs-dist library. Your file never leaves your device.' },
        { question: 'Are page breaks preserved?', answer: 'Yes. The extracted text includes page markers (--- Page 1 ---, --- Page 2 ---, etc.) so you can see where each page starts.' },
        { question: 'What if the extracted text looks garbled?', answer: 'Some PDFs use custom fonts or encodings that may not extract cleanly. If the text looks wrong, the PDF may use non-standard character mappings. Try a different PDF reader or OCR tool.' },
        { question: 'Is there a file size limit?', answer: 'No hard limit, but very large PDFs may be slow to process since everything runs in your browser. Most PDFs under 50MB work fine.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF to Text?</h2>
          <p>
            PDF to Text extracts all readable text from a PDF document, organized by page. It is useful for copying
            content from PDFs, creating searchable text versions, or extracting data for further processing. The tool
            runs entirely in your browser — no upload, no server processing.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a PDF by clicking the upload area or dragging it in.</li>
            <li>The tool automatically extracts text from all pages.</li>
            <li>Review the extracted text in the output area.</li>
            <li>Use <strong>Copy</strong> to copy the text to your clipboard.</li>
            <li>Use <strong>Download .txt</strong> to save as a plain text file.</li>
          </ol>

          <h2>When to Use PDF to Text</h2>
          <ul>
            <li>Extract text from a PDF report for analysis or editing.</li>
            <li>Copy content from a PDF into a document or email.</li>
            <li>Create a searchable text version of a PDF for indexing.</li>
            <li>Pull data from PDF invoices or contracts for processing.</li>
          </ul>

          <h2>Limitations</h2>
          <ul>
            <li>Scanned image PDFs require OCR — this tool only extracts embedded text.</li>
            <li>Complex layouts (columns, tables) may not preserve their structure perfectly.</li>
            <li>Password-protected PDFs must be unlocked first.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upload PDF to Extract Text</label>
          {pdfFile && <ClearButton onClear={clear} />}
        </div>

        {/* Upload zone */}
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
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

        {/* Processing */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Extracting text from {pdfFile?.name}...
          </div>
        )}

        {/* File info */}
        {pdfFile && !isProcessing && extractedText && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex flex-wrap gap-4 p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-red-500" />
                <span className="font-medium">{pdfFile.name}</span>
                <span className="text-muted-foreground">({formatSize(pdfFile.size)})</span>
              </div>
              <div className="text-muted-foreground">
                <strong>{pageCount}</strong> page{pageCount !== 1 ? 's' : ''} &middot; <strong>{wordCount.toLocaleString()}</strong> word{wordCount !== 1 ? 's' : ''} &middot; <strong>{charCount.toLocaleString()}</strong> char{charCount !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Extracted text */}
            <div>
              <label className="block text-sm font-medium mb-2">Extracted Text</label>
              <textarea
                value={extractedText}
                readOnly
                rows={20}
                className="w-full px-3 py-2 text-sm font-mono border border-border rounded-lg bg-card resize-y focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
              <button
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download .txt
              </button>
            </div>
          </div>
        )}

        {/* Empty extraction result */}
        {pdfFile && !isProcessing && extractedText === '' && !error && (
          <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm">
            No text could be extracted. This PDF may contain only images (scanned document). Try our AI OCR tool for image-based PDFs.
          </div>
        )}
      </div>
    </ToolPage>
  )
}
