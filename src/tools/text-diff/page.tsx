'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, ClearButton } from '@/components/tool-page'

interface DiffLine {
  type: 'equal' | 'added' | 'removed'
  text: string
  leftNum?: number
  rightNum?: number
}

function computeDiff(text1: string, text2: string): DiffLine[] {
  const lines1 = text1.split('\n')
  const lines2 = text2.split('\n')

  const m = lines1.length
  const n = lines2.length

  // LCS using dynamic programming
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find diff
  const result: DiffLine[] = []
  let i = m, j = n

  const stack: DiffLine[] = []
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      stack.push({ type: 'equal', text: lines1[i - 1], leftNum: i, rightNum: j })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'added', text: lines2[j - 1], rightNum: j })
      j--
    } else if (i > 0) {
      stack.push({ type: 'removed', text: lines1[i - 1], leftNum: i })
      i--
    }
  }

  // Reverse since we built it backwards
  for (let k = stack.length - 1; k >= 0; k--) {
    result.push(stack[k])
  }

  return result
}

export default function TextDiffTool() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [showDiff, setShowDiff] = useState(false)

  const diff = useMemo(() => {
    if (!showDiff) return []
    return computeDiff(left, right)
  }, [left, right, showDiff])

  const stats = useMemo(() => {
    const added = diff.filter(d => d.type === 'added').length
    const removed = diff.filter(d => d.type === 'removed').length
    const unchanged = diff.filter(d => d.type === 'equal').length
    return { added, removed, unchanged }
  }, [diff])

  const clear = () => { setLeft(''); setRight(''); setShowDiff(false) }

  return (
    <ToolPage title="Text Diff Checker" description="Compare two texts side by side and highlight differences" category="developer" categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Text Diff is a free browser-based tool that lets you compare two text inputs and visualize the differences with highlighted additions and deletions. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when reviewing document changes, comparing code versions, verifying edits in configuration files, or validating content updates. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this development tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need text comparison.</li>
          </ul>
        </>
      }
 faqs={[{ question: 'What is a text diff checker?', answer: 'A diff checker compares two pieces of text and highlights the exact lines and words that differ between them, making it easy to spot changes.' }, { question: 'How does the diff algorithm work?', answer: 'It uses a longest common subsequence (LCS) algorithm to find the minimal set of additions, deletions, and modifications between two texts.' }, { question: 'Can I compare code with this tool?', answer: 'Yes. This diff checker works with any text including source code, configuration files, and documents. It preserves whitespace and indentation for accurate code comparison.' }, { question: 'Is my text data safe?', answer: 'Yes. All comparison happens locally in your browser. Your text is never uploaded to any server.' }]}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Original Text</span>
            <ClearButton onClear={clear} />
          </div>
          <ToolTextarea value={left} onChange={(v) => { setLeft(v); setShowDiff(false) }} placeholder="Paste original text here..." rows={10} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Modified Text</span>
          </div>
          <ToolTextarea value={right} onChange={(v) => { setRight(v); setShowDiff(false) }} placeholder="Paste modified text here..." rows={10} />
        </div>
      </div>

      <button
        onClick={() => setShowDiff(true)}
        className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Compare
      </button>

      {showDiff && (
        <div className="mt-4">
          <div className="flex gap-4 mb-3 text-sm">
            <span className="text-green-600 dark:text-green-400">+ {stats.added} added</span>
            <span className="text-red-600 dark:text-red-400">- {stats.removed} removed</span>
            <span className="text-muted-foreground">{stats.unchanged} unchanged</span>
          </div>

          {diff.length === 0 && left === '' && right === '' ? (
            <div className="text-sm text-muted-foreground p-4 text-center">Enter text in both fields and click Compare</div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-sm font-mono border-collapse">
                  <tbody>
                    {diff.map((line, idx) => (
                      <tr
                        key={idx}
                        className={
                          line.type === 'added'
                            ? 'bg-green-500/10'
                            : line.type === 'removed'
                            ? 'bg-red-500/10'
                            : ''
                        }
                      >
                        <td className="w-12 text-right pr-2 pl-2 text-muted-foreground select-none border-r border-border py-0.5">
                          {line.leftNum ?? ''}
                        </td>
                        <td className="w-12 text-right pr-2 pl-2 text-muted-foreground select-none border-r border-border py-0.5">
                          {line.rightNum ?? ''}
                        </td>
                        <td className="w-6 text-center select-none py-0.5">
                          {line.type === 'added' ? (
                            <span className="text-green-600 dark:text-green-400 font-bold">+</span>
                          ) : line.type === 'removed' ? (
                            <span className="text-red-600 dark:text-red-400 font-bold">-</span>
                          ) : (
                            <span className="text-muted-foreground">&nbsp;</span>
                          )}
                        </td>
                        <td className="px-2 py-0.5 whitespace-pre-wrap break-all">
                          {line.text || '\u00A0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolPage>
  )
}
