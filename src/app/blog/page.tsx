import Link from 'next/link'
import type { Metadata } from 'next'
import { getVisiblePosts } from '@/lib/blog-data'
import { ChevronRight, Clock, Calendar, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - How-To Guides & Comparisons',
  description: 'Learn how to use developer tools, understand encoding formats, master regex, and more with our in-depth guides.',
}

export default function BlogPage() {
  const posts = getVisiblePosts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Blog</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Blog</h1>
      <p className="text-muted-foreground mb-8">How-to guides, comparisons, and tips for getting the most out of our tools.</p>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No posts published yet.</p>
          <p className="text-sm mt-1">Check back soon for new guides and tutorials!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Tag className="h-3 w-3" />
                  {post.category}
                </span>
              </div>
              <h2 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 flex-1 line-clamp-3">
                {post.description}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingTime} min read
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
