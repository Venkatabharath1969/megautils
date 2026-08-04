'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

export default function SchemaArticleTool() {
  const [headline, setHeadline] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorUrl, setAuthorUrl] = useState('')
  const [datePublished, setDatePublished] = useState('')
  const [dateModified, setDateModified] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [publisherName, setPublisherName] = useState('')
  const [publisherLogo, setPublisherLogo] = useState('')
  const [description, setDescription] = useState('')

  const output = useMemo(() => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
    }
    if (headline) schema.headline = headline
    if (description) schema.description = description
    if (imageUrl) schema.image = imageUrl
    if (datePublished) schema.datePublished = datePublished
    if (dateModified) schema.dateModified = dateModified
    if (authorName) {
      const author: Record<string, string> = { '@type': 'Person', name: authorName }
      if (authorUrl) author.url = authorUrl
      schema.author = author
    }
    if (publisherName) {
      const publisher: Record<string, unknown> = { '@type': 'Organization', name: publisherName }
      if (publisherLogo) publisher.logo = { '@type': 'ImageObject', url: publisherLogo }
      schema.publisher = publisher
    }
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }, [headline, authorName, authorUrl, datePublished, dateModified, imageUrl, publisherName, publisherLogo, description])

  const clear = () => {
    setHeadline(''); setAuthorName(''); setAuthorUrl(''); setDatePublished('')
    setDateModified(''); setImageUrl(''); setPublisherName(''); setPublisherLogo(''); setDescription('')
  }

  const inputClass = 'w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage title="Article Schema Generator" description="Generate Article JSON-LD structured data for SEO." category="seo" categoryLabel="SEO Tools">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Article Details</h2>
            <ClearButton onClear={clear} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Headline</label>
            <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Article headline" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of the article..." rows={3} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Author Name</label>
              <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="John Doe" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author URL</label>
              <input type="url" value={authorUrl} onChange={e => setAuthorUrl(e.target.value)} placeholder="https://example.com/author" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date Published</label>
              <input type="date" value={datePublished} onChange={e => setDatePublished(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Modified</label>
              <input type="date" value={dateModified} onChange={e => setDateModified(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Publisher Name</label>
              <input type="text" value={publisherName} onChange={e => setPublisherName(e.target.value)} placeholder="Acme Inc." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Publisher Logo URL</label>
              <input type="url" value={publisherLogo} onChange={e => setPublisherLogo(e.target.value)} placeholder="https://example.com/logo.png" className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Generated JSON-LD</span>
            <CopyButton text={output} />
          </div>
          <pre className="w-full rounded-lg border border-input bg-tool-bg p-3 text-xs font-mono overflow-auto whitespace-pre-wrap min-h-[300px]">{output}</pre>
        </div>
      </div>
    </ToolPage>
  )
}
