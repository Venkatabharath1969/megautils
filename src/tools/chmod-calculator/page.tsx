'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const PERMISSIONS = ['read', 'write', 'execute'] as const
const ENTITIES = ['owner', 'group', 'other'] as const

interface PermState {
  owner: [boolean, boolean, boolean]
  group: [boolean, boolean, boolean]
  other: [boolean, boolean, boolean]
}

function permToOctal(perms: [boolean, boolean, boolean]): number {
  return (perms[0] ? 4 : 0) + (perms[1] ? 2 : 0) + (perms[2] ? 1 : 0)
}

function octalToPerm(n: number): [boolean, boolean, boolean] {
  return [(n & 4) !== 0, (n & 2) !== 0, (n & 1) !== 0]
}

function permToSymbolic(perms: [boolean, boolean, boolean]): string {
  return (perms[0] ? 'r' : '-') + (perms[1] ? 'w' : '-') + (perms[2] ? 'x' : '-')
}

export default function ChmodCalculatorTool() {
  const [perms, setPerms] = useState<PermState>({
    owner: [true, true, true],
    group: [true, false, true],
    other: [true, false, true],
  })

  const [numericInput, setNumericInput] = useState('755')

  const octal = useMemo(() => {
    return `${permToOctal(perms.owner)}${permToOctal(perms.group)}${permToOctal(perms.other)}`
  }, [perms])

  const symbolic = useMemo(() => {
    return `-${permToSymbolic(perms.owner)}${permToSymbolic(perms.group)}${permToSymbolic(perms.other)}`
  }, [perms])

  const chmodCmd = useMemo(() => `chmod ${octal} filename`, [octal])

  const togglePerm = useCallback((entity: keyof PermState, permIdx: number) => {
    setPerms((prev) => {
      const newPerms = { ...prev }
      const entityPerms = [...prev[entity]] as [boolean, boolean, boolean]
      entityPerms[permIdx] = !entityPerms[permIdx]
      newPerms[entity] = entityPerms
      return newPerms
    })
  }, [])

  const applyNumeric = useCallback(() => {
    const cleaned = numericInput.replace(/\D/g, '').slice(0, 3)
    if (cleaned.length !== 3) return
    const digits = cleaned.split('').map(Number)
    if (digits.some((d) => d > 7)) return
    setPerms({
      owner: octalToPerm(digits[0]),
      group: octalToPerm(digits[1]),
      other: octalToPerm(digits[2]),
    })
  }, [numericInput])

  const presets = [
    { label: '755', desc: 'Standard directory/executable' },
    { label: '644', desc: 'Standard file' },
    { label: '777', desc: 'Full access (avoid!)' },
    { label: '700', desc: 'Owner only' },
    { label: '600', desc: 'Owner read/write only' },
    { label: '444', desc: 'Read-only for all' },
    { label: '666', desc: 'Read/write for all' },
    { label: '750', desc: 'Owner full, group read/execute' },
  ]

  const applyPreset = (preset: string) => {
    setNumericInput(preset)
    const digits = preset.split('').map(Number)
    setPerms({
      owner: octalToPerm(digits[0]),
      group: octalToPerm(digits[1]),
      other: octalToPerm(digits[2]),
    })
  }

  return (
    <ToolPage title="Chmod Calculator" description="Unix file permissions calculator. Toggle checkboxes or enter numeric permissions." category="developer" categoryLabel="Developer Tools">
      <div className="space-y-6">
        {/* Checkboxes Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium"></th>
                {PERMISSIONS.map((p) => (
                  <th key={p} className="text-center py-2 px-4 font-medium capitalize">{p}</th>
                ))}
                <th className="text-center py-2 px-4 font-medium">Octal</th>
                <th className="text-center py-2 px-4 font-medium">Symbolic</th>
              </tr>
            </thead>
            <tbody>
              {ENTITIES.map((entity) => (
                <tr key={entity} className="border-b border-border">
                  <td className="py-3 pr-4 font-medium capitalize">{entity}</td>
                  {PERMISSIONS.map((_, permIdx) => (
                    <td key={permIdx} className="text-center py-3 px-4">
                      <input
                        type="checkbox"
                        checked={perms[entity][permIdx]}
                        onChange={() => togglePerm(entity, permIdx)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-ring cursor-pointer"
                      />
                    </td>
                  ))}
                  <td className="text-center py-3 px-4 font-mono font-bold text-primary">{permToOctal(perms[entity])}</td>
                  <td className="text-center py-3 px-4 font-mono">{permToSymbolic(perms[entity])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="text-xs font-medium text-muted-foreground mb-1">Numeric</div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-mono text-primary">{octal}</span>
              <CopyButton text={octal} />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="text-xs font-medium text-muted-foreground mb-1">Symbolic</div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono">{symbolic}</span>
              <CopyButton text={symbolic} />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="text-xs font-medium text-muted-foreground mb-1">Command</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono">{chmodCmd}</span>
              <CopyButton text={chmodCmd} />
            </div>
          </div>
        </div>

        {/* Numeric Input */}
        <div>
          <label className="text-sm font-medium block mb-1">Enter Numeric Permissions</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={numericInput}
              onChange={(e) => setNumericInput(e.target.value)}
              maxLength={3}
              className="w-24 px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm font-mono text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="755"
            />
            <button onClick={applyNumeric} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Apply
            </button>
          </div>
        </div>

        {/* Presets */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Common Presets</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.label)}
                className={`p-2 rounded-lg border text-left transition-colors ${octal === p.label ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}
              >
                <span className="text-lg font-bold font-mono text-primary">{p.label}</span>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
