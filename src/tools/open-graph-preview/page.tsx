'use client'

import { useState } from 'react'
import { ToolPage, ClearButton, CopyButton } from '@/components/tool-page'

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
    <ToolPage title="Open Graph Preview" description="Preview how your links will appear when shared on Facebook, LinkedIn, and Twitter." category="seo" categoryLabel="SEO Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Open Graph Preview is a free browser-based tool that lets you preview how your web pages will appear when shared on Facebook, Twitter, LinkedIn, and other social platforms. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Fill in the required fields with your page or content information.</li>
            <li>Configure optional settings to match your specific SEO needs.</li>
            <li>Review the generated output, preview, or analysis results.</li>
            <li>Copy the generated code or export the results for use on your website.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when optimizing social media appearances before publishing, debugging Open Graph meta tags, or testing social share cards. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this social media tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is Open Graph and why does it matter?', answer: 'Open Graph is a protocol created by Facebook that controls how URLs are displayed when shared on social media, letting you set the title, description, and image for link previews.' },
        { question: 'What is the recommended Open Graph image size?', answer: 'The recommended OG image size is 1200x630 pixels with a 1.91:1 aspect ratio. This ensures your image displays correctly across Facebook, LinkedIn, and Twitter/X.' },
        { question: 'How do I test my Open Graph tags?', answer: 'Use this preview tool to see how your link will appear, then validate with Facebook\'s Sharing Debugger or Twitter\'s Card Validator to clear any cached previews.' },
        { question: 'Why is my social media link preview not updating?', answer: 'Social platforms cache Open Graph data. After updating your OG tags, use Facebook\'s Sharing Debugger to scrape the URL again and force a cache refresh.' },
      ]}>
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

          {(ogTitle || ogDescription || ogImage || ogUrl) && (
            <div className="p-3 rounded-lg bg-muted space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Generated OG Tags</span>
                <CopyButton text={[
                  ogTitle && `<meta property="og:title" content="${ogTitle}" />`,
                  ogDescription && `<meta property="og:description" content="${ogDescription}" />`,
                  ogImage && `<meta property="og:image" content="${ogImage}" />`,
                  ogUrl && `<meta property="og:url" content="${ogUrl}" />`,
                  '<meta property="og:type" content="website" />',
                ].filter(Boolean).join('\n')} />
              </div>
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{[
                ogTitle && `<meta property="og:title" content="${ogTitle}" />`,
                ogDescription && `<meta property="og:description" content="${ogDescription}" />`,
                ogImage && `<meta property="og:image" content="${ogImage}" />`,
                ogUrl && `<meta property="og:url" content="${ogUrl}" />`,
                '<meta property="og:type" content="website" />',
              ].filter(Boolean).join('\n')}</pre>
            </div>
          )}
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
