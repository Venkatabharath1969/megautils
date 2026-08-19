'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download } from 'lucide-react'

const THEMES = {
  dark: {
    name: 'Dark',
    bg: '#1e1e2e',
    text: '#cdd6f4',
    keyword: '#cba6f7',
    string: '#a6e3a1',
    comment: '#6c7086',
    number: '#fab387',
    function: '#89b4fa',
    operator: '#89dceb',
    windowBg: '#313244',
    dotColors: ['#f38ba8', '#fab387', '#a6e3a1'],
  },
  light: {
    name: 'Light',
    bg: '#ffffff',
    text: '#383a42',
    keyword: '#a626a4',
    string: '#50a14f',
    comment: '#a0a1a7',
    number: '#986801',
    function: '#4078f2',
    operator: '#0184bc',
    windowBg: '#e5e5e5',
    dotColors: ['#ff5f57', '#febc2e', '#28c840'],
  },
  monokai: {
    name: 'Monokai',
    bg: '#272822',
    text: '#f8f8f2',
    keyword: '#f92672',
    string: '#e6db74',
    comment: '#75715e',
    number: '#ae81ff',
    function: '#a6e22e',
    operator: '#f8f8f2',
    windowBg: '#3e3d32',
    dotColors: ['#ff5f57', '#febc2e', '#28c840'],
  },
  nord: {
    name: 'Nord',
    bg: '#2e3440',
    text: '#d8dee9',
    keyword: '#81a1c1',
    string: '#a3be8c',
    comment: '#616e88',
    number: '#b48ead',
    function: '#88c0d0',
    operator: '#eceff4',
    windowBg: '#3b4252',
    dotColors: ['#bf616a', '#ebcb8b', '#a3be8c'],
  },
}

type ThemeName = keyof typeof THEMES

const PADDING_OPTIONS = [16, 32, 48, 64]
const FONT_SIZES = [12, 14, 16, 18, 20]

// Simple syntax highlighting with regex tokenization
function tokenize(code: string): { text: string; type: string }[] {
  const tokens: { text: string; type: string }[] = []
  const regex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|default|from|async|await|try|catch|finally|throw|new|typeof|instanceof|void|delete|in|of|this|super|yield|static|get|set|true|false|null|undefined|interface|type|enum|implements|public|private|protected|readonly|abstract|as|is|keyof|never|unknown|any|string|number|boolean|object|symbol|bigint|def|self|print|elif|None|True|False|lambda|with|pass|raise|except|finally)\b)|(\b\d+\.?\d*\b)|(\b[A-Za-z_]\w*(?=\s*\())|([+\-*/%=<>!&|^~?:;,{}[\]()])|(\n)|([^\S\n]+)|([^\s]+)/g

  let match
  while ((match = regex.exec(code)) !== null) {
    if (match[1]) tokens.push({ text: match[1], type: 'comment' })
    else if (match[2]) tokens.push({ text: match[2], type: 'string' })
    else if (match[3]) tokens.push({ text: match[3], type: 'keyword' })
    else if (match[4]) tokens.push({ text: match[4], type: 'number' })
    else if (match[5]) tokens.push({ text: match[5], type: 'function' })
    else if (match[6]) tokens.push({ text: match[6], type: 'operator' })
    else if (match[7]) tokens.push({ text: match[7], type: 'newline' })
    else if (match[8]) tokens.push({ text: match[8], type: 'whitespace' })
    else tokens.push({ text: match[0], type: 'text' })
  }
  return tokens
}

export default function CodeToImageTool() {
  const [code, setCode] = useState(`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Generate first 10 Fibonacci numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}
console.log(results);`)
  const [theme, setTheme] = useState<ThemeName>('dark')
  const [padding, setPadding] = useState(32)
  const [fontSize, setFontSize] = useState(14)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [showWindowChrome, setShowWindowChrome] = useState(true)
  const [title, setTitle] = useState('code.js')
  const codeRef = useRef<HTMLDivElement>(null)

  const t = THEMES[theme]

  const handleDownload = useCallback(() => {
    if (!codeRef.current) return

    const el = codeRef.current
    const canvas = document.createElement('canvas')
    const scale = 2 // Retina
    canvas.width = el.offsetWidth * scale
    canvas.height = el.offsetHeight * scale
    const ctx = canvas.getContext('2d')!
    ctx.scale(scale, scale)

    // Background
    ctx.fillStyle = t.bg
    ctx.fillRect(0, 0, el.offsetWidth, el.offsetHeight)

    // Window chrome
    let yOffset = padding
    if (showWindowChrome) {
      const chromeHeight = 36
      ctx.fillStyle = t.windowBg
      ctx.beginPath()
      ctx.roundRect(0, 0, el.offsetWidth, chromeHeight + padding, [8, 8, 0, 0])
      ctx.fill()

      // Dots
      const dotY = padding / 2 + chromeHeight / 2
      t.dotColors.forEach((color, i) => {
        ctx.beginPath()
        ctx.arc(padding + i * 20, dotY, 6, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })

      // Title
      if (title) {
        ctx.fillStyle = t.comment
        ctx.font = `${fontSize - 2}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(title, el.offsetWidth / 2, dotY + 4)
        ctx.textAlign = 'left'
      }

      yOffset = chromeHeight + padding + 8
    }

    // Code
    const lineHeight = fontSize * 1.6
    const lines = code.split('\n')
    const lineNumWidth = showLineNumbers ? String(lines.length).length * (fontSize * 0.6) + 24 : 0

    ctx.font = `${fontSize}px "Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace`

    lines.forEach((line, lineIdx) => {
      const y = yOffset + lineIdx * lineHeight

      // Line number
      if (showLineNumbers) {
        ctx.fillStyle = t.comment
        ctx.textAlign = 'right'
        ctx.fillText(String(lineIdx + 1), padding + lineNumWidth - 12, y + fontSize)
        ctx.textAlign = 'left'
      }

      // Tokenize line and render
      const tokens = tokenize(line)
      let x = padding + lineNumWidth
      for (const token of tokens) {
        if (token.type === 'newline') continue
        ctx.fillStyle = t[token.type as keyof typeof t] as string || t.text
        ctx.fillText(token.text, x, y + fontSize)
        x += ctx.measureText(token.text).width
      }
    })

    const link = document.createElement('a')
    link.download = `code-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [code, t, padding, fontSize, showLineNumbers, showWindowChrome, title])

  const clear = () => setCode('')

  const lines = code.split('\n')

  return (
    <ToolPage
      title="Code to Image"
      description="Create beautiful code screenshots with syntax highlighting"
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Code to Image is a free browser-based tool that lets you convert source code snippets into beautiful, shareable images with syntax highlighting and customizable themes. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when sharing code on social media, creating presentation slides, writing technical blog posts, or documentation. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For large inputs, the tool processes data efficiently in your browser but very large files may take a moment.</li>
            <li>Use keyboard shortcuts like Ctrl+A to select all output text before copying.</li>
            <li>The tool preserves your data types and structure during conversion or formatting.</li>
            <li>Compare the formatted output with the original to verify no data was altered.</li>
            <li>All processing is client-side — safe for use with proprietary or sensitive code.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I create a code screenshot?', answer: 'Paste your code into the editor, choose a theme and settings, then click Download PNG to generate a high-resolution image of your code with syntax highlighting.' },
        { question: 'What themes are available for code images?', answer: 'The tool includes Dark (Catppuccin), Light (One Light), Monokai, and Nord themes, each with matching window chrome and syntax highlighting colors.' },
        { question: 'Can I customize the code image output?', answer: 'Yes, you can adjust the theme, font size, padding, line numbers, window chrome, and file title to create the exact look you want.' },
        { question: 'What resolution are the exported code images?', answer: 'Images are exported at 2x (Retina) resolution for crisp rendering on high-DPI displays, social media, and presentations.' },
      ]}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Code Input</span>
            <ClearButton onClear={clear} />
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={12}
            className="tool-textarea w-full rounded-lg border border-input bg-tool-bg p-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground font-mono text-sm"
            spellCheck={false}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeName)}
                className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
              >
                {Object.entries(THEMES).map(([key, val]) => (
                  <option key={key} value={key}>{val.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Padding</label>
              <select
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
              >
                {PADDING_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}px</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Window Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="code.js"
                className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showLineNumbers} onChange={(e) => setShowLineNumbers(e.target.checked)} className="rounded accent-primary" />
              Line numbers
            </label>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showWindowChrome} onChange={(e) => setShowWindowChrome(e.target.checked)} className="rounded accent-primary" />
              Window chrome
            </label>
          </div>

          <button
            onClick={handleDownload}
            disabled={!code.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
        </div>

        {/* Preview */}
        <div>
          <span className="text-sm font-medium mb-2 block">Preview</span>
          <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
            <div
              ref={codeRef}
              style={{
                backgroundColor: t.bg,
                padding: `${padding}px`,
                fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
                fontSize: `${fontSize}px`,
                lineHeight: 1.6,
                minWidth: 'fit-content',
              }}
            >
              {/* Window chrome */}
              {showWindowChrome && (
                <div
                  style={{ backgroundColor: t.windowBg }}
                  className="flex items-center gap-2 px-4 py-2 rounded-t-lg -mx-[var(--pad)] -mt-[var(--pad)] mb-3"
                  // Use inline margin override since CSS var won't work
                >
                  <div style={{ marginLeft: `-${padding - 16}px`, marginTop: `-${padding - 8}px`, marginRight: 0, paddingTop: `${padding - 8}px`, paddingBottom: '8px', paddingLeft: `${padding - 16}px`, paddingRight: `${padding}px`, backgroundColor: t.windowBg, borderTopLeftRadius: '8px', borderTopRightRadius: '8px', width: `calc(100% + ${(padding - 16) * 2}px)`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="flex gap-2">
                      {t.dotColors.map((color, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    {title && (
                      <span
                        className="flex-1 text-center"
                        style={{ color: t.comment, fontSize: `${fontSize - 2}px` }}
                      >
                        {title}
                      </span>
                    )}
                    <div className="w-12" /> {/* Balance spacer */}
                  </div>
                </div>
              )}

              {/* Code lines */}
              <div>
                {lines.map((line, lineIdx) => (
                  <div key={lineIdx} className="flex">
                    {showLineNumbers && (
                      <span
                        className="select-none text-right pr-4 shrink-0"
                        style={{
                          color: t.comment,
                          minWidth: `${String(lines.length).length * 0.6 + 1.5}em`,
                          userSelect: 'none',
                        }}
                      >
                        {lineIdx + 1}
                      </span>
                    )}
                    <span className="whitespace-pre">
                      {tokenize(line).map((token, ti) => (
                        <span
                          key={ti}
                          style={{
                            color: token.type === 'comment' ? t.comment
                              : token.type === 'keyword' ? t.keyword
                              : token.type === 'string' ? t.string
                              : token.type === 'number' ? t.number
                              : token.type === 'function' ? t.function
                              : token.type === 'operator' ? t.operator
                              : t.text,
                          }}
                        >
                          {token.text}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
