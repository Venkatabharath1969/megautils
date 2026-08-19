'use client'

import { useState, useMemo, useEffect } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

const CLAIM_DESCRIPTIONS: Record<string, string> = {
  sub: 'Subject (user identifier)',
  iss: 'Issuer',
  aud: 'Audience',
  exp: 'Expiration Time',
  iat: 'Issued At',
  nbf: 'Not Before',
  jti: 'JWT ID',
  scope: 'Scope/Permissions',
  name: 'Full Name',
  email: 'Email Address',
}

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

function formatCountdown(diffMs: number): string {
  const absDiff = Math.abs(diffMs)
  const totalSeconds = Math.floor(absDiff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)

  if (diffMs > 0) {
    return `Expires in ${parts.join(' ')}`
  } else {
    return `Expired ${parts.join(' ')} ago`
  }
}

interface JwtResult {
  header: string
  payload: string
  payloadObj: Record<string, unknown>
  signature: string
  isExpired: boolean | null
  expTimestamp: number | null
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
  let expTimestamp: number | null = null
  let expiresAt: string | null = null
  let issuedAt: string | null = null
  let notBefore: string | null = null

  if (typeof payload.exp === 'number') {
    isExpired = payload.exp < now
    expTimestamp = payload.exp
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
    payloadObj: payload,
    signature: parts[2],
    isExpired,
    expTimestamp,
    expiresAt,
    issuedAt,
    notBefore,
  }
}

export default function JwtDecoderTool() {
  const [input, setInput] = useState('')
  const [countdown, setCountdown] = useState<string | null>(null)

  // Real-time decode via useMemo
  const { result, error } = useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return { result: null as JwtResult | null, error: '' }
    try {
      return { result: decodeJwt(trimmed), error: '' }
    } catch (e) {
      return { result: null as JwtResult | null, error: e instanceof Error ? e.message : 'Invalid JWT' }
    }
  }, [input])

  // Live expiry countdown
  useEffect(() => {
    if (!result?.expTimestamp) {
      setCountdown(null)
      return
    }

    const update = () => {
      const diffMs = result.expTimestamp! * 1000 - Date.now()
      setCountdown(formatCountdown(diffMs))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [result?.expTimestamp])

  const clear = () => { setInput('') }

  // Render claim descriptions for payload keys
  const renderClaimDescriptions = (payloadObj: Record<string, unknown>) => {
    const entries = Object.keys(payloadObj).filter(k => CLAIM_DESCRIPTIONS[k])
    if (entries.length === 0) return null
    return (
      <div className="mt-3 space-y-1">
        <span className="text-xs font-medium text-muted-foreground block mb-1">Claim Descriptions</span>
        <div className="flex flex-wrap gap-2">
          {entries.map(key => (
            <span key={key} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs">
              <code className="font-mono text-primary">{key}</code>
              <span className="text-muted-foreground">— {CLAIM_DESCRIPTIONS[key]}</span>
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ToolPage
      title="JWT Decoder"
      description="Decode and inspect JSON Web Tokens (JWT) - view header, payload, and expiry"
      category="developer"
      categoryLabel="Developer Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>JWT Decoder is a free browser-based tool that lets you decode JSON Web Tokens to inspect the header, payload, and signature without verification. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your code or data into the <strong>input panel</strong>.</li>
            <li>Select any formatting options or conversion targets if available.</li>
            <li>View the processed output instantly in the <strong>result panel</strong>.</li>
            <li>Use <strong>Copy</strong> to grab the output or <strong>Download</strong> to save it as a file.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when debugging authentication issues, inspecting token claims and expiration, or understanding OAuth2 and OIDC token contents. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this security tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'Is it safe to decode a JWT in the browser?', answer: 'Yes, JWT payloads are only Base64-encoded, not encrypted, so anyone with the token can read them. This tool runs entirely in your browser and never sends your token to any server.' },
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
          placeholder="Paste your JWT token here — decodes automatically as you type...&#10;eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
          rows={4}
        />
      </div>

      {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-mono">{error}</div>}

      {result && (
        <div className="mt-6 space-y-4">
          {/* Token Status */}
          {result.isExpired !== null && (
            <div className={`p-3 rounded-lg text-sm font-medium ${result.isExpired ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'}`}>
              <div>{result.isExpired ? 'Token is EXPIRED' : 'Token is VALID (not expired)'}</div>
              {countdown && (
                <div className="mt-1 text-xs font-mono opacity-80">{countdown}</div>
              )}
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
              {renderClaimDescriptions(result.payloadObj)}
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
            <p className="text-xs text-muted-foreground mt-1">Note: Signature verification requires the secret key and is not performed in the browser.</p>
          </div>
        </div>
      )}
    </ToolPage>
  )
}
