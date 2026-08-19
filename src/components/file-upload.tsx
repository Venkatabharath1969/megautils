'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  accept?: string
  onFileContent: (content: string, filename: string) => void
  label?: string
  maxSizeMB?: number
}

export function FileUpload({ accept, onFileContent, label = 'Upload File', maxSizeMB = 10 }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [filename, setFilename] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setError(null)

    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`File exceeds ${maxSizeMB} MB limit`)
      setFilename(null)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFilename(file.name)
      onFileContent(reader.result as string, file.name)
    }
    reader.onerror = () => {
      setError('Failed to read file')
      setFilename(null)
    }
    reader.readAsText(file)
  }, [maxSizeMB, onFileContent])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset input so re-uploading the same file triggers change
    if (inputRef.current) inputRef.current.value = ''
  }, [processFile])

  return (
    <div className="flex flex-col gap-1.5">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
          dragOver
            ? 'border-ring bg-ring/5'
            : 'border-border bg-card hover:bg-muted'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          aria-label={label}
        />

        {filename ? (
          <>
            <FileText className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium truncate max-w-full">{filename}</span>
            <span className="text-xs text-muted-foreground">Click or drag to replace</span>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">Click to browse or drag and drop</span>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
