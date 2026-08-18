'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

type ListMode = 'split' | 'join' | 'dedupe' | 'sort' | 'number'

export default function ListToolsPage() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<ListMode>('split')
  const [delimiter, setDelimiter] = useState(',')
  const [joinDelimiter, setJoinDelimiter] = useState(', ')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [numberPrefix, setNumberPrefix] = useState('')
  const [numberSuffix, setNumberSuffix] = useState('. ')

  const output = useMemo(() => {
    if (!input) return ''
    switch (mode) {
      case 'split': {
        return input.split(delimiter).map(s => s.trim()).filter(Boolean).join('\n')
      }
      case 'join': {
        return input.split('\n').map(s => s.trim()).filter(Boolean).join(joinDelimiter)
      }
      case 'dedupe': {
        const lines = input.split('\n').map(s => s.trim()).filter(Boolean)
        return [...new Set(lines)].join('\n')
      }
      case 'sort': {
        const lines = input.split('\n').map(s => s.trim()).filter(Boolean)
        const sorted = lines.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        if (sortOrder === 'desc') sorted.reverse()
        return sorted.join('\n')
      }
      case 'number': {
        const lines = input.split('\n').filter(s => s.trim())
        return lines.map((line, i) => `${numberPrefix}${i + 1}${numberSuffix}${line}`).join('\n')
      }
    }
  }, [input, mode, delimiter, joinDelimiter, sortOrder, numberPrefix, numberSuffix])

  const modes: { key: ListMode; label: string }[] = [
    { key: 'split', label: 'Split to Lines' },
    { key: 'join', label: 'Join Lines' },
    { key: 'dedupe', label: 'Remove Duplicates' },
    { key: 'sort', label: 'Sort' },
    { key: 'number', label: 'Number Items' },
  ]

  return (
    <ToolPage
      title="List Tools"
      description="Split, join, deduplicate, sort, and number list items."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>List Tools is a free browser-based tool that lets you sort, shuffle, reverse, number, deduplicate, and transform lists with multiple formatting options. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when organizing data lists, preparing CSV columns, randomizing quiz answers, or formatting text lists for documents. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this text processing tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need list manipulation.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How do I split a comma-separated list into lines?', answer: 'Select the "Split to Lines" mode and enter a comma in the delimiter field. Paste your comma-separated values into the input, and each item will appear on its own line in the output.' },
        { question: 'Can I remove duplicate items from a list?', answer: 'Yes. Select the "Remove Duplicates" mode and paste your list with one item per line. The tool will keep only unique items while preserving the order of first occurrence.' },
        { question: 'How does the sorting work?', answer: 'The sort mode arranges lines alphabetically using locale-aware comparison. You can switch between ascending (A-Z) and descending (Z-A) order with the toggle buttons.' },
        { question: 'Can I add custom numbering to my list?', answer: 'Yes. Use the "Number Items" mode and customize the prefix and suffix fields. For example, set the suffix to ") " to get numbering like "1) Item" or leave the default ". " for "1. Item".' },
      ]}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {modes.map(m => (
          <button key={m.key} onClick={() => setMode(m.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode-specific options */}
      <div className="flex flex-wrap gap-3 mb-4">
        {mode === 'split' && (
          <div>
            <label className="block text-xs font-medium mb-1">Split Delimiter</label>
            <input type="text" value={delimiter} onChange={e => setDelimiter(e.target.value)} placeholder="," className="w-24 rounded-lg border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        )}
        {mode === 'join' && (
          <div>
            <label className="block text-xs font-medium mb-1">Join With</label>
            <input type="text" value={joinDelimiter} onChange={e => setJoinDelimiter(e.target.value)} placeholder=", " className="w-24 rounded-lg border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        )}
        {mode === 'sort' && (
          <div>
            <label className="block text-xs font-medium mb-1">Order</label>
            <div className="flex gap-1">
              <button onClick={() => setSortOrder('asc')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${sortOrder === 'asc' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>A-Z</button>
              <button onClick={() => setSortOrder('desc')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${sortOrder === 'desc' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Z-A</button>
            </div>
          </div>
        )}
        {mode === 'number' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1">Prefix</label>
              <input type="text" value={numberPrefix} onChange={e => setNumberPrefix(e.target.value)} placeholder="" className="w-16 rounded-lg border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Suffix</label>
              <input type="text" value={numberSuffix} onChange={e => setNumberSuffix(e.target.value)} placeholder=". " className="w-16 rounded-lg border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={() => setInput('')} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'split' ? 'apple, banana, cherry, date' : 'apple\nbanana\ncherry\ndate'} rows={12} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={12} />
        </div>
      </div>
    </ToolPage>
  )
}
