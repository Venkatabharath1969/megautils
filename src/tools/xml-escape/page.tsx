'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

const XML_ENTITIES: [RegExp, string][] = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&apos;'],
]

const XML_REVERSE: [RegExp, string][] = [
  [/&apos;/g, "'"],
  [/&quot;/g, '"'],
  [/&gt;/g, '>'],
  [/&lt;/g, '<'],
  [/&amp;/g, '&'],
]

function xmlEscape(str: string): string {
  let result = str
  for (const [pattern, replacement] of XML_ENTITIES) {
    result = result.replace(pattern, replacement)
  }
  return result
}

function xmlUnescape(str: string): string {
  let result = str
  for (const [pattern, replacement] of XML_REVERSE) {
    result = result.replace(pattern, replacement)
  }
  return result
}

export default function XmlEscapeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape')

  const process = () => {
    setOutput(mode === 'escape' ? xmlEscape(input) : xmlUnescape(input))
  }

  const clear = () => { setInput(''); setOutput('') }

  return (
    <ToolPage title="XML Escape / Unescape" description="Escape or unescape XML special characters like ampersand, angle brackets, quotes, and apostrophes." category="string" categoryLabel="String Utilities" faqs={[
        { question: 'What characters need to be escaped in XML?', answer: 'The five XML special characters that must be escaped are & (&amp;amp;), < (&amp;lt;), > (&amp;gt;), " (&amp;quot;), and the apostrophe (&amp;apos;).' },
        { question: 'Why do I need to escape XML characters?', answer: 'Unescaped special characters like < and & break XML parsing because they are reserved for markup syntax. Escaping ensures your text content is treated as data, not structure.' },
        { question: 'What is the difference between XML and HTML escaping?', answer: 'XML uses the same core five entities as HTML but is stricter. HTML has many more named entities like &amp;nbsp; and &amp;copy; that are not valid in XML.' },
      ]}>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setMode('escape')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'escape' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Escape</button>
        <button onClick={() => setMode('unescape')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'unescape' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Unescape</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'escape' ? '<tag attr="value">text & more</tag>' : '&lt;tag attr=&quot;value&quot;&gt;text &amp; more&lt;/tag&gt;'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>

      <button onClick={process} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        {mode === 'escape' ? 'Escape XML' : 'Unescape XML'}
      </button>
    </ToolPage>
  )
}
