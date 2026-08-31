'use client'

import { useState } from 'react'
import { FileDown, Check } from 'lucide-react'

interface PdfDownloadButtonProps {
  contentHtml: string
  filename?: string
  label?: string
}

export function PdfDownloadButton({ contentHtml, filename = 'document.pdf', label = 'Download PDF' }: PdfDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2pdf = (await import('html2pdf.js' as any)).default
      const container = document.createElement('div')
      container.innerHTML = contentHtml
      container.style.padding = '20px'
      container.style.fontFamily = 'Arial, sans-serif'
      container.style.fontSize = '14px'
      container.style.lineHeight = '1.6'
      document.body.appendChild(container)
      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(container).save()
      document.body.removeChild(container)
    } catch (e) {
      console.error('PDF generation failed:', e)
    }
    setDownloading(false)
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50"
    >
      {downloading ? (
        <><FileDown className="h-3.5 w-3.5 animate-pulse" /> Generating...</>
      ) : (
        <><FileDown className="h-3.5 w-3.5" /> {label}</>
      )}
    </button>
  )
}
