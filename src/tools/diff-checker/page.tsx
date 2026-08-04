'use client'

import { useState, useMemo } from 'react'
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

function computeDiff(textA: string, textB: string): DiffLine[] {
  const linesA = textA.split('\n')
  const linesB = textB.split('\n')
  const dp = computeLCS(linesA, linesB)

  const result: DiffLine[] = []
  let i = linesA.length
  let j = linesB.length

  const stack: DiffLine[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
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

export default function DiffCheckerTool() {
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [viewMode, setViewMode] = useState<'unified' | 'side-by-side'>('unified')
  const [diffMode, setDiffMode] = useState<'line' | 'word'>('line')

  const diff = useMemo(() => computeDiff(textA, textB), [textA, textB])

  const stats = useMemo(() => {
    let added = 0, removed = 0, unchanged = 0
    for (const line of diff) {
      if (line.type === 'added') added++
      else if (line.type === 'removed') removed++
      else unchanged++
    }
    return { added, removed, unchanged, changed: Math.min(added, removed) }
  }, [diff])

  const clear = () => { setTextA(''); setTextB('') }

  const hasDiff = textA || textB

  return (
    <ToolPage title="Diff Checker" description="Compare two texts with unified or side-by-side diff view. Line-level and word-level modes." category="developer" categoryLabel="Developer Tools">
      <div className="space-y-4">
        {/* Input areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Original Text</span>
              <ClearButton onClear={clear} />
            </div>
            <ToolTextarea value={textA} onChange={setTextA} placeholder="Paste original text here..." rows={10} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Modified Text</span>
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
                {diff.map((line, idx) => (
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
                ))}
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
                {diff.map((line, idx) => {
                  if (diffMode === 'word' && line.type !== 'unchanged') {
                    // For word diff, find paired add/remove
                    const isRemoved = line.type === 'removed'
                    const isAdded = line.type === 'added'

                    if (isRemoved) {
                      // Find matching added line nearby
                      const nextAdded = diff.slice(idx + 1).find((l) => l.type === 'added')
                      if (nextAdded) {
                        const wordDiff = computeWordDiff(line.content, nextAdded.content)
                        return (
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
                      }
                    }
                    if (isAdded) {
                      // Check if already rendered with previous removed
                      const prevRemoved = diff.slice(0, idx).reverse().find((l) => l.type === 'removed')
                      if (prevRemoved) return null
                    }
                  }

                  return (
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
