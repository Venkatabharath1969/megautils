'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ToolPage } from '@/components/tool-page'

type TimerMode = 'work' | 'shortBreak' | 'longBreak'

const MODE_CONFIG: Record<TimerMode, { label: string; color: string; bgColor: string }> = {
  work: { label: 'Focus', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10 border-red-500/30' },
  shortBreak: { label: 'Short Break', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500/10 border-green-500/30' },
  longBreak: { label: 'Long Break', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30' },
}

const MODE_STROKE_COLORS: Record<TimerMode, string> = {
  work: '#ef4444',
  shortBreak: '#22c55e',
  longBreak: '#3b82f6',
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 800
    gain.gain.value = 0.3
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    setTimeout(() => {
      osc.stop()
      ctx.close()
    }, 200)
    // Play a second beep after a short pause
    setTimeout(() => {
      const ctx2 = new AudioContext()
      const osc2 = ctx2.createOscillator()
      const gain2 = ctx2.createGain()
      osc2.frequency.value = 1000
      gain2.gain.value = 0.3
      osc2.connect(gain2)
      gain2.connect(ctx2.destination)
      osc2.start()
      setTimeout(() => {
        osc2.stop()
        ctx2.close()
      }, 300)
    }, 300)
  } catch {
    // Audio not supported
  }
}

export default function PomodoroTimerTool() {
  const [workDuration, setWorkDuration] = useState(25)
  const [shortBreakDuration, setShortBreakDuration] = useState(5)
  const [longBreakDuration, setLongBreakDuration] = useState(15)
  const [mode, setMode] = useState<TimerMode>('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const [autoStart, setAutoStart] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getDuration = useCallback((m: TimerMode) => {
    switch (m) {
      case 'work': return workDuration * 60
      case 'shortBreak': return shortBreakDuration * 60
      case 'longBreak': return longBreakDuration * 60
    }
  }, [workDuration, shortBreakDuration, longBreakDuration])

  const totalTime = getDuration(mode)
  const progress = 1 - timeLeft / totalTime
  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference * (1 - progress)

  const switchMode = useCallback((nextMode: TimerMode) => {
    setMode(nextMode)
    setTimeLeft(getDuration(nextMode))
    setIsRunning(false)
    if (autoStart) {
      setTimeout(() => setIsRunning(true), 500)
    }
  }, [getDuration, autoStart])

  const handleTimerEnd = useCallback(() => {
    playBeep()
    if (mode === 'work') {
      const newSessions = sessions + 1
      setSessions(newSessions)
      setTotalFocusTime(prev => prev + workDuration)
      // Long break every 4 pomodoros
      if (newSessions % 4 === 0) {
        switchMode('longBreak')
      } else {
        switchMode('shortBreak')
      }
    } else {
      switchMode('work')
    }
  }, [mode, sessions, workDuration, switchMode])

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimerEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, handleTimerEnd])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        setIsRunning(prev => !prev)
      } else if (e.code === 'KeyR') {
        e.preventDefault()
        setIsRunning(false)
        setTimeLeft(getDuration(mode))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [getDuration, mode])

  const reset = () => {
    setIsRunning(false)
    setTimeLeft(getDuration(mode))
  }

  const resetAll = () => {
    setIsRunning(false)
    setMode('work')
    setTimeLeft(workDuration * 60)
    setSessions(0)
    setTotalFocusTime(0)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  const modeConfig = MODE_CONFIG[mode]

  return (
    <ToolPage
      title="Pomodoro Timer"
      description="Free online Pomodoro timer for focused work sessions. 25-minute work intervals with short and long breaks to maximize productivity."
      category="datetime"
      categoryLabel="Date & Time"
      helpContent={
        <>
          <h2>What is the Pomodoro Technique?</h2>
          <p>The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a kitchen timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. Each interval is known as a &quot;pomodoro&quot; (Italian for tomato). After four pomodoros, you take a longer break. This technique helps maintain focus, reduce mental fatigue, and improve productivity.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Click Start to begin a 25-minute focus session (default). The circular progress indicator shows your remaining time.</li>
            <li>Work with full concentration until the timer rings with an audio notification.</li>
            <li>Take the automatically suggested break — 5 minutes for a short break, or 15 minutes after every 4 pomodoros (long break).</li>
            <li>Use the Settings panel to customize work duration (15-60 min), short break (3-15 min), and long break (10-30 min).</li>
            <li>Track your completed sessions and total focus time in the Stats section.</li>
            <li>Use keyboard shortcuts: Space to start/pause, R to reset the current timer.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>During a focus session, close all distracting tabs, silence notifications, and commit to a single task.</li>
            <li>If a distraction pops into your head, write it down quickly and return to your task. Address it during a break.</li>
            <li>Start with the default 25/5 timing. Once you are comfortable, experiment with longer focus sessions (45-50 minutes) for deep work.</li>
            <li>Use the break time to stand up, stretch, hydrate, or briefly walk around — avoid screens during breaks.</li>
            <li>Aim for 8-12 pomodoros per day for a productive workday without burnout.</li>
            <li>Enable &quot;Auto-start next session&quot; if you want the timer to flow seamlessly between work and break periods.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is the ideal Pomodoro length?', answer: 'The traditional length is 25 minutes of focused work. However, many people find 45-50 minute sessions better for deep work. Experiment with what works best for your concentration span.' },
        { question: 'Why does the timer beep?', answer: 'The timer plays an audio notification using the Web Audio API when a session ends. This alerts you to take a break or start your next work session without constantly watching the screen.' },
        { question: 'Can I customize the timer durations?', answer: 'Yes! You can customize the work duration (15-60 minutes), short break (3-15 minutes), and long break (10-30 minutes) in the Settings section below the timer.' },
        { question: 'What are the keyboard shortcuts?', answer: 'Press Space to start or pause the timer, and R to reset the current session. These shortcuts only work when the focus is not on an input field.' },
        { question: 'Does the timer work in the background?', answer: 'Yes, the timer continues to run even if you switch to another browser tab. The audio notification will play when the session ends.' },
      ]}
    >
      <div className="max-w-xl mx-auto space-y-6">
        {/* Mode selector */}
        <div className="flex justify-center gap-2">
          {(Object.keys(MODE_CONFIG) as TimerMode[]).map(m => (
            <button
              key={m}
              onClick={() => { if (!isRunning) switchMode(m) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground border border-border'
              } ${isRunning && mode !== m ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>

        {/* Circular progress timer */}
        <div className="flex justify-center">
          <div className="relative w-[280px] h-[280px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
              {/* Background circle */}
              <circle
                cx="130"
                cy="130"
                r="120"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx="130"
                cy="130"
                r="120"
                fill="none"
                stroke={MODE_STROKE_COLORS[mode]}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            {/* Time display in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-sm font-medium mb-1 ${modeConfig.color}`}>{modeConfig.label}</div>
              <div className="text-5xl font-bold font-mono tracking-wider">{timeDisplay}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 py-3 rounded-xl font-semibold text-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl font-medium transition-colors bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80"
          >
            Reset
          </button>
          <button
            onClick={resetAll}
            className="px-6 py-3 rounded-xl font-medium transition-colors bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80"
            title="Reset all sessions and stats"
          >
            Clear All
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-center text-xs text-muted-foreground">
          Space = Start/Pause &middot; R = Reset
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${modeConfig.bgColor} text-center`}>
            <div className="text-2xl font-bold">{sessions}</div>
            <div className="text-xs text-muted-foreground mt-1">Sessions Done</div>
          </div>
          <div className="p-4 rounded-xl border border-border text-center">
            <div className="text-2xl font-bold">{totalFocusTime}</div>
            <div className="text-xs text-muted-foreground mt-1">Focus Minutes</div>
          </div>
          <div className="p-4 rounded-xl border border-border text-center">
            <div className="text-2xl font-bold">{4 - (sessions % 4)}</div>
            <div className="text-xs text-muted-foreground mt-1">Until Long Break</div>
          </div>
        </div>

        {/* Settings */}
        <div className="p-5 rounded-xl border border-border space-y-4">
          <div className="text-sm font-medium">Settings</div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Work (min)</label>
              <input
                type="number"
                value={workDuration}
                onChange={e => {
                  const v = Math.max(15, Math.min(60, parseInt(e.target.value) || 25))
                  setWorkDuration(v)
                  if (mode === 'work' && !isRunning) setTimeLeft(v * 60)
                }}
                min={15}
                max={60}
                disabled={isRunning}
                className="w-full h-9 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Short Break (min)</label>
              <input
                type="number"
                value={shortBreakDuration}
                onChange={e => {
                  const v = Math.max(3, Math.min(15, parseInt(e.target.value) || 5))
                  setShortBreakDuration(v)
                  if (mode === 'shortBreak' && !isRunning) setTimeLeft(v * 60)
                }}
                min={3}
                max={15}
                disabled={isRunning}
                className="w-full h-9 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Long Break (min)</label>
              <input
                type="number"
                value={longBreakDuration}
                onChange={e => {
                  const v = Math.max(10, Math.min(30, parseInt(e.target.value) || 15))
                  setLongBreakDuration(v)
                  if (mode === 'longBreak' && !isRunning) setTimeLeft(v * 60)
                }}
                min={10}
                max={30}
                disabled={isRunning}
                className="w-full h-9 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={e => setAutoStart(e.target.checked)}
              className="rounded border-border"
            />
            Auto-start next session
          </label>
        </div>
      </div>
    </ToolPage>
  )
}
