import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Properly capitalize tool names (handle acronyms like JSON, CSS, HTML, etc.)
const acronyms = new Set(['json', 'csv', 'xml', 'yaml', 'toml', 'html', 'css', 'sql', 'jwt', 'url', 'uri', 'uuid', 'qr', 'svg', 'rgb', 'hex', 'bmi', 'emi', 'sip', 'ppf', 'fd', 'rd', 'roi', 'npv', 'irr', 'cagr', 'gst', 'utm', 'ip', 'http', 'ascii', 'dns', 'api', 'rss', 'nato', 'md', 'og', 'serp', 'htaccess', 'base64', 'base32', 'rot13'])

function formatTitle(slug: string): string {
  return slug.split('-').map(w => acronyms.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const title = formatTitle(slug)
  return {
    title,
    description: `Free online ${title.toLowerCase()}. Process data securely in your browser. No login required.`,
    openGraph: {
      title: `${title} | UtilsNow`,
      description: `Free online ${title.toLowerCase()}. 100% client-side, no data uploaded.`,
      url: `https://utilsnow.com/tools/${slug}`,
      type: 'website',
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
