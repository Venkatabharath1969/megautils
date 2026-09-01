'use client'

import { useState, useCallback, useRef } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'
import { Download, Shield, Loader2, Code, FileText } from 'lucide-react'

type PageSize = 'a4' | 'letter'
type MarginSize = 'normal' | 'narrow' | 'wide'

const MARGIN_VALUES: Record<MarginSize, [number, number, number, number]> = {
  normal: [10, 10, 10, 10],
  narrow: [5, 5, 5, 5],
  wide: [20, 15, 20, 15],
}

const EXAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; }
    h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    h2 { color: #1e40af; margin-top: 24px; }
    .highlight { background: #fef3c7; padding: 12px 16px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 16px 0; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    th, td { border: 1px solid #d1d5db; padding: 10px 14px; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    tr:nth-child(even) { background: #f9fafb; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <h1>Quarterly Report — Q3 2024</h1>
  <p>This report summarizes key metrics and achievements for the third quarter.</p>

  <div class="highlight">
    <strong>Key Highlight:</strong> Revenue grew 23% compared to Q2, exceeding targets by 8%.
  </div>

  <h2>Performance Summary</h2>
  <table>
    <thead>
      <tr><th>Metric</th><th>Q2</th><th>Q3</th><th>Change</th></tr>
    </thead>
    <tbody>
      <tr><td>Revenue</td><td>$1.2M</td><td>$1.48M</td><td>+23%</td></tr>
      <tr><td>Users</td><td>45,000</td><td>62,300</td><td>+38%</td></tr>
      <tr><td>Churn Rate</td><td>4.2%</td><td>3.1%</td><td>-1.1%</td></tr>
      <tr><td>NPS Score</td><td>72</td><td>78</td><td>+6</td></tr>
    </tbody>
  </table>

  <h2>Key Achievements</h2>
  <ul>
    <li>Launched v2.0 of the platform with redesigned dashboard</li>
    <li>Expanded to 3 new markets (UK, Germany, Japan)</li>
    <li>Reduced average response time by 40%</li>
    <li>Onboarded 12 enterprise clients</li>
  </ul>

  <div class="footer">Generated with MegaUtils HTML to PDF — utilsnow.com</div>
</body>
</html>`

export default function HTMLToPDFTool() {
  const [htmlInput, setHtmlInput] = useState('')
  const [pageSize, setPageSize] = useState<PageSize>('a4')
  const [marginSize, setMarginSize] = useState<MarginSize>('normal')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLIFrameElement>(null)

  const loadExample = () => {
    setHtmlInput(EXAMPLE_HTML)
    setShowPreview(true)
    setError(null)
  }

  const generatePDF = useCallback(async () => {
    if (!htmlInput.trim()) {
      setError('Please enter some HTML content.')
      return
    }
    setIsProcessing(true)
    setError(null)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const container = document.createElement('div')
      container.innerHTML = htmlInput
      container.style.padding = '20px'
      container.style.fontFamily = 'Arial, Helvetica, sans-serif'
      container.style.fontSize = '14px'
      container.style.lineHeight = '1.6'
      container.style.color = '#333'
      document.body.appendChild(container)

      const margins = MARGIN_VALUES[marginSize]
      await html2pdf().set({
        margin: margins,
        filename: 'document.pdf',
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: pageSize, orientation: 'portrait' as const },
      }).from(container).save()

      document.body.removeChild(container)
    } catch {
      setError('Failed to generate PDF. Check your HTML for errors.')
    } finally {
      setIsProcessing(false)
    }
  }, [htmlInput, pageSize, marginSize])

  const clear = () => {
    setHtmlInput('')
    setShowPreview(false)
    setError(null)
    setIsProcessing(false)
  }

  return (
    <ToolPage
      title="HTML to PDF"
      description="Convert HTML code to a downloadable PDF document. Free, no upload, runs in your browser."
      category="pdf"
      categoryLabel="PDF Tools"
      faqs={[
        { question: 'Does it support CSS styling?', answer: 'Yes. Inline styles, <style> tags, and most CSS properties are supported. External stylesheets (linked via <link>) are not loaded for security reasons. Include all styles inline or in a <style> block.' },
        { question: 'Can I include images in the HTML?', answer: 'Yes, images referenced with data URIs (base64) work perfectly. External image URLs may work if the server allows cross-origin requests (CORS).' },
        { question: 'Are my files uploaded to a server?', answer: 'No. The HTML is rendered and converted to PDF entirely in your browser using html2pdf.js. Nothing is sent to any server.' },
        { question: 'What page sizes are supported?', answer: 'A4 (210 x 297 mm) and US Letter (215.9 x 279.4 mm) are supported, both in portrait orientation.' },
      ]}
      helpContent={
        <>
          <h2>What is HTML to PDF?</h2>
          <p>
            HTML to PDF converts HTML markup — including full CSS styling — into a downloadable PDF document.
            This is useful for generating reports, invoices, and formatted documents from code. The conversion
            runs entirely in your browser using html2pdf.js.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type your HTML code into the text area. Include any CSS in a <code>&lt;style&gt;</code> block.</li>
            <li>Or click <strong>Load Example</strong> to start with a sample report template.</li>
            <li>Toggle the preview to see how your HTML renders.</li>
            <li>Choose page size (A4 or Letter) and margin width.</li>
            <li>Click <strong>Generate PDF</strong> to convert and download.</li>
          </ol>

          <h2>When to Use HTML to PDF</h2>
          <ul>
            <li>Generate formatted reports from HTML templates.</li>
            <li>Convert email HTML to a PDF archive.</li>
            <li>Create invoices or certificates from HTML markup.</li>
            <li>Save styled web content as a portable document.</li>
          </ul>

          <h2>Tips</h2>
          <ul>
            <li>Use inline or embedded CSS for best results. External stylesheets are not fetched.</li>
            <li>For multi-page documents, the tool automatically handles page breaks.</li>
            <li>Use <code>page-break-before: always</code> CSS to force manual page breaks.</li>
            <li>Images work best as base64 data URIs or from CORS-enabled servers.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">HTML Input</label>
          {htmlInput && <ClearButton onClear={clear} />}
        </div>

        {/* HTML text area */}
        <div className="space-y-2">
          <textarea
            value={htmlInput}
            onChange={e => { setHtmlInput(e.target.value); setError(null) }}
            placeholder="Paste your HTML here..."
            className="w-full h-64 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadExample}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors inline-flex items-center gap-1.5"
            >
              <Code className="h-3.5 w-3.5" /> Load Example
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              disabled={!htmlInput.trim()}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <FileText className="h-3.5 w-3.5" /> {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-green-500" />
          Your content never leaves your device
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Live preview */}
        {showPreview && htmlInput.trim() && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Preview</label>
            <div className="border border-border rounded-lg overflow-hidden bg-white">
              <iframe
                ref={previewRef}
                srcDoc={htmlInput}
                title="HTML Preview"
                className="w-full h-96 border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Page Size</label>
            <div className="flex gap-2">
              {([['a4', 'A4'], ['letter', 'Letter']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setPageSize(val)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${pageSize === val ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Margins</label>
            <div className="flex gap-2">
              {([['normal', 'Normal'], ['narrow', 'Narrow'], ['wide', 'Wide']] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setMarginSize(val)}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${marginSize === val ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-muted'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generatePDF}
          disabled={isProcessing || !htmlInput.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
          {isProcessing ? 'Generating...' : 'Generate PDF'}
          {!isProcessing && <Download className="h-4 w-4" />}
        </button>
      </div>
    </ToolPage>
  )
}
