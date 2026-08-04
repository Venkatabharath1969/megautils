'use client'

import { useState, useCallback } from 'react'
import { ToolPage } from '@/components/tool-page'

export default function ScientificCalculatorTool() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('')
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([])

  const safeEval = useCallback((expr: string): string => {
    try {
      // Replace display symbols with JS-evaluable equivalents
      let sanitized = expr
        .replace(/\u00D7/g, '*')
        .replace(/\u00F7/g, '/')
        .replace(/\u03C0/g, `(${Math.PI})`)
        .replace(/\be\b/g, `(${Math.E})`)
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/\^/g, '**')
        .replace(/(\d+)!/g, (_match, n) => {
          let f = 1
          for (let i = 2; i <= parseInt(n); i++) f *= i
          return f.toString()
        })

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
      default:
        setExpression((prev) => prev + val)
        break
    }
  }

  // Button grid layout
  const buttons: { label: string; value: string; className?: string }[][] = [
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
      { label: 'ANS', value: 'ANS', className: 'text-xs bg-muted/80 hover:bg-muted' },
    ],
    [
      { label: '4', value: '4' },
      { label: '5', value: '5' },
      { label: '6', value: '6' },
      { label: '-', value: '-', className: 'bg-primary/20 text-primary hover:bg-primary/30' },
      { label: '!', value: '!' },
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
    >
      <div className="max-w-md mx-auto">
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
