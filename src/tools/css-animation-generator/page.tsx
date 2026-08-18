'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

interface AnimationPreset {
  name: string
  label: string
  keyframes: string
}

const presets: AnimationPreset[] = [
  {
    name: 'fadeIn',
    label: 'Fade In',
    keyframes: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`,
  },
  {
    name: 'slideUp',
    label: 'Slide Up',
    keyframes: `@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}`,
  },
  {
    name: 'bounce',
    label: 'Bounce',
    keyframes: `@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}`,
  },
  {
    name: 'shake',
    label: 'Shake',
    keyframes: `@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}`,
  },
  {
    name: 'spin',
    label: 'Spin',
    keyframes: `@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
  },
  {
    name: 'pulse',
    label: 'Pulse',
    keyframes: `@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}`,
  },
  {
    name: 'slideLeft',
    label: 'Slide Left',
    keyframes: `@keyframes slideLeft {
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}`,
  },
  {
    name: 'zoomIn',
    label: 'Zoom In',
    keyframes: `@keyframes zoomIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`,
  },
]

const timingFunctions = ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out']

export default function CSSAnimationGeneratorTool() {
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [duration, setDuration] = useState(1)
  const [timingFunction, setTimingFunction] = useState('ease')
  const [iterationCount, setIterationCount] = useState('1')
  const [delay, setDelay] = useState(0)
  const [direction, setDirection] = useState('normal')
  const [fillMode, setFillMode] = useState('forwards')
  const [playing, setPlaying] = useState(true)
  const [animKey, setAnimKey] = useState(0)

  const preset = presets[selectedPreset]

  const animationCSS = useMemo(() => {
    const iterations = iterationCount === 'infinite' ? 'infinite' : iterationCount
    return `animation: ${preset.name} ${duration}s ${timingFunction} ${delay}s ${iterations} ${direction} ${fillMode};`
  }, [preset.name, duration, timingFunction, delay, iterationCount, direction, fillMode])

  const fullCSS = useMemo(() => {
    return `${preset.keyframes}\n\n.animated-element {\n  ${animationCSS}\n}`
  }, [preset.keyframes, animationCSS])

  const replay = () => {
    setPlaying(false)
    setTimeout(() => { setPlaying(true); setAnimKey(k => k + 1) }, 50)
  }

  return (
    <ToolPage
      title="CSS Animation Generator"
      description="Build CSS keyframe animations with presets and live preview. Customize duration, timing, iterations, and more."
      category="css"
      categoryLabel="CSS Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSS Animation Generator is a free browser-based tool that lets you create CSS keyframe animations visually with a timeline editor and export production-ready CSS code. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when adding animations to websites without writing complex keyframe code manually. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this web development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need css animation creation.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is a CSS keyframe animation?', answer: 'A CSS keyframe animation uses @keyframes rules to define intermediate steps in an animation sequence, allowing you to control how an element transitions between styles over time.' },
        { question: 'What does animation-fill-mode do?', answer: 'animation-fill-mode determines which styles are applied before and after the animation. "forwards" retains the final keyframe styles, while "backwards" applies the first keyframe styles during the delay period.' },
        { question: 'How do I make a CSS animation loop infinitely?', answer: 'Set animation-iteration-count to "infinite" to make the animation repeat continuously without stopping.' },
        { question: 'What is the difference between ease and linear timing functions?', answer: '"ease" starts slow, speeds up, then slows down for a natural feel, while "linear" maintains a constant speed throughout the entire animation.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Animation Preset</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => { setSelectedPreset(i); replay() }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${i === selectedPreset ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Duration: {duration}s</label>
            <input type="range" min={0.1} max={5} step={0.1} value={duration} onChange={e => setDuration(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Timing Function</label>
            <select value={timingFunction} onChange={e => setTimingFunction(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {timingFunctions.map(tf => <option key={tf} value={tf}>{tf}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Iteration Count</label>
            <div className="flex gap-2">
              {['1', '2', '3', '5', 'infinite'].map(v => (
                <button
                  key={v}
                  onClick={() => setIterationCount(v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${iterationCount === v ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Delay: {delay}s</label>
            <input type="range" min={0} max={5} step={0.1} value={delay} onChange={e => setDelay(+e.target.value)} className="w-full" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Direction</label>
            <select value={direction} onChange={e => setDirection(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="normal">normal</option>
              <option value="reverse">reverse</option>
              <option value="alternate">alternate</option>
              <option value="alternate-reverse">alternate-reverse</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Fill Mode</label>
            <select value={fillMode} onChange={e => setFillMode(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-tool-bg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="none">none</option>
              <option value="forwards">forwards</option>
              <option value="backwards">backwards</option>
              <option value="both">both</option>
            </select>
          </div>
        </div>

        {/* Preview & Code */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Preview</label>
              <button onClick={replay} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                Replay
              </button>
            </div>
            <div className="w-full h-48 rounded-lg border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
              <div
                key={animKey}
                className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-lg"
                style={playing ? {
                  animation: `${preset.name} ${duration}s ${timingFunction} ${delay}s ${iterationCount} ${direction} ${fillMode}`,
                } : { animation: 'none' }}
              >
                Element
              </div>
            </div>
            <style>{preset.keyframes}</style>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">CSS Code</label>
              <CopyButton text={fullCSS} />
            </div>
            <pre className="p-3 rounded-lg bg-muted text-sm font-mono whitespace-pre overflow-x-auto">{fullCSS}</pre>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
