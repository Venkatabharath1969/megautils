'use client'

import { useState, useMemo } from 'react'
import { ToolPage, CopyButton, ClearButton } from '@/components/tool-page'

interface BreadcrumbItem {
  name: string
  url: string
}

export default function SchemaBreadcrumbTool() {
  const [items, setItems] = useState<BreadcrumbItem[]>([
    { name: 'Home', url: 'https://example.com' },
    { name: '', url: '' },
  ])

  const updateItem = (index: number, field: keyof BreadcrumbItem, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const output = useMemo(() => {
    const validItems = items.filter(item => item.name.trim())
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: validItems.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        ...(item.url && { item: item.url }),
      })),
    }
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  }, [items])

  const clear = () => setItems([{ name: 'Home', url: 'https://example.com' }, { name: '', url: '' }])

  const inputClass = 'w-full rounded-lg border border-input bg-tool-bg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <ToolPage
      title="Breadcrumb Schema Generator"
      description="Generate BreadcrumbList JSON-LD structured data for SEO."
      category="seo"
      categoryLabel="SEO Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>Breadcrumb Schema Generator is a free browser-based tool that lets you generate BreadcrumbList JSON-LD structured data for navigation breadcrumbs on your website. It processes everything locally in your browser using JavaScript, so your data never leaves your device. No sign-up, no installation, and no server uploads required — just open the tool and start using it immediately.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Fill in the required fields with your page or content information.</li>
            <li>Configure optional settings to match your specific SEO needs.</li>
            <li>Review the generated output, preview, or analysis results.</li>
            <li>Copy the generated code or export the results for use on your website.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>This tool is particularly useful when adding breadcrumb rich snippets in search results, improving site navigation understanding for search engines. Since it runs entirely in your browser, it works offline after the page loads and keeps your data completely private. Whether you are a developer, designer, student, or professional, this SEO tool saves time and eliminates the need for desktop software installation.</p>

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
        { question: 'What is BreadcrumbList schema?', answer: 'BreadcrumbList schema is JSON-LD structured data that describes the navigational hierarchy of a page within your site. It helps Google display breadcrumb trails in search results instead of raw URLs.' },
        { question: 'How many breadcrumb items should I include?', answer: 'Include every level from the homepage to the current page. Most sites have 2-5 levels. The last item typically represents the current page and should not include a URL.' },
        { question: 'Do breadcrumbs improve SEO rankings?', answer: 'Breadcrumbs do not directly boost rankings, but they improve how your pages appear in search results and help Google understand your site structure, which can indirectly benefit SEO.' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Breadcrumb Path</h2>
            <ClearButton onClear={clear} />
          </div>

          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex items-center justify-center w-7 h-10 shrink-0 text-xs font-bold text-muted-foreground">{i + 1}.</div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input type="text" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Page name" className={inputClass} />
                <input type="url" value={item.url} onChange={e => updateItem(i, 'url', e.target.value)} placeholder="https://example.com/page" className={inputClass} />
              </div>
              {items.length > 2 && (
                <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-700 shrink-0 px-1 pt-2.5">Remove</button>
              )}
            </div>
          ))}

          <button onClick={() => setItems([...items, { name: '', url: '' }])} className="w-full px-4 py-2 rounded-lg border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">+ Add Path Item</button>

          {/* Preview */}
          <div className="mt-4 p-3 rounded-lg bg-muted">
            <span className="text-xs font-semibold text-muted-foreground block mb-1">Preview</span>
            <div className="text-sm">
              {items.filter(it => it.name.trim()).map((it, i, arr) => (
                <span key={i}>
                  <span className="text-primary underline">{it.name}</span>
                  {i < arr.length - 1 && <span className="text-muted-foreground mx-1">&gt;</span>}
                </span>
              ))}
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
