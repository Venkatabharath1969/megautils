'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'
import { Upload } from 'lucide-react'

export default function ImageToBase64Tool() {
  const [mode, setMode] = useState<'toBase64' | 'toImage'>('toBase64')
  const [base64, setBase64] = useState('')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [base64Input, setBase64Input] = useState('')
  const [previewFromBase64, setPreviewFromBase64] = useState<string | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setFileSize(file.size)
    setError('')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setBase64(result)
      setImageSrc(result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleBase64ToImage = useCallback(() => {
    setError('')
    const input = base64Input.trim()
    if (!input) return
    // Add data URI prefix if missing
    let src = input
    if (!src.startsWith('data:')) {
      src = `data:image/png;base64,${src}`
    }
    // Validate
    try {
      const img = new Image()
      img.onload = () => setPreviewFromBase64(src)
      img.onerror = () => setError('Invalid Base64 image data')
      img.src = src
    } catch {
      setError('Invalid Base64 image data')
    }
  }, [base64Input])

  const clear = () => {
    setBase64('')
    setImageSrc(null)
    setFileName('')
    setFileSize(0)
    setBase64Input('')
    setPreviewFromBase64(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const truncated = base64.length > 500
    ? base64.substring(0, 500) + `... (${base64.length.toLocaleString()} characters total)`
    : base64

  return (
    <ToolPage
      title="Image to Base64"
      description="Convert images to Base64 data URI or decode Base64 back to images"
      category="image"
      categoryLabel="Image Tools"
      faqs={[
        { question: 'What is a Base64 data URI for images?', answer: 'A Base64 data URI embeds the image data directly as a text string in your HTML or CSS, eliminating the need for a separate image file request.' },
        { question: 'When should I use Base64-encoded images?', answer: 'Base64 is best for very small images like icons or simple graphics under 10 KB. For larger images, regular files are more efficient since Base64 increases size by about 33%.' },
        { question: 'How do I use a Base64 image in HTML?', answer: 'Place the full data URI string (starting with "data:image/...") in the src attribute of an img tag, like: <img src="data:image/png;base64,..." />.' },
      ]}
    >
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setMode('toBase64'); clear() }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'toBase64' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
        >
          Image to Base64
        </button>
        <button
          onClick={() => { setMode('toImage'); clear() }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'toImage' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
        >
          Base64 to Image
        </button>
      </div>

      {mode === 'toBase64' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Upload Image</span>
            {imageSrc && <ClearButton onClear={clear} />}
          </div>

          <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {fileName || 'Click to upload an image'}
            </span>
            {fileSize > 0 && (
              <span className="text-xs text-muted-foreground mt-1">
                {(fileSize / 1024).toFixed(1)} KB
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </label>

          {imageSrc && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageSrc} alt="Preview" className="max-w-full h-auto max-h-60 mx-auto" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Base64 Output</span>
                  <CopyButton text={base64} />
                </div>
                <ToolTextarea value={truncated} readOnly rows={10} placeholder="Base64 will appear here..." />
                <div className="mt-2 text-xs text-muted-foreground">
                  Length: {base64.length.toLocaleString()} characters
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Paste Base64</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea
            value={base64Input}
            onChange={setBase64Input}
            placeholder="Paste Base64 string here (with or without data: prefix)..."
            rows={8}
          />

          <button
            onClick={handleBase64ToImage}
            disabled={!base64Input.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Convert to Image
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">{error}</div>
          )}

          {previewFromBase64 && (
            <div>
              <span className="text-sm font-medium mb-2 block">Image Preview</span>
              <div className="border border-border rounded-lg p-4 bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewFromBase64} alt="Decoded" className="max-w-full h-auto max-h-80 mx-auto" />
              </div>
            </div>
          )}
        </div>
      )}
    </ToolPage>
  )
}
