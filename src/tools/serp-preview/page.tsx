'use client'

import { useState } from 'react'
import { ToolPage, ClearButton } from '@/components/tool-page'

export default function SerpPreviewTool() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop')

  const clear = () => { setTitle(''); setUrl(''); setDescription('') }

  const displayUrl = (() => {
    try {
      if (!url) return 'https://example.com'
      const u = new URL(url.startsWith('http') ? url : `https://${url}`)
      return u.origin + u.pathname
    } catch {
      return url || 'https://example.com'
    }
  })()

  const breadcrumbUrl = (() => {
    try {
      if (!url) return 'https://example.com'
      const u = new URL(url.startsWith('http') ? url : `https://${url}`)
      const parts = u.pathname.split('/').filter(Boolean)
      return u.origin + (parts.length > 0 ? ' > ' + parts.join(' > ') : '')
    } catch {
      return url || 'https://example.com'
    }
  })()

  const truncatedTitle = title.length > 60 ? title.slice(0, 60) + '...' : (title || 'Page Title')
  const truncatedDesc = description.length > 155 ? description.slice(0, 155) + '...' : (description || 'This is the meta description of your page. It will show up in search engine results. Write a compelling description to improve click-through rates.')

  return (
    <ToolPage title="SERP Preview" description="Preview how your page will appear in Google search results. Check title and description lengths." category="seo" categoryLabel="SEO Tools" faqs={[
        { question: 'What is a SERP preview?', answer: 'A SERP (Search Engine Results Page) preview shows you exactly how your page title, URL, and meta description will look in Google search results before you publish.' },
        { question: 'What is the ideal title tag length for Google?', answer: 'Google typically displays the first 50-60 characters of a title tag. Keeping your title within 60 characters ensures it won\'t be truncated in search results.' },
        { question: 'How long should a meta description be?', answer: 'Meta descriptions should be between 120 and 155 characters. Google may truncate descriptions longer than 155 characters with an ellipsis.' },
        { question: 'Does Google always use my meta description?', answer: 'No, Google may rewrite your meta description if it determines that a different snippet from your page better matches the user\'s search query.' },
      ]}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Page Details</h2>
            <ClearButton onClear={clear} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Page Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Your Page Title" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className={`text-xs mt-1 ${title.length > 60 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              {title.length}/60 characters {title.length > 60 && '(will be truncated)'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Page URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/your-page" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meta Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Write your meta description here..." rows={4} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <div className={`text-xs mt-1 ${description.length > 155 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              {description.length}/155 characters {description.length > 155 && '(will be truncated)'}
            </div>
          </div>

          {/* Character limit indicators */}
          <div className="p-3 rounded-lg bg-muted space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground">Optimization Tips</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${title.length >= 30 && title.length <= 60 ? 'bg-green-500' : title.length > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
              Title: Ideal length is 30-60 characters
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${description.length >= 120 && description.length <= 155 ? 'bg-green-500' : description.length > 0 ? 'bg-yellow-500' : 'bg-gray-300'}`} />
              Description: Ideal length is 120-155 characters
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Google SERP Preview</span>
            <div className="flex gap-1">
              <button onClick={() => setView('desktop')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${view === 'desktop' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Desktop</button>
              <button onClick={() => setView('mobile')} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${view === 'mobile' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>Mobile</button>
            </div>
          </div>

          <div className={`bg-white rounded-lg border border-gray-200 p-4 ${view === 'mobile' ? 'max-w-[360px]' : ''}`}>
            {/* Google-style SERP result */}
            <div className="space-y-1">
              {/* URL / Breadcrumb */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-gray-300" />
                </div>
                <div>
                  <div className="text-xs text-gray-700" style={{ fontFamily: 'Arial, sans-serif' }}>{displayUrl}</div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: 'Arial, sans-serif' }}>{breadcrumbUrl}</div>
                </div>
              </div>
              {/* Title */}
              <h3 className="text-xl leading-snug cursor-pointer" style={{ color: '#1a0dab', fontFamily: 'Arial, sans-serif' }}>
                {truncatedTitle}
              </h3>
              {/* Description */}
              <p className="text-sm leading-relaxed" style={{ color: '#4d5156', fontFamily: 'Arial, sans-serif' }}>
                {truncatedDesc}
              </p>
            </div>
          </div>

          {view === 'mobile' && (
            <p className="text-xs text-muted-foreground mt-2">Mobile preview (360px width)</p>
          )}
        </div>
      </div>
    </ToolPage>
  )
}
