'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

function toSentenceCase(str: string): string {
  return str
    .split(/([.!?]\s*)/)
    .map((part, i) => {
      if (i % 2 === 0 && part.length > 0) {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      }
      return part
    })
    .join('')
}

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('')
}

function toSnakeCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
    .join('_')
}

function toKebabCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
    .join('-')
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
}

function toConstantCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toUpperCase())
    .join('_')
}

function toSwapCase(str: string): string {
  return [...str].map(ch => {
    if (ch >= 'a' && ch <= 'z') return ch.toUpperCase()
    if (ch >= 'A' && ch <= 'Z') return ch.toLowerCase()
    return ch
  }).join('')
}

function toDotCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
    .join('.')
}

export default function CaseConverterTool() {
  const [input, setInput] = useState('')

  const results = useMemo(() => {
    if (!input) return []
    return [
      { label: 'UPPERCASE', value: input.toUpperCase() },
      { label: 'lowercase', value: input.toLowerCase() },
      { label: 'Title Case', value: toTitleCase(input) },
      { label: 'Sentence case', value: toSentenceCase(input) },
      { label: 'camelCase', value: toCamelCase(input) },
      { label: 'snake_case', value: toSnakeCase(input) },
      { label: 'kebab-case', value: toKebabCase(input) },
      { label: 'PascalCase', value: toPascalCase(input) },
      { label: 'CONSTANT_CASE', value: toConstantCase(input) },
      { label: 'sWAP cASE', value: toSwapCase(input) },
      { label: 'dot.case', value: toDotCase(input) },
    ]
  }, [input])

  return (
    <ToolPage
      title="Case Converter"
      description="Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, and more."
      category="text"
      categoryLabel="Text Tools"
      faqs={[
        { question: 'What is the difference between camelCase and PascalCase?', answer: 'In camelCase the first word is lowercase and subsequent words are capitalized (e.g., myVariableName), while in PascalCase every word starts with a capital letter (e.g., MyVariableName). camelCase is typical for variables, PascalCase for class names.' },
        { question: 'When should I use snake_case vs kebab-case?', answer: 'snake_case (words separated by underscores) is standard in Python and database column names, while kebab-case (words separated by hyphens) is used in URLs, CSS class names, and file names.' },
        { question: 'What is Sentence case vs Title Case?', answer: 'Sentence case capitalizes only the first letter of the first word (like a normal sentence), while Title Case capitalizes the first letter of every word (commonly used in headings and titles).' },
        { question: 'What is CONSTANT_CASE used for?', answer: 'CONSTANT_CASE (all uppercase with underscores) is the convention for constant values and environment variables in most programming languages, such as MAX_RETRY_COUNT or API_BASE_URL.' },
      ]}
      helpContent={
        <>
          <h2>What is a Case Converter?</h2>
          <p>
            A case converter is a utility that transforms text between different capitalization and naming conventions in a
            single step. In software development, writing, and data processing, the same phrase often needs to appear in
            multiple formats: a variable name might use camelCase in JavaScript, snake_case in Python, kebab-case in a CSS
            class, PascalCase for a React component, and CONSTANT_CASE for an environment variable. Manually rewriting each
            form is tedious and error-prone. This tool instantly generates all common conventions at once so you can copy the
            one you need. Beyond programming, case conversion is useful for formatting headings in Title Case, normalizing
            user input to lowercase for comparison, or converting an entire paragraph to UPPERCASE for emphasis. The converter
            handles multi-word input by splitting on spaces, punctuation, and existing case boundaries, then reassembling the
            words in the target format.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Type or paste your text into the input field at the top of the page.</li>
            <li>All supported case conversions are generated instantly and displayed below the input. You do not need to click a button — results update as you type.</li>
            <li>Find the format you need — UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case, PascalCase, or CONSTANT_CASE — and click the <strong>Copy</strong> button next to it.</li>
            <li>Paste the converted text into your code editor, document, or form field.</li>
            <li>Click <strong>Clear</strong> to reset the input and start a new conversion.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Use camelCase for JavaScript and TypeScript variables and function names, and PascalCase for class names and React component names — this follows the conventions enforced by most linters.</li>
            <li>Choose snake_case for Python variables, Ruby methods, and database column names, as it is the standard in those ecosystems.</li>
            <li>Use kebab-case for URL slugs, CSS class names, and HTML attributes to ensure compatibility and readability in web contexts.</li>
            <li>CONSTANT_CASE is the universal standard for environment variables and constant declarations — using it signals that a value should not be reassigned.</li>
            <li>When converting text that contains acronyms like "API" or "URL," review the output to make sure the acronym is handled the way your style guide expects.</li>
            <li>For large batches of text, consider scripting the conversion, but for quick one-off needs this tool is the fastest path from input to correctly cased output.</li>
          </ul>
        </>
      }
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Input Text</span>
        <ClearButton onClear={() => setInput('')} />
      </div>
      <ToolTextarea value={input} onChange={setInput} placeholder="Enter text to convert..." rows={5} />

      {results.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-3">
          {results.map((r) => (
            <div key={r.label} className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-muted-foreground">{r.label}</span>
                <CopyButton text={r.value} />
              </div>
              <p className="text-sm font-mono break-all">{r.value}</p>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  )
}
