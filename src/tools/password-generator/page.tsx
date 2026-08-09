'use client'

import { useState, useCallback } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

function generatePassword(length: number, options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }): string {
  let chars = ''
  if (options.uppercase) chars += CHARSETS.uppercase
  if (options.lowercase) chars += CHARSETS.lowercase
  if (options.numbers) chars += CHARSETS.numbers
  if (options.symbols) chars += CHARSETS.symbols
  if (!chars) chars = CHARSETS.lowercase

  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (v) => chars[v % chars.length]).join('')
}

function getStrength(password: string): { label: string; percent: number; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { label: 'Weak', percent: 25, color: 'bg-red-500' }
  if (score <= 3) return { label: 'Fair', percent: 50, color: 'bg-yellow-500' }
  if (score <= 4) return { label: 'Good', percent: 75, color: 'bg-blue-500' }
  return { label: 'Strong', percent: 100, color: 'bg-green-500' }
}

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [passwords, setPasswords] = useState<string[]>([])

  const generate = useCallback(() => {
    const opts = { uppercase, lowercase, numbers, symbols }
    const result: string[] = []
    for (let i = 0; i < quantity; i++) {
      result.push(generatePassword(length, opts))
    }
    setPasswords(result)
  }, [length, uppercase, lowercase, numbers, symbols, quantity])

  const allText = passwords.join('\n')

  return (
    <ToolPage
      title="Password Generator"
      description="Generate secure random passwords with customizable length and character sets."
      category="generators"
      categoryLabel="Generators"
      helpContent={
        <>
          <h2>What is a Password Generator?</h2>
          <p>
            A password generator creates random strings of characters that are designed to be extremely difficult for attackers to guess or crack through brute-force methods. Humans are notoriously bad at inventing passwords — we tend to reuse familiar words, add predictable numbers, and follow patterns that automated cracking tools exploit in seconds. A dedicated generator removes that human bias by using a cryptographically secure random number source to select each character independently, producing passwords with maximum entropy for their length.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Set your desired <strong>password length</strong> using the slider. Security experts recommend at least 12–16 characters; longer is always better.</li>
            <li>Choose which <strong>character sets</strong> to include: uppercase letters, lowercase letters, numbers, and symbols. Enabling all four maximises the keyspace and produces the strongest passwords.</li>
            <li>Set the <strong>quantity</strong> if you need more than one password — you can generate up to 50 at once.</li>
            <li>Click <strong>Generate Password</strong>. Each password appears with a colour-coded strength indicator so you can judge its quality at a glance.</li>
            <li>Click the <strong>Copy</strong> button next to any password to send it to your clipboard, then paste it into your password manager or sign-up form.</li>
          </ol>

          <h2>When to Use a Password Generator</h2>
          <p>
            Use a generator every time you create a new account, rotate credentials, generate API keys, or set up database passwords. It is especially important for accounts that protect sensitive information — email, banking, cloud infrastructure, and admin panels. Generating passwords in bulk is handy when provisioning multiple test accounts or issuing temporary credentials to team members.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li><strong>Never reuse passwords.</strong> If one service is breached, attackers will try the same credentials on every other site — a technique called credential stuffing.</li>
            <li>Store generated passwords in a reputable <strong>password manager</strong> rather than in a spreadsheet, sticky note, or browser autofill alone.</li>
            <li>For passphrases (easier to type on mobile), consider combining four or more random dictionary words — but for maximum security per character, symbol-rich random strings are superior.</li>
            <li>This generator on utilsnow.com uses the <strong>Web Crypto API</strong> (<code>crypto.getRandomValues</code>), which is the same cryptographic primitive browsers use for TLS. Your passwords are never sent to a server.</li>
            <li>Enable <strong>two-factor authentication</strong> (2FA) wherever possible — even the strongest password benefits from an additional layer of security.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How long should a strong password be?', answer: 'Security experts recommend at least 12-16 characters. Longer passwords with a mix of uppercase, lowercase, numbers, and symbols are exponentially harder to crack.' },
        { question: 'Are the generated passwords truly random?', answer: 'Yes. This tool uses the Web Crypto API (crypto.getRandomValues), which provides cryptographically secure random number generation built into your browser.' },
        { question: 'Are my generated passwords stored anywhere?', answer: 'No. Passwords are generated entirely in your browser and are never sent to any server. Once you close or refresh the page, they are gone unless you save them.' },
        { question: 'Why should I include symbols in my password?', answer: 'Adding symbols dramatically increases the number of possible combinations, making brute-force attacks much slower. A 12-character password with symbols is far stronger than one with only letters.' },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label className="font-medium">Length</label>
              <span className="text-muted-foreground">{length}</span>
            </div>
            <input
              type="range"
              min={8}
              max={128}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>8</span>
              <span>128</span>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Uppercase (A-Z)', checked: uppercase, set: setUppercase },
              { label: 'Lowercase (a-z)', checked: lowercase, set: setLowercase },
              { label: 'Numbers (0-9)', checked: numbers, set: setNumbers },
              { label: 'Symbols (!@#$...)', checked: symbols, set: setSymbols },
            ].map((opt) => (
              <label key={opt.label} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={opt.checked} onChange={(e) => opt.set(e.target.checked)} className="rounded border-border" />
                {opt.label}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Generate</label>
            <input
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-1.5 text-sm rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">password(s)</span>
          </div>

          <button onClick={generate} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Generate Password{quantity > 1 ? 's' : ''}
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Generated Passwords</span>
            <div className="flex gap-1.5">
              {passwords.length > 0 && <CopyButton text={allText} />}
              {passwords.length > 0 && <ClearButton onClear={() => setPasswords([])} />}
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {passwords.length === 0 && (
              <div className="p-4 rounded-lg bg-muted text-center text-sm text-muted-foreground">
                Click Generate to create passwords
              </div>
            )}
            {passwords.map((pw, i) => {
              const strength = getStrength(pw)
              return (
                <div key={i} className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-1.5">
                    <code className="text-sm font-mono break-all flex-1 mr-2">{pw}</code>
                    <CopyButton text={pw} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted-foreground/20">
                      <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.percent}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{strength.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
