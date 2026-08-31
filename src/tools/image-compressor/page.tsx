'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload, Trash2, Image as ImageIcon, Shield } from 'lucide-react'
import JSZip from 'jszip'

interface CompressResult {
  original: File
  compressed: Blob
  compressedUrl: string
  savings: number
}

const OUTPUT_FORMATS = [
  { value: 'same', label: 'Same as Input' },
  { value: 'jpeg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
]

function getOutputMime(format: string, originalType: string): string {
  if (format === 'same') {
    if (originalType === 'image/webp') return 'image/webp'
    if (originalType === 'image/png') return 'image/png'
    return 'image/jpeg'
  }
  if (format === 'png') return 'image/png'
  if (format === 'webp') return 'image/webp'
  return 'image/jpeg'
}

function getOutputExt(format: string, originalName: string): string {
  if (format === 'same') {
    const ext = originalName.split('.').pop()?.toLowerCase()
    if (ext === 'webp') return 'webp'
    if (ext === 'png') return 'png'
    return 'jpg'
  }
  if (format === 'png') return 'png'
  if (format === 'webp') return 'webp'
  return 'jpg'
}

async function compressImage(file: File, quality: number, outputFormat: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      const mime = getOutputMime(outputFormat, file.type)
      // For JPEG, fill white background (no alpha support)
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Compression failed'))
        },
        mime,
        mime === 'image/png' ? undefined : quality / 100
      )
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function ImageCompressorTool() {
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<CompressResult[]>([])
  const [quality, setQuality] = useState(80)
  const [outputFormat, setOutputFormat] = useState('same')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const imageFiles = Array.from(newFiles).filter(f =>
      f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/webp'
    )
    if (imageFiles.length === 0) {
      setError('Please upload JPG, PNG, or WebP images only.')
      return
    }
    setError(null)
    setFiles(prev => [...prev, ...imageFiles])
    setResults([])
  }, [])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [addFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setResults([])
  }, [])

  const compressAll = useCallback(async () => {
    if (files.length === 0) return
    setIsProcessing(true)
    setError(null)
    const newResults: CompressResult[] = []
    try {
      for (const file of files) {
        const compressed = await compressImage(file, quality, outputFormat)
        const savings = Math.round((1 - compressed.size / file.size) * 100)
        newResults.push({
          original: file,
          compressed,
          compressedUrl: URL.createObjectURL(compressed),
          savings,
        })
      }
      setResults(newResults)
    } catch {
      setError('Some images failed to compress. Please check the file formats.')
    } finally {
      setIsProcessing(false)
    }
  }, [files, quality, outputFormat])

  const downloadSingle = useCallback((result: CompressResult, index: number) => {
    const ext = getOutputExt(outputFormat, result.original.name)
    const baseName = result.original.name.replace(/\.[^.]+$/, '')
    const a = document.createElement('a')
    a.href = result.compressedUrl
    a.download = `${baseName}-compressed.${ext}`
    a.click()
  }, [outputFormat])

  const downloadAllZip = useCallback(async () => {
    if (results.length === 0) return
    const zip = new JSZip()
    results.forEach((r, i) => {
      const ext = getOutputExt(outputFormat, r.original.name)
      const baseName = r.original.name.replace(/\.[^.]+$/, '')
      zip.file(`${baseName}-compressed.${ext}`, r.compressed)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'compressed-images.zip'
    a.click()
  }, [results, outputFormat])

  const clear = () => {
    results.forEach(r => URL.revokeObjectURL(r.compressedUrl))
    setFiles([])
    setResults([])
    setQuality(80)
    setOutputFormat('same')
    setPreviewIndex(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const totalOriginal = results.reduce((sum, r) => sum + r.original.size, 0)
  const totalCompressed = results.reduce((sum, r) => sum + r.compressed.size, 0)
  const totalSavings = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0

  return (
    <ToolPage
      title="Image Compressor"
      description="Compress JPG, PNG, and WebP images to reduce file size while maintaining quality"
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Image Compressor is a free browser-based tool that reduces image file sizes without significant quality loss. It supports JPEG, PNG, and WebP formats and processes everything locally in your browser — your images are never uploaded to any server. No sign-up, no installation required.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Drag and drop images or click to upload one or more JPG, PNG, or WebP files.</li>
            <li>Adjust the <strong>quality slider</strong> (1-100) to control the compression level. Lower values produce smaller files.</li>
            <li>Optionally change the <strong>output format</strong> — keep the same format or convert to JPG, PNG, or WebP.</li>
            <li>Click <strong>Compress All</strong> to process the images.</li>
            <li>Review the before/after comparison showing original size, compressed size, and savings percentage.</li>
            <li>Download individual images or all at once as a ZIP file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Use this tool to optimize images for websites, emails, social media, or any scenario where smaller file sizes are needed. Reducing image sizes improves page load speed, saves bandwidth, and makes sharing faster. It&apos;s a great free alternative to TinyPNG, Squoosh, or Compressor.io — and runs entirely offline after the page loads.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>A quality setting of 70-85 offers the best balance between size reduction and visual quality for most photographs.</li>
            <li>PNG images with large flat-color areas compress less with quality adjustment — consider converting to WebP for better results.</li>
            <li>WebP typically produces 25-35% smaller files than JPEG at equivalent visual quality.</li>
            <li>Use batch mode to compress multiple images at once and download them all as a ZIP.</li>
            <li>Your images are never uploaded to any server — all compression happens on your device using the Canvas API.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How much can I reduce my image file size?', answer: 'Typical savings range from 30-80% depending on the image type and quality setting. JPEG photos usually compress best, while PNG images with few colors may see smaller reductions.' },
        { question: 'Does compressing an image reduce its quality?', answer: 'JPEG and WebP compression is lossy, meaning some data is discarded. At quality 70-85, the difference is usually invisible to the human eye. PNG compression in this tool re-encodes the image, so converting to JPEG or WebP will yield better size reduction.' },
        { question: 'Is this tool a free alternative to TinyPNG?', answer: 'Yes! This tool compresses images entirely in your browser for free with no limits. Unlike TinyPNG, your images are never uploaded to a server, making it more private and faster for large files.' },
        { question: 'Can I compress multiple images at once?', answer: 'Yes! Upload multiple files at once using drag-and-drop or the file picker. All images will be compressed in batch and you can download them individually or as a ZIP file.' },
        { question: 'Does this tool upload my images to a server?', answer: 'No. All compression happens locally in your browser using the HTML Canvas API. Your images never leave your device.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload Images</span>
          {files.length > 0 && <ClearButton onClear={clear} />}
        </div>

        {/* Upload area */}
        {files.length === 0 ? (
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Drag & drop images here, or click to upload</span>
            <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP • Multiple files supported</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFile}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-6">
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => { setQuality(Number(e.target.value)); setResults([]) }}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1% (smallest)</span>
                  <span>100% (best quality)</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Output Format</label>
                <div className="flex flex-wrap gap-2">
                  {OUTPUT_FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => { setOutputFormat(f.value); setResults([]) }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${outputFormat === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* File list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{files.length} image{files.length !== 1 ? 's' : ''} queued</span>
                <label className="text-xs text-primary cursor-pointer hover:underline">
                  + Add more
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFile}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1.5">
                {files.map((file, i) => {
                  const result = results[i]
                  return (
                    <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 text-sm">
                      <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1 min-w-0">{file.name}</span>
                      <span className="text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
                      {result && (
                        <>
                          <span className="text-muted-foreground shrink-0">→</span>
                          <span className="font-medium shrink-0">{formatFileSize(result.compressed.size)}</span>
                          <span className={`text-xs font-medium shrink-0 px-1.5 py-0.5 rounded ${result.savings > 0 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'}`}>
                            {result.savings > 0 ? `-${result.savings}%` : `+${Math.abs(result.savings)}%`}
                          </span>
                          <button
                            onClick={() => downloadSingle(result, i)}
                            className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setPreviewIndex(previewIndex === i ? null : i)}
                            className="shrink-0 p-1 rounded hover:bg-muted transition-colors text-xs text-primary"
                            title="Preview"
                          >
                            👁
                          </button>
                        </>
                      )}
                      {!result && (
                        <button
                          onClick={() => removeFile(i)}
                          className="shrink-0 p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={compressAll}
                disabled={isProcessing || files.length === 0}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Compressing...' : `Compress All (${files.length})`}
              </button>
              {results.length > 1 && (
                <button
                  onClick={downloadAllZip}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download All as ZIP
                </button>
              )}
            </div>

            {/* Total savings summary */}
            {results.length > 0 && (
              <div className="p-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm space-y-1">
                <div className="font-medium text-base">Compression Complete</div>
                <div>Original total: <strong>{formatFileSize(totalOriginal)}</strong></div>
                <div>Compressed total: <strong>{formatFileSize(totalCompressed)}</strong></div>
                <div>Total savings: <strong>{totalSavings > 0 ? `-${totalSavings}%` : `+${Math.abs(totalSavings)}%`}</strong> ({formatFileSize(Math.abs(totalOriginal - totalCompressed))} {totalSavings > 0 ? 'saved' : 'increase'})</div>
              </div>
            )}

            {/* Before/After Preview */}
            {previewIndex !== null && results[previewIndex] && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Before / After Preview — {results[previewIndex].original.name}</span>
                  <button onClick={() => setPreviewIndex(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">Original ({formatFileSize(results[previewIndex].original.size)})</div>
                    <div className="border border-border rounded-lg p-2 bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(results[previewIndex].original)}
                        alt="Original"
                        className="max-w-full h-auto max-h-64 mx-auto object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">Compressed ({formatFileSize(results[previewIndex].compressed.size)})</div>
                    <div className="border border-border rounded-lg p-2 bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={results[previewIndex].compressedUrl}
                        alt="Compressed"
                        className="max-w-full h-auto max-h-64 mx-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privacy badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Shield className="h-3.5 w-3.5" />
          <span>Your images never leave your device. All compression happens locally in your browser.</span>
        </div>
      </div>
    </ToolPage>
  )
}
