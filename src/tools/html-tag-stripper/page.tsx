'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function stripHtmlTags(html: string, preserveBreaks: boolean): string {
  let result = html
  if (preserveBreaks) {
    result = result.replace(/<br\s*\/?>/gi, '\n')
    result = result.replace(/<\/p>/gi, '\n\n')
    result = result.replace(/<\/div>/gi, '\n')
    result = result.replace(/<\/li>/gi, '\n')
    result = result.replace(/<\/h[1-6]>/gi, '\n\n')
    result = result.replace(/<\/tr>/gi, '\n')
    result = result.replace(/<\/blockquote>/gi, '\n')
  }
  result = result.replace(/<[^>]*>/g, '')
  result = result.replace(/&nbsp;/gi, ' ')
  result = result.replace(/&amp;/gi, '&')
  result = result.replace(/&lt;/gi, '<')
  result = result.replace(/&gt;/gi, '>')
  result = result.replace(/&quot;/gi, '"')
  result = result.replace(/&#39;/gi, "'")
  if (preserveBreaks) {
    result = result.replace(/\n{3,}/g, '\n\n')
  }
  return result.trim()
}

export default function HtmlTagStripperTool() {
  const [input, setInput] = useState('')
  const [preserveBreaks, setPreserveBreaks] = useState(true)

  const output = useMemo(() => {
    if (!input) return ''
    return stripHtmlTags(input, preserveBreaks)
  }, [input, preserveBreaks])

  return (
    <ToolPage title="HTML Tag Stripper" description="Strip all HTML tags from text and keep only the text content." category="text" categoryLabel="Text Tools">
      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="checkbox" checked={preserveBreaks} onChange={e => setPreserveBreaks(e.target.checked)} className="rounded border-input" />
          Preserve line breaks
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">HTML Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder='<h1>Hello World</h1>\n<p>This is a <strong>paragraph</strong> with <a href="#">links</a>.</p>' rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Plain Text Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Stripped text will appear here..." rows={12} />
        </div>
      </div>
    </ToolPage>
  )
}
