'use client'

import { useState } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

function base64UrlDecode(str: string): string {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding
  const pad = base64.length % 4
  if (pad === 2) base64 += '=='
  else if (pad === 3) base64 += '='

  return decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts * 1000)
  return date.toLocaleString() + ' (' + date.toISOString() + ')'
}

interface JwtResult {
  header: string
  payload: string
  signature: string
  isExpired: boolean | null
  expiresAt: string | null
  issuedAt: string | null
  notBefore: string | null
}

function decodeJwt(token: string): JwtResult {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format. Expected 3 parts separated by dots (header.payload.signature)')
  }

  let header: Record<string, unknown>
  let payload: Record<string, unknown>

  try {
    header = JSON.parse(base64UrlDecode(parts[0]))
  } catch {
    throw new Error('Invalid JWT header: could not decode Base64 or parse JSON')
  }

  try {
    payload = JSON.parse(base64UrlDecode(parts[1]))
  } catch {
    throw new Error('Invalid JWT payload: could not decode Base64 or parse JSON')
  }

  const now = Math.floor(Date.now() / 1000)

  let isExpired: boolean | null = null
  let expiresAt: string | null = null
  let issuedAt: string | null = null
  let notBefore: string | null = null

  if (typeof payload.exp === 'number') {
    isExpired = payload.exp < now
    expiresAt = formatTimestamp(payload.exp)
  }
  if (typeof payload.iat === 'number') {
    issuedAt = formatTimestamp(payload.iat)
  }
  if (typeof payload.nbf === 'number') {
    notBefore = formatTimestamp(payload.nbf)
  }

  return {
    header: JSON.stringify(header, null, 2),
    payload: JSON.stringify(payload, null, 2),
    signature: parts[2],
    isExpired,
    expiresAt,
    issuedAt,
    notBefore,
  }
}

export default function JwtDecoderTool() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<JwtResult | null>(null)
  const [error, setError] = useState('')

  const decode = () => {
    try {
      if (!input.trim()) throw new Error('Please enter a JWT token')
      setResult(decodeJwt(input))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JWT')
      setResult(null)
    }
  }

  const clear = () => { setInput(''); setResult(null); setError('') }

  return (
    <ToolPage
      title="JWT Decoder"
      description="Decode and inspect JSON Web Tokens (JWT) - view header, payload, and expiry"
      category="developer"
      categoryLabel="Developer Tools"
      faqs={[
        { question: 'Is it safe to decode a JWT in the browser?', answer: 'Yes, JWT payloads are only Base64-encoded, not encrypted, so anyone with the token can read them. This tool decodes entirely client-side and never sends your token to any server.' },
        { question: 'Can this tool verify the JWT signature?', answer: 'No, signature verification requires the secret key or public key used to sign the token, which should never be shared publicly. This tool only decodes and inspects the header and payload.' },
        { question: 'What do the exp, iat, and nbf claims mean in a JWT?', answer: 'The "exp" (expiration) is when the token expires, "iat" (issued at) is when it was created, and "nbf" (not before) is the earliest time the token should be accepted. All are Unix timestamps.' },
        { question: 'How can I tell if my JWT token has expired?', answer: 'Paste your token into the decoder and it will automatically compare the "exp" claim against the current time and display whether the token is expired or still valid.' },
      ]}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">JWT Token</span>
          <ClearButton onClear={clear} />
        </div>
        <ToolTextarea
          value={input}
          onChange={setInput}
          placeholder="Paste your JWT token here...\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
          rows={4}
        />
      </div>

      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}

      <button onClick={decode} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
        Decode JWT
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          {/* Token Status */}
          {result.isExpired !== null && (
            <div className={`p-3 rounded-lg text-sm font-medium ${result.isExpired ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
              {result.isExpired ? 'Token is EXPIRED' : 'Token is VALID (not expired)'}
            </div>
          )}

          {/* Time claims */}
          {(result.expiresAt || result.issuedAt || result.notBefore) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.issuedAt && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Issued At (iat)</div>
                  <div className="text-sm font-mono">{result.issuedAt}</div>
                </div>
              )}
              {result.expiresAt && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Expires At (exp)</div>
                  <div className="text-sm font-mono">{result.expiresAt}</div>
                </div>
              )}
              {result.notBefore && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Not Before (nbf)</div>
                  <div className="text-sm font-mono">{result.notBefore}</div>
                </div>
              )}
            </div>
          )}

          {/* Header & Payload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Header</span>
                <CopyButton text={result.header} />
              </div>
              <ToolTextarea value={result.header} readOnly rows={8} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Payload</span>
                <CopyButton text={result.payload} />
              </div>
              <ToolTextarea value={result.payload} readOnly rows={8} />
            </div>
          </div>

          {/* Signature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Signature</span>
              <CopyButton text={result.signature} />
            </div>
            <div className="p-3 rounded-lg border border-input bg-tool-bg font-mono text-sm break-all text-muted-foreground">
              {result.signature}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Note: Signature verification requires the secret key and is not performed client-side.</p>
          </div>
        </div>
      )}
    </ToolPage>
  )
}
