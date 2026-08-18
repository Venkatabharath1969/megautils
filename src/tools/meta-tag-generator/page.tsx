'use client'

import { useState, useMemo } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'

export default function MetaTagGeneratorTool() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [keywords, setKeywords] = useState('')
  const [author, setAuthor] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')
  const [robotsIndex, setRobotsIndex] = useState<'index' | 'noindex'>('index')
  const [robotsFollow, setRobotsFollow] = useState<'follow' | 'nofollow'>('follow')
  const [ogType, setOgType] = useState('website')
  const [ogImage, setOgImage] = useState('')
  const [twitterCard, setTwitterCard] = useState<'summary' | 'summary_large_image'>('summary_large_image')
  const [twitterSite, setTwitterSite] = useState('')

  const output = useMemo(() => {
    const lines: string[] = ['<!-- Primary Meta Tags -->']
    if (title) lines.push(`<title>${title}</title>`, `<meta name="title" content="${title}" />`)
    if (description) lines.push(`<meta name="description" content="${description}" />`)
    if (keywords) lines.push(`<meta name="keywords" content="${keywords}" />`)
    if (author) lines.push(`<meta name="author" content="${author}" />`)
    lines.push(`<meta name="robots" content="${robotsIndex}, ${robotsFollow}" />`)
    if (canonicalUrl) lines.push(`<link rel="canonical" href="${canonicalUrl}" />`)

    lines.push('', '<!-- Open Graph / Facebook -->')
    lines.push(`<meta property="og:type" content="${ogType}" />`)
    if (title) lines.push(`<meta property="og:title" content="${title}" />`)
    if (description) lines.push(`<meta property="og:description" content="${description}" />`)
    if (canonicalUrl) lines.push(`<meta property="og:url" content="${canonicalUrl}" />`)
    if (ogImage) lines.push(`<meta property="og:image" content="${ogImage}" />`)

    lines.push('', '<!-- Twitter -->')
    lines.push(`<meta property="twitter:card" content="${twitterCard}" />`)
    if (title) lines.push(`<meta property="twitter:title" content="${title}" />`)
    if (description) lines.push(`<meta property="twitter:description" content="${description}" />`)
    if (canonicalUrl) lines.push(`<meta property="twitter:url" content="${canonicalUrl}" />`)
    if (ogImage) lines.push(`<meta property="twitter:image" content="${ogImage}" />`)
    if (twitterSite) lines.push(`<meta property="twitter:site" content="${twitterSite}" />`)

    return lines.join('\n')
  }, [title, description, keywords, author, canonicalUrl, robotsIndex, robotsFollow, ogType, ogImage, twitterCard, twitterSite])

  const clear = () => {
    setTitle(''); setDescription(''); setKeywords(''); setAuthor('')
    setCanonicalUrl(''); setRobotsIndex('index'); setRobotsFollow('follow')
    setOgType('website'); setOgImage(''); setTwitterCard('summary_large_image'); setTwitterSite('')
  }

  return (
    <ToolPage title="Meta Tag Generator" description="Generate HTML meta tags, Open Graph tags, and Twitter Card tags for SEO." category="seo" categoryLabel="SEO Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Meta Tag Generator is a free browser-based tool that lets you generate HTML meta tags for SEO including title, description, Open Graph, Twitter Cards, and canonical URLs. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Enter your data or content in the <strong>input area</strong>.</li>
            <li>Configure any available options or settings to match your needs.</li>
            <li>View the <strong>result instantly</strong> in the output area.</li>
            <li>Use the <strong>Copy</strong> or <strong>Download</strong> button to save your result.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when optimizing web pages for search engines and social media sharing with proper meta tag configuration. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this SEO tool saves time and eliminates the need for desktop software installation.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>All processing happens locally in your browser — your data is never sent to any server, making it safe for sensitive content.</li>
            <li>The tool works on any modern browser including Chrome, Firefox, Safari, and Edge on both desktop and mobile devices.</li>
            <li>No account or sign-up is required — the tool is completely free with no usage limits.</li>
            <li>Use the Copy button to quickly transfer results to your clipboard for pasting into other applications.</li>
            <li>Bookmark this page for quick access whenever you need meta tag generation.</li>
          </ul>
        </>
      }
 faqs={[
        { question: 'What are meta tags and why are they important for SEO?', answer: 'Meta tags are HTML elements in the <head> section that provide search engines with information about your page, including title, description, and indexing instructions. They directly influence how your page appears in search results.' },
        { question: 'What is the ideal length for a meta description?', answer: 'The ideal meta description length is between 120 and 155 characters. Google typically truncates descriptions longer than 155 characters in search results.' },
        { question: 'What are Open Graph tags?', answer: 'Open Graph tags are meta tags that control how your page appears when shared on social media platforms like Facebook and LinkedIn, including the title, description, and preview image.' },
        { question: 'Do I need both Open Graph and Twitter Card tags?', answer: 'Twitter can fall back to Open Graph tags, but adding Twitter Card tags gives you more control over how your content appears on Twitter/X, such as choosing between summary and large image card formats.' },
      ]}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Page Information</h2>
            <ClearButton onClear={clear} />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Page Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Awesome Website" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="text-xs text-muted-foreground mt-1">{title.length}/60 characters</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meta Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description of your page..." rows={3} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="text-xs text-muted-foreground mt-1">{description.length}/155 characters</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Keywords</label>
              <input type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="John Doe" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Canonical URL</label>
              <input type="url" value={canonicalUrl} onChange={e => setCanonicalUrl(e.target.value)} placeholder="https://example.com/page" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Robots Index</label>
                <select value={robotsIndex} onChange={e => setRobotsIndex(e.target.value as 'index' | 'noindex')} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="index">index</option>
                  <option value="noindex">noindex</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Robots Follow</label>
                <select value={robotsFollow} onChange={e => setRobotsFollow(e.target.value as 'follow' | 'nofollow')} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="follow">follow</option>
                  <option value="nofollow">nofollow</option>
                </select>
              </div>
            </div>

            <h2 className="text-sm font-semibold pt-2">Social Media</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">OG Type</label>
                <select value={ogType} onChange={e => setOgType(e.target.value)} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="product">product</option>
                  <option value="profile">profile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Twitter Card</label>
                <select value={twitterCard} onChange={e => setTwitterCard(e.target.value as 'summary' | 'summary_large_image')} className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="summary">summary</option>
                  <option value="summary_large_image">summary_large_image</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">OG Image URL</label>
              <input type="url" value={ogImage} onChange={e => setOgImage(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Twitter @username</label>
              <input type="text" value={twitterSite} onChange={e => setTwitterSite(e.target.value)} placeholder="@yoursite" className="w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Generated Meta Tags</span>
            <CopyButton text={output} />
          </div>
          <ToolTextarea value={output} readOnly rows={24} placeholder="Fill in the form to generate meta tags..." />
        </div>
      </div>
    </ToolPage>
  )
}
