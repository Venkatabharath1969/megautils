'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, FileText, Shield, Loader2, Unlock, Eye, EyeOff } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

export default function PDFUnlockTool() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null)
  const [unlockedSize, setUnlockedSize] = useState(0)
  const [unlockedPages, setUnlockedPages] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsPassword, setNeedsPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const processFile = useCallback(async (f: File) => {
    setError(null)
    setUnlockedUrl(null)
    setNeedsPassword(false)
    setPassword('')
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.')
      return
    }
    setFile(f)
    setFileName(f.name)
    setFileSize(f.size)

    // Try loading without a password first
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      // If it loads with ignoreEncryption, check whether it was actually encrypted
      // We'll try to load normally to see
      try {
        await PDFDocument.load(bytes)
        // No encryption — loaded fine
        setNeedsPassword(false)
        setError('This PDF is not password-protected. No unlocking needed.')
        setUnlockedPages(pdf.getPageCount())
      } catch {
        // Encrypted — needs password
        setNeedsPassword(true)
        setUnlockedPages(pdf.getPageCount())
      }
    } catch {
      // Even ignoreEncryption failed — may be severely encrypted
      setNeedsPassword(true)
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

  const unlockPDF = useCallback(async () => {
    if (!file) return
    setIsProcessing(true)
    setError(null)
    setUnlockedUrl(null)
    try {
      const bytes = await file.arrayBuffer()
      // Load with the user-provided password
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdf = await PDFDocument.load(bytes, { password: password || undefined } as any)
      // Re-save without encryption
      const savedBytes = await pdf.save()
      const blob = new Blob([new Uint8Array(savedBytes)], { type: 'application/pdf' })
      setUnlockedSize(blob.size)
      setUnlockedPages(pdf.getPageCount())
      setUnlockedUrl(URL.createObjectURL(blob))
    } catch {
      setError('Failed to unlock PDF. The password may be incorrect or the encryption is unsupported.')
    } finally {
      setIsProcessing(false)
    }
  }, [file, password])

  const handleDownload = useCallback(() => {
    if (!unlockedUrl) return
    const a = document.createElement('a')
    a.href = unlockedUrl
    a.download = fileName.replace(/\.pdf$/i, '') + '_unlocked.pdf'
    a.click()
  }, [unlockedUrl, fileName])

  const clear = () => {
    if (unlockedUrl) URL.revokeObjectURL(unlockedUrl)
    setFile(null)
    setFileName('')
    setFileSize(0)
    setPassword('')
    setUnlockedUrl(null)
    setUnlockedSize(0)
    setUnlockedPages(0)
    setNeedsPassword(false)
    setError(null)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Unlock PDF"
      description="Remove password protection from a PDF file. Enter the password once and download an unrestricted copy. Free, private, in-browser."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'Can this tool crack a PDF password?', answer: 'No. You must know the correct password. This tool removes the encryption by opening the file with your password and saving a clean copy without restrictions.' },
        { question: 'Does unlocking change the PDF content?', answer: 'No. Pages, fonts, images, and form fields are preserved exactly. Only the password protection and permission restrictions are removed.' },
        { question: 'Are my files uploaded to a server?', answer: 'No. Everything runs in your browser using the pdf-lib library. Your file and password never leave your device.' },
        { question: 'What types of PDF encryption are supported?', answer: 'The tool supports standard PDF password encryption (40-bit and 128-bit RC4). Some advanced AES-256 encrypted files may not be supported by the browser-based library.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Unlock?</h2>
          <p>
            PDF Unlock removes password protection from PDF documents. If you have the password but want to save an
            unrestricted copy — for archiving, printing, or sharing — this tool opens the encrypted file and re-saves
            it without any password or permission restrictions. Everything runs locally in your browser.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a password-protected PDF by clicking the upload area or dragging it in.</li>
            <li>Enter the document password in the password field.</li>
            <li>Click <strong>Unlock PDF</strong>.</li>
            <li>Download the unlocked file — it will open without any password prompt.</li>
          </ol>

          <h2>When to Use PDF Unlock</h2>
          <ul>
            <li>You received a password-protected PDF and want to archive it without restrictions.</li>
            <li>A document has printing disabled — unlock it so you can print freely.</li>
            <li>You need to merge or edit a locked PDF but the editing tools require an unlocked file.</li>
            <li>Share a document with colleagues without forwarding the password.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Make sure you have legal permission to remove the password protection.</li>
            <li>If the tool says &ldquo;not password-protected&rdquo;, the PDF may only have owner-permissions restrictions which some viewers ignore anyway.</li>
            <li>For heavily encrypted files, try updating your browser for the best pdf-lib compatibility.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upload Password-Protected PDF</label>
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
            <span className="text-xs text-muted-foreground mt-1">Password-protected PDFs accepted</span>
            <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileInput} className="hidden" />
          </label>
        )}

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-green-500" />
          Your files and password never leave your device
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
                <div className="text-xs text-muted-foreground">{formatSize(fileSize)}</div>
              </div>
              {needsPassword && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">Encrypted</span>
              )}
            </div>

            {/* Password input */}
            {needsPassword && !unlockedUrl && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">PDF Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter the document password"
                    className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    onKeyDown={e => { if (e.key === 'Enter') unlockPDF() }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {needsPassword && !unlockedUrl && (
              <button
                onClick={unlockPDF}
                disabled={isProcessing || !password}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                {isProcessing ? 'Unlocking...' : 'Unlock PDF'}
              </button>
            )}

            {/* Result */}
            {unlockedUrl && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
                  <div>PDF unlocked successfully</div>
                  <div><strong>{unlockedPages}</strong> page{unlockedPages !== 1 ? 's' : ''} &middot; {formatSize(unlockedSize)}</div>
                </div>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" /> Download Unlocked PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
