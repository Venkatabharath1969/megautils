'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

// 5-line tall block font for A-Z, 0-9, space
const FONT: Record<string, string[]> = {
  A: ['  #  ', ' # # ', '#####', '#   #', '#   #'],
  B: ['#### ', '#   #', '#### ', '#   #', '#### '],
  C: [' ####', '#    ', '#    ', '#    ', ' ####'],
  D: ['#### ', '#   #', '#   #', '#   #', '#### '],
  E: ['#####', '#    ', '#### ', '#    ', '#####'],
  F: ['#####', '#    ', '#### ', '#    ', '#    '],
  G: [' ####', '#    ', '# ###', '#   #', ' ####'],
  H: ['#   #', '#   #', '#####', '#   #', '#   #'],
  I: ['#####', '  #  ', '  #  ', '  #  ', '#####'],
  J: ['#####', '    #', '    #', '#   #', ' ### '],
  K: ['#   #', '#  # ', '###  ', '#  # ', '#   #'],
  L: ['#    ', '#    ', '#    ', '#    ', '#####'],
  M: ['#   #', '## ##', '# # #', '#   #', '#   #'],
  N: ['#   #', '##  #', '# # #', '#  ##', '#   #'],
  O: [' ### ', '#   #', '#   #', '#   #', ' ### '],
  P: ['#### ', '#   #', '#### ', '#    ', '#    '],
  Q: [' ### ', '#   #', '# # #', '#  # ', ' ## #'],
  R: ['#### ', '#   #', '#### ', '#  # ', '#   #'],
  S: [' ####', '#    ', ' ### ', '    #', '#### '],
  T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
  U: ['#   #', '#   #', '#   #', '#   #', ' ### '],
  V: ['#   #', '#   #', '#   #', ' # # ', '  #  '],
  W: ['#   #', '#   #', '# # #', '## ##', '#   #'],
  X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
  Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  '],
  Z: ['#####', '   # ', '  #  ', ' #   ', '#####'],
  '0': [' ### ', '#  ##', '# # #', '##  #', ' ### '],
  '1': ['  #  ', ' ##  ', '  #  ', '  #  ', '#####'],
  '2': [' ### ', '#   #', '  ## ', ' #   ', '#####'],
  '3': [' ### ', '#   #', '  ## ', '#   #', ' ### '],
  '4': ['#   #', '#   #', '#####', '    #', '    #'],
  '5': ['#####', '#    ', '#### ', '    #', '#### '],
  '6': [' ### ', '#    ', '#### ', '#   #', ' ### '],
  '7': ['#####', '   # ', '  #  ', ' #   ', '#    '],
  '8': [' ### ', '#   #', ' ### ', '#   #', ' ### '],
  '9': [' ### ', '#   #', ' ####', '    #', ' ### '],
  ' ': ['     ', '     ', '     ', '     ', '     '],
  '!': ['  #  ', '  #  ', '  #  ', '     ', '  #  '],
  '?': [' ### ', '#   #', '  ## ', '     ', '  #  '],
  '.': ['     ', '     ', '     ', '     ', '  #  '],
  ',': ['     ', '     ', '     ', '  #  ', ' #   '],
  '-': ['     ', '     ', '#####', '     ', '     '],
  "'": ['  #  ', '  #  ', '     ', '     ', '     '],
  ':': ['     ', '  #  ', '     ', '  #  ', '     '],
}

function textToAsciiArt(text: string): string {
  const upper = text.toUpperCase()
  const lines: string[][] = [[], [], [], [], []]

  for (const ch of upper) {
    const glyph = FONT[ch]
    if (glyph) {
      for (let row = 0; row < 5; row++) {
        lines[row].push(glyph[row])
      }
    } else {
      for (let row = 0; row < 5; row++) {
        lines[row].push('     ')
      }
    }
  }

  return lines.map(row => row.join(' ')).join('\n')
}

export default function TextToAsciiArtTool() {
  const [input, setInput] = useState('')

  const output = useMemo(() => {
    if (!input) return ''
    return textToAsciiArt(input)
  }, [input])

  return (
    <ToolPage title="Text to ASCII Art" description="Convert text to ASCII art using a simple block font. Supports A-Z, 0-9, and common punctuation." category="text" categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text to ASCII Art is a free browser-based tool that lets you convert text into large ASCII art characters using various font styles for decorative display. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating banner text for README files, terminal splash screens, or decorative text for presentations. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this creative tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need ascii art generation.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'What is ASCII art?', answer: 'ASCII art is a graphic design technique that creates images and text art using printable characters from the ASCII standard, like letters, numbers, and symbols like # and *.' },
        { question: 'Where can I use ASCII art text?', answer: 'ASCII art text works great in code comments, terminal banners, README files, email signatures, and any plain text environment where formatting is limited.' },
        { question: 'What characters are supported?', answer: 'This tool supports all uppercase letters A-Z, digits 0-9, and common punctuation including periods, commas, exclamation marks, question marks, hyphens, colons, and apostrophes.' },
      ]}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Input Text</span>
          <ClearButton onClear={() => setInput('')} />
        </div>
        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="HELLO" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">ASCII Art Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="ASCII art will appear here..." rows={8} />
        </div>
      </div>
    </ToolPage>
  )
}
