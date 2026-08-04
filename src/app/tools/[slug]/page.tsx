import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return {
    title,
    description: `Free online ${title.toLowerCase()}. Process data securely in your browser. No login required.`,
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
