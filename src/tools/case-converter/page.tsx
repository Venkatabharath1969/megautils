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
