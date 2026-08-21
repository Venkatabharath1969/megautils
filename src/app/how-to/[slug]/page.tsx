import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChevronRight, ArrowRight, HelpCircle, BookOpen, CheckCircle2 } from 'lucide-react'
import { HOW_TO_GUIDES, getHowToGuideBySlug } from '@/lib/howto-data'

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return HOW_TO_GUIDES.map((g) => ({ slug: g.slug }))
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = getHowToGuideBySlug(slug)
  if (!guide) return { title: 'Guide Not Found' }

  return {
    title: guide.title,
    description: guide.description,
    keywords: [guide.slug.replace(/-/g, ' '), guide.title.toLowerCase(), guide.toolName.toLowerCase(), 'how to', 'guide', 'tutorial'],
    alternates: { canonical: `https://utilsnow.com/how-to/${slug}` },
    openGraph: {
      title: `${guide.title} | UtilsNow`,
      description: guide.description,
      url: `https://utilsnow.com/how-to/${slug}`,
      type: 'article',
    },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HowToGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getHowToGuideBySlug(slug)
  if (!guide) notFound()

  // HowTo JSON-LD schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title,
    description: guide.description,
    step: guide.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
    tool: {
      '@type': 'HowToTool',
      name: guide.toolName,
    },
    totalTime: 'PT2M',
    supply: [],
  }

  // FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://utilsnow.com' },
      { '@type': 'ListItem', position: 2, name: 'How-To Guides', item: 'https://utilsnow.com/how-to' },
      { '@type': 'ListItem', position: 3, name: guide.title },
    ],
  }

  // Related guides (same category, different slug)
  const relatedGuides = HOW_TO_GUIDES
    .filter((g) => g.category === guide.category && g.slug !== guide.slug)
    .slice(0, 4)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/how-to" className="hover:text-foreground transition-colors">How-To Guides</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{guide.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <BookOpen className="h-4 w-4" />
          How-To Guide
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">{guide.title}</h1>
        <p className="text-lg text-muted-foreground">{guide.description}</p>
      </div>

      {/* Quick CTA */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg mb-1">Skip to the Tool</h2>
            <p className="text-muted-foreground text-sm">
              Want to jump straight in? Use our free {guide.toolName} tool directly.
            </p>
          </div>
          <Link
            href={`/tools/${guide.toolSlug}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Use {guide.toolName}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Step-by-step guide */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-5">Step-by-Step Guide</h2>
        <div className="space-y-4">
          {guide.steps.map((step, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex-shrink-0">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {i + 1}
                </span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">{step.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main CTA */}
      <div className="rounded-xl border border-border bg-card p-6 text-center mb-8">
        <h2 className="text-lg font-semibold mb-2">Ready to Try It?</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Use our free {guide.toolName} tool — no signup, no uploads, works directly in your browser.
        </p>
        <Link
          href={`/tools/${guide.toolSlug}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <CheckCircle2 className="h-4 w-4" />
          Open {guide.toolName}
        </Link>
      </div>

      {/* FAQ section */}
      {guide.faqs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {guide.faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related guides */}
      {relatedGuides.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Related Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/how-to/${g.slug}`}
                className="group flex flex-col p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
              >
                <span className="font-semibold group-hover:text-primary transition-colors">{g.title}</span>
                <span className="text-xs text-muted-foreground mt-1 line-clamp-2">{g.description}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Browse all guides */}
      <div className="text-center">
        <Link
          href="/how-to"
          className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
        >
          Browse all how-to guides
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
