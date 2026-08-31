'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Shield, Video, Mic, MicOff, Camera, CameraOff, Pause, Play, Square, Circle } from 'lucide-react'

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped'

export default function ScreenRecorderTool() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [includeMic, setIncludeMic] = useState(false)
  const [includeWebcam, setIncludeWebcam] = useState(false)
  const [includeSystemAudio, setIncludeSystemAudio] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamsRef = useRef<MediaStream[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const cleanupStreams = useCallback(() => {
    streamsRef.current.forEach(stream => {
      stream.getTracks().forEach(track => track.stop())
    })
    streamsRef.current = []
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setRecordedUrl(null)
    setRecordedBlob(null)
    chunksRef.current = []

    try {
      // Request screen capture
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' } as MediaTrackConstraints,
        audio: includeSystemAudio,
      })
      streamsRef.current.push(displayStream)

      let combinedStream = displayStream

      // Add microphone if selected
      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          streamsRef.current.push(micStream)

          const audioContext = new AudioContext()
          audioContextRef.current = audioContext
          const destination = audioContext.createMediaStreamDestination()

          // Mix display audio (if available) + mic audio
          if (displayStream.getAudioTracks().length > 0) {
            audioContext.createMediaStreamSource(displayStream).connect(destination)
          }
          audioContext.createMediaStreamSource(micStream).connect(destination)

          combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...destination.stream.getAudioTracks(),
          ])
        } catch {
          // Mic not available, continue without
          console.warn('Microphone not available')
        }
      }

      // Webcam (picture-in-picture info only — actual overlay would need a canvas compositor)
      if (includeWebcam) {
        try {
          const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true })
          streamsRef.current.push(webcamStream)
          // Note: Browser PiP webcam overlay is not natively composited onto screen recording.
          // We keep the webcam stream alive for potential future canvas-based compositing.
        } catch {
          console.warn('Webcam not available')
        }
      }

      // Determine MIME type support
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp8',
        'video/webm',
      ]
      let selectedMime = 'video/webm'
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime
          break
        }
      }

      const recorder = new MediaRecorder(combinedStream, { mimeType: selectedMime })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: selectedMime })
        const url = URL.createObjectURL(blob)
        setRecordedUrl(url)
        setRecordedBlob(blob)
        setRecordingState('stopped')
        stopTimer()
        cleanupStreams()
      }

      // Handle user stopping the screen share via browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        if (recorder.state !== 'inactive') {
          recorder.stop()
        }
      }

      recorder.start(1000) // Collect data every second
      setRecordingState('recording')
      setElapsedTime(0)
      startTimer()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
        setError('Screen sharing was denied. Please allow screen sharing to record.')
      } else {
        setError(`Failed to start recording: ${errorMsg}`)
      }
      cleanupStreams()
    }
  }, [includeMic, includeWebcam, includeSystemAudio, cleanupStreams])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingState('paused')
      stopTimer()
    }
  }, [])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingState('recording')
      startTimer()
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const handleDownload = useCallback(() => {
    if (!recordedUrl) return
    const a = document.createElement('a')
    a.href = recordedUrl
    a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.webm`
    a.click()
  }, [recordedUrl])

  const clear = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    cleanupStreams()
    stopTimer()
    setRecordingState('idle')
    setElapsedTime(0)
    setRecordedUrl(null)
    setRecordedBlob(null)
    setError(null)
    chunksRef.current = []
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStreams()
      stopTimer()
    }
  }, [cleanupStreams])

  const isRecording = recordingState === 'recording'
  const isPaused = recordingState === 'paused'
  const isStopped = recordingState === 'stopped'
  const isIdle = recordingState === 'idle'

  return (
    <ToolPage
      title="Screen Recorder"
      description="Record your screen, window, or browser tab with optional microphone audio. Download as WebM. No upload, no account, no watermark."
      category="image"
      categoryLabel="Image Tools"
      faqs={[
        { question: 'What format is the recording saved in?', answer: 'Recordings are saved as WebM (VP9 codec). WebM is supported by all modern browsers and can be converted to MP4 using free tools like HandBrake or FFmpeg.' },
        { question: 'Is my recording uploaded anywhere?', answer: 'No. The recording happens entirely in your browser using the native MediaRecorder API. No data is uploaded to any server. Your recordings stay on your device.' },
        { question: 'Can I record system audio?', answer: 'Yes, if your browser supports it. When selecting a screen or tab to share, check the "Share audio" checkbox in the browser dialog. This works best with tab sharing in Chrome.' },
        { question: 'Is there a recording time limit?', answer: 'No. You can record as long as you need. The only limit is your device storage since the recording is kept in memory until you download it.' },
        { question: 'How does this compare to Loom or Screencastify?', answer: 'This tool provides the core recording functionality for free with no account, no watermark, and no upload. Competitors like Loom ($13/mo) and Screencastify ($7/mo) add cloud storage, sharing links, and team features.' },
        { question: 'Can I record my webcam?', answer: 'The webcam option requests camera access. Currently, webcam overlay compositing is a browser-level feature. For a webcam overlay on your recording, use your browser\'s Picture-in-Picture mode while recording.' },
      ]}
      helpContent={
        <>
          <h2>What is Screen Recorder?</h2>
          <p>
            Screen Recorder captures your screen, a specific window, or a browser tab as a video file. It uses the
            browser&apos;s native MediaRecorder and Screen Capture APIs — no plugins, no extensions, no server upload.
            Competitors like Loom ($13/mo) and Screencastify ($7/mo) charge monthly fees for similar functionality.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Configure your recording options: microphone, webcam, system audio.</li>
            <li>Click <strong>Start Recording</strong>.</li>
            <li>Your browser will ask you to select a screen, window, or tab to share.</li>
            <li>Use the Pause/Resume and Stop controls during recording.</li>
            <li>After stopping, preview your recording and click Download to save it.</li>
          </ol>

          <h2>Features</h2>
          <ul>
            <li>Record entire screen, application window, or browser tab</li>
            <li>Optional microphone audio recording</li>
            <li>Optional system audio capture (browser-dependent)</li>
            <li>Pause and resume recording</li>
            <li>Real-time recording timer</li>
            <li>Preview before downloading</li>
            <li>Download as WebM video</li>
            <li>No watermark, no account, no upload</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>For the best quality, record a specific tab rather than the whole screen.</li>
            <li>To capture system audio, make sure to check &quot;Share audio&quot; in the browser dialog.</li>
            <li>Use a tool like HandBrake or FFmpeg to convert WebM to MP4 if needed.</li>
            <li>Close unnecessary tabs to free memory for longer recordings.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Screen Recorder</label>
          {!isIdle && <ClearButton onClear={clear} />}
        </div>

        {/* Recording options (only when idle) */}
        {isIdle && (
          <div className="space-y-4 border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold">Recording Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Microphone */}
              <button
                onClick={() => setIncludeMic(!includeMic)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${includeMic ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
              >
                {includeMic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-muted-foreground" />}
                Microphone
              </button>

              {/* Webcam */}
              <button
                onClick={() => setIncludeWebcam(!includeWebcam)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${includeWebcam ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
              >
                {includeWebcam ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4 text-muted-foreground" />}
                Webcam
              </button>

              {/* System audio */}
              <button
                onClick={() => setIncludeSystemAudio(!includeSystemAudio)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${includeSystemAudio ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
              >
                <Video className="h-4 w-4" />
                System Audio
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              System audio capture depends on browser support. In the share dialog, check &quot;Share audio&quot; for tab recording.
            </p>
          </div>
        )}

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-green-500" />
          Recording stays on your device — nothing uploaded
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Recording status */}
        {(isRecording || isPaused) && (
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
            {/* Red dot indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-sm font-medium">
                {isRecording ? 'Recording' : 'Paused'}
              </span>
            </div>
            {/* Timer */}
            <div className="text-2xl font-mono font-bold tabular-nums">
              {formatTime(elapsedTime)}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {isIdle && (
            <button
              onClick={startRecording}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <Circle className="h-4 w-4 fill-current" /> Start Recording
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={pauseRecording}
                className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 transition-colors inline-flex items-center gap-2"
              >
                <Pause className="h-4 w-4" /> Pause
              </button>
              <button
                onClick={stopRecording}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                <Square className="h-4 w-4 fill-current" /> Stop
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={resumeRecording}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <Play className="h-4 w-4 fill-current" /> Resume
              </button>
              <button
                onClick={stopRecording}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                <Square className="h-4 w-4 fill-current" /> Stop
              </button>
            </>
          )}
        </div>

        {/* Preview & Download */}
        {isStopped && recordedUrl && (
          <div className="space-y-4">
            <div className="border border-border rounded-lg overflow-hidden">
              <video
                ref={videoPreviewRef}
                src={recordedUrl}
                controls
                className="w-full max-h-[500px] bg-black"
              />
            </div>

            {/* Stats */}
            {recordedBlob && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <strong>Duration:</strong> {formatTime(elapsedTime)} &middot; <strong>Size:</strong> {formatSize(recordedBlob.size)} &middot; <strong>Format:</strong> WebM
              </div>
            )}

            {/* Download */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Download className="h-4 w-4" /> Download WebM
              </button>
              <button
                onClick={() => { clear(); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              >
                <Circle className="h-4 w-4" /> Record Again
              </button>
            </div>

            <div className="p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
              Recording complete. Click Download to save your video.
            </div>
          </div>
        )}

        {/* Idle state info */}
        {isIdle && !error && (
          <div className="p-4 rounded-lg border border-dashed border-border text-center space-y-2">
            <Video className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Configure your options above, then click <strong>Start Recording</strong>.
            </p>
            <p className="text-xs text-muted-foreground">
              Your browser will ask you to select a screen, window, or tab to capture.
            </p>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
