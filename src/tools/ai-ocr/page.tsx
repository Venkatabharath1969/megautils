'use client'

import { useState, useRef, useCallback } from 'react'
import { ToolPage, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'
import { Upload, ImageIcon, Shield, Wifi } from 'lucide-react'

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'spa', label: 'Spanish' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'hin', label: 'Hindi' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
  { code: 'jpn', label: 'Japanese' },
  { code: 'kor', label: 'Korean' },
]

export default function AIOCR() {
  const [image, setImage] = useState<string | null>(null)
  const [imageName, setImageName] = useState('')
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [language, setLanguage] = useState('eng')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentFile = useRef<File | null>(null)

  const processImage = useCallback(async (file: File) => {
    setStatus('loading')
    setProgress(0)
    setText('')
    setErrorMsg('')

    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker(language, 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
            setStatus('processing')
          }
        },
      })

      const { data } = await worker.recognize(file)
      setText(data.text)
      setStatus('done')
      await worker.terminate()
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'OCR processing failed')
      setStatus('error')
    }
  }, [language])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file.')
      setStatus('error')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File size must be under 20 MB')
      setStatus('error')
      return
    }

    currentFile.current = file
    setImageName(file.name)
    setStatus('idle')
    setText('')
    setErrorMsg('')

    const reader = new FileReader()
    reader.onload = (ev) => {
      setImage(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleExtract = useCallback(() => {
    if (currentFile.current) {
      processImage(currentFile.current)
    }
  }, [processImage])

  const clear = useCallback(() => {
    setImage(null)
    setImageName('')
    setText('')
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
    currentFile.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const progressLabel = status === 'loading'
    ? 'Preparing AI engine (one-time setup)...'
    : status === 'processing'
      ? `Reading text from your image... ${progress}%`
      : ''

  return (
    <ToolPage
      title="AI Image to Text (OCR)"
      description="Extract text from images, screenshots, and documents using AI. Supports 100+ languages. Runs entirely in your browser."
      category="image"
      categoryLabel="Image Tools"
      slug="ai-ocr"
      helpContent={
        <>
          <h2>What is AI Image to Text (OCR)?</h2>
          <p>
            AI Image to Text is a free optical character recognition tool that extracts readable, editable text from images, screenshots, scanned documents, and photographs. Powered by Tesseract.js — the leading open-source OCR engine — it analyzes the pixel patterns in your image to identify individual characters, words, lines, and paragraphs. The entire recognition process runs locally in your browser, which means your images are never uploaded to any external server. This makes the tool ideal for sensitive documents such as contracts, medical records, identification cards, and financial statements.
          </p>
          <p>
            The tool supports over 100 languages including English, Spanish, French, German, Hindi, Chinese, Japanese, and Korean. You can select the appropriate language before starting recognition to significantly improve accuracy. Whether you need to digitize a printed page, pull text from a screenshot, or convert a handwritten note into editable content, this tool provides fast and reliable results directly in your browser.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Select the language of the text in your image from the dropdown menu at the top of the tool.</li>
            <li>Click the upload area or drag and drop an image file (PNG, JPG, WebP, BMP, or GIF) up to 20 MB.</li>
            <li>A preview of your uploaded image will appear on the left side of the screen.</li>
            <li>Click the Extract Text button to begin OCR processing. A progress bar will show the recognition status.</li>
            <li>Once complete, the extracted text appears in the right panel where you can review it for accuracy.</li>
            <li>Use the copy button to copy the text to your clipboard, or download it as a plain text file for later use.</li>
            <li>Click clear to reset the tool and process another image.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Use high-resolution images with clear, sharp text for the best recognition accuracy. Blurry or low-contrast images produce less reliable results.</li>
            <li>Crop your image to focus on the text area before uploading. Removing unnecessary borders, logos, and background elements helps the engine concentrate on the text.</li>
            <li>Ensure the text in the image is not rotated or heavily skewed. Straight, level text is recognized much more accurately.</li>
            <li>Always select the correct language before clicking Extract Text. The language model is critical for accurate character recognition, especially for non-Latin scripts.</li>
            <li>The first use requires downloading the language model to your browser. This is a one-time setup per language, and subsequent extractions will be faster.</li>
            <li>For multi-language documents, process the image once per language and combine the results for complete coverage.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is OCR and how does it work?', answer: 'OCR (Optical Character Recognition) is a technology that converts images of text into machine-readable text. This tool uses Tesseract.js, an open-source OCR engine, to analyze pixel patterns in your image and identify characters, words, and paragraphs.' },
        { question: 'Is my image data safe and private?', answer: 'Yes. All processing happens entirely in your browser, on your device. Your images are never uploaded to any server. The Tesseract.js engine runs locally, ensuring complete privacy.' },
        { question: 'What image formats and types are supported?', answer: 'This tool supports all common image formats including PNG, JPEG, WebP, BMP, and GIF. It works well with photos of documents, screenshots, scanned pages, receipts, business cards, and any image containing text.' },
        { question: 'How can I improve OCR accuracy?', answer: 'For best results, use high-resolution images with clear, well-lit text. Ensure the text is not rotated or skewed. Selecting the correct language helps the engine recognize characters more accurately. Cropping the image to focus on the text area also improves results.' },
      ]}
    >
      <div className="space-y-4">
        {/* Controls row: language selector + clear */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-card text-sm"
              disabled={status === 'loading' || status === 'processing'}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
          {image && <ClearButton onClear={clear} />}
        </div>

        {/* Main content area */}
        {!image ? (
          /* Upload zone */
          <div>
            <label
              className={`flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground hover:bg-muted/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className={`h-10 w-10 mb-3 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm font-medium text-foreground">Drag & drop your image here, or click to browse</span>
              <span className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WebP, BMP, GIF</span>
              <span className="text-xs text-muted-foreground">Max file size: 20MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-3">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                Your image never leaves your device
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-blue-500" />
                Works offline after first use
              </span>
            </div>
          </div>
        ) : (
          /* Two-column layout: image preview + extracted text */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Image preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">{imageName}</span>
              </div>
              <div className="border border-border rounded-lg p-2 bg-muted/20 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Uploaded preview"
                  loading="lazy"
                  className="max-w-full max-h-80 mx-auto rounded object-contain"
                />
              </div>

              {/* Extract button */}
              <button
                onClick={handleExtract}
                disabled={status === 'loading' || status === 'processing'}
                className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' || status === 'processing' ? progressLabel : 'Extract Text'}
              </button>

              {/* Progress bar */}
              {(status === 'loading' || status === 'processing') && (
                <div className="space-y-1.5">
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: status === 'loading' ? '10%' : `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{progressLabel}</p>
                </div>
              )}
            </div>

            {/* Right: Extracted text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Extracted Text</span>
                <div className="flex gap-2">
                  {text && <CopyButton text={text} />}
                  {text && <DownloadButton content={text} filename="extracted-text.txt" mimeType="text/plain" />}
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={status === 'done' && !text ? 'No text was detected in the image.' : 'Extracted text will appear here...'}
                rows={16}
                className="tool-textarea w-full rounded-lg border border-input bg-tool-bg p-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground disabled:opacity-50"
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
