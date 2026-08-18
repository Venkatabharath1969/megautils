'use client'

import { useState, useEffect, useCallback } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

export default function TextToSpeechTool() {
  const [text, setText] = useState('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      setVoices(available)
      if (available.length > 0 && !selectedVoice) {
        const defaultVoice = available.find(v => v.default) || available[0]
        setSelectedVoice(defaultVoice.name)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [selectedVoice])

  const handlePlay = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      return
    }

    window.speechSynthesis.cancel()

    if (!text.trim()) return

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = voices.find(v => v.name === selectedVoice)
    if (voice) utterance.voice = voice
    utterance.rate = rate
    utterance.pitch = pitch

    utterance.onstart = () => {
      setIsSpeaking(true)
      setIsPaused(false)
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    window.speechSynthesis.speak(utterance)
  }, [text, selectedVoice, voices, rate, pitch, isPaused])

  const handlePause = useCallback(() => {
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [])

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
  }, [])

  const clear = () => {
    handleStop()
    setText('')
  }

  // Group voices by language
  const groupedVoices = voices.reduce<Record<string, SpeechSynthesisVoice[]>>((acc, voice) => {
    const lang = voice.lang.split('-')[0]
    if (!acc[lang]) acc[lang] = []
    acc[lang].push(voice)
    return acc
  }, {})

  return (
    <ToolPage
      title="Text to Speech"
      description="Convert text to speech using your browser's built-in speech synthesis. Choose voice, rate, and pitch."
      category="content"
      categoryLabel="Content Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text to Speech is a free browser-based tool that lets you convert written text to spoken audio using your browser's built-in speech synthesis with adjustable voice, speed, and pitch. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when proofreading by listening, accessibility testing, creating audio from text content, or language pronunciation practice. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this accessibility tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need speech synthesis.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How does the online text to speech tool work?', answer: 'It uses your browser\'s built-in Web Speech API to read text aloud with customizable voice, speed, and pitch settings.' },
        { question: 'Can I change the voice or language?', answer: 'Yes, you can select from all voices installed on your device, including different languages and regional accents.' },
        { question: 'Is my text uploaded to a server?', answer: 'No, all speech synthesis happens locally in your browser. Your text is never sent to any server.' },
        { question: 'Can I adjust the speaking speed?', answer: 'Yes, use the rate slider to slow down to 0.1x or speed up to 2x the normal speaking rate.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Text to Speak</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={text} onChange={setText} placeholder="Enter the text you want to convert to speech..." rows={12} />

          <div className="text-xs text-muted-foreground">
            {text.length} characters | ~{Math.ceil(text.split(/\s+/).filter(Boolean).length / 150)} min at normal speed
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <span className="text-sm font-semibold">Controls</span>

          <div>
            <label className="block text-sm font-medium mb-1">Voice</label>
            <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {Object.entries(groupedVoices).map(([lang, langVoices]) => (
                <optgroup key={lang} label={lang.toUpperCase()}>
                  {langVoices.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Rate</label>
              <span className="text-xs text-muted-foreground">{rate.toFixed(1)}x</span>
            </div>
            <input type="range" min="0.1" max="2" step="0.1" value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.1x</span><span>1x</span><span>2x</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Pitch</label>
              <span className="text-xs text-muted-foreground">{pitch.toFixed(1)}</span>
            </div>
            <input type="range" min="0" max="2" step="0.1" value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Low</span><span>Normal</span><span>High</span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handlePlay}
              disabled={!text.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPaused ? 'Resume' : isSpeaking ? 'Restart' : 'Play'}
            </button>
            {isSpeaking && !isPaused && (
              <button onClick={handlePause} className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                Pause
              </button>
            )}
            {(isSpeaking || isPaused) && (
              <button onClick={handleStop} className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors text-red-500">
                Stop
              </button>
            )}
          </div>

          {isSpeaking && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {isPaused ? 'Paused' : 'Speaking...'}
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
