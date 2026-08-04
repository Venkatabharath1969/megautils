'use client'

import { useState } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'

export default function OpenGraphPreviewTool() {
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [ogUrl, setOgUrl] = useState('')
  const [preview, setPreview] = useState<'facebook' | 'linkedin' | 'twitter'>('facebook')

  const clear = () => { setOgTitle(''); setOgDescription(''); setOgImage(''); setOgUrl('') }

  const displayDomain = (() => {
    try {
      if (!ogUrl) return 'example.com'
      const u = new URL(ogUrl.startsWith('http') ? ogUrl : `https://${ogUrl}`)
      return u.hostname
    } catch {
      return 'example.com'
    }
  })()

  const titleText = ogTitle || 'Open Graph Title'
  const descText = ogDescription || 'This is a preview of how your link will appear when shared on social media platforms.'

  return (
    <ToolPage title="Open Graph Preview" description="Preview how your links will appear when shared on Facebook, LinkedIn, and Twitter." category="seo" categoryLabel="SEO Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">OG Properties</h2>
            <ClearButton onClear={clear} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">OG Title</label>
            <input type="text" value={ogTitle} onChange={e => setOgTitle(e.target.value)} placeholder="Your Page Title" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">OG Description</label>
            <textarea value={ogDescription} onChange={e => setOgDescription(e.target.value)} placeholder="A compelling description of your page..." rows={3} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">OG Image URL</label>
            <input type="url" value={ogImage} onChange={e => setOgImage(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className="text-xs text-muted-foreground mt-1">Recommended: 1200x630 pixels</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Page URL</label>
            <input type="url" value={ogUrl} onChange={e => setOgUrl(e.target.value)} placeholder="https://example.com/page" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Previews */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Social Media Preview</span>
            <div className="flex gap-1">
              {(['facebook', 'linkedin', 'twitter'] as const).map(p => (
                <button key={p} onClick={() => setPreview(p)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${preview === p ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                  {p === 'twitter' ? 'Twitter/X' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Facebook Preview */}
          {preview === 'facebook' && (
            <div className="rounded-lg border border-gray-300 overflow-hidden bg-white max-w-[500px]">
              <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center overflow-hidden">
                {ogImage ? (
                  <img src={ogImage} alt="OG Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="text-gray-400 text-sm">No image provided</div>
                )}
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide">{displayDomain}</div>
                <div className="text-base font-semibold text-gray-900 mt-0.5 leading-tight line-clamp-2">{titleText}</div>
                <div className="text-sm text-gray-500 mt-0.5 line-clamp-2">{descText}</div>
              </div>
            </div>
          )}

          {/* LinkedIn Preview */}
          {preview === 'linkedin' && (
            <div className="rounded-lg border border-gray-300 overflow-hidden bg-white max-w-[500px]">
              <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center overflow-hidden">
                {ogImage ? (
                  <img src={ogImage} alt="OG Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="text-gray-400 text-sm">No image provided</div>
                )}
              </div>
              <div className="p-3 bg-white border-t border-gray-200">
                <div className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">{titleText}</div>
                <div className="text-xs text-gray-500 mt-1">{displayDomain}</div>
              </div>
            </div>
          )}

          {/* Twitter Preview */}
          {preview === 'twitter' && (
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white max-w-[500px]">
              <div className="aspect-[2/1] bg-gray-100 flex items-center justify-center overflow-hidden">
                {ogImage ? (
                  <img src={ogImage} alt="OG Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="text-gray-400 text-sm">No image provided</div>
                )}
              </div>
              <div className="p-3 border-t border-gray-200">
                <div className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{titleText}</div>
                <div className="text-sm text-gray-500 mt-0.5 line-clamp-2">{descText}</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
                  {displayDomain}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
