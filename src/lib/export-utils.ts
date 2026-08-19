/** RFC 4180 compliant CSV field escaping */
function escapeCSVField(field: string | number): string {
  const str = String(field)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

/** Build a CSV string from headers and rows (RFC 4180 compliant) */
function buildCSV(headers: string[], rows: (string | number)[][]): string {
  const headerLine = headers.map(escapeCSVField).join(',')
  const dataLines = rows.map(row => row.map(escapeCSVField).join(','))
  return [headerLine, ...dataLines].join('\r\n')
}

/**
 * Export tabular data as a downloadable CSV file.
 * Uses BOM prefix for Excel compatibility and RFC 4180 compliant escaping.
 */
export function exportToCSV(
  headers: string[],
  rows: (string | number)[][],
  filename: string = 'export.csv'
): void {
  const csv = buildCSV(headers, rows)
  // UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Copy tabular data to clipboard in tab-separated format for pasting into spreadsheets.
 * Returns true on success, false on failure.
 */
export async function copyTableToClipboard(
  headers: string[],
  rows: (string | number)[][]
): Promise<boolean> {
  const headerLine = headers.join('\t')
  const dataLines = rows.map(row => row.map(String).join('\t'))
  const text = [headerLine, ...dataLines].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
