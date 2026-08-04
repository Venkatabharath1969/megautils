'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

interface UrlEntry {
  url: string
  changefreq: string
  priority: string
}

export default function SitemapGeneratorTool() {
  const [urlsText, setUrlsText] = useState('')
  const [defaultChangefreq, setDefaultChangefreq] = useState('weekly')
  const [defaultPriority, setDefaultPriority] = useState('0.8')
  const [entries, setEntries] = useState<UrlEntry[]>([])
  const [generated, setGenerated] = useState(false)

  const parseUrls = () => {
    const lines = urlsText.split('\n').map(l => l.trim()).filter(Boolean)
    const parsed = lines.map(url => ({
      url: url.startsWith('http') ? url : `https://${url}`,
      changefreq: defaultChangefreq,
      priority: defaultPriority,
    }))
    setEntries(parsed)
    setGenerated(true)
  }

  const updateEntry = (index: number, field: keyof UrlEntry, value: string) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e))
  }

  const today = new Date().toISOString().split('T')[0]

  const output = useMemo(() => {
    if (!generated || entries.length === 0) return ''
    const urls = entries.map(e =>
      `  <url>\n    <loc>${e.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    ).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
  }, [entries, generated, today])

  const clear = () => {
    setUrlsText(''); setEntries([]); setGenerated(false)
  }

  return (
    <ToolPage title="XML Sitemap Generator" description="Paste a list of URLs to generate an XML sitemap with lastmod, changefreq, and priority." category="seo" categoryLabel="SEO Tools">
      <div className="space-y-4">
        {!generated ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Paste URLs (one per line)</span>
              <ClearButton onClear={clear} />
            </div>
            <ToolTextarea value={urlsText} onChange={setUrlsText} placeholder={"https://example.com\nhttps://example.com/about\nhttps://example.com/contact"} rows={8} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Default Change Frequency</label>
                <select value={defaultChangefreq} onChange={e => setDefaultChangefreq(e.target.value)} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="always">always</option>
                  <option value="hourly">hourly</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                  <option value="never">never</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Default Priority</label>
                <select value={defaultPriority} onChange={e => setDefaultPriority(e.target.value)} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1', '0.0'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <button onClick={parseUrls} disabled={!urlsText.trim()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              Generate Sitemap
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">URL Settings ({entries.length} URLs)</span>
              <button onClick={() => setGenerated(false)} className="text-xs text-primary hover:underline">Edit URLs</button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {entries.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted text-sm">
                  <span className="flex-1 font-mono text-xs truncate">{entry.url}</span>
                  <select value={entry.changefreq} onChange={e => updateEntry(i, 'changefreq', e.target.value)} className="rounded-md border border-input bg-tool-bg p-1 text-xs focus:outline-none">
                    {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <select value={entry.priority} onChange={e => updateEntry(i, 'priority', e.target.value)} className="rounded-md border border-input bg-tool-bg p-1 text-xs focus:outline-none">
                    {['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1', '0.0'].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Generated Sitemap XML</span>
              <div className="flex gap-2">
                <CopyButton text={output} />
                <DownloadButton content={output} filename="sitemap.xml" mimeType="application/xml" />
                <ClearButton onClear={clear} />
              </div>
            </div>
            <ToolTextarea value={output} readOnly rows={14} />
          </>
        )}
      </div>
    </ToolPage>
  )
}
