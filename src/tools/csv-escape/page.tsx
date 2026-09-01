'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

type Delimiter = ',' | '\t' | ';' | '|'

function csvEscape(str: string, delimiter: string): string {
  const needsQuoting = str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')
  if (!needsQuoting) return str
  return '"' + str.replace(/"/g, '""') + '"'
}

function csvUnescape(str: string): string {
  let s = str.trim()
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1)
    s = s.replace(/""/g, '"')
  }
  return s
}

function csvEscapeMultiline(input: string, delimiter: string): string {
  return input.split('\n').map(line => csvEscape(line, delimiter)).join('\n')
}

function csvUnescapeMultiline(input: string): string {
  return input.split('\n').map(line => csvUnescape(line)).join('\n')
}

export default function CsvEscapeTool() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape')
  const [delimiter, setDelimiter] = useState<Delimiter>(',')

  const output = useMemo(() => {
    if (!input) return ''
    return mode === 'escape' ? csvEscapeMultiline(input, delimiter) : csvUnescapeMultiline(input)
  }, [input, mode, delimiter])

  const clear = () => { setInput('') }

  return (
    <ToolPage title="CSV Field Escape / Unescape" description="Escape or unescape strings for CSV fields. Handles quote wrapping and double-quote escaping." category="string" categoryLabel="String Utilities"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>CSV Escape/Unescape is a free browser-based tool that lets you escape special characters in CSV fields (commas, quotes, newlines) or unescape previously escaped CSV data. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type the string value you want to process in the input field.</li>
            <li>Select the specific operation — escape, unescape, test, or generate.</li>
            <li>Review the processed output and any match highlights or validation results.</li>
            <li>Copy the result for direct use in your code or queries.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when preparing data for CSV export, fixing malformed CSV files, or handling fields with special characters. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this data processing tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Escape characters correctly before inserting strings into code to prevent syntax errors and security vulnerabilities.</li>
            <li>Different languages and formats have different escaping rules — select the correct mode for your use case.</li>
            <li>Test escaped strings in a safe environment before using them in production queries or code.</li>
            <li>The tool handles edge cases like nested quotes, backslashes, and null bytes correctly.</li>
            <li>All processing is client-side — safe to use with database queries containing sensitive data.</li>
          </ul>

          <h2>Why CSV Escaping Matters</h2>
          <p>CSV (Comma-Separated Values) files look simple, but improper escaping is one of the most common causes of <strong>data corruption</strong> in data pipelines. When a field value contains a <strong>comma</strong>, it gets misinterpreted as a field delimiter, splitting one value into two columns and shifting every subsequent column in the row. <strong>Double quotes</strong> inside field values cause even worse problems — an unescaped quote can prematurely close a quoted field, corrupting the rest of the file. <strong>Newline characters</strong> embedded within a field (common in addresses, descriptions, and comments) break row boundaries entirely, causing parsers to treat one record as multiple rows. These issues cascade through data imports, breaking database loads, analytics dashboards, and spreadsheet formulas. Proper escaping prevents all of these problems by wrapping affected fields in quotes and doubling any internal quote characters.</p>

          <h2>CSV Escape Rules (RFC 4180)</h2>
          <p>The <strong>RFC 4180</strong> standard defines the official rules for CSV formatting, and this tool follows them precisely. The rules are straightforward: if a field contains a comma, a double quote, or a newline character, the entire field must be <strong>wrapped in double quotes</strong>. Any double quote characters within the field must be <strong>escaped by doubling them</strong> — so a single <code>&quot;</code> becomes <code>&quot;&quot;</code>. For example, the value <code>She said &quot;hello&quot;</code> becomes <code>&quot;She said &quot;&quot;hello&quot;&quot;&quot;</code> in properly escaped CSV. Fields that contain no special characters can be left unquoted. While some applications use backslash escaping instead, RFC 4180 quote-doubling is the universally accepted standard supported by Excel, Google Sheets, Python&apos;s csv module, and virtually every data processing tool. This tool also supports alternative delimiters — tabs, semicolons, and pipes — since European locales commonly use semicolons as CSV delimiters because commas serve as decimal separators.</p>
        </>
      }
 faqs={[
        { question: 'When do CSV fields need to be escaped?', answer: 'CSV fields must be escaped when they contain commas, double quotes, or newline characters. The field is wrapped in double quotes and any existing quotes are doubled.' },
        { question: 'How do you escape quotes in CSV?', answer: 'In CSV format, double quotes inside a field value are escaped by doubling them (e.g., "She said ""hello"""), and the entire field is wrapped in quotes.' },
        { question: 'What does CSV unescape do?', answer: 'CSV unescape removes the outer double quotes from a quoted field and converts doubled quotes ("") back to single quotes, restoring the original text.' },
      ]}>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setMode('escape')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'escape' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Escape</button>
        <button onClick={() => setMode('unescape')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'unescape' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Unescape</button>
        <select value={delimiter} onChange={e => setDelimiter(e.target.value as Delimiter)} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value=",">Comma (,)</option>
          <option value={'\t'}>Tab</option>
          <option value=";">Semicolon (;)</option>
          <option value="|">Pipe (|)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Input (one field per line)</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder={mode === 'escape' ? 'Enter CSV fields, one per line...\nHello, World\nShe said "hi"\nPlain text' : 'Enter escaped CSV fields...\n"Hello, World"\n"She said ""hi"""\nPlain text'} rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Output</span>
            {output && <CopyButton text={output} />}
          </div>
          <ToolTextarea value={output} readOnly placeholder="Result will appear here..." rows={10} />
        </div>
      </div>


    </ToolPage>
  )
}
