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
    <ToolPage
      title="Article Schema Generator"
      description="Generate Article JSON-LD structured data for SEO."
      category="seo"
      categoryLabel="SEO Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Article Schema Generator is a free browser-based tool that lets you generate JSON-LD structured data for articles following Schema.org Article markup standards. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Fill in the required fields with your page or content information.</li>
            <li>Configure optional settings to match your specific SEO needs.</li>
            <li>Review the generated output, preview, or analysis results.</li>
            <li>Copy the generated code or export the results for use on your website.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when adding rich snippets to blog posts, news articles, or content pages to improve search engine understanding. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this SEO tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is Article schema markup?', answer: 'Article schema is JSON-LD structured data that tells search engines about your article content, including the headline, author, publish date, and publisher. It helps your pages qualify for rich results in Google Search.' },
        { question: 'Where do I put the Article JSON-LD code?', answer: 'Paste the generated script tag into the <head> section of your HTML page or within the <body>. Google can read JSON-LD regardless of placement, but the <head> is the most common convention.' },
        { question: 'Is Article schema required for SEO?', answer: 'It is not required, but strongly recommended. Article schema helps Google understand your content better, which can lead to enhanced search appearances like Top Stories carousels and rich snippets.' },
        { question: 'What is the difference between Article and NewsArticle schema?', answer: 'Article is a general type for any article, while NewsArticle is a subtype specifically for time-sensitive news content. Use NewsArticle only for journalistic news; otherwise, Article is the correct choice.' },
      ]}
    >
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
