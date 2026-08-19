'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

interface ReplacePair {
  id: number
  find: string
  replace: string
}

let nextId = 1

export default function FindAndReplaceTool() {
  const [input, setInput] = useState('')
  const [pairs, setPairs] = useState<ReplacePair[]>([{ id: nextId++, find: '', replace: '' }])
  const [caseSensitive, setCaseSensitive] = useState(true)
  const [useRegex, setUseRegex] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)

  const addPair = () => setPairs([...pairs, { id: nextId++, find: '', replace: '' }])
  const removePair = (id: number) => {
    if (pairs.length > 1) setPairs(pairs.filter((p) => p.id !== id))
  }
  const updatePair = (id: number, field: 'find' | 'replace', value: string) => {
    setPairs(pairs.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const { output, totalReplacements } = useMemo(() => {
    if (!input) return { output: '', totalReplacements: 0 }
    let result = input
    let total = 0
    for (const pair of pairs) {
      if (!pair.find) continue
      try {
        const flags = 'g' + (caseSensitive ? '' : 'i')
        let source = useRegex ? pair.find : pair.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (wholeWord && !useRegex) source = '\\b' + source + '\\b'
        const pattern = new RegExp(source, flags)
        const matches = result.match(pattern)
        if (matches) total += matches.length
        result = result.replace(pattern, pair.replace)
      } catch {
        // Invalid regex, skip
      }
    }
    return { output: result, totalReplacements: total }
  }, [input, pairs, caseSensitive, useRegex, wholeWord])

  return (
    <ToolPage
      title="Find and Replace"
      description="Bulk find and replace with multiple pairs. Supports case sensitivity and regex."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Find & Replace is a free browser-based tool that lets you search for text patterns in your content and replace them with new text, with support for regular expressions. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when bulk-editing text, standardizing terminology across documents, or performing complex pattern-based replacements. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text editing tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'Can I find and replace multiple different strings at once?', answer: 'Yes, click "+ Add Pair" to add as many find/replace pairs as you need. All replacements are applied sequentially to your text in the order listed.' },
        { question: 'How do I use regex in find and replace?', answer: 'Enable the "Use Regex" checkbox, then enter a valid regular expression in the Find field. For example, use "\\d+" to match all numbers or "\\b\\w+\\b" to match whole words.' },
        { question: 'What does the case-sensitive option do?', answer: 'When enabled, "Hello" and "hello" are treated as different strings. Disable it to match regardless of uppercase or lowercase letters.' },
        { question: 'Does this tool show how many replacements were made?', answer: 'Yes, a counter next to the options shows the total number of replacements made across all find/replace pairs, updating in real time as you type.' },
      ]}
    >
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="rounded border-border" />
          Case-sensitive
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} className="rounded border-border" />
          Use Regex
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} disabled={useRegex} className="rounded border-border" />
          Whole word
        </label>
        {totalReplacements > 0 && (
          <span className="text-xs text-muted-foreground">{totalReplacements} replacement{totalReplacements !== 1 ? 's' : ''} made</span>
        )}
      </div>

      <div className="mb-4 space-y-2">
        <span className="text-sm font-medium">Find & Replace Pairs</span>
        {pairs.map((pair) => (
          <div key={pair.id} className="flex gap-2 items-center">
            <input
              type="text"
              value={pair.find}
              onChange={(e) => updatePair(pair.id, 'find', e.target.value)}
              placeholder="Find..."
              className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground text-sm">&rarr;</span>
            <input
              type="text"
              value={pair.replace}
              onChange={(e) => updatePair(pair.id, 'replace', e.target.value)}
              placeholder="Replace with..."
              className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {pairs.length > 1 && (
              <button onClick={() => removePair(pair.id)} className="px-2 py-1.5 text-sm rounded-md border border-border bg-card hover:bg-muted transition-colors text-red-500">
                &times;
              </button>
            )}
          </div>
        ))}
        <button onClick={addPair} className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
          + Add Pair
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Enter your text..." rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Result</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>
    </ToolPage>
  )
}
