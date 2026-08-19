'use client'

import { useState, useCallback } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function ScientificCalculatorTool() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([])
  const [angleMode, setAngleMode] = useState<'RAD' | 'DEG'>('RAD')
  const [memory, setMemory] = useState(0)

  const safeEval = useCallback((expr: string): string => {
    try {
      // Replace display symbols with JS-evaluable equivalents
      let sanitized = expr
        .replace(/\u00D7/g, '*')
        .replace(/\u00F7/g, '/')
        .replace(/\u03C0/g, `(${Math.PI})`)
        .replace(/\be\b/g, `(${Math.E})`)
        .replace(/\^/g, '**')
        .replace(/(\d+)!/g, (_match, n) => {
          let f = 1
          for (let i = 2; i <= parseInt(n); i++) f *= i
          return f.toString()
        })

      // Handle trig functions with degree conversion
      if (angleMode === 'DEG') {
        sanitized = sanitized
          .replace(/sin\(([^)]+)\)/g, (_m, arg) => `Math.sin((${arg})*Math.PI/180)`)
          .replace(/cos\(([^)]+)\)/g, (_m, arg) => `Math.cos((${arg})*Math.PI/180)`)
          .replace(/tan\(([^)]+)\)/g, (_m, arg) => `Math.tan((${arg})*Math.PI/180)`)
          .replace(/asin\(([^)]+)\)/g, (_m, arg) => `(Math.asin(${arg})*180/Math.PI)`)
          .replace(/acos\(([^)]+)\)/g, (_m, arg) => `(Math.acos(${arg})*180/Math.PI)`)
          .replace(/atan\(([^)]+)\)/g, (_m, arg) => `(Math.atan(${arg})*180/Math.PI)`)
      } else {
        sanitized = sanitized
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/asin\(/g, 'Math.asin(')
          .replace(/acos\(/g, 'Math.acos(')
          .replace(/atan\(/g, 'Math.atan(')
      }

      sanitized = sanitized
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')

      // Security: only allow safe characters
      if (!/^[0-9+\-*/.() ,Mathesincotaglqrbp\s]*$/.test(sanitized)) {
        return 'Error'
      }

      const fn = new Function(`"use strict"; return (${sanitized})`)
      const res = fn()
      if (typeof res !== 'number' || !isFinite(res)) return 'Error'
      // Format nicely
      return Number.isInteger(res) ? res.toString() : parseFloat(res.toPrecision(12)).toString()
    } catch {
      return 'Error'
    }
  }, [])

  const handleButton = (val: string) => {
    switch (val) {
      case 'C':
        setExpression('')
        setResult('')
        break
      case 'CE':
        setExpression((prev) => prev.slice(0, -1))
        break
      case '=': {
        const res = safeEval(expression)
        setResult(res)
        if (res !== 'Error') {
          setHistory((prev) => [{ expr: expression, result: res }, ...prev].slice(0, 10))
        }
        break
      }
      case 'ANS':
        if (history.length > 0) {
          setExpression((prev) => prev + history[0].result)
        }
        break
      case 'M+': {
        const currentVal = parseFloat(result)
        if (!isNaN(currentVal)) setMemory((prev) => prev + currentVal)
        break
      }
      case 'M-': {
        const currentVal2 = parseFloat(result)
        if (!isNaN(currentVal2)) setMemory((prev) => prev - currentVal2)
        break
      }
      case 'MR':
        setExpression((prev) => prev + memory.toString())
        break
      case 'MC':
        setMemory(0)
        break
      default:
        setExpression((prev) => prev + val)
        break
    }
  }

  // Button grid layout
  const buttons: { label: string; value: string; className?: string }[][] = [
    [
      { label: 'M+', value: 'M+', className: 'text-xs bg-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/30' },
      { label: 'M-', value: 'M-', className: 'text-xs bg-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/30' },
      { label: 'MR', value: 'MR', className: 'text-xs bg-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/30' },
      { label: 'MC', value: 'MC', className: 'text-xs bg-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/30' },
      { label: 'ANS', value: 'ANS', className: 'text-xs bg-muted/80 hover:bg-muted' },
    ],
    [
      { label: 'sin', value: 'sin(' },
      { label: 'cos', value: 'cos(' },
      { label: 'tan', value: 'tan(' },
      { label: 'log', value: 'log(' },
      { label: 'ln', value: 'ln(' },
    ],
    [
      { label: '\u221A', value: 'sqrt(' },
      { label: 'x\u00B2', value: '^2' },
      { label: 'x^y', value: '^' },
      { label: '\u03C0', value: '\u03C0' },
      { label: 'e', value: 'e' },
    ],
    [
      { label: '(', value: '(' },
      { label: ')', value: ')' },
      { label: 'CE', value: 'CE', className: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30' },
      { label: 'C', value: 'C', className: 'bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30' },
      { label: '\u00F7', value: '\u00F7', className: 'bg-primary/20 text-primary hover:bg-primary/30' },
    ],
    [
      { label: '7', value: '7' },
      { label: '8', value: '8' },
      { label: '9', value: '9' },
      { label: '\u00D7', value: '\u00D7', className: 'bg-primary/20 text-primary hover:bg-primary/30' },
      { label: '!', value: '!' },
    ],
    [
      { label: '4', value: '4' },
      { label: '5', value: '5' },
      { label: '6', value: '6' },
      { label: '-', value: '-', className: 'bg-primary/20 text-primary hover:bg-primary/30' },
      { label: '%', value: '/100' },
    ],
    [
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' },
      { label: '+', value: '+', className: 'bg-primary/20 text-primary hover:bg-primary/30' },
      { label: 'abs', value: 'abs(' },
    ],
    [
      { label: '0', value: '0', className: 'col-span-2' },
      { label: '.', value: '.' },
      { label: '=', value: '=', className: 'col-span-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold' },
    ],
  ]

  return (
    <ToolPage
      title="Scientific Calculator"
      description="A full-featured scientific calculator with trigonometric, logarithmic, and power functions."
      category="math"
      categoryLabel="Math & Science"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Scientific Calculator is a free browser-based tool that lets you perform advanced mathematical operations including trigonometry, logarithms, exponents, factorials, and constants like pi and e. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter the required numeric values or expressions in the input fields.</li>
            <li>Select the operation or calculation type if multiple options exist.</li>
            <li>View the result, intermediate steps, and any visual representations.</li>
            <li>Copy the result for use in your work, assignments, or reports.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when academic math, engineering calculations, physics problems, or any computation requiring advanced mathematical functions. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this mathematics tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Results are calculated to high precision but displayed values may be rounded for readability.</li>
            <li>For scientific notation, the tool handles very large and very small numbers correctly.</li>
            <li>Double-check results for critical calculations — this tool is an aid, not a replacement for professional verification.</li>
            <li>The calculator supports standard mathematical operations and common constants like pi and e.</li>
            <li>All computation runs locally in your browser with no server dependency.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'What functions does this scientific calculator support?', answer: 'It supports sin, cos, tan and their inverses, log (base 10), ln (natural log), square root, exponents, factorials, absolute value, and constants like pi and e.' },
        { question: 'Are trigonometric functions calculated in degrees or radians?', answer: 'The calculator uses radians by default, which is the standard for JavaScript math functions. To use degrees, multiply your angle by (pi/180) before applying the trig function.' },
        { question: 'What does the ANS button do?', answer: 'The ANS button inserts the result of your most recent calculation into the current expression, allowing you to chain calculations without retyping previous results.' },
        { question: 'Does the calculator keep a history of my calculations?', answer: 'Yes, the last 10 calculations are shown in the history section below the calculator. You can click any previous result to reuse it in a new expression.' },
      ]}
    >
      <div className="max-w-md mx-auto">
        {/* DEG/RAD Toggle & Memory */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAngleMode(angleMode === 'RAD' ? 'DEG' : 'RAD')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border bg-card hover:bg-muted transition-colors"
            >
              {angleMode}
            </button>
            {memory !== 0 && (
              <span className="text-xs text-violet-600 dark:text-violet-400 font-mono">M={memory}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {angleMode === 'DEG' ? 'Degrees' : 'Radians'}
          </span>
        </div>

        {/* Display */}
        <div className="bg-muted/50 rounded-xl border border-border p-4 mb-4">
          <div className="text-right min-h-[1.5rem] text-sm text-muted-foreground font-mono break-all">
            {expression || '\u00A0'}
          </div>
          <div className="text-right text-3xl font-bold font-mono mt-1 break-all min-h-[2.5rem]">
            {result || '0'}
          </div>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-5 gap-1.5">
          {buttons.flat().map((btn, i) => {
            const isWide = btn.className?.includes('col-span-2')
            return (
              <button
                key={`${btn.label}-${i}`}
                onClick={() => handleButton(btn.value)}
                className={`h-12 rounded-lg font-medium text-sm transition-colors border border-border
                  ${btn.className || 'bg-card hover:bg-muted'}
                  ${isWide ? '' : ''}
                `}
                style={isWide ? { gridColumn: 'span 2' } : undefined}
              >
                {btn.label}
              </button>
            )
          })}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">History</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setExpression(h.result); setResult('') }}
                  className="w-full flex justify-between p-2 rounded-lg text-sm bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                  <span className="text-muted-foreground font-mono truncate">{h.expr}</span>
                  <span className="font-mono font-medium ml-2">= {h.result}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}
