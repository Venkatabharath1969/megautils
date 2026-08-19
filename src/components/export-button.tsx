'use client'

import { useState } from 'react'
import { Download, Check } from 'lucide-react'
import { exportToCSV } from '@/lib/export-utils'

interface ExportButtonProps {
  headers: string[]
  rows: (string | number)[][]
  filename?: string
  label?: string
}

export function ExportButton({ headers, rows, filename = 'export.csv', label = 'Download CSV' }: ExportButtonProps) {
  const [downloaded, setDownloaded] = useState(false)

  const handleExport = () => {
    exportToCSV(headers, rows, filename)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  return (
    <button
      onClick={handleExport}
      disabled={rows.length === 0}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
    >
      {downloaded ? (
        <><Check className="h-3.5 w-3.5 text-green-500" /> Downloaded</>
      ) : (
        <><Download className="h-3.5 w-3.5" /> {label}</>
      )}
    </button>
  )
}
