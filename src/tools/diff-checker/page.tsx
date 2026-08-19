'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  leftNum: number | null
  rightNum: number | null
  content: string
}

function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp
}

function normalizeWhitespace(line: string): string {
  return line.replace(/\s+/g, ' ').trim()
}

function computeDiff(textA: string, textB: string, ignoreWhitespace: boolean): DiffLine[] {
  const linesA = textA.split('\n')
  const linesB = textB.split('\n')

  // For comparison, optionally normalize whitespace; display original lines
  const cmpA = ignoreWhitespace ? linesA.map(normalizeWhitespace) : linesA
  const cmpB = ignoreWhitespace ? linesB.map(normalizeWhitespace) : linesB

  const dp = computeLCS(cmpA, cmpB)

  const result: DiffLine[] = []
  let i = linesA.length
  let j = linesB.length

  const stack: DiffLine[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && cmpA[i - 1] === cmpB[j - 1]) {
      stack.push({ type: 'unchanged', leftNum: i, rightNum: j, content: linesA[i - 1] })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'added', leftNum: null, rightNum: j, content: linesB[j - 1] })
      j--
    } else if (i > 0) {
      stack.push({ type: 'removed', leftNum: i, rightNum: null, content: linesA[i - 1] })
      i--
    }
  }

  // Reverse to get correct order
  while (stack.length) result.push(stack.pop()!)

  return result
}

function computeWordDiff(lineA: string, lineB: string): { left: { text: string; highlight: boolean }[]; right: { text: string; highlight: boolean }[] } {
  const wordsA = lineA.split(/(\s+)/)
  const wordsB = lineB.split(/(\s+)/)
  const dp = computeLCS(wordsA, wordsB)

  const leftResult: { text: string; highlight: boolean }[] = []
  const rightResult: { text: string; highlight: boolean }[] = []

  let i = wordsA.length
  let j = wordsB.length

  const leftStack: { text: string; highlight: boolean }[] = []
  const rightStack: { text: string; highlight: boolean }[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      leftStack.push({ text: wordsA[i - 1], highlight: false })
      rightStack.push({ text: wordsB[j - 1], highlight: false })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rightStack.push({ text: wordsB[j - 1], highlight: true })
      j--
    } else if (i > 0) {
      leftStack.push({ text: wordsA[i - 1], highlight: true })
      i--
    }
  }

  while (leftStack.length) leftResult.push(leftStack.pop()!)
  while (rightStack.length) rightResult.push(rightStack.pop()!)

  return { left: leftResult, right: rightResult }
}

const FILE_ACCEPT = ".txt,.json,.csv,.xml,.html,.css,.js,.ts,.py,.md"
const COLLAPSE_THRESHOLD = 5

interface CollapsedSection {
  startIdx: number
  endIdx: number
  count: number
}

function getCollapsedSections(diff: DiffLine[]): CollapsedSection[] {
  const sections: CollapsedSection[] = []
  let runStart = -1
  let runLength = 0

  for (let i = 0; i <= diff.length; i++) {
    if (i < diff.length && diff[i].type === 'unchanged') {
      if (runStart === -1) runStart = i
      runLength++
    } else {
      if (runLength > COLLAPSE_THRESHOLD) {
        sections.push({ startIdx: runStart, endIdx: runStart + runLength - 1, count: runLength })
      }
      runStart = -1
      runLength = 0
    }
  }
  return sections
}

export default function DiffCheckerTool() {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [viewMode, setViewMode] = useState<'unified' | 'side-by-side'>('unified')
  const [diffMode, setDiffMode] = useState<'line' | 'word'>('line')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())

  const fileInputA = useRef<HTMLInputElement>(null)
  const fileInputB = useRef<HTMLInputElement>(null)

  const diff = useMemo(() => {
    setExpandedSections(new Set())
    return computeDiff(textA, textB, ignoreWhitespace)
  }, [textA, textB, ignoreWhitespace])

  const collapsedSections = useMemo(() => getCollapsedSections(diff), [diff])

  const stats = useMemo(() => {
    let added = 0, removed = 0, unchanged = 0
    for (const line of diff) {
      if (line.type === 'added') added++
      else if (line.type === 'removed') removed++
      else unchanged++
    }
    return { added, removed, unchanged, changed: Math.min(added, removed) }
  }, [diff])

  const clear = () => { setTextA(''); setTextB(''); setExpandedSections(new Set()) }

  const handleFileUpload = useCallback((side: 'a' | 'b') => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result as string
        if (side === 'a') setTextA(content)
        else setTextB(content)
      }
      reader.readAsText(file)
      e.target.value = ''
    }
  }, [])

  const toggleSection = useCallback((startIdx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(startIdx)) next.delete(startIdx)
      else next.add(startIdx)
      return next
    })
  }, [])

  // Build a set of indices that are collapsed
  const isCollapsed = useCallback((idx: number): { collapsed: boolean; section: CollapsedSection | null; isFirst: boolean } => {
    for (const section of collapsedSections) {
      if (!expandedSections.has(section.startIdx) && idx >= section.startIdx && idx <= section.endIdx) {
        return { collapsed: true, section, isFirst: idx === section.startIdx }
      }
    }
    return { collapsed: false, section: null, isFirst: false }
  }, [collapsedSections, expandedSections])

  const hasDiff = textA || textB

  const renderDiffRows = (viewType: 'unified' | 'side-by-side') => {
    const rows: React.ReactNode[] = []
    for (let idx = 0; idx < diff.length; idx++) {
      const line = diff[idx]
      const collapseInfo = isCollapsed(idx)

      if (collapseInfo.collapsed) {
        if (collapseInfo.isFirst && collapseInfo.section) {
          const section = collapseInfo.section
          if (viewType === 'unified') {
            rows.push(
              <tr key={`collapse-${idx}`} className="bg-muted/50">
                <td colSpan={4} className="px-4 py-1.5 text-center">
                  <button
                    onClick={() => toggleSection(section.startIdx)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    &#x2193; ... {section.count} unchanged lines ... &#x2193;
                  </button>
                </td>
              </tr>
            )
          } else {
            rows.push(
              <tr key={`collapse-${idx}`} className="bg-muted/50">
                <td colSpan={2} className="px-4 py-1.5 text-center">
                  <button
                    onClick={() => toggleSection(section.startIdx)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    &#x2193; ... {section.count} unchanged lines ... &#x2193;
                  </button>
                </td>
              </tr>
            )
          }
        }
        continue
      }

      if (viewType === 'unified') {
        rows.push(
          <tr key={idx} className={
            line.type === 'added' ? 'bg-green-500/10' :
            line.type === 'removed' ? 'bg-red-500/10' : ''
          }>
            <td className="px-2 py-0.5 text-muted-foreground select-none w-10 text-right border-r border-border">
              {line.leftNum || ''}
            </td>
            <td className="px-2 py-0.5 text-muted-foreground select-none w-10 text-right border-r border-border">
              {line.rightNum || ''}
            </td>
            <td className="px-1 py-0.5 select-none w-4 text-center font-bold">
              {line.type === 'added' ? <span className="text-green-600 dark:text-green-400">+</span> :
               line.type === 'removed' ? <span className="text-red-600 dark:text-red-400">-</span> : ' '}
            </td>
            <td className="px-2 py-0.5 whitespace-pre">{line.content || ' '}</td>
          </tr>
        )
      } else {
        // Side-by-side
        if (diffMode === 'word' && line.type !== 'unchanged') {
          const isRemoved = line.type === 'removed'
          const isAdded = line.type === 'added'

          if (isRemoved) {
            const nextAdded = diff.slice(idx + 1).find((l) => l.type === 'added')
            if (nextAdded) {
              const wordDiff = computeWordDiff(line.content, nextAdded.content)
              rows.push(
                <tr key={idx}>
                  <td className="px-2 py-0.5 border-r border-border bg-red-500/10 whitespace-pre">
                    <span className="text-muted-foreground mr-2 select-none">{line.leftNum}</span>
                    {wordDiff.left.map((w, wi) => (
                      <span key={wi} className={w.highlight ? 'bg-red-500/30 rounded' : ''}>{w.text}</span>
                    ))}
                  </td>
                  <td className="px-2 py-0.5 bg-green-500/10 whitespace-pre">
                    <span className="text-muted-foreground mr-2 select-none">{nextAdded.rightNum}</span>
                    {wordDiff.right.map((w, wi) => (
                      <span key={wi} className={w.highlight ? 'bg-green-500/30 rounded' : ''}>{w.text}</span>
                    ))}
                  </td>
                </tr>
              )
              continue
            }
          }
          if (isAdded) {
            const prevRemoved = diff.slice(0, idx).reverse().find((l) => l.type === 'removed')
            if (prevRemoved) continue
          }
        }

        rows.push(
          <tr key={idx}>
            <td className={`px-2 py-0.5 border-r border-border whitespace-pre ${line.type === 'removed' ? 'bg-red-500/10' : ''}`}>
              {line.type !== 'added' && (
                <>
                  <span className="text-muted-foreground mr-2 select-none">{line.leftNum}</span>
                  {line.content}
                </>
              )}
            </td>
            <td className={`px-2 py-0.5 whitespace-pre ${line.type === 'added' ? 'bg-green-500/10' : ''}`}>
              {line.type !== 'removed' && (
                <>
                  <span className="text-muted-foreground mr-2 select-none">{line.rightNum}</span>
                  {line.content}
                </>
              )}
            </td>
          </tr>
        )
      }
    }
    return rows
  }

  return (
    <ToolPage
      title="Diff Checker"
      description="Compare two texts with unified or side-by-side diff view. Line-level and word-level modes."
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Diff Checker is a free browser-based tool that lets you compare two pieces of text or code side-by-side and highlight additions, deletions, and changes between them. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when reviewing code changes, comparing document versions, verifying configuration edits, or debugging unexpected content changes. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>For large inputs, the tool processes data efficiently in your browser but very large files may take a moment.</li>
            <li>Use keyboard shortcuts like Ctrl+A to select all output text before copying.</li>
            <li>The tool preserves your data types and structure during conversion or formatting.</li>
            <li>Compare the formatted output with the original to verify no data was altered.</li>
            <li>All processing is client-side — safe for use with proprietary or sensitive code.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What is the difference between unified and side-by-side diff view?', answer: 'Unified view shows changes in a single column with + and - markers, while side-by-side view displays the original and modified text in separate columns for easier visual comparison.' },
        { question: 'What is the difference between line diff and word diff?', answer: 'Line diff highlights entire lines that changed, while word diff highlights the specific words within each line that are different, making small edits much easier to spot.' },
        { question: 'Can I use this to compare code files?', answer: 'Yes, paste the contents of any two text files or code snippets and the tool will show all additions, deletions, and unchanged lines with line numbers, just like a Git diff.' },
        { question: 'How does the diff algorithm work?', answer: 'It uses the Longest Common Subsequence (LCS) algorithm to find the optimal alignment between the two texts, minimizing the number of reported changes.' },
      ]}
    >
      <div className="space-y-4">
        {/* Input areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Original Text</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputA.current?.click()}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors"
                >
                  Upload File
                </button>
                <input ref={fileInputA} type="file" accept={FILE_ACCEPT} onChange={handleFileUpload('a')} className="hidden" />
                <ClearButton onClear={clear} />
              </div>
            </div>
            <ToolTextarea value={textA} onChange={setTextA} placeholder="Paste original text here..." rows={10} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Modified Text</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputB.current?.click()}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors"
                >
                  Upload File
                </button>
                <input ref={fileInputB} type="file" accept={FILE_ACCEPT} onChange={handleFileUpload('b')} className="hidden" />
              </div>
            </div>
            <ToolTextarea value={textB} onChange={setTextB} placeholder="Paste modified text here..." rows={10} />
          </div>
        </div>

        {/* Controls */}
        {hasDiff && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button onClick={() => setViewMode('unified')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'unified' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Unified</button>
              <button onClick={() => setViewMode('side-by-side')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'side-by-side' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Side-by-Side</button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDiffMode('line')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${diffMode === 'line' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Line Diff</button>
              <button onClick={() => setDiffMode('word')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${diffMode === 'word' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Word Diff</button>
            </div>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded accent-primary"
              />
              Ignore whitespace
            </label>
            <div className="flex gap-3 text-sm">
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">+{stats.added} added</span>
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400">-{stats.removed} removed</span>
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">{stats.unchanged} unchanged</span>
            </div>
          </div>
        )}

        {/* Unified Diff View */}
        {hasDiff && viewMode === 'unified' && (
          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <tbody>
                {renderDiffRows('unified')}
              </tbody>
            </table>
          </div>
        )}

        {/* Side-by-Side View */}
        {hasDiff && viewMode === 'side-by-side' && (
          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-muted">
                  <th className="px-2 py-1 text-left font-medium w-1/2 border-r border-border">Original</th>
                  <th className="px-2 py-1 text-left font-medium w-1/2">Modified</th>
                </tr>
              </thead>
              <tbody>
                {renderDiffRows('side-by-side')}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
