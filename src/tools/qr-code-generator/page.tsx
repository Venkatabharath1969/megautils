'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Copy, Check, WifiOff } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  CDN-loaded qrcode-generator typings                               */
/* ------------------------------------------------------------------ */
interface QRCode {
  addData(data: string): void
  make(): void
  getModuleCount(): number
  isDark(row: number, col: number): boolean
}

declare global {
  interface Window {
    qrcode?: (typeNumber: number, errorCorrection: string) => QRCode
  }
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
type QRType = 'text' | 'vcard' | 'wifi'

const SIZES = [
  { label: '200 × 200', value: 200 },
  { label: '300 × 300', value: 300 },
  { label: '400 × 400', value: 400 },
  { label: '500 × 500', value: 500 },
  { label: '600 × 600', value: 600 },
]

const ERROR_LEVELS: { label: string; value: string; desc: string }[] = [
  { label: 'L — Low (7 %)',        value: 'L', desc: '~7 % recovery' },
  { label: 'M — Medium (15 %)',    value: 'M', desc: '~15 % recovery' },
  { label: 'Q — Quartile (25 %)',  value: 'Q', desc: '~25 % recovery' },
  { label: 'H — High (30 %)',      value: 'H', desc: '~30 % recovery' },
]

const WIFI_ENCRYPTIONS = ['WPA', 'WEP', 'nopass'] as const

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function QrCodeGeneratorTool() {
  const [qrType, setQrType] = useState<QRType>('text')
  const [text, setText] = useState('')
  const [size, setSize] = useState(300)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [errorLevel, setErrorLevel] = useState('M')
  const [libLoaded, setLibLoaded] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  /* ---- vCard fields ---- */
  const [vcFirstName, setVcFirstName] = useState('')
  const [vcLastName, setVcLastName] = useState('')
  const [vcPhone, setVcPhone] = useState('')
  const [vcEmail, setVcEmail] = useState('')
  const [vcOrg, setVcOrg] = useState('')
  const [vcAddress, setVcAddress] = useState('')

  /* ---- WiFi fields ---- */
  const [wifiSSID, setWifiSSID] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiEncryption, setWifiEncryption] = useState<typeof WIFI_ENCRYPTIONS[number]>('WPA')

  /* ---- Logo file handling ---- */
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    setLogoFile(file)
    setLogoUrl(URL.createObjectURL(file))
    setErrorLevel('H') // Auto-set to highest error correction for logo overlay
  }

  const removeLogo = () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    setLogoFile(null)
    setLogoUrl(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  /* ---- Build the effective QR data string ---- */
  const getQRData = useCallback((): string => {
    if (qrType === 'vcard') {
      if (!vcFirstName && !vcLastName && !vcPhone && !vcEmail) return ''
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${vcLastName};${vcFirstName}`,
        `FN:${vcFirstName} ${vcLastName}`.trim(),
      ]
      if (vcPhone) lines.push(`TEL:${vcPhone}`)
      if (vcEmail) lines.push(`EMAIL:${vcEmail}`)
      if (vcOrg) lines.push(`ORG:${vcOrg}`)
      if (vcAddress) lines.push(`ADR:${vcAddress}`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
    if (qrType === 'wifi') {
      if (!wifiSSID) return ''
      const escSSID = wifiSSID.replace(/([\\;,:".])/g, '\\$1')
      const escPass = wifiPassword.replace(/([\\;,:".])/g, '\\$1')
      return `WIFI:T:${wifiEncryption};S:${escSSID};P:${escPass};;`
    }
    return text
  }, [qrType, text, vcFirstName, vcLastName, vcPhone, vcEmail, vcOrg, vcAddress, wifiSSID, wifiPassword, wifiEncryption])

  /* ---- Load qrcode-generator from CDN once ---- */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.qrcode) {
      setLibLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js'
    script.async = true
    script.onload = () => setLibLoaded(true)
    script.onerror = () => setError('Failed to load QR code library. Please refresh.')
    document.head.appendChild(script)
    return () => { /* script stays cached */ }
  }, [])

  /* ---- Render QR on canvas ---- */
  const qrData = getQRData()

  const generateQR = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    if (!qrData.trim() || !libLoaded) {
      canvas.width = size
      canvas.height = size
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)
      setError('')
      return
    }

    try {
      const qr = window.qrcode!(0, errorLevel)
      qr.addData(qrData)
      qr.make()

      const moduleCount = qr.getModuleCount()
      const quietZone = 4                       // modules of quiet-zone padding
      const totalModules = moduleCount + quietZone * 2
      const cellSize = size / totalModules

      canvas.width = size
      canvas.height = size

      // Background
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, size, size)

      // Modules
      ctx.fillStyle = fgColor
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            const x = Math.round((c + quietZone) * cellSize)
            const y = Math.round((r + quietZone) * cellSize)
            const w = Math.round((c + quietZone + 1) * cellSize) - x
            const h = Math.round((r + quietZone + 1) * cellSize) - y
            ctx.fillRect(x, y, w, h)
          }
        }
      }

      // Logo overlay
      if (logoUrl) {
        const logoImg = new Image()
        logoImg.src = logoUrl
        await new Promise(r => { logoImg.onload = r })
        const logoSize = size * 0.25 // Logo takes up 25% of QR code
        const logoX = (size - logoSize) / 2
        const logoY = (size - logoSize) / 2
        // Draw white background behind logo for readability
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8)
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
      }

      setError('')
    } catch {
      setError('Input too long for the selected error correction level. Try shorter text or a lower level.')
    }
  }, [qrData, size, fgColor, bgColor, errorLevel, libLoaded, logoUrl])

  useEffect(() => { generateQR() }, [generateQR])

  /* ---- Download PNG ---- */
  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !qrData.trim()) return
    const a = document.createElement('a')
    a.download = `qr-code-${size}x${size}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }, [size, qrData])

  /* ---- Download SVG ---- */
  const downloadSVG = useCallback(() => {
    if (!qrData.trim() || !libLoaded) return
    try {
      const qr = window.qrcode!(0, errorLevel)
      qr.addData(qrData)
      qr.make()

      const moduleCount = qr.getModuleCount()
      const quietZone = 4
      const totalModules = moduleCount + quietZone * 2
      const cellSize = size / totalModules

      let rects = ''
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.isDark(r, c)) {
            const x = ((c + quietZone) * cellSize).toFixed(2)
            const y = ((r + quietZone) * cellSize).toFixed(2)
            const w = cellSize.toFixed(2)
            rects += `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="${fgColor}"/>`
          }
        }
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${bgColor}"/>${rects}</svg>`

      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.download = `qr-code-${size}x${size}.svg`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* error already shown via canvas path */ }
  }, [qrData, size, fgColor, bgColor, errorLevel, libLoaded])

  /* ---- Copy image to clipboard ---- */
  const copyImage = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !qrData.trim()) return
    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
      if (!blob) return
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard API may be blocked */ }
  }, [qrData])

  /* ---- Clear ---- */
  const clear = () => {
    setText('')
    setError('')
    setVcFirstName('')
    setVcLastName('')
    setVcPhone('')
    setVcEmail('')
    setVcOrg('')
    setVcAddress('')
    setWifiSSID('')
    setWifiPassword('')
    setWifiEncryption('WPA')
    removeLogo()
  }

  const hasQR = qrData.trim().length > 0 && libLoaded && !error

  return (
    <ToolPage
      title="QR Code Generator"
      description="Generate customizable QR codes from text or URLs instantly. Choose colors, size, and error correction — runs entirely in your browser."
      category="generators"
      categoryLabel="Generators"
      slug="qr-code-generator"
      helpContent={
        <>
          <h2>What Is a QR Code Generator?</h2>
          <p>
            A QR (Quick Response) code is a two-dimensional barcode that stores text, URLs, contact
            information, Wi-Fi credentials, or any short string in a pattern of black-and-white
            modules. Smartphones and tablets can scan the code with their camera and instantly act on
            the encoded data — opening a link, joining a network, or saving a contact. This
            generator creates QR codes entirely in your browser using the Canvas API, so the text you
            enter never leaves your device.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Type or paste the text or URL you want to encode into the <strong>Text or URL</strong> field. The QR code updates in real time as you type.</li>
            <li>Choose a <strong>size</strong> from the dropdown — larger sizes are better for print, smaller sizes work well on screens.</li>
            <li>Pick <strong>foreground</strong> and <strong>background</strong> colors to match your brand or design.</li>
            <li>Select an <strong>error correction level</strong>. Higher levels make the code scannable even when partially damaged, but they also increase density.</li>
            <li>Click <strong>Download PNG</strong> for a raster image, <strong>Download SVG</strong> for a scalable vector, or <strong>Copy Image</strong> to paste the QR code directly into a document or chat.</li>
          </ol>

          <h2>Choosing the Right Error Correction Level</h2>
          <p>
            QR codes include redundancy so they can still be read if part of the pattern is obscured
            or damaged. Level <strong>L</strong> tolerates roughly 7 % damage and produces the
            simplest codes. Level <strong>M</strong> (the default) handles about 15 % and is a good
            all-round choice. Level <strong>Q</strong> recovers from roughly 25 % damage, and Level
            <strong> H</strong> can survive up to 30 % — ideal if you plan to place a logo over part
            of the code. Higher error correction increases the number of modules and may require a
            larger printed size to remain scannable.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Keep the encoded string short. URLs can be shortened with a link shortener before encoding to produce a less dense, easier-to-scan code.</li>
            <li>Ensure good contrast between foreground and background colors. Dark-on-light is most reliable for scanners.</li>
            <li>Use SVG for print materials — it scales to any size without losing quality.</li>
            <li>Test your QR code with at least two different scanning apps before distributing it widely.</li>
            <li>If you plan to overlay a logo, choose error correction level <strong>H</strong> and keep the logo small relative to the code.</li>
          </ul>
        </>
      }
      faqs={[
        {
          question: 'What can I encode in a QR code?',
          answer: 'You can encode any text, including URLs, email addresses, phone numbers, Wi-Fi credentials, or plain text messages. The maximum capacity depends on the content type and error correction level — roughly 4,296 alphanumeric characters at Level L.',
        },
        {
          question: 'What is error correction and which level should I choose?',
          answer: 'Error correction adds redundant data so the code remains scannable even if part of it is damaged or covered. Level L (7 %) is fine for clean digital use, M (15 %) is a balanced default, Q (25 %) is good for labels that may get scuffed, and H (30 %) is best if you want to overlay a small logo on the code.',
        },
        {
          question: 'Is my data sent to a server?',
          answer: 'No. The QR code is generated entirely in your browser using the Canvas API and a client-side JavaScript library. Your text never leaves your device, making the tool safe for sensitive data like Wi-Fi passwords or private URLs.',
        },
        {
          question: 'Do QR codes expire or stop working?',
          answer: 'QR codes themselves never expire — they simply encode static data. However, if the code contains a URL, the link destination could go offline independently. The QR code image will always decode to the same string it was created with.',
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---- Left: Controls ---- */}
        <div className="space-y-4">
          {/* Header + Clear */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">QR Code Data</span>
            <ClearButton onClear={clear} />
          </div>

          {/* Type selector */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Type:</label>
            <select
              value={qrType}
              onChange={e => setQrType(e.target.value as QRType)}
              className="h-9 px-3 rounded-md border border-input bg-card text-sm"
            >
              <option value="text">Text / URL</option>
              <option value="vcard">vCard Contact</option>
              <option value="wifi">WiFi Network</option>
            </select>
          </div>

          {/* Text / URL input */}
          {qrType === 'text' && (
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter text or URL to generate QR code…"
              rows={4}
              className="tool-textarea w-full rounded-lg border border-input bg-tool-bg p-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          )}

          {/* vCard fields */}
          {qrType === 'vcard' && (
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">First Name</label>
                  <input type="text" value={vcFirstName} onChange={e => setVcFirstName(e.target.value)} placeholder="John" className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Last Name</label>
                  <input type="text" value={vcLastName} onChange={e => setVcLastName(e.target.value)} placeholder="Doe" className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Phone</label>
                <input type="tel" value={vcPhone} onChange={e => setVcPhone(e.target.value)} placeholder="+1234567890" className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Email</label>
                <input type="email" value={vcEmail} onChange={e => setVcEmail(e.target.value)} placeholder="email@example.com" className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Organization</label>
                <input type="text" value={vcOrg} onChange={e => setVcOrg(e.target.value)} placeholder="Company Inc." className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Address</label>
                <input type="text" value={vcAddress} onChange={e => setVcAddress(e.target.value)} placeholder="123 Main St, City, Country" className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm" />
              </div>
            </div>
          )}

          {/* WiFi fields */}
          {qrType === 'wifi' && (
            <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
              <div>
                <label className="text-xs font-medium mb-1 block">SSID (Network Name)</label>
                <input type="text" value={wifiSSID} onChange={e => setWifiSSID(e.target.value)} placeholder="MyNetwork" className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Password</label>
                <input type="text" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} placeholder="MyPassword" className="w-full h-9 px-3 rounded-md border border-input bg-card text-sm" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs font-medium">Encryption:</label>
                <select
                  value={wifiEncryption}
                  onChange={e => setWifiEncryption(e.target.value as typeof WIFI_ENCRYPTIONS[number])}
                  className="h-9 px-3 rounded-md border border-input bg-card text-sm"
                >
                  <option value="WPA">WPA / WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (Open)</option>
                </select>
              </div>
            </div>
          )}

          {/* Size selector */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Size:</label>
            <select
              value={size}
              onChange={e => setSize(Number(e.target.value))}
              className="h-9 px-3 rounded-md border border-input bg-card text-sm"
            >
              {SIZES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Error correction */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium">Error Correction:</label>
            <select
              value={errorLevel}
              onChange={e => setErrorLevel(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-card text-sm"
            >
              {ERROR_LEVELS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Color pickers */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Foreground:</label>
              <input
                type="color"
                value={fgColor}
                onChange={e => setFgColor(e.target.value)}
                className="w-9 h-9 rounded border border-input cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-muted-foreground">{fgColor.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Background:</label>
              <input
                type="color"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="w-9 h-9 rounded border border-input cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-muted-foreground">{bgColor.toUpperCase()}</span>
            </div>
          </div>

          {/* Logo overlay */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Logo Overlay</label>
            <div className="flex items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                onChange={handleLogoChange}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:transition-colors"
              />
              {logoFile && (
                <button
                  onClick={removeLogo}
                  className="shrink-0 px-2 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors text-red-500"
                >
                  Remove Logo
                </button>
              )}
            </div>
            {logoFile && (
              <p className="text-xs text-muted-foreground">
                Logo: {logoFile.name} (error correction auto-set to H)
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={downloadPNG}
              disabled={!hasQR}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="h-3.5 w-3.5" /> Download PNG
            </button>
            <button
              onClick={downloadSVG}
              disabled={!hasQR}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="h-3.5 w-3.5" /> Download SVG
            </button>
            <button
              onClick={copyImage}
              disabled={!hasQR}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {copied
                ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</>
                : <><Copy className="h-3.5 w-3.5" /> Copy Image</>}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Offline badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium w-fit">
            <WifiOff className="h-3.5 w-3.5" />
            Works offline after first load
          </div>
        </div>

        {/* ---- Right: Preview ---- */}
        <div className="flex flex-col items-center justify-center">
          <div
            className="border border-border rounded-lg p-4 inline-flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto"
              style={{ width: size, height: size, imageRendering: 'pixelated' }}
            />
          </div>
          {!qrData.trim() && (
            <p className="text-sm text-muted-foreground mt-3">
              {qrType === 'text' ? 'Start typing to see a live preview' : qrType === 'vcard' ? 'Fill in contact details to generate QR' : 'Enter WiFi details to generate QR'}
            </p>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
