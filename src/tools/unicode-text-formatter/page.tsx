'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

const BOLD_UPPER = '\u{1D5D4}\u{1D5D5}\u{1D5D6}\u{1D5D7}\u{1D5D8}\u{1D5D9}\u{1D5DA}\u{1D5DB}\u{1D5DC}\u{1D5DD}\u{1D5DE}\u{1D5DF}\u{1D5E0}\u{1D5E1}\u{1D5E2}\u{1D5E3}\u{1D5E4}\u{1D5E5}\u{1D5E6}\u{1D5E7}\u{1D5E8}\u{1D5E9}\u{1D5EA}\u{1D5EB}\u{1D5EC}\u{1D5ED}'
const BOLD_LOWER = '\u{1D5EE}\u{1D5EF}\u{1D5F0}\u{1D5F1}\u{1D5F2}\u{1D5F3}\u{1D5F4}\u{1D5F5}\u{1D5F6}\u{1D5F7}\u{1D5F8}\u{1D5F9}\u{1D5FA}\u{1D5FB}\u{1D5FC}\u{1D5FD}\u{1D5FE}\u{1D5FF}\u{1D600}\u{1D601}\u{1D602}\u{1D603}\u{1D604}\u{1D605}\u{1D606}\u{1D607}'

const ITALIC_UPPER = '\u{1D608}\u{1D609}\u{1D60A}\u{1D60B}\u{1D60C}\u{1D60D}\u{1D60E}\u{1D60F}\u{1D610}\u{1D611}\u{1D612}\u{1D613}\u{1D614}\u{1D615}\u{1D616}\u{1D617}\u{1D618}\u{1D619}\u{1D61A}\u{1D61B}\u{1D61C}\u{1D61D}\u{1D61E}\u{1D61F}\u{1D620}\u{1D621}'
const ITALIC_LOWER = '\u{1D622}\u{1D623}\u{1D624}\u{1D625}\u{1D626}\u{1D627}\u{1D628}\u{1D629}\u{1D62A}\u{1D62B}\u{1D62C}\u{1D62D}\u{1D62E}\u{1D62F}\u{1D630}\u{1D631}\u{1D632}\u{1D633}\u{1D634}\u{1D635}\u{1D636}\u{1D637}\u{1D638}\u{1D639}\u{1D63A}\u{1D63B}'

const BOLD_ITALIC_UPPER = '\u{1D63C}\u{1D63D}\u{1D63E}\u{1D63F}\u{1D640}\u{1D641}\u{1D642}\u{1D643}\u{1D644}\u{1D645}\u{1D646}\u{1D647}\u{1D648}\u{1D649}\u{1D64A}\u{1D64B}\u{1D64C}\u{1D64D}\u{1D64E}\u{1D64F}\u{1D650}\u{1D651}\u{1D652}\u{1D653}\u{1D654}\u{1D655}'
const BOLD_ITALIC_LOWER = '\u{1D656}\u{1D657}\u{1D658}\u{1D659}\u{1D65A}\u{1D65B}\u{1D65C}\u{1D65D}\u{1D65E}\u{1D65F}\u{1D660}\u{1D661}\u{1D662}\u{1D663}\u{1D664}\u{1D665}\u{1D666}\u{1D667}\u{1D668}\u{1D669}\u{1D66A}\u{1D66B}\u{1D66C}\u{1D66D}\u{1D66E}\u{1D66F}'

const MONO_UPPER = '\u{1D670}\u{1D671}\u{1D672}\u{1D673}\u{1D674}\u{1D675}\u{1D676}\u{1D677}\u{1D678}\u{1D679}\u{1D67A}\u{1D67B}\u{1D67C}\u{1D67D}\u{1D67E}\u{1D67F}\u{1D680}\u{1D681}\u{1D682}\u{1D683}\u{1D684}\u{1D685}\u{1D686}\u{1D687}\u{1D688}\u{1D689}'
const MONO_LOWER = '\u{1D68A}\u{1D68B}\u{1D68C}\u{1D68D}\u{1D68E}\u{1D68F}\u{1D690}\u{1D691}\u{1D692}\u{1D693}\u{1D694}\u{1D695}\u{1D696}\u{1D697}\u{1D698}\u{1D699}\u{1D69A}\u{1D69B}\u{1D69C}\u{1D69D}\u{1D69E}\u{1D69F}\u{1D6A0}\u{1D6A1}\u{1D6A2}\u{1D6A3}'

// Script/Cursive (Mathematical Script Bold U+1D4D0+)
const SCRIPT_UPPER = '\u{1D4D0}\u{1D4D1}\u{1D4D2}\u{1D4D3}\u{1D4D4}\u{1D4D5}\u{1D4D6}\u{1D4D7}\u{1D4D8}\u{1D4D9}\u{1D4DA}\u{1D4DB}\u{1D4DC}\u{1D4DD}\u{1D4DE}\u{1D4DF}\u{1D4E0}\u{1D4E1}\u{1D4E2}\u{1D4E3}\u{1D4E4}\u{1D4E5}\u{1D4E6}\u{1D4E7}\u{1D4E8}\u{1D4E9}'
const SCRIPT_LOWER = '\u{1D4EA}\u{1D4EB}\u{1D4EC}\u{1D4ED}\u{1D4EE}\u{1D4EF}\u{1D4F0}\u{1D4F1}\u{1D4F2}\u{1D4F3}\u{1D4F4}\u{1D4F5}\u{1D4F6}\u{1D4F7}\u{1D4F8}\u{1D4F9}\u{1D4FA}\u{1D4FB}\u{1D4FC}\u{1D4FD}\u{1D4FE}\u{1D4FF}\u{1D500}\u{1D501}\u{1D502}\u{1D503}'

// Double-struck (U+1D538+)
const DOUBLE_UPPER = '\u{1D538}\u{1D539}\u{2102}\u{1D53B}\u{1D53C}\u{1D53D}\u{1D53E}\u{210D}\u{1D540}\u{1D541}\u{1D542}\u{1D543}\u{1D544}\u{2115}\u{1D546}\u{2119}\u{211A}\u{211D}\u{1D54A}\u{1D54B}\u{1D54C}\u{1D54D}\u{1D54E}\u{1D54F}\u{1D550}\u{2124}'
const DOUBLE_LOWER = '\u{1D552}\u{1D553}\u{1D554}\u{1D555}\u{1D556}\u{1D557}\u{1D558}\u{1D559}\u{1D55A}\u{1D55B}\u{1D55C}\u{1D55D}\u{1D55E}\u{1D55F}\u{1D560}\u{1D561}\u{1D562}\u{1D563}\u{1D564}\u{1D565}\u{1D566}\u{1D567}\u{1D568}\u{1D569}\u{1D56A}\u{1D56B}'

// Fullwidth (U+FF21+ uppercase, U+FF41+ lowercase)
const FULLWIDTH_UPPER = '\uFF21\uFF22\uFF23\uFF24\uFF25\uFF26\uFF27\uFF28\uFF29\uFF2A\uFF2B\uFF2C\uFF2D\uFF2E\uFF2F\uFF30\uFF31\uFF32\uFF33\uFF34\uFF35\uFF36\uFF37\uFF38\uFF39\uFF3A'
const FULLWIDTH_LOWER = '\uFF41\uFF42\uFF43\uFF44\uFF45\uFF46\uFF47\uFF48\uFF49\uFF4A\uFF4B\uFF4C\uFF4D\uFF4E\uFF4F\uFF50\uFF51\uFF52\uFF53\uFF54\uFF55\uFF56\uFF57\uFF58\uFF59\uFF5A'

// Circled (U+24B6+ uppercase, U+24D0+ lowercase)
const CIRCLED_UPPER = '\u24B6\u24B7\u24B8\u24B9\u24BA\u24BB\u24BC\u24BD\u24BE\u24BF\u24C0\u24C1\u24C2\u24C3\u24C4\u24C5\u24C6\u24C7\u24C8\u24C9\u24CA\u24CB\u24CC\u24CD\u24CE\u24CF'
const CIRCLED_LOWER = '\u24D0\u24D1\u24D2\u24D3\u24D4\u24D5\u24D6\u24D7\u24D8\u24D9\u24DA\u24DB\u24DC\u24DD\u24DE\u24DF\u24E0\u24E1\u24E2\u24E3\u24E4\u24E5\u24E6\u24E7\u24E8\u24E9'

function toArray(str: string): string[] {
  return [...str]
}

function mapChars(text: string, upperMap: string[], lowerMap: string[]): string {
  return [...text].map(ch => {
    const upper = ch.charCodeAt(0) - 65
    const lower = ch.charCodeAt(0) - 97
    if (upper >= 0 && upper < 26) return upperMap[upper]
    if (lower >= 0 && lower < 26) return lowerMap[lower]
    return ch
  }).join('')
}

function strikethrough(text: string): string {
  return [...text].map(ch => ch + '\u0336').join('')
}

function upsideDown(text: string): string {
  const flipMap: Record<string, string> = {
    a: '\u0250', b: 'q', c: '\u0254', d: 'p', e: '\u01DD', f: '\u025F',
    g: '\u0253', h: '\u0265', i: '\u0131', j: '\u027E', k: '\u029E', l: 'l',
    m: '\u026F', n: 'u', o: 'o', p: 'd', q: 'b', r: '\u0279',
    s: 's', t: '\u0287', u: 'n', v: '\u028C', w: '\u028D', x: 'x',
    y: '\u028E', z: 'z',
    A: '\u2200', B: 'B', C: '\u0186', D: 'D', E: '\u018E', F: '\u2132',
    G: '\u2141', H: 'H', I: 'I', J: '\u017F', K: 'K', L: '\u2142',
    M: 'W', N: 'N', O: 'O', P: '\u0500', Q: 'Q', R: 'R',
    S: 'S', T: '\u2534', U: '\u2229', V: '\u039B', W: 'M', X: 'X',
    Y: '\u2144', Z: 'Z',
    '1': '\u0196', '2': '\u1105', '3': '\u0190', '4': '\u3123', '5': '\u03DB',
    '6': '9', '7': '\u3125', '8': '8', '9': '6', '0': '0',
    '.': '\u02D9', ',': "'", "'": ',', '"': '\u201E', '`': ',',
    '?': '\u00BF', '!': '\u00A1', '(': ')', ')': '(', '[': ']', ']': '[',
    '{': '}', '}': '{', '<': '>', '>': '<', '&': '\u214B', '_': '\u203E',
  }
  return [...text].reverse().map(ch => flipMap[ch] || ch).join('')
}

export default function UnicodeTextFormatterTool() {
  const [input, setInput] = useState('')

  const boldUpper = toArray(BOLD_UPPER)
  const boldLower = toArray(BOLD_LOWER)
  const italicUpper = toArray(ITALIC_UPPER)
  const italicLower = toArray(ITALIC_LOWER)
  const boldItalicUpper = toArray(BOLD_ITALIC_UPPER)
  const boldItalicLower = toArray(BOLD_ITALIC_LOWER)
  const monoUpper = toArray(MONO_UPPER)
  const monoLower = toArray(MONO_LOWER)
  const scriptUpper = toArray(SCRIPT_UPPER)
  const scriptLower = toArray(SCRIPT_LOWER)
  const doubleUpper = toArray(DOUBLE_UPPER)
  const doubleLower = toArray(DOUBLE_LOWER)
  const fullwidthUpper = toArray(FULLWIDTH_UPPER)
  const fullwidthLower = toArray(FULLWIDTH_LOWER)
  const circledUpper = toArray(CIRCLED_UPPER)
  const circledLower = toArray(CIRCLED_LOWER)

  const results = useMemo(() => {
    if (!input) return []
    return [
      { label: '\u{1D5D7}\u{1D5EE}\u{1D5FF}\u{1D5F2} Bold', value: mapChars(input, boldUpper, boldLower) },
      { label: '\u{1D608}\u{1D622}\u{1D62F}\u{1D634} Italic', value: mapChars(input, italicUpper, italicLower) },
      { label: '\u{1D63C}\u{1D656}\u{1D663}\u{1D659} Bold Italic', value: mapChars(input, boldItalicUpper, boldItalicLower) },
      { label: '\u{1D670}\u{1D68A}\u{1D697}\u{1D698} Monospace', value: mapChars(input, monoUpper, monoLower) },
      { label: '\u{1D4D2}\u{1D4F4}\u{1D4FB}\u{1D4FC}\u{1D4F2}\u{1D4F5}\u{1D4EE} Script/Cursive', value: mapChars(input, scriptUpper, scriptLower) },
      { label: '\u{1D53B}\u{1D560}\u{1D566}\u{1D553}\u{1D55D}\u{1D556} Double-struck', value: mapChars(input, doubleUpper, doubleLower) },
      { label: '\uFF26\uFF55\uFF4C\uFF4C\uFF57\uFF49\uFF44\uFF54\uFF48 Fullwidth', value: mapChars(input, fullwidthUpper, fullwidthLower) },
      { label: '\u24B8\u24D8\u24E1\u24D2\u24DB\u24D4\u24D3 Circled', value: mapChars(input, circledUpper, circledLower) },
      { label: 'S\u0336t\u0336r\u0336i\u0336k\u0336e\u0336 Strikethrough', value: strikethrough(input) },
      { label: '\u0250\u028D\u0279\u01DD Upside Down', value: upsideDown(input) },
    ]
  }, [input, boldUpper, boldLower, italicUpper, italicLower, boldItalicUpper, boldItalicLower, monoUpper, monoLower, scriptUpper, scriptLower, doubleUpper, doubleLower, fullwidthUpper, fullwidthLower, circledUpper, circledLower])

  return (
    <ToolPage
      title="Unicode Text Formatter"
      description="Convert text to Unicode styled variants: Bold, Italic, Bold Italic, Monospace, Strikethrough, and Upside Down."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Unicode Text Formatter is a free browser-based tool that lets you convert regular text to various Unicode styles including bold, italic, script, and monospace using Unicode characters. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when creating styled text for social media bios and posts where HTML formatting is not available. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this design tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'How do I make bold or italic text for social media?', answer: 'Type your text and copy the bold, italic, or other Unicode-styled variant. These work on platforms like Twitter, Instagram, and Facebook where HTML formatting is not supported.' },
        { question: 'Are Unicode text styles the same as HTML bold/italic?', answer: 'No, these use special Unicode characters that look like styled text. They work anywhere plain text is accepted, unlike HTML tags which require a renderer.' },
        { question: 'Why do some Unicode styles not display correctly?', answer: 'Some devices or apps may not have fonts that support all Unicode mathematical symbols. Results may vary across platforms and operating systems.' },
        { question: 'What text styles are available?', answer: 'This tool offers bold, italic, bold italic, monospace, strikethrough, and upside-down text transformations.' },
      ]}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Input Text</span>
        <ClearButton onClear={() => setInput('')} />
      </div>
      <ToolTextarea value={input} onChange={setInput} placeholder="Type text to convert to Unicode styles..." rows={4} />

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3">
          {results.map(r => (
            <div key={r.label} className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">{r.label}</span>
                <CopyButton text={r.value} />
              </div>
              <p className="text-sm break-all">{r.value}</p>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  )
}
