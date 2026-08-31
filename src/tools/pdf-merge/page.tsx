'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, ChevronUp, ChevronDown, X, FileText, Shield, Loader2 } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

interface PDFFile {
  file: File
  name: string
  pageCount: number
  size: number
}

export default function PDFMergeTool() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([])
  const [mergedUrl, setMergedUrl] = useState<string | null>(null)
  const [mergedSize, setMergedSize] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    setMergedUrl(null)
    const newFiles: PDFFile[] = []
    for (const file of Array.from(files)) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        continue
      }
      try {
        const bytes = await file.arrayBuffer()
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
        newFiles.push({
          file,
          name: file.name,
          pageCount: pdf.getPageCount(),
          size: file.size,
        })
      } catch {
        setError(`Could not read "${file.name}". It may be corrupted or password-protected.`)
      }
    }
    if (newFiles.length > 0) {
      setPdfFiles(prev => {
        const updated = [...prev, ...newFiles]
        setTotalPages(updated.reduce((sum, f) => sum + f.pageCount, 0))
        return updated
      })
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) processFiles(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [processFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files)
  }, [processFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const moveFile = useCallback((index: number, direction: -1 | 1) => {
    setPdfFiles(prev => {
      const newArr = [...prev]
      const target = index + direction
      if (target < 0 || target >= newArr.length) return prev
      ;[newArr[index], newArr[target]] = [newArr[target], newArr[index]]
      return newArr
    })
    setMergedUrl(null)
  }, [])

  const removeFile = useCallback((index: number) => {
    setPdfFiles(prev => {
      const updated = prev.filter((_, i) => i !== index)
      setTotalPages(updated.reduce((sum, f) => sum + f.pageCount, 0))
      return updated
    })
    setMergedUrl(null)
  }, [])

  const mergePDFs = useCallback(async () => {
    if (pdfFiles.length < 2) {
      setError('Add at least 2 PDF files to merge.')
      return
    }
    setIsProcessing(true)
    setError(null)
    setMergedUrl(null)
    try {
      const mergedPdf = await PDFDocument.create()
      for (const pdfFile of pdfFiles) {
        const bytes = await pdfFile.file.arrayBuffer()
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(page => mergedPdf.addPage(page))
      }
      const mergedBytes = await mergedPdf.save()
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: 'application/pdf' })
      setMergedSize(blob.size)
      setMergedUrl(URL.createObjectURL(blob))
    } catch {
      setError('Failed to merge PDFs. One or more files may be corrupted.')
    } finally {
      setIsProcessing(false)
    }
  }, [pdfFiles])

  const handleDownload = useCallback(() => {
    if (!mergedUrl) return
    const a = document.createElement('a')
    a.href = mergedUrl
    a.download = 'merged.pdf'
    a.click()
  }, [mergedUrl])

  const clear = () => {
    setPdfFiles([])
    setMergedUrl(null)
    setMergedSize(0)
    setTotalPages(0)
    setError(null)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Merge PDF"
      description="Combine multiple PDF files into one document. Free, no limits, no upload."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'How many PDFs can I merge at once?', answer: 'There is no hard limit. The tool runs entirely in your browser, so the practical limit depends on your device\'s available memory. Most users can merge dozens of files without any issues.' },
        { question: 'Does merging change the quality of my PDFs?', answer: 'No. The merge copies pages exactly as they are — fonts, images, vector graphics, and form fields are preserved at their original quality. No re-encoding or compression is applied.' },
        { question: 'Are my files uploaded to a server?', answer: 'No. Every step — reading, combining, and saving — happens locally in your browser using the pdf-lib library. Your files never leave your device.' },
        { question: 'Can I reorder pages before merging?', answer: 'Yes. Use the up and down arrows next to each file to change the order. Pages from each file are added sequentially in the order you arrange them.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Merge?</h2>
          <p>
            PDF Merge combines two or more PDF documents into a single file. It is useful for assembling reports from
            separate chapters, consolidating scanned pages, or bundling invoices for accounting. This tool runs entirely
            in your browser using the pdf-lib library — no server upload, no file-size cap, and no watermarks.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Click the upload area or drag and drop PDF files onto it. You can select multiple files at once.</li>
            <li>Review the file list. Each entry shows the file name, page count, and size.</li>
            <li>Use the arrow buttons to reorder files, or the X button to remove one.</li>
            <li>Click <strong>Merge PDFs</strong> to combine them. A progress indicator shows while processing.</li>
            <li>Click <strong>Download</strong> to save the merged PDF to your device.</li>
          </ol>

          <h2>When to Use PDF Merge</h2>
          <ul>
            <li>Combine contract pages scanned on different days into one document.</li>
            <li>Bundle multiple invoices or receipts into a single PDF for bookkeeping.</li>
            <li>Assemble a report from individually exported charts, tables, and text sections.</li>
            <li>Merge cover letter and resume into one file before submitting a job application.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Arrange files in your desired page order before merging — the output follows the list order top to bottom.</li>
            <li>For very large files, close other browser tabs to free memory.</li>
            <li>Encrypted or password-protected PDFs may fail to load; remove the password first using a PDF unlock tool.</li>
            <li>The merged file retains all original page sizes, even if source documents use different paper formats.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upload PDF Files</label>
          {pdfFiles.length > 0 && <ClearButton onClear={clear} />}
        </div>

        {/* Upload zone */}
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`}
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">
            {isDragging ? 'Drop your PDFs here' : 'Click to upload or drag PDF files'}
          </span>
          <span className="text-xs text-muted-foreground mt-1">You can select multiple files</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
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

        {/* File list */}
        {pdfFiles.length > 0 && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <strong>{pdfFiles.length}</strong> file{pdfFiles.length !== 1 ? 's' : ''} &middot; <strong>{totalPages}</strong> total page{totalPages !== 1 ? 's' : ''}
            </div>

            <div className="space-y-2">
              {pdfFiles.map((pdf, index) => (
                <div key={`${pdf.name}-${index}`} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                  <FileText className="h-5 w-5 text-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{pdf.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {pdf.pageCount} page{pdf.pageCount !== 1 ? 's' : ''} &middot; {formatSize(pdf.size)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveFile(index, -1)}
                      disabled={index === 0}
                      className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveFile(index, 1)}
                      disabled={index === pdfFiles.length - 1}
                      className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeFile(index)}
                      className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors text-red-500"
                      title="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={mergePDFs}
                disabled={isProcessing || pdfFiles.length < 2}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? 'Merging...' : 'Merge PDFs'}
              </button>
              <label className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors cursor-pointer inline-flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Add More
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
              {mergedUrl && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              )}
            </div>

            {/* Result */}
            {mergedUrl && (
              <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
                <div>Merged successfully: <strong>{totalPages} pages</strong></div>
                <div>File size: <strong>{formatSize(mergedSize)}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
