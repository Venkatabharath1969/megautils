'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload, Trash2, Image as ImageIcon, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import JSZip from 'jszip'

interface ConvertResult {
  original: File
  converted: Blob
  convertedUrl: string
  status: 'success' | 'error'
  errorMsg?: string
}

const OUTPUT_FORMATS = [
  { value: 'jpeg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
]

function getOutputExt(format: string): string {
  if (format === 'png') return 'png'
  if (format === 'webp') return 'webp'
  return 'jpg'
}

async function convertHEIC(file: File, toFormat: string, quality: number): Promise<Blob> {
  const heic2any = (await import('heic2any')).default
  const result = await heic2any({
    blob: file,
    toType: `image/${toFormat === 'jpeg' ? 'jpeg' : toFormat}`,
    quality: quality / 100,
  })
  return Array.isArray(result) ? result[0] : result
}

export default function HeicToJpgTool() {
  const [files, setFiles] = useState<File[]>([])
  const [results, setResults] = useState<ConvertResult[]>([])
  const [quality, setQuality] = useState(90)
  const [outputFormat, setOutputFormat] = useState('jpeg')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingIndex, setProcessingIndex] = useState(-1)
  const [isDragging, setIsDragging] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const isHEIC = (file: File): boolean => {
    const name = file.name.toLowerCase()
    return (
      name.endsWith('.heic') ||
      name.endsWith('.heif') ||
      file.type === 'image/heic' ||
      file.type === 'image/heif'
    )
  }

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const heicFiles = Array.from(newFiles).filter(f => isHEIC(f))
    if (heicFiles.length === 0) {
      setError('Please upload HEIC or HEIF files only. These are typically photos from iPhones and iPads.')
      return
    }
    setError(null)
    setFiles(prev => [...prev, ...heicFiles])
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

  const convertAll = useCallback(async () => {
    if (files.length === 0) return
    setIsProcessing(true)
    setError(null)
    const newResults: ConvertResult[] = []
    for (let i = 0; i < files.length; i++) {
      setProcessingIndex(i)
      try {
        const converted = await convertHEIC(files[i], outputFormat, quality)
        newResults.push({
          original: files[i],
          converted,
          convertedUrl: URL.createObjectURL(converted),
          status: 'success',
        })
      } catch {
        newResults.push({
          original: files[i],
          converted: new Blob(),
          convertedUrl: '',
          status: 'error',
          errorMsg: 'Failed to convert. File may be corrupted or not a valid HEIC image.',
        })
      }
    }
    setResults(newResults)
    setProcessingIndex(-1)
    setIsProcessing(false)
  }, [files, quality, outputFormat])

  const downloadSingle = useCallback((result: ConvertResult) => {
    if (result.status !== 'success') return
    const ext = getOutputExt(outputFormat)
    const baseName = result.original.name.replace(/\.[^.]+$/, '')
    const a = document.createElement('a')
    a.href = result.convertedUrl
    a.download = `${baseName}.${ext}`
    a.click()
  }, [outputFormat])

  const downloadAllZip = useCallback(async () => {
    const successResults = results.filter(r => r.status === 'success')
    if (successResults.length === 0) return
    const zip = new JSZip()
    successResults.forEach((r) => {
      const ext = getOutputExt(outputFormat)
      const baseName = r.original.name.replace(/\.[^.]+$/, '')
      zip.file(`${baseName}.${ext}`, r.converted)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `heic-converted-${getOutputExt(outputFormat)}.zip`
    a.click()
  }, [results, outputFormat])

  const clear = () => {
    results.forEach(r => { if (r.convertedUrl) URL.revokeObjectURL(r.convertedUrl) })
    setFiles([])
    setResults([])
    setQuality(90)
    setOutputFormat('jpeg')
    setPreviewIndex(null)
    setProcessingIndex(-1)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  return (
    <ToolPage
      title="HEIC to JPG Converter"
      description="Convert iPhone HEIC/HEIF photos to JPG, PNG, or WebP — free and private"
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>HEIC to JPG Converter is a free browser-based tool that converts Apple&apos;s HEIC (High Efficiency Image Container) and HEIF photos into universally compatible formats like JPG, PNG, or WebP. iPhones and iPads save photos in HEIC format by default since iOS 11, but many Windows apps, websites, and email clients don&apos;t support HEIC. This tool handles the conversion entirely in your browser — your photos are never uploaded to any server.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Drag and drop your HEIC/HEIF files onto the upload area, or click to browse. Multiple files are supported.</li>
            <li>Choose your <strong>output format</strong> — JPG (default, most compatible), PNG (lossless), or WebP (smallest size).</li>
            <li>Adjust the <strong>quality slider</strong> to balance file size and image quality.</li>
            <li>Click <strong>Convert All</strong> and wait for processing. HEIC decoding happens in your browser, so larger files may take a few seconds each.</li>
            <li>Preview converted images and download them individually or all at once as a ZIP.</li>
          </ol>

          <h2>What is HEIC Format?</h2>
          <p>HEIC (High Efficiency Image Container) is an image format based on the HEIF standard, developed by the MPEG group. Apple adopted it as the default photo format for iPhones starting with iOS 11 and iPhone 7. HEIC files are roughly 50% smaller than JPEG at the same visual quality, but compatibility remains limited outside the Apple ecosystem. This tool bridges that gap by converting HEIC to universally supported formats.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Transfer HEIC photos from your iPhone via USB, AirDrop, iCloud, or email and then convert them here.</li>
            <li>JPG is the most universally compatible format — use it when you need the image to work everywhere.</li>
            <li>WebP produces smaller files than JPG while maintaining similar quality — ideal for web use.</li>
            <li>Conversion may take a few seconds per image because the HEIC decoder runs in your browser.</li>
            <li>Your photos are never uploaded to any server — all conversion happens locally on your device.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is a HEIC file?', answer: 'HEIC (High Efficiency Image Container) is an image format used by Apple on iPhones and iPads since iOS 11. It produces smaller file sizes than JPEG while maintaining the same quality, but is not widely supported outside Apple devices.' },
        { question: 'Why can\'t I open HEIC files on Windows?', answer: 'Windows does not natively support HEIC files in older versions. While Windows 10/11 can add support through the HEIF Image Extensions from the Microsoft Store, many apps and websites still don\'t accept HEIC. Converting to JPG ensures universal compatibility.' },
        { question: 'Does converting HEIC to JPG lose quality?', answer: 'There is some quality loss since JPG uses lossy compression. However, at a quality setting of 85-95, the difference is virtually invisible. For lossless conversion, choose PNG as the output format.' },
        { question: 'Can I convert multiple HEIC files at once?', answer: 'Yes! You can upload multiple HEIC files via drag-and-drop or the file picker. All files will be converted in batch, and you can download them individually or as a ZIP file.' },
        { question: 'Does this tool upload my photos to a server?', answer: 'No. The HEIC decoding and conversion happens entirely in your browser using WebAssembly. Your photos never leave your device, ensuring complete privacy.' },
        { question: 'How do I stop my iPhone from saving photos as HEIC?', answer: 'Go to Settings → Camera → Formats and select "Most Compatible" instead of "High Efficiency." This will save new photos as JPEG instead of HEIC.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload HEIC Files</span>
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
            <span className="text-sm text-muted-foreground">Drag & drop HEIC files here, or click to upload</span>
            <span className="text-xs text-muted-foreground mt-1">HEIC, HEIF files from iPhone/iPad • Multiple files supported</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".heic,.heif,image/heic,image/heif"
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
                <label className="text-sm font-medium mb-2 block">Output Format</label>
                <div className="flex gap-2">
                  {OUTPUT_FORMATS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => { setOutputFormat(f.value); setResults([]) }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${outputFormat === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

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
            </div>

            {/* File list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{files.length} file{files.length !== 1 ? 's' : ''} queued</span>
                <label className="text-xs text-primary cursor-pointer hover:underline">
                  + Add more
                  <input
                    type="file"
                    accept=".heic,.heif,image/heic,image/heif"
                    multiple
                    onChange={handleFile}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1.5">
                {files.map((file, i) => {
                  const result = results[i]
                  const isCurrentlyProcessing = isProcessing && processingIndex === i
                  return (
                    <div key={`${file.name}-${i}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 text-sm">
                      <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate flex-1 min-w-0">{file.name}</span>
                      <span className="text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>

                      {isCurrentlyProcessing && (
                        <span className="flex items-center gap-1 text-xs text-blue-500 shrink-0">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Converting...
                        </span>
                      )}

                      {result && result.status === 'success' && (
                        <>
                          <span className="text-muted-foreground shrink-0">→</span>
                          <span className="font-medium shrink-0">{formatFileSize(result.converted.size)}</span>
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          <button
                            onClick={() => downloadSingle(result)}
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

                      {result && result.status === 'error' && (
                        <span className="flex items-center gap-1 text-xs text-red-500 shrink-0">
                          <AlertCircle className="h-3.5 w-3.5" /> Failed
                        </span>
                      )}

                      {!result && !isCurrentlyProcessing && (
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
                onClick={convertAll}
                disabled={isProcessing || files.length === 0}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? `Converting ${processingIndex + 1}/${files.length}...` : `Convert All (${files.length})`}
              </button>
              {successCount > 1 && (
                <button
                  onClick={downloadAllZip}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download All as ZIP
                </button>
              )}
            </div>

            {/* Conversion summary */}
            {results.length > 0 && (
              <div className={`p-4 rounded-lg text-sm space-y-1 ${errorCount > 0 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
                <div className="font-medium text-base">Conversion Complete</div>
                <div>{successCount} of {results.length} file{results.length !== 1 ? 's' : ''} converted successfully</div>
                {errorCount > 0 && (
                  <div>{errorCount} file{errorCount !== 1 ? 's' : ''} failed — check if they are valid HEIC images</div>
                )}
              </div>
            )}

            {/* Preview */}
            {previewIndex !== null && results[previewIndex] && results[previewIndex].status === 'success' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Preview — {results[previewIndex].original.name}</span>
                  <button onClick={() => setPreviewIndex(null)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
                </div>
                <div className="border border-border rounded-lg p-2 bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={results[previewIndex].convertedUrl}
                    alt="Converted preview"
                    className="max-w-full h-auto max-h-80 mx-auto object-contain"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Converted to {outputFormat.toUpperCase()} • {formatFileSize(results[previewIndex].converted.size)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privacy badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Shield className="h-3.5 w-3.5" />
          <span>Your photos never leave your device. HEIC decoding happens entirely in your browser.</span>
        </div>
      </div>
    </ToolPage>
  )
}
