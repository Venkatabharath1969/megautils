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
    <ToolPage title="Robots.txt Generator" description="Build a robots.txt file with user-agent rules, sitemap URL, and crawl delay." category="seo" categoryLabel="SEO Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Robots.txt Generator is a free browser-based tool that lets you create robots.txt files with rules for search engine crawlers including allow, disallow, and sitemap directives. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Fill in the required fields with your page or content information.</li>
            <li>Configure optional settings to match your specific SEO needs.</li>
            <li>Review the generated output, preview, or analysis results.</li>
            <li>Copy the generated code or export the results for use on your website.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when controlling search engine access to your website, blocking private directories, or specifying sitemap locations. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this SEO tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Validate generated markup using Google Rich Results Test before deploying to your site.</li>
            <li>Keep meta titles under 60 characters and descriptions under 160 characters for optimal display in search results.</li>
            <li>Update structured data whenever your page content changes significantly.</li>
            <li>Test how your pages appear in search results using the preview features provided.</li>
            <li>All SEO analysis runs in your browser — your website data stays private.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'What is a robots.txt file?', answer: 'A robots.txt file is a plain text file placed at the root of your website that tells search engine crawlers which pages or sections they are allowed or disallowed from crawling.' },
        { question: 'Does robots.txt block pages from appearing in Google?', answer: 'No, robots.txt only prevents crawling, not indexing. Google may still index a URL if other pages link to it. Use a "noindex" meta tag to prevent a page from appearing in search results.' },
        { question: 'Where should I put my robots.txt file?', answer: 'The robots.txt file must be placed in the root directory of your website (e.g., https://example.com/robots.txt). It won\'t work if placed in a subdirectory.' },
        { question: 'What does crawl delay do in robots.txt?', answer: 'Crawl delay tells bots to wait a specified number of seconds between requests, which helps reduce server load. Note that Google ignores the crawl-delay directive.' },
      ]}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Rules</h2>
            <ClearButton onClear={clear} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Allow All', apply: () => { setRules([{ id: '1', userAgent: '*', type: 'Allow' as const, path: '/' }]); setSitemapUrl(''); setCrawlDelay('') } },
                { label: 'Block All', apply: () => { setRules([{ id: '1', userAgent: '*', type: 'Disallow' as const, path: '/' }]); setSitemapUrl(''); setCrawlDelay('') } },
                { label: 'Block AI Crawlers', apply: () => { setRules([
                  { id: '1', userAgent: '*', type: 'Allow' as const, path: '/' },
                  { id: '2', userAgent: 'GPTBot', type: 'Disallow' as const, path: '/' },
                  { id: '3', userAgent: 'ChatGPT-User', type: 'Disallow' as const, path: '/' },
                  { id: '4', userAgent: 'ClaudeBot', type: 'Disallow' as const, path: '/' },
                  { id: '5', userAgent: 'Bytespider', type: 'Disallow' as const, path: '/' },
                  { id: '6', userAgent: 'CCBot', type: 'Disallow' as const, path: '/' },
                ]); setNextId(7) } },
                { label: 'WordPress Default', apply: () => { setRules([
                  { id: '1', userAgent: '*', type: 'Disallow' as const, path: '/wp-admin/' },
                  { id: '2', userAgent: '*', type: 'Allow' as const, path: '/wp-admin/admin-ajax.php' },
                  { id: '3', userAgent: '*', type: 'Disallow' as const, path: '/wp-includes/' },
                ]); setNextId(4) } },
              ].map(preset => (
                <button key={preset.label} onClick={preset.apply} className="px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground border border-border hover:bg-muted transition-colors">
                  {preset.label}
                </button>
              ))}
            </div>
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
