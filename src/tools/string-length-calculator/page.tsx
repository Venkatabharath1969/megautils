'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

export default function StringLengthCalculatorTool() {
  const [input, setInput] = useState('')

  const stats = useMemo(() => {
    const charCount = [...input].length // Handles surrogate pairs correctly
    const utf16Length = input.length    // JavaScript string length (UTF-16 code units)
    const byteLength = new TextEncoder().encode(input).length // UTF-8 byte length
    const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0
    const lineCount = input ? input.split('\n').length : 0
    const urlEncodedLength = encodeURIComponent(input).length
    const base64Length = input ? Math.ceil(byteLength / 3) * 4 : 0
    return { charCount, utf16Length, byteLength, wordCount, lineCount, urlEncodedLength, base64Length }
  }, [input])

  return (
    <ToolPage
      title="String Length Calculator"
      description="Analyze text length: character count, UTF-8 byte length, UTF-16 length, word count, and line count."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>String Length Calculator is a free browser-based tool that lets you count the exact number of characters, bytes, words, and lines in a text string with Unicode support. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your text content into the input area.</li>
            <li>Select the operation or transformation you want to apply.</li>
            <li>View the processed text <strong>instantly</strong> in the output area.</li>
            <li>Copy the result or download it for use in your documents or projects.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when verifying string lengths for database fields, API input limits, SMS character counts, or programming constraints. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For very long documents, processing is instant but rendering the output may take a brief moment.</li>
            <li>The tool handles Unicode text correctly, including accented characters, CJK scripts, and emoji.</li>
            <li>Use the undo function in your browser (Ctrl+Z) if you need to revert input changes.</li>
            <li>Combine multiple text operations by copying the output of one tool into the input of another.</li>
            <li>No text is stored or transmitted — all processing runs locally in your browser.</li>
          </ul>

          <h2>Why String Length Matters</h2>
          <p>Knowing the exact length of a string is essential across many areas of software development and content creation. Front-end developers rely on string length for <strong>form validation</strong> — ensuring usernames, passwords, and email addresses meet minimum and maximum requirements before submission. Database engineers must verify that text fits within <strong>VARCHAR column limits</strong> to prevent truncation errors when inserting data into MySQL, PostgreSQL, or SQL Server. API developers need to check <strong>payload size limits</strong> — many REST APIs enforce maximum request body sizes, and exceeding them causes silent failures or rejected requests. Content creators count characters to stay within platform limits such as Twitter posts, meta descriptions, and SMS messages.</p>

          <h2>String Length in Different Programming Languages</h2>
          <p>String length behaves differently depending on the language and encoding. In <strong>JavaScript</strong>, <code>str.length</code> returns the number of UTF-16 code units, which means emojis and certain Unicode characters count as 2. Use <code>[...str].length</code> for the true character count. In <strong>Python 3</strong>, <code>len(s)</code> returns the number of Unicode code points, giving you the true character count directly. To get the byte length, use <code>len(s.encode(&apos;utf-8&apos;))</code>. In <strong>Java</strong>, <code>str.length()</code> returns UTF-16 code units similar to JavaScript, while <code>str.codePointCount(0, str.length())</code> gives the actual character count. Understanding these differences is critical when working across multiple languages or migrating data between systems.</p>

          <h2>Common String Length Limits</h2>
          <p>Many platforms and standards enforce specific character limits that you should be aware of:</p>
          <ul>
            <li><strong>Twitter / X posts:</strong> 280 characters (was 140 before 2017)</li>
            <li><strong>SMS messages:</strong> 160 characters for GSM-7 encoding, 70 for UCS-2 (Unicode)</li>
            <li><strong>Email subject lines:</strong> 78 characters recommended by RFC 2822, though most clients display 40-60</li>
            <li><strong>Meta descriptions:</strong> 155-160 characters before Google truncates them in search results</li>
            <li><strong>URLs:</strong> 2,048 characters is the practical maximum for most browsers</li>
            <li><strong>MySQL VARCHAR:</strong> up to 65,535 bytes depending on character set</li>
            <li><strong>PostgreSQL TEXT:</strong> up to 1 GB, but VARCHAR(n) enforces a specific limit</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is the difference between character count and byte length?', answer: 'Character count is the number of visible characters, while byte length measures storage size in UTF-8 encoding where non-ASCII characters use 2-4 bytes each.' },
        { question: 'Why is UTF-16 length different from character count?', answer: 'UTF-16 length matches JavaScript\'s .length property, which counts surrogate pairs (like emojis) as 2 units instead of 1 character.' },
        { question: 'How are words counted?', answer: 'Words are counted by splitting text on whitespace, so any sequence of non-space characters separated by spaces, tabs, or newlines counts as one word.' },
        { question: 'Does this tool count emoji characters correctly?', answer: 'Yes. This tool uses the Unicode-aware spread operator to count emoji as single characters, unlike JavaScript\'s built-in .length which counts many emoji as 2 due to UTF-16 surrogate pairs.' },
        { question: 'How do I check string length for a database column?', answer: 'Use the UTF-8 Bytes count for databases using UTF-8 encoding (most modern databases), or the Characters count for databases configured with character-based limits like PostgreSQL VARCHAR(n).' },
        { question: 'What is URL-encoded length used for?', answer: 'URL-encoded length tells you how many characters your string will occupy when placed in a URL query parameter. Non-ASCII characters and special characters are percent-encoded, making the URL-encoded version significantly longer than the original.' },
      ]}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
        {[
          { label: 'Characters', value: stats.charCount },
          { label: 'UTF-8 Bytes', value: stats.byteLength },
          { label: 'UTF-16 Length', value: stats.utf16Length },
          { label: 'Words', value: stats.wordCount },
          { label: 'Lines', value: stats.lineCount },
          { label: 'URL-Encoded', value: stats.urlEncodedLength },
          { label: 'Base64', value: stats.base64Length },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-lg bg-muted text-center">
            <div className="text-xl font-bold text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Input Text</span>
        <ClearButton onClear={() => setInput('')} />
      </div>
      <ToolTextarea value={input} onChange={setInput} placeholder="Enter or paste text to analyze..." rows={10} />
    </ToolPage>
  )
}
