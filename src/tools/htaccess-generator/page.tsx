'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, DownloadButton, ClearButton } from '@/components/tool-page'
import { Plus, Trash2 } from 'lucide-react'

interface Redirect {
  id: number
  from: string
  to: string
  type: '301' | '302'
}

export default function HtaccessGeneratorTool() {
  const [forceHttps, setForceHttps] = useState(false)
  const [wwwMode, setWwwMode] = useState<'none' | 'www' | 'non-www'>('none')
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [error404, setError404] = useState('')
  const [error403, setError403] = useState('')
  const [error500, setError500] = useState('')
  const [enableGzip, setEnableGzip] = useState(false)
  const [enableCaching, setEnableCaching] = useState(false)
  const [blockHotlinking, setBlockHotlinking] = useState(false)
  const [nextId, setNextId] = useState(1)

  const addRedirect = useCallback(() => {
    setRedirects(prev => [...prev, { id: nextId, from: '', to: '', type: '301' }])
    setNextId(prev => prev + 1)
  }, [nextId])

  const updateRedirect = useCallback((id: number, field: keyof Redirect, value: string) => {
    setRedirects(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }, [])

  const removeRedirect = useCallback((id: number) => {
    setRedirects(prev => prev.filter(r => r.id !== id))
  }, [])

  const output = useMemo(() => {
    const lines: string[] = []

    if (forceHttps) {
      lines.push('# Force HTTPS')
      lines.push('RewriteEngine On')
      lines.push('RewriteCond %{HTTPS} off')
      lines.push('RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]')
      lines.push('')
    }

    if (wwwMode === 'www') {
      lines.push('# Force www')
      lines.push('RewriteEngine On')
      lines.push('RewriteCond %{HTTP_HOST} !^www\\. [NC]')
      lines.push('RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]')
      lines.push('')
    } else if (wwwMode === 'non-www') {
      lines.push('# Force non-www')
      lines.push('RewriteEngine On')
      lines.push('RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]')
      lines.push('RewriteRule ^(.*)$ https://%1%{REQUEST_URI} [L,R=301]')
      lines.push('')
    }

    const validRedirects = redirects.filter(r => r.from.trim() && r.to.trim())
    if (validRedirects.length > 0) {
      lines.push('# Redirects')
      for (const r of validRedirects) {
        lines.push(`Redirect ${r.type} ${r.from} ${r.to}`)
      }
      lines.push('')
    }

    const errorPages = [
      { code: '404', page: error404 },
      { code: '403', page: error403 },
      { code: '500', page: error500 },
    ].filter(e => e.page.trim())

    if (errorPages.length > 0) {
      lines.push('# Custom Error Pages')
      for (const e of errorPages) {
        lines.push(`ErrorDocument ${e.code} ${e.page}`)
      }
      lines.push('')
    }

    if (enableGzip) {
      lines.push('# Enable Gzip Compression')
      lines.push('<IfModule mod_deflate.c>')
      lines.push('  AddOutputFilterByType DEFLATE text/html')
      lines.push('  AddOutputFilterByType DEFLATE text/css')
      lines.push('  AddOutputFilterByType DEFLATE text/javascript')
      lines.push('  AddOutputFilterByType DEFLATE application/javascript')
      lines.push('  AddOutputFilterByType DEFLATE application/json')
      lines.push('  AddOutputFilterByType DEFLATE application/xml')
      lines.push('  AddOutputFilterByType DEFLATE image/svg+xml')
      lines.push('</IfModule>')
      lines.push('')
    }

    if (enableCaching) {
      lines.push('# Browser Caching')
      lines.push('<IfModule mod_expires.c>')
      lines.push('  ExpiresActive On')
      lines.push('  ExpiresByType image/jpeg "access plus 1 year"')
      lines.push('  ExpiresByType image/png "access plus 1 year"')
      lines.push('  ExpiresByType image/gif "access plus 1 year"')
      lines.push('  ExpiresByType image/svg+xml "access plus 1 year"')
      lines.push('  ExpiresByType text/css "access plus 1 month"')
      lines.push('  ExpiresByType application/javascript "access plus 1 month"')
      lines.push('  ExpiresByType text/html "access plus 1 hour"')
      lines.push('</IfModule>')
      lines.push('')
    }

    if (blockHotlinking) {
      lines.push('# Block Hotlinking')
      lines.push('RewriteEngine On')
      lines.push('RewriteCond %{HTTP_REFERER} !^$')
      lines.push('RewriteCond %{HTTP_REFERER} !^https?://(www\\.)?yourdomain\\.com [NC]')
      lines.push('RewriteRule \\.(jpg|jpeg|png|gif|svg|webp)$ - [F,NC,L]')
      lines.push('')
    }

    return lines.join('\n').trim()
  }, [forceHttps, wwwMode, redirects, error404, error403, error500, enableGzip, enableCaching, blockHotlinking])

  const clear = () => {
    setForceHttps(false)
    setWwwMode('none')
    setRedirects([])
    setError404('')
    setError403('')
    setError500('')
    setEnableGzip(false)
    setEnableCaching(false)
    setBlockHotlinking(false)
  }

  return (
    <ToolPage
      title=".htaccess Generator"
      description="Generate .htaccess rules for redirects, HTTPS, caching, and more"
      category="generators"
      categoryLabel="Generators"
      faqs={[
        { question: 'What is an .htaccess file?', answer: 'An .htaccess file is a configuration file used by Apache web servers to control directory-level settings like URL redirects, access control, HTTPS enforcement, and caching rules.' },
        { question: 'Where do I put the .htaccess file?', answer: 'Place the .htaccess file in the root directory of your website. It affects that directory and all subdirectories unless overridden by another .htaccess file.' },
        { question: 'What is the difference between a 301 and 302 redirect?', answer: 'A 301 redirect is permanent and passes SEO link equity to the new URL. A 302 redirect is temporary and tells search engines to keep indexing the original URL.' },
        { question: 'Does .htaccess work on Nginx servers?', answer: 'No, .htaccess files only work on Apache servers. Nginx uses its own configuration files (nginx.conf) for similar functionality like redirects and caching.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Configuration</span>
            <ClearButton onClear={clear} />
          </div>

          {/* Toggle options */}
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={forceHttps} onChange={(e) => setForceHttps(e.target.checked)} className="rounded accent-primary" />
              Force HTTPS
            </label>
            <br />
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={enableGzip} onChange={(e) => setEnableGzip(e.target.checked)} className="rounded accent-primary" />
              Enable Gzip Compression
            </label>
            <br />
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={enableCaching} onChange={(e) => setEnableCaching(e.target.checked)} className="rounded accent-primary" />
              Enable Browser Caching
            </label>
            <br />
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={blockHotlinking} onChange={(e) => setBlockHotlinking(e.target.checked)} className="rounded accent-primary" />
              Block Image Hotlinking
            </label>
          </div>

          {/* WWW mode */}
          <div>
            <label className="text-sm font-medium mb-2 block">WWW Preference</label>
            <div className="flex gap-2">
              {(['none', 'www', 'non-www'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setWwwMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    wwwMode === mode ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'
                  }`}
                >
                  {mode === 'none' ? 'No preference' : mode === 'www' ? 'Force www' : 'Force non-www'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom error pages */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">Custom Error Pages</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">404 Page</label>
                <input type="text" value={error404} onChange={(e) => setError404(e.target.value)} placeholder="/404.html" className="w-full h-8 px-2 rounded-md border border-input bg-card text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">403 Page</label>
                <input type="text" value={error403} onChange={(e) => setError403(e.target.value)} placeholder="/403.html" className="w-full h-8 px-2 rounded-md border border-input bg-card text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">500 Page</label>
                <input type="text" value={error500} onChange={(e) => setError500(e.target.value)} placeholder="/500.html" className="w-full h-8 px-2 rounded-md border border-input bg-card text-xs" />
              </div>
            </div>
          </div>

          {/* Redirects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">URL Redirects</label>
              <button onClick={addRedirect} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border hover:bg-muted transition-colors">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            {redirects.map((r) => (
              <div key={r.id} className="flex gap-2 items-start">
                <select
                  value={r.type}
                  onChange={(e) => updateRedirect(r.id, 'type', e.target.value)}
                  className="h-8 px-2 rounded-md border border-input bg-card text-xs w-16"
                >
                  <option value="301">301</option>
                  <option value="302">302</option>
                </select>
                <input
                  type="text"
                  value={r.from}
                  onChange={(e) => updateRedirect(r.id, 'from', e.target.value)}
                  placeholder="/old-page"
                  className="flex-1 h-8 px-2 rounded-md border border-input bg-card text-xs"
                />
                <input
                  type="text"
                  value={r.to}
                  onChange={(e) => updateRedirect(r.id, 'to', e.target.value)}
                  placeholder="/new-page"
                  className="flex-1 h-8 px-2 rounded-md border border-input bg-card text-xs"
                />
                <button onClick={() => removeRedirect(r.id)} className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-red-500/10 hover:text-red-500 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">.htaccess Output</span>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && <DownloadButton content={output} filename=".htaccess" />}
            </div>
          </div>
          <ToolTextarea value={output} readOnly placeholder="Configure options to generate .htaccess rules..." rows={24} />
        </div>
      </div>
    </ToolPage>
  )
}
