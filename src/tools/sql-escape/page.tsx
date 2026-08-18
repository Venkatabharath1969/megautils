'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function mysqlEscape(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x00/g, '\\0')
    .replace(/\x1a/g, '\\Z')
}

function mysqlUnescape(str: string): string {
  let result = ''
  let i = 0
  while (i < str.length) {
    if (str[i] === '\\' && i + 1 < str.length) {
      const next = str[i + 1]
      if (next === '\\') { result += '\\'; i += 2 }
      else if (next === "'") { result += "'"; i += 2 }
      else if (next === '"') { result += '"'; i += 2 }
      else if (next === 'n') { result += '\n'; i += 2 }
      else if (next === 'r') { result += '\r'; i += 2 }
      else if (next === '0') { result += '\x00'; i += 2 }
      else if (next === 'Z') { result += '\x1a'; i += 2 }
      else { result += str[i]; i++ }
    } else {
      result += str[i]; i++
    }
  }
  return result
}

function postgresEscape(str: string): string {
  return str.replace(/'/g, "''")
}

function postgresUnescape(str: string): string {
  return str.replace(/''/g, "'")
}

export default function SqlEscapeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape')
  const [dialect, setDialect] = useState<'mysql' | 'postgres'>('mysql')

  const process = () => {
    if (mode === 'escape') {
      setOutput(dialect === 'mysql' ? mysqlEscape(input) : postgresEscape(input))
    } else {
      setOutput(dialect === 'mysql' ? mysqlUnescape(input) : postgresUnescape(input))
    }
  }

  const clear = () => { setInput(''); setOutput('') }

  return (
    <ToolPage title="SQL String Escape / Unescape" description="Escape or unescape strings for SQL queries. Supports MySQL and PostgreSQL modes." category="string" categoryLabel="String Utilities"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>SQL Escape/Unescape is a free browser-based tool that lets you escape special characters in SQL strings or unescape SQL-encoded values back to plain text. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when preparing strings for SQL queries, debugging SQL syntax issues, or understanding escaped characters in database outputs. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this database tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need sql string escaping.</li>
          </ul>
        </>
      }
 faqs={[{ question: 'Why do I need to escape SQL strings?', answer: 'Escaping prevents SQL injection attacks by neutralizing special characters like single quotes that could break your query or allow malicious code execution.' }, { question: 'What characters need escaping in SQL?', answer: "Single quotes ('), backslashes (\\), and null bytes are the most common characters requiring escaping. MySQL also escapes double quotes and percent signs." }, { question: 'What is the difference between MySQL and PostgreSQL escaping?', answer: "MySQL uses backslash escaping (\\') while PostgreSQL uses double single quotes (''). This tool supports both modes." }]}>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setMode('escape')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'escape' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Escape</button>
        <button onClick={() => setMode('unescape')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'unescape' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Unescape</button>
        <select value={dialect} onChange={e => setDialect(e.target.value as 'mysql' | 'postgres')} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value="mysql">MySQL</option>
          <option value="postgres">PostgreSQL</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Enter string to escape for SQL..." rows={10} />
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
        {mode === 'escape' ? 'Escape String' : 'Unescape String'}
      </button>
    </ToolPage>
  )
}
