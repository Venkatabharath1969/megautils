'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'
import { Upload, Shield, FileText } from 'lucide-react'
import Tesseract from 'tesseract.js'

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'ita', label: 'Italian' },
  { code: 'por', label: 'Portuguese' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
  { code: 'jpn', label: 'Japanese' },
  { code: 'kor', label: 'Korean' },
  { code: 'hin', label: 'Hindi' },
  { code: 'ara', label: 'Arabic' },
  { code: 'rus', label: 'Russian' },
]

export default function OCRTextExtractorTool() {
  const [image, setImage] = useState<string | null>(null)
  const [imageName, setImageName] = useState('')
  const [text, setText] = useState('')
  const [confidence, setConfidence] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState('eng')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, WebP, BMP, or TIFF image.')
      return
    }
    setError(null)
    setText('')
    setConfidence(null)
    setProgress(0)
    setStatus('idle')
    setImageName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [handleFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const extractText = useCallback(async () => {
    if (!image) return
    setStatus('processing')
    setProgress(0)
    setError(null)
    setText('')
    setConfidence(null)

    try {
      const result = await Tesseract.recognize(image, language, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })
      setText(result.data.text)
      setConfidence(Math.round(result.data.confidence))
      setStatus('done')
    } catch {
      setError('OCR failed. Please try a different image or language.')
      setStatus('error')
    }
  }, [image, language])

  const clear = () => {
    setImage(null)
    setImageName('')
    setText('')
    setConfidence(null)
    setProgress(0)
    setStatus('idle')
    setError(null)
    setLanguage('eng')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="OCR Text Extractor"
      description="Extract text from images using browser-based OCR. Supports 12 languages. Free alternative to Adobe, Smallpdf, and iLovePDF OCR."
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>OCR Text Extractor is a free browser-based optical character recognition (OCR) tool that extracts text from images. It uses Tesseract.js to process images entirely on your device &mdash; nothing is uploaded to any server. This makes it a private, free alternative to paid OCR services like Adobe Acrobat ($15/mo), Smallpdf ($12/mo), and iLovePDF ($7/mo).</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Drag and drop an image or click to upload a JPG, PNG, WebP, BMP, or TIFF file.</li>
            <li>Select the <strong>language</strong> of the text in your image from the dropdown. English is selected by default.</li>
            <li>Click <strong>Extract Text</strong> and watch the progress bar as the OCR engine processes your image.</li>
            <li>Once complete, review the extracted text in the output area. A confidence score shows how accurate the recognition is.</li>
            <li>Use the <strong>Copy</strong> button to copy text to your clipboard, or <strong>Download</strong> to save it as a .txt file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Use this tool to digitize printed documents, extract text from screenshots, convert scanned documents to editable text, or grab text from photos. It&apos;s perfect for students, researchers, professionals, and anyone who needs to convert image-based text into editable, searchable content without paying for expensive OCR software.</p>

          <h2>Supported Languages</h2>
          <p>This tool supports 12 languages: English, Spanish, French, German, Italian, Portuguese, Chinese (Simplified), Japanese, Korean, Hindi, Arabic, and Russian. Select the correct language before extracting for best results.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Higher resolution images produce more accurate OCR results. Aim for at least 300 DPI for scanned documents.</li>
            <li>Ensure good contrast between text and background. Dark text on white background works best.</li>
            <li>Straight, non-rotated text is recognized more accurately than skewed or curved text.</li>
            <li>For multi-language documents, run OCR separately for each language section.</li>
            <li>The first run may take a few seconds longer as the language model is downloaded and cached in your browser.</li>
            <li>All processing happens in your browser &mdash; your images are never sent to any server.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'Is this OCR tool really free?', answer: 'Yes, completely free with no limits. Unlike Adobe ($15/mo), Smallpdf ($12/mo), or iLovePDF ($7/mo), this tool runs entirely in your browser with no subscription, no sign-up, and no usage caps.' },
        { question: 'Does this tool upload my images to a server?', answer: 'No. All OCR processing happens locally in your browser using Tesseract.js (WebAssembly). Your images never leave your device, making this the most private OCR option available.' },
        { question: 'What image formats are supported?', answer: 'JPG/JPEG, PNG, WebP, BMP, and TIFF files are supported. For best results, use high-resolution images with clear, well-contrasted text.' },
        { question: 'How accurate is the OCR?', answer: 'Accuracy depends on image quality, font clarity, and contrast. For clean printed text at 300+ DPI, accuracy typically exceeds 95%. The confidence score shown after extraction indicates the engine\'s certainty.' },
        { question: 'Why does the first extraction take longer?', answer: 'On the first run, Tesseract.js downloads the language model (~2-4 MB) to your browser. This is cached locally, so subsequent extractions are much faster.' },
        { question: 'Can I extract text from handwritten notes?', answer: 'Tesseract.js is optimized for printed text. It can recognize some neat handwriting, but accuracy will be significantly lower than for printed or typed text.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload Image</span>
          {image && <ClearButton onClear={clear} />}
        </div>

        {/* Upload area */}
        {!image ? (
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Drag & drop an image here, or click to upload</span>
            <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, BMP, TIFF</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff"
              onChange={handleInputChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-6">
            {/* Image preview */}
            <div className="border border-border rounded-lg p-2 bg-muted/20">
              <div className="text-xs text-muted-foreground mb-2">{imageName}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Uploaded"
                className="max-w-full h-auto max-h-64 mx-auto object-contain rounded"
              />
            </div>

            {/* Language selection */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Language:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-9 px-3 rounded-md border border-input bg-card text-sm"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Extract button */}
            <button
              onClick={extractText}
              disabled={status === 'processing'}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'processing' ? 'Extracting...' : 'Extract Text'}
            </button>

            {/* Progress bar */}
            {status === 'processing' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recognizing text...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Results */}
            {status === 'done' && text && (
              <div className="space-y-4">
                {/* Confidence score */}
                {confidence !== null && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                    confidence >= 80
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : confidence >= 50
                      ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    <FileText className="h-3.5 w-3.5" />
                    Confidence: {confidence}%
                  </div>
                )}

                {/* Text output */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Extracted Text</label>
                  <textarea
                    value={text}
                    readOnly
                    rows={12}
                    className="w-full rounded-lg border border-input bg-tool-bg p-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground text-sm font-mono"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={text} />
                  <DownloadButton
                    content={text}
                    filename={`${imageName.replace(/\.[^.]+$/, '')}-ocr.txt`}
                    mimeType="text/plain"
                  />
                </div>

                {/* Stats */}
                <div className="text-xs text-muted-foreground">
                  {text.trim().split(/\s+/).filter(Boolean).length} words &middot; {text.length} characters
                </div>
              </div>
            )}
          </div>
        )}

        {/* Privacy badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Shield className="h-3.5 w-3.5" />
          <span>Processing happens entirely in your browser. Your images are never uploaded to any server.</span>
        </div>
      </div>
    </ToolPage>
  )
}
