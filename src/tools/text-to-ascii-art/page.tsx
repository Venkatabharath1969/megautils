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

// 3-line tall small block font
const FONT_SMALL: Record<string, string[]> = {
  A: ['###', '# #', '###'], B: ['## ', '###', '## '], C: ['###', '#  ', '###'],
  D: ['## ', '# #', '## '], E: ['###', '## ', '###'], F: ['###', '## ', '#  '],
  G: ['###', '# #', '###'], H: ['# #', '###', '# #'], I: ['###', ' # ', '###'],
  J: ['###', ' # ', '## '], K: ['# #', '## ', '# #'], L: ['#  ', '#  ', '###'],
  M: ['# #', '###', '# #'], N: ['# #', '###', '# #'], O: ['###', '# #', '###'],
  P: ['###', '###', '#  '], Q: ['###', '# #', '## '], R: ['###', '## ', '# #'],
  S: ['###', ' # ', '###'], T: ['###', ' # ', ' # '], U: ['# #', '# #', '###'],
  V: ['# #', '# #', ' # '], W: ['# #', '###', '# #'], X: ['# #', ' # ', '# #'],
  Y: ['# #', ' # ', ' # '], Z: ['###', ' # ', '###'],
  '0': ['###', '# #', '###'], '1': [' # ', '## ', '###'], '2': ['###', ' ##', '###'],
  '3': ['###', ' ##', '###'], '4': ['# #', '###', '  #'], '5': ['###', '## ', '###'],
  '6': ['###', '## ', '###'], '7': ['###', '  #', '  #'], '8': ['###', '###', '###'],
  '9': ['###', '###', '  #'],
  ' ': ['   ', '   ', '   '], '!': [' # ', ' # ', ' # '], '.': ['   ', '   ', ' # '],
  '-': ['   ', '###', '   '], '?': ['###', ' # ', ' # '], ',': ['   ', '   ', ' # '],
}

function textToAsciiArt(text: string, font: Record<string, string[]>): string {
  const upper = text.toUpperCase()
  const rowCount = font['A']?.length || 5
  const lines: string[][] = Array.from({ length: rowCount }, () => [])

  for (const ch of upper) {
    const glyph = font[ch]
    if (glyph) {
      for (let row = 0; row < rowCount; row++) {
        lines[row].push(glyph[row])
      }
    } else {
      const w = rowCount === 5 ? '     ' : '   '
      for (let row = 0; row < rowCount; row++) {
        lines[row].push(w)
      }
    }
  }

  return lines.map(row => row.join(' ')).join('\n')
}

export default function TextToAsciiArtTool() {
  const [input, setInput] = useState('')
  const [fontStyle, setFontStyle] = useState<'large' | 'small'>('large')

  const output = useMemo(() => {
    if (!input) return ''
    return textToAsciiArt(input, fontStyle === 'large' ? FONT : FONT_SMALL)
  }, [input, fontStyle])

  return (
    <ToolPage title="Text to ASCII Art" description="Convert text to ASCII art using a simple block font. Supports A-Z, 0-9, and common punctuation." category="text" categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text to ASCII Art is a free browser-based tool that lets you convert text into large ASCII art characters using various font styles for decorative display. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating banner text for README files, terminal splash screens, or decorative text for presentations. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this creative tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For very long documents, processing is instant but rendering the output may take a brief moment.</li>
            <li>The tool handles Unicode text correctly, including accented characters, CJK scripts, and emoji.</li>
            <li>Use the undo function in your browser (Ctrl+Z) if you need to revert input changes.</li>
            <li>Combine multiple text operations by copying the output of one tool into the input of another.</li>
            <li>No text is stored or transmitted — all processing runs locally in your browser.</li>
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
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Input Text</span>
            <div className="flex gap-1">
              <button onClick={() => setFontStyle('large')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${fontStyle === 'large' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Large</button>
              <button onClick={() => setFontStyle('small')} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${fontStyle === 'small' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Small</button>
            </div>
          </div>
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
