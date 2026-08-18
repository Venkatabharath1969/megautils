'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'
import { Mic, MicOff, Globe, AlertCircle, Shield } from 'lucide-react'

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'ko-KR', label: 'Korean' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'it-IT', label: 'Italian' },
]

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export default function AISpeechToText() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [error, setError] = useState('')
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    setIsSupported(getSpeechRecognition() !== null)
  }, [])

  const startRecording = useCallback(() => {
    setError('')
    const SpeechRecognitionAPI = getSpeechRecognition()
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = selectedLanguage

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' '
        } else {
          interim = event.results[i][0].transcript
        }
      }
      if (final) {
        setTranscript(prev => prev + final)
      }
      setInterimText(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions in your browser settings.')
      } else if (event.error === 'no-speech') {
        // Ignore no-speech errors, just keep listening
      } else if (event.error !== 'aborted') {
        setError(`Speech recognition error: ${event.error}`)
      }
      setIsRecording(false)
      setInterimText('')
    }

    recognition.onend = () => {
      setIsRecording(false)
      setInterimText('')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [selectedLanguage])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
    setInterimText('')
  }, [])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const clear = useCallback(() => {
    stopRecording()
    setTranscript('')
    setInterimText('')
    setError('')
  }, [stopRecording])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  // Still loading support check
  if (isSupported === null) {
    return (
      <ToolPage
        title="AI Speech to Text"
        description="Convert speech to text in real-time using your microphone. Supports 10+ languages — runs entirely in your browser."
        category="text"
        categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>AI Speech to Text converts spoken audio into written text using a speech recognition model that runs in your browser. It supports multiple languages and can handle various accents, background noise levels, and speaking speeds. Your audio is processed locally — nothing is uploaded to external servers.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Click the <strong>microphone button</strong> to start recording, or upload an audio file.</li>
            <li>Speak clearly into your microphone at a natural pace.</li>
            <li>The tool transcribes your speech into text in real time.</li>
            <li>Copy or download the transcription when finished.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Speech to text is invaluable for transcribing interviews, lectures, and meetings; creating subtitles for videos; drafting emails or documents hands-free; and making notes while multitasking. It is also used for accessibility — allowing people who cannot type to create written content.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Speak clearly and at a moderate pace for the best accuracy.</li>
            <li>A quiet environment significantly improves transcription quality.</li>
            <li>Use an external microphone for better audio quality compared to laptop microphones.</li>
            <li>The model handles common accents well but may struggle with heavy regional dialects.</li>
            <li>Your audio is never uploaded — all speech recognition runs on your device.</li>
          </ul>
        </>
      }
        slug="ai-speech-to-text"
        faqs={[]}
      >
        <div className="flex items-center justify-center h-40">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </ToolPage>
    )
  }

  const fullText = transcript + (interimText ? interimText : '')

  return (
    <ToolPage
      title="AI Speech to Text"
      description="Convert speech to text in real-time using your microphone. Supports 10+ languages — runs entirely in your browser."
      category="text"
      categoryLabel="Text Tools"
      slug="ai-speech-to-text"
      faqs={[
        {
          question: 'How does speech-to-text work in the browser?',
          answer: 'This tool uses the Web Speech API built into modern browsers. Your voice is processed by your browser\'s speech recognition engine — no external servers, no uploads, no API keys needed. It works instantly with zero setup.',
        },
        {
          question: 'Which browsers support speech recognition?',
          answer: 'Speech recognition is supported in Google Chrome, Microsoft Edge, and Safari. Firefox does not currently support the Web Speech API. For the best experience, use the latest version of Chrome or Edge.',
        },
        {
          question: 'Is my voice data private?',
          answer: 'Your voice data is processed by your browser\'s built-in speech recognition engine. This tool does not upload or store any audio. However, some browsers (like Chrome) may send audio to their servers for processing as part of the Web Speech API — check your browser\'s privacy policy for details.',
        },
        {
          question: 'What languages are supported?',
          answer: 'This tool supports 10 languages: English, Spanish, French, German, Hindi, Japanese, Korean, Chinese (Simplified), Portuguese, and Italian. Select your language from the dropdown before starting to record.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isRecording ? 'Listening...' : 'Speech to Text'}
            </span>
          </div>
          {(transcript || error) && <ClearButton onClear={clear} />}
        </div>

        {/* Browser not supported message */}
        {!isSupported && (
          <div className="p-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Browser Not Supported</p>
              <p className="mt-1">Speech recognition is not available in your browser. Please use Google Chrome, Microsoft Edge, or Safari for this feature.</p>
            </div>
          </div>
        )}

        {/* Language selector */}
        {isSupported && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <label htmlFor="language-select" className="text-sm font-medium">Language</label>
            </div>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isRecording}
              className="rounded-lg border border-input bg-tool-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Microphone button */}
        {isSupported && (
          <div className="flex flex-col items-center gap-4 py-6">
            <button
              onClick={toggleRecording}
              className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500/30 shadow-lg shadow-red-500/25'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-primary/30 shadow-lg'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {/* Pulsing animation ring when recording */}
              {isRecording && (
                <>
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-500/40" />
                  <span className="absolute inset-[-4px] rounded-full animate-pulse border-2 border-red-400/50" />
                </>
              )}
              {isRecording ? (
                <MicOff className="h-10 w-10 relative z-10" />
              ) : (
                <Mic className="h-10 w-10 relative z-10" />
              )}
            </button>
            <span className={`text-sm font-medium ${isRecording ? 'text-red-500' : 'text-muted-foreground'}`}>
              {isRecording ? (
                <span className="inline-flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  Listening... Speak now
                </span>
              ) : (
                'Click to start recording'
              )}
            </span>
          </div>
        )}

        {/* Interim text (live preview) */}
        {isRecording && interimText && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <span className="text-xs font-medium text-muted-foreground block mb-1">Live preview</span>
            <p className="text-sm text-muted-foreground italic">{interimText}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Transcript textarea */}
        {isSupported && (
          <div>
            <ToolTextarea
              value={fullText}
              onChange={(v) => {
                setTranscript(v)
                setInterimText('')
              }}
              placeholder="Your transcript will appear here as you speak..."
              rows={8}
              label="Transcript"
            />
          </div>
        )}

        {/* Action buttons */}
        {transcript.trim() && (
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton text={transcript.trim()} />
            <DownloadButton content={transcript.trim()} filename="transcript.txt" />
          </div>
        )}

        {/* Privacy badge */}
        {isSupported && !transcript && !isRecording && (
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              Processed in your browser — no audio uploaded
            </span>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
