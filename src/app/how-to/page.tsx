import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, BookOpen, ArrowRight } from 'lucide-react'
import { HOW_TO_GUIDES, HOW_TO_CATEGORIES, getHowToGuidesByCategory } from '@/lib/howto-data'

export const metadata: Metadata = {
  title: 'How-To Guides - Step-by-Step Tool Tutorials',
  description: `${HOW_TO_GUIDES.length} free how-to guides for developers, designers, and marketers. Learn to format JSON, generate QR codes, check color contrast, calculate EMI, and more.`,
  keywords: ['how to', 'guide', 'tutorial', 'step by step', 'online tools', 'free tools'],
  alternates: { canonical: 'https://utilsnow.com/how-to' },
  openGraph: {
    title: `How-To Guides - ${HOW_TO_GUIDES.length} Step-by-Step Tutorials | UtilsNow`,
    description: `${HOW_TO_GUIDES.length} free how-to guides for developers, designers, and marketers.`,
    url: 'https://utilsnow.com/how-to',
    type: 'website',
  },
}

export default function HowToHubPage() {
  // Only show categories that have guides
  const categoriesWithGuides = HOW_TO_CATEGORIES.filter(
    (cat) => getHowToGuidesByCategory(cat.id).length > 0
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">How-To Guides</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <BookOpen className="h-4 w-4" />
          {HOW_TO_GUIDES.length} Guides
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          How-To Guides
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Step-by-step guides for every tool on UtilsNow. Learn how to use our free online tools
          with clear instructions, tips, and FAQs.
        </p>
      </div>

      {/* Categories with guides */}
      <div className="space-y-12">
        {categoriesWithGuides.map((cat) => {
          const guides = getHowToGuidesByCategory(cat.id)
          return (
            <section key={cat.id}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {cat.name}
                <span className="text-sm font-normal text-muted-foreground">({guides.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {guides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/how-to/${guide.slug}`}
                    className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <BookOpen className="h-3 w-3" />
                        Guide
                      </span>
                      <span className="text-xs text-muted-foreground">{guide.steps.length} steps</span>
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 flex-1 line-clamp-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                        {guide.toolName}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-primary font-medium">
                        Read guide
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* CollectionPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'How-To Guides',
            description: `${HOW_TO_GUIDES.length} step-by-step guides for free online tools.`,
            url: 'https://utilsnow.com/how-to',
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: HOW_TO_GUIDES.length,
              itemListElement: HOW_TO_GUIDES.map((guide, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: guide.title,
                url: `https://utilsnow.com/how-to/${guide.slug}`,
              })),
            },
          }),
        }}
      />
    </div>
  )
}
