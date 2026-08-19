'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, CopyButton } from '@/components/tool-page'

const PERMISSIONS = ['read', 'write', 'execute'] as const
const ENTITIES = ['owner', 'group', 'other'] as const
const SPECIAL_PERMS = ['setuid', 'setgid', 'sticky'] as const

interface PermState {
  owner: [boolean, boolean, boolean]
  group: [boolean, boolean, boolean]
  other: [boolean, boolean, boolean]
}

interface SpecialPermState {
  setuid: boolean
  setgid: boolean
  sticky: boolean
}

function permToOctal(perms: [boolean, boolean, boolean]): number {
  return (perms[0] ? 4 : 0) + (perms[1] ? 2 : 0) + (perms[2] ? 1 : 0)
}

function octalToPerm(n: number): [boolean, boolean, boolean] {
  return [(n & 4) !== 0, (n & 2) !== 0, (n & 1) !== 0]
}

function specialToOctal(special: SpecialPermState): number {
  return (special.setuid ? 4 : 0) + (special.setgid ? 2 : 0) + (special.sticky ? 1 : 0)
}

function permToSymbolicSegment(
  perms: [boolean, boolean, boolean],
  entity: 'owner' | 'group' | 'other',
  special: SpecialPermState
): string {
  const r = perms[0] ? 'r' : '-'
  const w = perms[1] ? 'w' : '-'
  let x: string

  if (entity === 'owner') {
    if (special.setuid) {
      x = perms[2] ? 's' : 'S'
    } else {
      x = perms[2] ? 'x' : '-'
    }
  } else if (entity === 'group') {
    if (special.setgid) {
      x = perms[2] ? 's' : 'S'
    } else {
      x = perms[2] ? 'x' : '-'
    }
  } else {
    if (special.sticky) {
      x = perms[2] ? 't' : 'T'
    } else {
      x = perms[2] ? 'x' : '-'
    }
  }

  return r + w + x
}

function getSecurityWarnings(octal3: string, perms: PermState): string[] {
  const warnings: string[] = []
  if (octal3 === '777') {
    warnings.push('World-writable and executable — anyone can read, modify, and execute this file. Avoid in production.')
  } else if (octal3 === '666') {
    warnings.push('World-writable — anyone can read and modify this file. Consider restricting write access.')
  }
  if (perms.other[1] && octal3 !== '777' && octal3 !== '666') {
    warnings.push('\"Other\" has write access — any user on the system can modify this file.')
  }
  return warnings
}

export default function ChmodCalculatorTool() {
  const [perms, setPerms] = useState<PermState>({
    owner: [true, true, true],
    group: [true, false, true],
    other: [true, false, true],
  })

  const [special, setSpecial] = useState<SpecialPermState>({
    setuid: false,
    setgid: false,
    sticky: false,
  })

  const [numericInput, setNumericInput] = useState('755')
  const [umaskInput, setUmaskInput] = useState('022')

  const octal3 = useMemo(() => {
    return `${permToOctal(perms.owner)}${permToOctal(perms.group)}${permToOctal(perms.other)}`
  }, [perms])

  const specialOctal = useMemo(() => specialToOctal(special), [special])

  const octal = useMemo(() => {
    if (specialOctal > 0) return `${specialOctal}${octal3}`
    return octal3
  }, [specialOctal, octal3])

  const symbolic = useMemo(() => {
    return `-${permToSymbolicSegment(perms.owner, 'owner', special)}${permToSymbolicSegment(perms.group, 'group', special)}${permToSymbolicSegment(perms.other, 'other', special)}`
  }, [perms, special])

  const chmodCmd = useMemo(() => `chmod ${octal} filename`, [octal])

  const warnings = useMemo(() => getSecurityWarnings(octal3, perms), [octal3, perms])

  const togglePerm = useCallback((entity: keyof PermState, permIdx: number) => {
    setPerms((prev) => {
      const newPerms = { ...prev }
      const entityPerms = [...prev[entity]] as [boolean, boolean, boolean]
      entityPerms[permIdx] = !entityPerms[permIdx]
      newPerms[entity] = entityPerms
      return newPerms
    })
  }, [])

  const toggleSpecial = useCallback((perm: keyof SpecialPermState) => {
    setSpecial((prev) => ({ ...prev, [perm]: !prev[perm] }))
  }, [])

  const applyNumeric = useCallback(() => {
    const cleaned = numericInput.replace(/\D/g, '')
    if (cleaned.length === 3) {
      const digits = cleaned.split('').map(Number)
      if (digits.some((d) => d > 7)) return
      setPerms({
        owner: octalToPerm(digits[0]),
        group: octalToPerm(digits[1]),
        other: octalToPerm(digits[2]),
      })
      setSpecial({ setuid: false, setgid: false, sticky: false })
    } else if (cleaned.length === 4) {
      const digits = cleaned.split('').map(Number)
      if (digits.some((d) => d > 7)) return
      setSpecial({
        setuid: (digits[0] & 4) !== 0,
        setgid: (digits[0] & 2) !== 0,
        sticky: (digits[0] & 1) !== 0,
      })
      setPerms({
        owner: octalToPerm(digits[1]),
        group: octalToPerm(digits[2]),
        other: octalToPerm(digits[3]),
      })
    }
  }, [numericInput])

  // Umask calculator
  const umaskResult = useMemo(() => {
    const cleaned = umaskInput.replace(/\D/g, '').slice(0, 4)
    if (cleaned.length < 3 || cleaned.length > 4) return null
    const umaskVal = parseInt(cleaned, 8)
    if (isNaN(umaskVal) || cleaned.split('').some(c => parseInt(c) > 7)) return null

    const fileBase = 0o666
    const dirBase = 0o777
    const filePerm = fileBase & ~umaskVal
    const dirPerm = dirBase & ~umaskVal

    return {
      file: filePerm.toString(8).padStart(3, '0'),
      dir: dirPerm.toString(8).padStart(3, '0'),
    }
  }, [umaskInput])

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
    setSpecial({ setuid: false, setgid: false, sticky: false })
  }

  return (
    <ToolPage title="Chmod Calculator" description="Unix file permissions calculator. Toggle checkboxes or enter numeric permissions." category="developer" categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>chmod Calculator is a free browser-based tool that lets you convert between symbolic (rwxr-xr-x) and numeric (755) Unix file permission formats. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when setting file permissions on Linux/Unix servers, configuring web server directories, or managing deployment scripts. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this system administration tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What does chmod 755 mean?', answer: 'chmod 755 gives the owner full read, write, and execute permissions (7), while group and others get read and execute only (5). This is the standard permission for directories and executable files.' },
        { question: 'How do I calculate chmod permissions?', answer: 'Toggle the read (4), write (2), and execute (1) checkboxes for owner, group, and other, and the tool instantly calculates the numeric (e.g., 755) and symbolic (e.g., -rwxr-xr-x) notation.' },
        { question: 'What is the difference between chmod 644 and 755?', answer: '644 gives the owner read/write and everyone else read-only (typical for files), while 755 adds execute permission for all users (typical for directories and scripts).' },
        { question: 'Should I ever use chmod 777?', answer: 'Avoid chmod 777 in production as it gives full read, write, and execute access to everyone, creating a significant security risk. Use more restrictive permissions like 755 or 750.' },
      ]}>
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
                  <td className="text-center py-3 px-4 font-mono">{permToSymbolicSegment(perms[entity], entity, special)}</td>
                </tr>
              ))}
              {/* Special permissions row */}
              <tr className="border-b border-border">
                <td className="py-3 pr-4 font-medium">Special</td>
                {SPECIAL_PERMS.map((sp) => (
                  <td key={sp} className="text-center py-3 px-4">
                    <div className="flex flex-col items-center gap-0.5">
                      <input
                        type="checkbox"
                        checked={special[sp]}
                        onChange={() => toggleSpecial(sp)}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-ring cursor-pointer"
                      />
                      <span className="text-[10px] text-muted-foreground capitalize">{sp}</span>
                    </div>
                  </td>
                ))}
                <td className="text-center py-3 px-4 font-mono font-bold text-primary">{specialOctal}</td>
                <td className="text-center py-3 px-4 font-mono text-muted-foreground text-xs">
                  {special.setuid ? 'SUID ' : ''}{special.setgid ? 'SGID ' : ''}{special.sticky ? 'Sticky' : ''}
                  {!special.setuid && !special.setgid && !special.sticky ? '-' : ''}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security Warnings */}
        {warnings.length > 0 && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-400">
                <span className="shrink-0 mt-0.5">&#x26A0;</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

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
              maxLength={4}
              className="w-24 px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm font-mono text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0755"
            />
            <button onClick={applyNumeric} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Apply
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Enter 3-digit (755) or 4-digit (4755) octal permissions</p>
        </div>

        {/* Presets */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Common Presets</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.label)}
                className={`p-2 rounded-lg border text-left transition-colors ${octal3 === p.label && specialOctal === 0 ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}
              >
                <span className="text-lg font-bold font-mono text-primary">{p.label}</span>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Umask Calculator */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold mb-3">Umask Calculator</h3>
          <p className="text-xs text-muted-foreground mb-3">Enter a umask value to see the resulting default permissions for new files and directories.</p>
          <div className="flex gap-2 items-start">
            <div>
              <input
                type="text"
                value={umaskInput}
                onChange={(e) => setUmaskInput(e.target.value)}
                maxLength={4}
                className="w-24 px-3 py-2 rounded-lg border border-input bg-tool-bg text-sm font-mono text-center text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="022"
              />
              <p className="text-xs text-muted-foreground mt-1">umask value</p>
            </div>
            {umaskResult && (
              <div className="flex gap-3 ml-4">
                <div className="p-3 rounded-lg bg-muted min-w-[120px]">
                  <div className="text-xs font-medium text-muted-foreground mb-1">File Default</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-bold font-mono text-primary">{umaskResult.file}</span>
                    <CopyButton text={umaskResult.file} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">666 &amp; ~{umaskInput}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted min-w-[120px]">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Directory Default</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl font-bold font-mono text-primary">{umaskResult.dir}</span>
                    <CopyButton text={umaskResult.dir} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">777 &amp; ~{umaskInput}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
