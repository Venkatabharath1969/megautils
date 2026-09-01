import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { TOOLS } from '@/lib/tool-registry'

// Properly capitalize tool names (handle acronyms like JSON, CSS, HTML, etc.)
const acronyms = new Set(['json', 'csv', 'xml', 'yaml', 'toml', 'html', 'css', 'sql', 'jwt', 'url', 'uri', 'uuid', 'qr', 'svg', 'rgb', 'hex', 'bmi', 'emi', 'sip', 'ppf', 'fd', 'rd', 'roi', 'npv', 'irr', 'cagr', 'gst', 'utm', 'ip', 'http', 'ascii', 'dns', 'api', 'rss', 'nato', 'md', 'og', 'serp', 'htaccess', 'base64', 'base32', 'rot13', 'pdf'])

function formatTitle(slug: string): string {
  return slug.split('-').map(w => acronyms.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function generateStaticParams() {
  return TOOLS.map(tool => ({ slug: tool.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tool = TOOLS.find(t => t.id === slug)
  const title = tool?.name || formatTitle(slug)
  const toolDesc = tool?.description || `${title.toLowerCase()} tool`

  // SEO-optimized title: action-oriented with "Free Online" for CTR
  const seoTitle = `${title} — Free Online Tool | No Signup | UtilsNow`
  const seoDesc = `${toolDesc.charAt(0).toUpperCase() + toolDesc.slice(1)}. Free, instant, no signup — 100% private, your data never leaves your browser.`

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: tool?.keywords || [],
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: `https://utilsnow.com/tools/${slug}`,
      type: 'website',
      images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: ['/opengraph-image.png'],
    },
    alternates: {
      canonical: `https://utilsnow.com/tools/${slug}`,
    },
  }
}

export default async function ToolSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Try to dynamically import the tool component
  try {
    const ToolModule = await import(`@/tools/${slug}/page`)
    const ToolComponent = ToolModule.default
    return <ToolComponent />
  } catch {
    notFound()
  }
}
