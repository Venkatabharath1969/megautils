'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'

interface Rule {
  id: string
  userAgent: string
  type: 'Allow' | 'Disallow'
  path: string
}

export default function RobotsTxtGeneratorTool() {
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', userAgent: '*', type: 'Disallow', path: '' },
  ])
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [crawlDelay, setCrawlDelay] = useState('')
  const [nextId, setNextId] = useState(2)

  const addRule = () => {
    setRules(prev => [...prev, { id: String(nextId), userAgent: '*', type: 'Disallow', path: '/' }])
    setNextId(n => n + 1)
  }

  const removeRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }

  const updateRule = (id: string, field: keyof Rule, value: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const output = useMemo(() => {
    const grouped: Record<string, Rule[]> = {}
    for (const rule of rules) {
      const agent = rule.userAgent || '*'
      if (!grouped[agent]) grouped[agent] = []
      grouped[agent].push(rule)
    }

    const lines: string[] = []
    for (const [agent, agentRules] of Object.entries(grouped)) {
      lines.push(`User-agent: ${agent}`)
      if (crawlDelay) lines.push(`Crawl-delay: ${crawlDelay}`)
      for (const rule of agentRules) {
        if (rule.path) lines.push(`${rule.type}: ${rule.path}`)
      }
      lines.push('')
    }

    if (sitemapUrl) lines.push(`Sitemap: ${sitemapUrl}`)

    return lines.join('\n').trim()
  }, [rules, sitemapUrl, crawlDelay])

  const clear = () => {
    setRules([{ id: '1', userAgent: '*', type: 'Disallow', path: '' }])
    setSitemapUrl('')
    setCrawlDelay('')
    setNextId(2)
  }

  return (
    <ToolPage title="Robots.txt Generator" description="Build a robots.txt file with user-agent rules, sitemap URL, and crawl delay." category="seo" categoryLabel="SEO Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Rules</h2>
            <ClearButton onClear={clear} />
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-end gap-2 p-3 rounded-lg bg-muted">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">User-Agent</label>
                  <input type="text" value={rule.userAgent} onChange={e => updateRule(rule.id, 'userAgent', e.target.value)} placeholder="*" className="w-full rounded-md border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium mb-1">Type</label>
                  <select value={rule.type} onChange={e => updateRule(rule.id, 'type', e.target.value)} className="w-full rounded-md border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="Allow">Allow</option>
                    <option value="Disallow">Disallow</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1">Path</label>
                  <input type="text" value={rule.path} onChange={e => updateRule(rule.id, 'path', e.target.value)} placeholder="/path/" className="w-full rounded-md border border-input bg-tool-bg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <button onClick={() => removeRule(rule.id)} className="px-2 py-2 text-sm text-red-500 hover:text-red-700 transition-colors" title="Remove rule">&times;</button>
              </div>
            ))}
          </div>

          <button onClick={addRule} className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            + Add Rule
          </button>

          <div>
            <label className="block text-sm font-medium mb-1">Sitemap URL</label>
            <input type="url" value={sitemapUrl} onChange={e => setSitemapUrl(e.target.value)} placeholder="https://example.com/sitemap.xml" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Crawl Delay (seconds)</label>
            <input type="number" min="0" value={crawlDelay} onChange={e => setCrawlDelay(e.target.value)} placeholder="10" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Generated robots.txt</span>
            <div className="flex gap-2">
              <CopyButton text={output} />
              <DownloadButton content={output} filename="robots.txt" />
            </div>
          </div>
          <pre className="w-full rounded-lg border border-input bg-tool-bg p-4 text-sm font-mono whitespace-pre-wrap min-h-[300px]">{output || 'Configure rules to generate robots.txt...'}</pre>
        </div>
      </div>
    </ToolPage>
  )
}
