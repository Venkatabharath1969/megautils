'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { ToolPage } from '@/components/tool-page'
import { RotateCcw, RefreshCw } from 'lucide-react'

type Difficulty = 'easy' | 'medium' | 'hard'

const TEXTS: Record<Difficulty, string[]> = {
  easy: [
    'The quick brown fox jumps over the lazy dog near the river bank on a warm summer morning.',
    'She sells sea shells by the sea shore while the sun shines bright above the water.',
    'A good friend is like a four leaf clover hard to find and lucky to have in your life.',
    'The cat sat on the mat and watched the birds fly by the open window all day long.',
    'Every morning I wake up and drink a cup of coffee before going for a walk in the park.',
    'The dog ran across the yard and jumped over the fence to chase the ball down the street.',
    'Reading books is one of the best ways to learn new things and expand your mind every day.',
    'The rain fell softly on the roof as we sat by the fire and told stories late into the night.',
    'Music fills the room with joy and brings people together no matter where they come from.',
    'The garden was full of colorful flowers that bloomed in the spring and lasted through summer.',
    'Cooking dinner for friends is a great way to spend time together and share a good meal.',
    'The stars shine bright in the clear night sky when you are far away from the city lights.',
  ],
  medium: [
    'Programming is the art of telling another human being what one wants the computer to do in a precise and logical manner.',
    'The ability to communicate clearly and effectively is one of the most valuable skills you can develop throughout your career.',
    'Scientists have discovered that regular exercise not only strengthens the body but also improves memory and cognitive function.',
    'Technology has transformed the way we work, learn, and connect with people around the world in the last two decades.',
    'Climate change presents one of the greatest challenges facing humanity, requiring collective action and innovative solutions.',
    'The history of mathematics spans thousands of years and has contributed to nearly every field of modern science and engineering.',
    'Artificial intelligence is rapidly changing industries from healthcare to transportation, creating both opportunities and challenges.',
    'A well-designed user interface can make the difference between a product that people love and one that they abandon quickly.',
    'The process of learning a new language requires patience, consistent practice, and exposure to native speakers whenever possible.',
    'Remote work has become increasingly common, offering flexibility while also presenting new challenges for team collaboration.',
    'Understanding data structures and algorithms is essential for writing efficient software that scales to millions of users.',
    'The scientific method involves forming hypotheses, designing experiments, collecting data, and drawing conclusions based on evidence.',
  ],
  hard: [
    'The implementation of concurrent data structures requires careful consideration of memory ordering, lock-free algorithms, and atomic operations to ensure thread safety without sacrificing performance.',
    'Quantum computing leverages superposition and entanglement to perform calculations that would take classical computers billions of years, potentially revolutionizing cryptography, drug discovery, and optimization problems.',
    'Microservices architecture decomposes applications into independently deployable services that communicate through well-defined APIs, enabling teams to develop, test, and scale individual components autonomously.',
    'The Byzantine fault tolerance problem addresses the challenge of reaching consensus in distributed systems where some participants may behave maliciously or fail in arbitrary and unpredictable ways.',
    'Functional programming emphasizes immutability, pure functions, and declarative patterns that enable equational reasoning, referential transparency, and straightforward parallelization of computational workloads.',
    'Natural language processing combines computational linguistics with machine learning to enable computers to understand, interpret, and generate human language in contextually appropriate and meaningful ways.',
    'The CAP theorem states that a distributed data store cannot simultaneously guarantee consistency, availability, and partition tolerance, forcing architects to make deliberate trade-offs based on application requirements.',
    'Compiler optimization techniques such as loop unrolling, dead code elimination, constant folding, and register allocation transform high-level source code into efficient machine instructions for the target architecture.',
    'Cryptographic hash functions must exhibit preimage resistance, second preimage resistance, and collision resistance to be suitable for applications in digital signatures, message authentication, and password storage.',
    'Event-driven architecture processes asynchronous streams of events through decoupled producers and consumers, enabling real-time data processing, complex event correlation, and scalable system integration patterns.',
    'The PageRank algorithm evaluates the importance of web pages by analyzing the link structure of the entire web, treating each hyperlink as a weighted vote that contributes to the destination authority.',
    'Containerization with Docker packages applications and their dependencies into standardized units, ensuring consistent behavior across development, staging, and production environments regardless of the underlying infrastructure.',
  ],
}

type TestState = 'idle' | 'running' | 'finished'

export default function TypingSpeedTestTool() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [textIndex, setTextIndex] = useState(0)
  const [testState, setTestState] = useState<TestState>('idle')
  const [typed, setTyped] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [now, setNow] = useState(Date.now())

  const currentText = TEXTS[difficulty][textIndex % TEXTS[difficulty].length]

  // Real-time timer tick
  useEffect(() => {
    if (testState === 'running') {
      timerRef.current = setInterval(() => setNow(Date.now()), 200)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [testState])

  const elapsed = useMemo(() => {
    if (!startTime) return 0
    const end = testState === 'finished' && endTime ? endTime : now
    return (end - startTime) / 1000
  }, [startTime, endTime, testState, now])

  const stats = useMemo(() => {
    if (!startTime || elapsed === 0) return { wpm: 0, cpm: 0, accuracy: 100, errors: 0 }
    const minutes = elapsed / 60
    let correct = 0
    let errCount = 0
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === currentText[i]) correct++
      else errCount++
    }
    const wpm = minutes > 0 ? Math.round((correct / 5) / minutes) : 0
    const cpm = minutes > 0 ? Math.round(correct / minutes) : 0
    const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100
    return { wpm, cpm, accuracy, errors: errCount }
  }, [typed, currentText, startTime, elapsed])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value

    // Prevent typing beyond the text length
    if (value.length > currentText.length) return

    // Start timer on first keystroke
    if (!startTime && value.length > 0) {
      setStartTime(Date.now())
      setTestState('running')
    }

    setTyped(value)

    // Count errors
    let errCount = 0
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentText[i]) errCount++
    }
    setErrors(errCount)

    // Auto-complete when finished
    if (value.length === currentText.length) {
      setEndTime(Date.now())
      setTestState('finished')
    }
  }, [currentText, startTime])

  const tryAgain = useCallback(() => {
    setTyped('')
    setStartTime(null)
    setEndTime(null)
    setErrors(0)
    setTestState('idle')
    setNow(Date.now())
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const newText = useCallback(() => {
    const texts = TEXTS[difficulty]
    setTextIndex(prev => (prev + 1) % texts.length)
    setTyped('')
    setStartTime(null)
    setEndTime(null)
    setErrors(0)
    setTestState('idle')
    setNow(Date.now())
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [difficulty])

  const changeDifficulty = useCallback((d: Difficulty) => {
    setDifficulty(d)
    setTextIndex(0)
    setTyped('')
    setStartTime(null)
    setEndTime(null)
    setErrors(0)
    setTestState('idle')
    setNow(Date.now())
  }, [])

  // Render highlighted text
  const renderText = () => {
    const chars = currentText.split('')
    return (
      <div className="font-mono text-base sm:text-lg leading-relaxed select-none">
        {chars.map((char, i) => {
          let className = 'text-muted-foreground/50'
          if (i < typed.length) {
            className = typed[i] === char
              ? 'text-green-600 dark:text-green-400 bg-green-500/10'
              : 'text-red-600 dark:text-red-400 bg-red-500/15 underline decoration-red-500'
          } else if (i === typed.length) {
            className = 'text-foreground bg-primary/20 border-l-2 border-primary animate-pulse'
          }
          return (
            <span key={i} className={className}>
              {char}
            </span>
          )
        })}
      </div>
    )
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <ToolPage
      title="Typing Speed Test"
      description="Test your typing speed with real-time WPM, accuracy, and error tracking."
      category="text"
      categoryLabel="Text Tools"
      faqs={[
        { question: 'How is WPM calculated?', answer: 'WPM (Words Per Minute) is calculated by dividing the number of correctly typed characters by 5 (the standard word length) and then dividing by the elapsed time in minutes.' },
        { question: 'What is a good typing speed?', answer: 'The average typing speed is around 40 WPM. Professional typists typically reach 65-75 WPM. Competitive typists can exceed 150 WPM. Above 60 WPM is considered above average.' },
        { question: 'How is accuracy measured?', answer: 'Accuracy is the percentage of characters typed correctly out of all characters typed. A score of 95% or above is considered good accuracy.' },
        { question: 'What do the difficulty levels mean?', answer: 'Easy uses common everyday words and short sentences. Medium includes longer sentences with varied vocabulary. Hard features technical and specialized text with complex terminology.' },
        { question: 'Can I retake the test?', answer: 'Yes. Use "Try Again" to retype the same text, or "New Text" to get a different passage. You can also change the difficulty level at any time.' },
      ]}
      helpContent={
        <>
          <h2>What is Typing Speed Test?</h2>
          <p>
            This typing speed test measures how fast and accurately you type by presenting a passage of text and tracking
            your keystrokes in real time. It calculates Words Per Minute (WPM), Characters Per Minute (CPM), accuracy
            percentage, and error count as you type. The test runs entirely in your browser with no data sent to any server.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Select a difficulty level: Easy, Medium, or Hard.</li>
            <li>Read the displayed text, then click the input area and start typing.</li>
            <li>The timer starts automatically on your first keystroke.</li>
            <li>Watch your stats update in real time as you type.</li>
            <li>The test ends automatically when you finish the text.</li>
            <li>Review your results and click &quot;Try Again&quot; or &quot;New Text&quot; to practice more.</li>
          </ol>

          <h2>Tips for Improving Typing Speed</h2>
          <ul>
            <li>Focus on accuracy first. Speed naturally improves as you make fewer errors.</li>
            <li>Use all ten fingers and maintain proper hand positioning on the home row.</li>
            <li>Practice regularly, even for just 10-15 minutes per day.</li>
            <li>Avoid looking at the keyboard. Build muscle memory through repetition.</li>
            <li>Start with Easy texts and gradually move to Hard as your speed increases.</li>
            <li>Keep your wrists relaxed and maintain good posture while typing.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Difficulty selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => changeDifficulty(d)}
                disabled={testState === 'running'}
                className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors capitalize ${difficulty === d ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'} disabled:opacity-50`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={tryAgain}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try Again
            </button>
            <button
              onClick={newText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> New Text
            </button>
          </div>
        </div>

        {/* Real-time stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">{stats.wpm}</div>
            <div className="text-xs text-muted-foreground">WPM</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">{stats.cpm}</div>
            <div className="text-xs text-muted-foreground">CPM</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className={`text-2xl font-bold ${stats.accuracy >= 95 ? 'text-green-600 dark:text-green-400' : stats.accuracy >= 80 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
              {stats.accuracy}%
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold">{formatTime(elapsed)}</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <div className={`text-2xl font-bold ${errors > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>{errors}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
        </div>

        {/* Text display */}
        <div className="p-4 sm:p-6 rounded-lg border border-border bg-muted/20 min-h-[120px]">
          {renderText()}
        </div>

        {/* Input area */}
        {testState !== 'finished' ? (
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {testState === 'idle' ? 'Start typing below...' : 'Keep typing...'}
            </label>
            <textarea
              ref={inputRef}
              value={typed}
              onChange={handleInput}
              className="w-full h-32 rounded-lg border border-input bg-tool-bg p-3 text-base font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Click here and start typing..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {/* Progress bar */}
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-150 rounded-full"
                style={{ width: `${currentText.length > 0 ? (typed.length / currentText.length) * 100 : 0}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {typed.length} / {currentText.length} characters
            </div>
          </div>
        ) : (
          /* Results screen */
          <div className="p-6 rounded-xl border border-border bg-card space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-1">Test Complete!</h3>
              <p className="text-muted-foreground text-sm">Here are your results</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 text-center">
                <div className="text-3xl font-bold text-primary">{stats.wpm}</div>
                <div className="text-sm text-muted-foreground mt-1">Words/Min</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold">{stats.cpm}</div>
                <div className="text-sm text-muted-foreground mt-1">Chars/Min</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className={`text-3xl font-bold ${stats.accuracy >= 95 ? 'text-green-600 dark:text-green-400' : stats.accuracy >= 80 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.accuracy}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">Accuracy</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold">{formatTime(elapsed)}</div>
                <div className="text-sm text-muted-foreground mt-1">Time</div>
              </div>
            </div>

            {/* Performance message */}
            <div className={`p-4 rounded-lg text-center text-sm font-medium ${
              stats.wpm >= 80 ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
              stats.wpm >= 50 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
              stats.wpm >= 30 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
              'bg-muted/50 text-muted-foreground'
            }`}>
              {stats.wpm >= 80 ? 'Excellent! You type faster than most professionals.' :
               stats.wpm >= 50 ? 'Great job! Your typing speed is above average.' :
               stats.wpm >= 30 ? 'Good effort! Keep practicing to improve your speed.' :
               'Keep practicing! Regular practice will help you improve.'}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={tryAgain}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Try Again
              </button>
              <button
                onClick={newText}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> New Text
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
