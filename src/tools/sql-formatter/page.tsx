'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

const MAJOR_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'SET', 'INSERT INTO', 'VALUES',
  'UPDATE', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
  'DROP TABLE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT',
  'OFFSET', 'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
  'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
  'CROSS JOIN', 'ON', 'USING', 'INTO', 'WITH', 'AS',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'RETURNING'
]

const ALL_KEYWORDS = [
  ...MAJOR_KEYWORDS,
  'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS',
  'NULL', 'TRUE', 'FALSE', 'ASC', 'DESC', 'DISTINCT', 'ALL',
  'ANY', 'SOME', 'TOP', 'AS', 'IF', 'BEGIN', 'COMMIT',
  'ROLLBACK', 'GRANT', 'REVOKE', 'PRIMARY', 'KEY', 'FOREIGN',
  'REFERENCES', 'CONSTRAINT', 'INDEX', 'UNIQUE', 'CHECK',
  'DEFAULT', 'AUTO_INCREMENT', 'CASCADE', 'REPLACE',
  'TRUNCATE', 'EXPLAIN', 'ANALYZE', 'COALESCE', 'CAST',
  'CONVERT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'VARCHAR', 'INT', 'INTEGER', 'BIGINT', 'FLOAT', 'DOUBLE',
  'DECIMAL', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'TEXT', 'BLOB'
]

function formatSql(sql: string, indentSize: number = 2): string {
  const pad = ' '.repeat(indentSize)

  // Capitalize keywords
  let formatted = sql.trim()

  // Tokenize while preserving strings and identifiers
  const tokens: string[] = []
  let i = 0
  while (i < formatted.length) {
    // String literals
    if (formatted[i] === "'" || formatted[i] === '"') {
      const quote = formatted[i]
      let token = quote
      i++
      while (i < formatted.length) {
        token += formatted[i]
        if (formatted[i] === quote) {
          if (i + 1 < formatted.length && formatted[i + 1] === quote) {
            token += formatted[i + 1]
            i += 2
          } else {
            i++
            break
          }
        } else {
          i++
        }
      }
      tokens.push(token)
    }
    // Whitespace
    else if (/\s/.test(formatted[i])) {
      let ws = ''
      while (i < formatted.length && /\s/.test(formatted[i])) { ws += formatted[i]; i++ }
      tokens.push(' ')
    }
    // Punctuation
    else if ('(),;'.includes(formatted[i])) {
      tokens.push(formatted[i])
      i++
    }
    // Words
    else {
      let word = ''
      while (i < formatted.length && !/[\s(),;'""]/.test(formatted[i])) { word += formatted[i]; i++ }
      tokens.push(word)
    }
  }

  // Capitalize SQL keywords (not inside strings)
  const capitalizedTokens = tokens.map(t => {
    if (t.startsWith("'") || t.startsWith('"')) return t
    const upper = t.toUpperCase()
    if (ALL_KEYWORDS.includes(upper)) return upper
    return t
  })

  // Rejoin and format with newlines before major keywords
  let result = capitalizedTokens.join('')

  // Collapse spaces
  result = result.replace(/ {2,}/g, ' ')

  // Add newlines before major keywords
  const majorPattern = MAJOR_KEYWORDS
    .sort((a, b) => b.length - a.length)
    .map(k => k.replace(/\s+/g, '\\s+'))
    .join('|')

  const regex = new RegExp(`\\b(${majorPattern})\\b`, 'gi')

  const parts: string[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  const tempResult = result

  while ((match = regex.exec(tempResult)) !== null) {
    const before = tempResult.slice(lastIndex, match.index).trimEnd()
    if (before) parts.push(before)
    parts.push('\n' + match[0].toUpperCase())
    lastIndex = match.index + match[0].length
  }

  const remainder = tempResult.slice(lastIndex)
  if (remainder.trim()) parts.push(remainder)

  let final = parts.join('').trim()

  // Indent after major keywords
  const lines = final.split('\n').filter(l => l.trim())
  const indented = lines.map((line, idx) => {
    const trimmed = line.trim()
    if (idx === 0) return trimmed
    // Check if line starts with a major keyword
    const startsWithMajor = MAJOR_KEYWORDS.some(k =>
      trimmed.toUpperCase().startsWith(k)
    )
    if (startsWithMajor) return trimmed
    return pad + trimmed
  })

  // Add AND/OR on new lines with indent
  let output = indented.join('\n')
  output = output.replace(/\s+(AND|OR)\s+/gi, (_, kw) => '\n' + pad + kw.toUpperCase() + ' ')

  return output
}

export default function SqlFormatterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)

  const format = () => {
    try {
      if (!input.trim()) throw new Error('Please enter a SQL query')
      setOutput(formatSql(input, indent))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error formatting SQL')
      setOutput('')
    }
  }

  const clear = () => { setInput(''); setOutput(''); setError('') }

  return (
    <ToolPage title="SQL Formatter" description="Format and beautify SQL queries with keyword capitalization and indentation" category="developer" categoryLabel="Developer Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">SQL Input</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={input} onChange={setInput} placeholder="Paste SQL here...\nselect * from users where id = 1" rows={14} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Formatted Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename="formatted.sql" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Formatted SQL will appear here..." rows={14} />
        </div>
      </div>
      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button onClick={format} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Format SQL
        </button>
        <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="h-9 px-3 rounded-md border border-input bg-card text-sm">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
      </div>
    </ToolPage>
  )
}
