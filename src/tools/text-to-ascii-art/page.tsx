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
    <ToolPage title="Text to ASCII Art" description="Convert text to ASCII art using a simple block font. Supports A-Z, 0-9, and common punctuation." category="text" categoryLabel="Text Tools" faqs={[
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
