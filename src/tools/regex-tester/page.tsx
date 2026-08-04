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
