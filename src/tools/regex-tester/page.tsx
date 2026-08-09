'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

interface MatchInfo {
  fullMatch: string
  index: number
  groups: string[]
}

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState('')
  const [testString, setTestString] = useState('')
  const [flagG, setFlagG] = useState(true)
  const [flagI, setFlagI] = useState(false)
  const [flagM, setFlagM] = useState(false)
  const [flagS, setFlagS] = useState(false)

  const { matches, error, highlighted } = useMemo(() => {
    if (!pattern || !testString) return { matches: [] as MatchInfo[], error: '', highlighted: testString }
    try {
      const flags = (flagG ? 'g' : '') + (flagI ? 'i' : '') + (flagM ? 'm' : '') + (flagS ? 's' : '')
      const regex = new RegExp(pattern, flags)
      const matchList: MatchInfo[] = []

      if (flagG) {
        let m: RegExpExecArray | null
        while ((m = regex.exec(testString)) !== null) {
          matchList.push({
            fullMatch: m[0],
            index: m.index,
            groups: m.slice(1),
          })
          if (m[0].length === 0) regex.lastIndex++ // prevent infinite loop
        }
      } else {
        const m = regex.exec(testString)
        if (m) {
          matchList.push({
            fullMatch: m[0],
            index: m.index,
            groups: m.slice(1),
          })
        }
      }

      // Build highlighted text
      let hl = ''
      let lastIdx = 0
      for (const match of matchList) {
        hl += testString.slice(lastIdx, match.index)
        hl += `\u00AB${match.fullMatch}\u00BB`
        lastIdx = match.index + match.fullMatch.length
      }
      hl += testString.slice(lastIdx)

      return { matches: matchList, error: '', highlighted: hl }
    } catch (e) {
      return { matches: [] as MatchInfo[], error: e instanceof Error ? e.message : 'Invalid regex', highlighted: testString }
    }
  }, [pattern, testString, flagG, flagI, flagM, flagS])

  return (
    <ToolPage
      title="Regex Tester"
      description="Test regular expressions with real-time matching, capture groups, and flag options."
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is a Regex Tester?</h2>
          <p>
            A regex tester is a tool that lets you write a regular expression pattern, apply it against sample text, and immediately see which parts of the text match. Regular expressions (regex) are a powerful pattern-matching language supported by virtually every programming language, text editor, and command-line utility. They are used for input validation, search-and-replace operations, log parsing, data extraction, and much more. Despite their power, regex syntax can be cryptic, so a live tester with instant visual feedback dramatically speeds up the authoring and debugging process.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Type your regular expression into the <strong>Pattern</strong> field. The delimiters <code>/</code> are shown for context but you do not need to type them.</li>
            <li>Toggle the <strong>flags</strong> you need: <code>g</code> (global — find all matches), <code>i</code> (case-insensitive), <code>m</code> (multiline — <code>^</code>/<code>$</code> match line boundaries), and <code>s</code> (dotall — <code>.</code> matches newlines).</li>
            <li>Paste or type your <strong>test string</strong> in the text area below.</li>
            <li>Matches appear in real time. The <strong>Highlighted Matches</strong> panel wraps each match in guillemets (<code>«»</code>), and the <strong>Match Details</strong> panel lists every match with its index position and any capture groups.</li>
            <li>Iterate on your pattern until the matches are exactly what you expect, then copy the pattern into your code.</li>
          </ol>

          <h2>When to Use a Regex Tester</h2>
          <p>
            Use this tool whenever you need to validate an email format, extract numbers from a log file, split a CSV line respecting quoted fields, or build a URL-routing pattern. It is especially valuable when working with complex patterns involving lookaheads, lookbehinds, or nested groups, where a small typo can change the meaning entirely. Testing on utilsnow.com before deploying saves you from subtle bugs in production.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Start simple. Build your pattern piece by piece, verifying each addition matches the right text before adding the next token.</li>
            <li>Use <strong>capture groups</strong> <code>()</code> deliberately. Every group adds overhead; use non-capturing groups <code>(?:)</code> when you only need grouping, not extraction.</li>
            <li>Be mindful of <strong>greedy vs. lazy</strong> quantifiers. <code>.*</code> matches as much as possible; <code>.*?</code> matches as little as possible. Choosing the wrong one is a common source of bugs.</li>
            <li>This tool uses <strong>JavaScript regex syntax</strong>. Most patterns transfer directly to Python, Java, and Go, but features like <code>\p&#123;L&#125;</code> (Unicode categories) or possessive quantifiers may differ across engines.</li>
            <li>Anchor your patterns with <code>^</code> and <code>$</code> when validating entire strings to prevent partial matches from slipping through.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What do the regex flags (g, i, m, s) mean?', answer: 'g (global) finds all matches, i (case insensitive) ignores letter casing, m (multiline) makes ^ and $ match line starts/ends, and s (dotall) makes the dot (.) match newline characters as well.' },
        { question: 'What are capture groups in regex?', answer: 'Capture groups are parts of a pattern enclosed in parentheses, e.g., (\\d+). They let you extract specific portions of a match, which this tool displays in the Match Details panel.' },
        { question: 'Why does my regex cause an infinite loop?', answer: 'This usually happens when a global regex matches an empty string (e.g., pattern "a*"). This tool automatically advances past empty matches to prevent infinite loops.' },
        { question: 'Does this regex tester work with all programming languages?', answer: 'This tool uses JavaScript regular expression syntax. Most basic patterns work across languages, but advanced features like lookbehinds or named groups may differ in Python, Java, or other languages.' },
      ]}
    >
      <div className="space-y-4">
        {/* Pattern input */}
        <div>
          <label className="text-sm font-medium block mb-1">Pattern</label>
          <div className="flex gap-2 items-center">
            <span className="text-muted-foreground font-mono">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              className="flex-1 px-3 py-2 text-sm font-mono rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground font-mono">/</span>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-3">
          {[
            { flag: 'g', label: 'Global', checked: flagG, set: setFlagG },
            { flag: 'i', label: 'Case Insensitive', checked: flagI, set: setFlagI },
            { flag: 'm', label: 'Multiline', checked: flagM, set: setFlagM },
            { flag: 's', label: 'Dotall', checked: flagS, set: setFlagS },
          ].map((f) => (
            <label key={f.flag} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={f.checked} onChange={(e) => f.set(e.target.checked)} className="rounded border-border" />
              <code className="text-xs bg-muted px-1 rounded">{f.flag}</code>
              {f.label}
            </label>
          ))}
        </div>

        {/* Test string */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Test String</span>
            <ClearButton onClear={() => { setTestString(''); setPattern('') }} />
          </div>
          <ToolTextarea value={testString} onChange={setTestString} placeholder="Enter text to test against..." rows={6} />
        </div>

        {/* Results */}
        {pattern && testString && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium block mb-2">
                Highlighted Matches ({matches.length} match{matches.length !== 1 ? 'es' : ''})
              </span>
              <div className="p-3 rounded-lg bg-muted font-mono text-sm whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
                {highlighted}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium block mb-2">Match Details</span>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {matches.length === 0 && (
                  <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">No matches found</div>
                )}
                {matches.map((m, i) => (
                  <div key={i} className="p-2 rounded-lg bg-muted text-sm">
                    <div className="font-mono">
                      <span className="text-muted-foreground">Match {i + 1} </span>
                      <span className="text-xs text-muted-foreground">(index {m.index})</span>
                      : <span className="text-primary font-medium">&quot;{m.fullMatch}&quot;</span>
                    </div>
                    {m.groups.length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {m.groups.map((g, gi) => (
                          <span key={gi} className="mr-2">Group {gi + 1}: <span className="text-foreground">&quot;{g}&quot;</span></span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
