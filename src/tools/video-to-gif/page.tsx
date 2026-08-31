'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Upload, Play, Shield, Film, Pause } from 'lucide-react'

const OUTPUT_SIZES = [
  { value: 0, label: 'Original' },
  { value: 480, label: '480px' },
  { value: 320, label: '320px' },
  { value: 240, label: '240px' },
]

const FPS_OPTIONS = [
  { value: 10, label: '10 FPS' },
  { value: 15, label: '15 FPS' },
  { value: 20, label: '20 FPS' },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 10)
  return `${m}:${s.toString().padStart(2, '0')}.${ms}`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

async function extractFrames(
  videoFile: File,
  startTime: number,
  endTime: number,
  fps: number,
  targetWidth: number,
  onProgress: (pct: number) => void
): Promise<{ frames: HTMLCanvasElement[]; width: number; height: number; delay: number }> {
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.src = URL.createObjectURL(videoFile)

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve()
    video.onerror = () => reject(new Error('Failed to load video'))
  })

  const width = targetWidth > 0 ? targetWidth : video.videoWidth
  const scale = width / video.videoWidth
  const height = Math.round(video.videoHeight * scale)
  const delay = 1000 / fps
  const frameInterval = 1 / fps
  const totalFrames = Math.ceil((endTime - startTime) / frameInterval)

  const frames: HTMLCanvasElement[] = []
  let frameIndex = 0

  for (let time = startTime; time < endTime; time += frameInterval) {
    video.currentTime = time
    await new Promise<void>(r => { video.onseeked = () => r() })

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, width, height)
    frames.push(canvas)
    frameIndex++
    onProgress(Math.round((frameIndex / totalFrames) * 100))
  }

  URL.revokeObjectURL(video.src)
  return { frames, width, height, delay }
}

async function framesToWebM(
  frames: HTMLCanvasElement[],
  width: number,
  height: number,
  delay: number
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const stream = canvas.captureStream(0)
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2_000_000,
  })

  const chunks: BlobPart[] = []
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }))
  })

  recorder.start()

  for (const frame of frames) {
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(frame, 0, 0)
    // @ts-expect-error captureStream track
    stream.getVideoTracks()[0].requestFrame?.()
    await new Promise(r => setTimeout(r, delay))
  }

  recorder.stop()
  return done
}

export default function VideoToGifTool() {
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [duration, setDuration] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(5)
  const [fps, setFps] = useState(10)
  const [outputWidth, setOutputWidth] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState<string>('')
  const [resultSize, setResultSize] = useState(0)
  const [frames, setFrames] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleFile = useCallback((f: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
    if (!validTypes.includes(f.type) && !f.name.match(/\.(mp4|webm|mov|mkv)$/i)) {
      setError('Please upload an MP4, WebM, or MOV video file.')
      return
    }
    if (f.size > 500 * 1024 * 1024) {
      setError('File too large. Maximum 500 MB.')
      return
    }
    setError(null)
    setFile(f)
    const url = URL.createObjectURL(f)
    setVideoUrl(url)
    setResultUrl('')
    setFrames([])
  }, [])

  const onVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      const dur = videoRef.current.duration
      setDuration(dur)
      setStartTime(0)
      setEndTime(Math.min(dur, 15))
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])

  const clipDuration = Math.min(endTime - startTime, 15)

  const generateClip = useCallback(async () => {
    if (!file) return
    if (endTime - startTime <= 0) { setError('End time must be after start time.'); return }
    if (endTime - startTime > 15) { setError('Maximum clip length is 15 seconds.'); return }

    setIsProcessing(true)
    setProgress(0)
    setError(null)
    setResultUrl('')
    setFrames([])

    try {
      const { frames: extractedFrames, width, height, delay } = await extractFrames(
        file, startTime, endTime, fps, outputWidth, setProgress
      )

      // Create frame previews (first 12)
      const previewFrames = extractedFrames.slice(0, 12).map(c => c.toDataURL('image/jpeg', 0.6))
      setFrames(previewFrames)

      setProgress(100)

      // Generate WebM
      const blob = await framesToWebM(extractedFrames, width, height, delay)
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
      setResultSize(blob.size)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process video. Try a different file.')
    } finally {
      setIsProcessing(false)
    }
  }, [file, startTime, endTime, fps, outputWidth])

  const downloadResult = useCallback(() => {
    if (!resultUrl || !file) return
    const a = document.createElement('a')
    a.href = resultUrl
    const baseName = file.name.replace(/\.[^.]+$/, '')
    a.download = `${baseName}-clip.webm`
    a.click()
  }, [resultUrl, file])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false) }
    else { videoRef.current.currentTime = startTime; videoRef.current.play(); setIsPlaying(true) }
  }, [isPlaying, startTime])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTimeUpdate = () => {
      if (v.currentTime >= endTime) { v.pause(); setIsPlaying(false) }
    }
    v.addEventListener('timeupdate', onTimeUpdate)
    return () => v.removeEventListener('timeupdate', onTimeUpdate)
  }, [endTime])

  const clear = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null)
    setVideoUrl('')
    setDuration(0)
    setStartTime(0)
    setEndTime(5)
    setFps(10)
    setOutputWidth(0)
    setResultUrl('')
    setResultSize(0)
    setFrames([])
    setProgress(0)
    setError(null)
    setIsPlaying(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <ToolPage
      title="Video to GIF/WebM Converter"
      description="Convert video clips to animated WebM or extract frames — no upload, 100% in-browser"
      category="image"
      categoryLabel="Image Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Video to GIF/WebM Converter is a free browser-based tool that turns video clips into lightweight animated WebM files or frame sequences. Upload any MP4, WebM, or MOV file, select a start/end time (up to 15 seconds), pick the output size and frame rate, and generate an animated clip — all without uploading to any server.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Upload an MP4, WebM, or MOV video file (up to 500 MB).</li>
            <li>Use the <strong>start time</strong> and <strong>end time</strong> sliders to select up to 15 seconds of the video.</li>
            <li>Choose an <strong>output width</strong> (Original, 480px, 320px, or 240px) — smaller widths produce smaller files.</li>
            <li>Select a <strong>frame rate</strong> (10, 15, or 20 FPS) — lower FPS means smaller files.</li>
            <li>Click <strong>Generate Clip</strong> to extract frames and build the animated clip.</li>
            <li>Preview the frame strip and the final clip, then download it.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Use this tool to create short animated clips for social media, messaging apps, presentations, or documentation. It is a great free alternative to CloudConvert, Convertio, or GIPHY — no sign-up or subscription required. Everything runs locally in your browser using Canvas and MediaRecorder APIs.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Keep clips under 5 seconds for the smallest file sizes. The maximum is 15 seconds.</li>
            <li>Lower frame rates (10 FPS) produce much smaller files while still looking smooth for most content.</li>
            <li>Smaller output widths (320px, 240px) dramatically reduce file size for sharing on chat or social media.</li>
            <li>WebM files are supported by all modern browsers and are typically 50-80% smaller than GIFs.</li>
            <li>Your video never leaves your device — all processing happens locally in your browser.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What video formats are supported?', answer: 'MP4, WebM, and MOV files are supported. The tool processes videos directly in your browser using the HTML5 Video and Canvas APIs.' },
        { question: 'Why WebM instead of GIF?', answer: 'WebM produces much smaller files (50-80% smaller) than GIF while maintaining better quality and supporting more colors. All modern browsers, messaging apps, and social platforms support WebM.' },
        { question: 'What is the maximum clip length?', answer: 'You can create clips up to 15 seconds long. Shorter clips produce smaller files and are easier to share.' },
        { question: 'Does this tool upload my video to a server?', answer: 'No. All processing happens locally in your browser. Your video never leaves your device.' },
        { question: 'Is this a free alternative to CloudConvert or Convertio?', answer: 'Yes! This tool converts video clips for free with no file limits, no sign-ups, and no subscriptions. Unlike paid tools, everything runs in your browser.' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Upload Video</span>
          {file && <ClearButton onClear={clear} />}
        </div>

        {!file ? (
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Drag & drop a video file, or click to upload</span>
            <span className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV &bull; Max 500 MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-6">
            {/* Video preview */}
            <div className="relative rounded-lg overflow-hidden bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={onVideoLoaded}
                className="w-full max-h-64 object-contain"
                playsInline
                muted
              />
              <button
                onClick={togglePlay}
                className="absolute bottom-3 left-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {file.name} &bull; {formatFileSize(file.size)}
              </div>
            </div>

            {/* Time controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Start: {formatTime(startTime)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, duration - 0.1)}
                  step={0.1}
                  value={startTime}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setStartTime(v)
                    if (v >= endTime) setEndTime(Math.min(v + 1, duration))
                    setResultUrl('')
                  }}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  End: {formatTime(endTime)} <span className="text-muted-foreground text-xs">({clipDuration.toFixed(1)}s clip)</span>
                </label>
                <input
                  type="range"
                  min={Math.max(0.1, startTime + 0.1)}
                  max={Math.min(duration, startTime + 15)}
                  step={0.1}
                  value={endTime}
                  onChange={(e) => { setEndTime(Number(e.target.value)); setResultUrl('') }}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {/* Output controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Output Size</label>
                <div className="flex flex-wrap gap-2">
                  {OUTPUT_SIZES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { setOutputWidth(s.value); setResultUrl('') }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${outputWidth === s.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Frame Rate</label>
                <div className="flex flex-wrap gap-2">
                  {FPS_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => { setFps(f.value); setResultUrl('') }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${fps === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={generateClip}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Film className="h-4 w-4" />
              {isProcessing ? `Extracting frames... ${progress}%` : 'Generate Clip'}
            </button>

            {/* Progress bar */}
            {isProcessing && (
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}

            {/* Frame preview strip */}
            {frames.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Frame Preview ({frames.length} of total)</span>
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {frames.map((src, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={i} src={src} alt={`Frame ${i + 1}`} className="h-16 rounded border border-border shrink-0" />
                  ))}
                </div>
              </div>
            )}

            {/* Result */}
            {resultUrl && (
              <div className="space-y-4 p-4 rounded-lg bg-green-500/10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-green-600 dark:text-green-400">Clip Ready</div>
                    <div className="text-sm text-muted-foreground">
                      File size: <strong>{formatFileSize(resultSize)}</strong> &bull; {clipDuration.toFixed(1)}s &bull; {fps} FPS
                    </div>
                  </div>
                  <button
                    onClick={downloadResult}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Download className="h-4 w-4" /> Download WebM
                  </button>
                </div>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video src={resultUrl} controls loop autoPlay muted playsInline className="w-full max-h-64 rounded-lg object-contain bg-black" />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Shield className="h-3.5 w-3.5" />
          <span>Your video never leaves your device. All processing happens locally in your browser.</span>
        </div>
      </div>
    </ToolPage>
  )
}
