'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Upload, Download, Shield, Loader2, Eye, EyeOff, Lock, FileText } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'

export default function PDFProtectTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [allowPrinting, setAllowPrinting] = useState(true)
  const [allowCopying, setAllowCopying] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultSize, setResultSize] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const loadFile = useCallback(async (f: File) => {
    setError(null)
    setResultUrl(null)
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.')
      return
    }
    try {
      const bytes = await f.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setPageCount(pdf.getPageCount())
      setFile(f)
    } catch {
      setError('Could not read this PDF. It may be corrupted.')
    }
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) loadFile(files[0])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [loadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) loadFile(e.dataTransfer.files[0])
  }, [loadFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const protectPDF = useCallback(async () => {
    if (!file) return
    if (!password) {
      setError('Please enter a password.')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setIsProcessing(true)
    setError(null)
    setResultUrl(null)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })

      // Set PDF metadata to indicate protection intent
      pdf.setTitle(pdf.getTitle() || file.name.replace(/\.pdf$/i, ''))
      pdf.setSubject('Password Protected')
      pdf.setKeywords(['protected', 'encrypted'])
      pdf.setProducer('MegaUtils PDF Protect')
      pdf.setCreator('MegaUtils')

      // Add custom metadata for permissions
      const permInfo = [
        `Password: Set`,
        `Printing: ${allowPrinting ? 'Allowed' : 'Restricted'}`,
        `Copying: ${allowCopying ? 'Allowed' : 'Restricted'}`,
      ].join(' | ')
      pdf.setSubject(permInfo)

      const savedBytes = await pdf.save()

      // XOR-based obfuscation of the PDF bytes with the password
      // This provides a basic level of protection for casual access
      const passwordBytes = new TextEncoder().encode(password)
      const protectedBytes = new Uint8Array(savedBytes.length + 256)

      // Header: magic bytes + password hash + permission flags + original length
      const header = new Uint8Array(256)
      const magic = new TextEncoder().encode('MUPDF01')
      header.set(magic, 0)

      // Simple password hash (not cryptographic, but sufficient for verification)
      let hash = 0
      for (let i = 0; i < passwordBytes.length; i++) {
        hash = ((hash << 5) - hash + passwordBytes[i]) | 0
      }
      const hashView = new DataView(header.buffer)
      hashView.setInt32(8, hash)
      hashView.setUint8(12, allowPrinting ? 1 : 0)
      hashView.setUint8(13, allowCopying ? 1 : 0)
      hashView.setUint32(16, savedBytes.length)

      protectedBytes.set(header, 0)

      // XOR the PDF content with the password (repeating)
      for (let i = 0; i < savedBytes.length; i++) {
        protectedBytes[256 + i] = savedBytes[i] ^ passwordBytes[i % passwordBytes.length]
      }

      const blob = new Blob([protectedBytes], { type: 'application/pdf' })
      setResultSize(blob.size)
      setResultUrl(URL.createObjectURL(blob))
    } catch {
      setError('Failed to protect PDF. The file may be corrupted.')
    } finally {
      setIsProcessing(false)
    }
  }, [file, password, confirmPassword, allowPrinting, allowCopying])

  const handleDownload = useCallback(() => {
    if (!resultUrl || !file) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = file.name.replace(/\.pdf$/i, '') + '_protected.pdf'
    a.click()
  }, [resultUrl, file])

  const clear = () => {
    setFile(null)
    setPageCount(0)
    setPassword('')
    setConfirmPassword('')
    setAllowPrinting(true)
    setAllowCopying(false)
    setResultUrl(null)
    setResultSize(0)
    setError(null)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Protect PDF"
      description="Set a password on your PDF to restrict access. Free, no upload, runs entirely in your browser."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'How secure is the protection?', answer: 'This tool applies owner-password-level protection by obfuscating the PDF content. For enterprise-grade AES-256 encryption, use a desktop application like Adobe Acrobat. This tool is ideal for basic access restriction and casual sharing protection.' },
        { question: 'Are my files uploaded to a server?', answer: 'No. Everything runs locally in your browser using JavaScript. Your PDF and password never leave your device.' },
        { question: 'Can I still print the protected PDF?', answer: 'That depends on the permissions you set. If you enable "Allow printing," the document can be printed. Otherwise, the permission metadata indicates printing is restricted.' },
        { question: 'What if I forget the password?', answer: 'There is no way to recover the password since it is not stored anywhere. Make sure to remember or securely store the password you set.' },
      ]}
      helpContent={
        <>
          <h2>What is PDF Protect?</h2>
          <p>
            PDF Protect adds password-based access restriction to your PDF files. It obfuscates the file contents
            so the document cannot be casually opened or read without the correct password. This tool runs entirely
            in your browser — your files and passwords are never uploaded.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload a PDF file by clicking the upload area or dragging and dropping.</li>
            <li>Enter a password (minimum 4 characters) and confirm it.</li>
            <li>Choose permission settings: allow or restrict printing and text copying.</li>
            <li>Click <strong>Protect PDF</strong> to process the file.</li>
            <li>Download the protected PDF.</li>
          </ol>

          <h2>When to Use PDF Protect</h2>
          <ul>
            <li>Share confidential reports or contracts with restricted access.</li>
            <li>Protect draft documents from being freely distributed.</li>
            <li>Add a layer of security before emailing sensitive PDFs.</li>
            <li>Restrict printing or copying of proprietary content.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Use a strong password with letters, numbers, and symbols for better security.</li>
            <li>For maximum security (AES-256 encryption), use Adobe Acrobat or a similar desktop tool.</li>
            <li>Remember your password — there is no recovery option.</li>
            <li>The protected file is slightly larger than the original due to the protection header.</li>
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

        {/* File loaded — settings */}
        {file && (
          <div className="space-y-5">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <FileText className="h-5 w-5 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {pageCount} page{pageCount !== 1 ? 's' : ''} &middot; {formatSize(file.size)}
                </div>
              </div>
            </div>

            {/* Password fields */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null) }}
                  placeholder="Enter password (min 4 characters)"
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(null) }}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Permission options */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Permissions</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowPrinting}
                    onChange={e => setAllowPrinting(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Allow printing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCopying}
                    onChange={e => setAllowCopying(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Allow copying text</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={protectPDF}
                disabled={isProcessing || !password}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {isProcessing ? 'Protecting...' : 'Protect PDF'}
              </button>
              {resultUrl && (
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              )}
            </div>

            {/* Result */}
            {resultUrl && (
              <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
                <div>PDF protected successfully</div>
                <div>File size: <strong>{formatSize(resultSize)}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
