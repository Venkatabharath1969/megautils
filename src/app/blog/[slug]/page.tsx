import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPostBySlugFromDB } from '@/lib/blog-data'
import { ChevronRight, Clock, Calendar, Tag, ArrowLeft } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlugFromDB(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishDate,
    },
  }
}

// Map blog post categories to relevant tool links
const categoryToolLinks: Record<string, { name: string; href: string }[]> = {
  'Developer Tools': [
    { name: 'JSON Formatter', href: '/tools/json-formatter' },
    { name: 'JSON to YAML', href: '/tools/json-to-yaml' },
    { name: 'Regex Tester', href: '/tools/regex-tester' },
    { name: 'Text Diff', href: '/tools/text-diff' },
  ],
  'Encoders': [
    { name: 'Base64 Encoder/Decoder', href: '/tools/base64-encoder' },
    { name: 'URL Encoder/Decoder', href: '/tools/url-encoder' },
    { name: 'JWT Decoder', href: '/tools/jwt-decoder' },
    { name: 'Text to Binary', href: '/tools/text-to-binary' },
  ],
  'Financial': [
    { name: 'Compound Interest Calculator', href: '/tools/compound-interest-calculator' },
    { name: 'EMI Calculator', href: '/tools/emi-calculator' },
    { name: 'Mortgage Calculator', href: '/tools/mortgage-calculator' },
    { name: 'ROI Calculator', href: '/tools/roi-calculator' },
  ],
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlugFromDB(slug)
  if (!post) notFound()

  const relatedTools = categoryToolLinks[post.category] || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
      </nav>

      {/* Article Header */}
      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Tag className="h-3 w-3" />
              {post.category}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{post.title}</h1>
          <p className="text-lg text-muted-foreground mt-3">{post.description}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTime} min read
            </span>
          </div>
        </header>

        {/* Article Content */}
        <div
          className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-table:border-collapse prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-2 prose-th:bg-muted prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div className="mt-12 p-6 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Related Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-sm font-medium"
              >
                {tool.name}
                <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to Blog */}
      <div className="mt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all posts
        </Link>
      </div>
    </div>
  )
}
