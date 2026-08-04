'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

interface BulkEntry {
  source: string
  medium: string
  campaign: string
}

export default function UtmLinkBuilderTool() {
  const [baseUrl, setBaseUrl] = useState('')
  const [source, setSource] = useState('')
  const [medium, setMedium] = useState('')
  const [campaign, setCampaign] = useState('')
  const [term, setTerm] = useState('')
  const [content, setContent] = useState('')
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [bulkEntries, setBulkEntries] = useState<BulkEntry[]>([
    { source: 'google', medium: 'cpc', campaign: '' },
    { source: 'facebook', medium: 'social', campaign: '' },
    { source: 'newsletter', medium: 'email', campaign: '' },
  ])

  const singleUrl = useMemo(() => {
    if (!baseUrl) return ''
    const params = new URLSearchParams()
    if (source) params.set('utm_source', source)
    if (medium) params.set('utm_medium', medium)
    if (campaign) params.set('utm_campaign', campaign)
    if (term) params.set('utm_term', term)
    if (content) params.set('utm_content', content)
    const qs = params.toString()
    if (!qs) return baseUrl
    const separator = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${separator}${qs}`
  }, [baseUrl, source, medium, campaign, term, content])

  const bulkOutput = useMemo(() => {
    if (!baseUrl || mode !== 'bulk') return ''
    const lines = ['URL,Source,Medium,Campaign']
    for (const entry of bulkEntries) {
      if (!entry.source && !entry.medium && !entry.campaign) continue
      const params = new URLSearchParams()
      if (entry.source) params.set('utm_source', entry.source)
      if (entry.medium) params.set('utm_medium', entry.medium)
      if (entry.campaign) params.set('utm_campaign', entry.campaign || campaign)
      const qs = params.toString()
      const separator = baseUrl.includes('?') ? '&' : '?'
      const url = qs ? `${baseUrl}${separator}${qs}` : baseUrl
      lines.push(`"${url}","${entry.source}","${entry.medium}","${entry.campaign || campaign}"`)
    }
    return lines.join('\n')
  }, [baseUrl, bulkEntries, campaign, mode])

  const updateBulkEntry = (index: number, field: keyof BulkEntry, value: string) => {
    setBulkEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e))
  }

  const addBulkEntry = () => {
    setBulkEntries(prev => [...prev, { source: '', medium: '', campaign: '' }])
  }

  const removeBulkEntry = (index: number) => {
    setBulkEntries(prev => prev.filter((_, i) => i !== index))
  }

  const clear = () => {
    setBaseUrl(''); setSource(''); setMedium(''); setCampaign(''); setTerm(''); setContent('')
    setBulkEntries([
      { source: 'google', medium: 'cpc', campaign: '' },
      { source: 'facebook', medium: 'social', campaign: '' },
      { source: 'newsletter', medium: 'email', campaign: '' },
    ])
  }

  return (
    <ToolPage title="UTM Link Builder" description="Generate UTM-tagged URLs for campaign tracking. Supports single and bulk mode." category="seo" categoryLabel="SEO Tools">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button onClick={() => setMode('single')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'single' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Single URL</button>
            <button onClick={() => setMode('bulk')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'bulk' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Bulk Mode</button>
          </div>
          <ClearButton onClear={clear} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Base URL <span className="text-red-500">*</span></label>
          <input type="url" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://example.com/landing-page" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {mode === 'single' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Source <span className="text-red-500">*</span></label>
                <input type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="google, facebook, newsletter" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Medium <span className="text-red-500">*</span></label>
                <input type="text" value={medium} onChange={e => setMedium(e.target.value)} placeholder="cpc, email, social" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name <span className="text-red-500">*</span></label>
                <input type="text" value={campaign} onChange={e => setCampaign(e.target.value)} placeholder="spring_sale, product_launch" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Term</label>
                <input type="text" value={term} onChange={e => setTerm(e.target.value)} placeholder="running+shoes (optional)" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Content</label>
                <input type="text" value={content} onChange={e => setContent(e.target.value)} placeholder="logolink, textlink (optional)" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {singleUrl && (
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Generated URL</span>
                  <CopyButton text={singleUrl} />
                </div>
                <div className="p-3 rounded-md bg-card border border-border break-all font-mono text-sm">
                  {singleUrl}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Default Campaign Name</label>
              <input type="text" value={campaign} onChange={e => setCampaign(e.target.value)} placeholder="spring_sale" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-semibold">Bulk Entries</span>
              {bulkEntries.map((entry, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <input type="text" value={entry.source} onChange={e => updateBulkEntry(i, 'source', e.target.value)} placeholder="Source" className="flex-1 rounded-md border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input type="text" value={entry.medium} onChange={e => updateBulkEntry(i, 'medium', e.target.value)} placeholder="Medium" className="flex-1 rounded-md border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input type="text" value={entry.campaign} onChange={e => updateBulkEntry(i, 'campaign', e.target.value)} placeholder="Campaign (optional)" className="flex-1 rounded-md border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button onClick={() => removeBulkEntry(i)} className="px-2 py-2 text-red-500 hover:text-red-700">&times;</button>
                </div>
              ))}
              <button onClick={addBulkEntry} className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                + Add Entry
              </button>
            </div>

            {bulkOutput && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">CSV Output</span>
                  <CopyButton text={bulkOutput} />
                </div>
                <ToolTextarea value={bulkOutput} readOnly rows={8} />
              </div>
            )}
          </>
        )}
      </div>
    </ToolPage>
  )
}
