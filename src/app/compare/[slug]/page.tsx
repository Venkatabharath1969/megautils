import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChevronRight, Scale, CheckCircle2, ArrowRight, HelpCircle, Lightbulb, ExternalLink, ThumbsUp, ThumbsDown, DollarSign } from 'lucide-react'
import { ALL_COMPARISONS, getComparisonBySlug } from '@/lib/comparison-data'

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return ALL_COMPARISONS.map((c) => ({ slug: c.slug }))
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const comp = getComparisonBySlug(slug)
  if (!comp) return { title: 'Comparison Not Found' }

  const title = `${comp.title}: ${comp.subtitle}`
  const description = `${comp.verdict} Compare ${comp.itemA.name} and ${comp.itemB.name} side by side with features, use cases, and our recommendation.`

  return {
    title,
    description,
    keywords: [comp.slug.replace(/-/g, ' '), comp.title.toLowerCase(), `${comp.itemA.name} vs ${comp.itemB.name}`, 'comparison'],
    alternates: { canonical: `https://utilsnow.com/compare/${slug}` },
    openGraph: {
      title: `${title} | UtilsNow`,
      description,
      url: `https://utilsnow.com/compare/${slug}`,
      type: 'article',
    },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const comp = getComparisonBySlug(slug)
  if (!comp) notFound()

  // FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the difference between ${comp.itemA.name} and ${comp.itemB.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${comp.itemA.name}: ${comp.itemA.description}. ${comp.itemB.name}: ${comp.itemB.description}. ${comp.verdict}`,
        },
      },
      {
        '@type': 'Question',
        name: `When should I use ${comp.itemA.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Use ${comp.itemA.name} for: ${comp.useCaseA.join(', ')}.`,
        },
      },
      {
        '@type': 'Question',
        name: `When should I use ${comp.itemB.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Use ${comp.itemB.name} for: ${comp.useCaseB.join(', ')}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which is better: ${comp.itemA.name} or ${comp.itemB.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: comp.verdict,
        },
      },
    ],
  }

  // Other comparisons for "Related" section
  // Show related comparisons from same category, then others
  const sameCategory = comp.category
    ? ALL_COMPARISONS.filter((c) => c.slug !== slug && c.category === comp.category)
    : []
  const otherComps = sameCategory.length > 0
    ? [...sameCategory, ...ALL_COMPARISONS.filter((c) => c.slug !== slug && c.category !== comp.category)].slice(0, 6)
    : ALL_COMPARISONS.filter((c) => c.slug !== slug).slice(0, 6)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/compare" className="hover:text-foreground transition-colors">Comparisons</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{comp.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <Scale className="h-4 w-4" />
          Comparison
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">{comp.title}</h1>
        <p className="text-lg text-muted-foreground">{comp.subtitle}</p>
      </div>

      {/* Quick verdict */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6 mb-8">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-lg mb-1">Quick Verdict</h2>
            <p className="text-muted-foreground">{comp.verdict}</p>
          </div>
        </div>
      </div>

      {/* Item descriptions side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-lg mb-2 text-blue-600 dark:text-blue-400">{comp.itemA.name}</h3>
          <p className="text-muted-foreground text-sm">{comp.itemA.description}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold text-lg mb-2 text-emerald-600 dark:text-emerald-400">{comp.itemB.name}</h3>
          <p className="text-muted-foreground text-sm">{comp.itemB.description}</p>
        </div>
      </div>

      {/* Feature comparison table */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Feature Comparison</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold">Feature</th>
                  <th className="text-left px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">{comp.itemA.name}</th>
                  <th className="text-left px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{comp.itemB.name}</th>
                </tr>
              </thead>
              <tbody>
                {comp.features.map((f, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{f.feature}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.a}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* When to use each */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">When to Use Each</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Use {comp.itemA.name} for:
            </h3>
            <ul className="space-y-2">
              {comp.useCaseA.map((uc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {uc}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Use {comp.itemB.name} for:
            </h3>
            <ul className="space-y-2">
              {comp.useCaseB.map((uc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  {uc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing comparison — only for SaaS/tool comparisons */}
      {comp.type === 'tool' && (comp.pricingA || comp.pricingB) && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Pricing Comparison
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {comp.pricingA && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">{comp.itemA.name} Pricing</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {comp.pricingA.free && <li><span className="font-medium text-foreground">Free:</span> {comp.pricingA.free}</li>}
                  {comp.pricingA.starter && <li><span className="font-medium text-foreground">Starter:</span> {comp.pricingA.starter}</li>}
                  {comp.pricingA.pro && <li><span className="font-medium text-foreground">Pro:</span> {comp.pricingA.pro}</li>}
                </ul>
                {comp.websiteA && (
                  <a
                    href={comp.affiliateUrlA || comp.websiteA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-medium hover:underline"
                  >
                    View {comp.itemA.name} pricing <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
            {comp.pricingB && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold mb-3 text-emerald-600 dark:text-emerald-400">{comp.itemB.name} Pricing</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {comp.pricingB.free && <li><span className="font-medium text-foreground">Free:</span> {comp.pricingB.free}</li>}
                  {comp.pricingB.starter && <li><span className="font-medium text-foreground">Starter:</span> {comp.pricingB.starter}</li>}
                  {comp.pricingB.pro && <li><span className="font-medium text-foreground">Pro:</span> {comp.pricingB.pro}</li>}
                </ul>
                {comp.websiteB && (
                  <a
                    href={comp.affiliateUrlB || comp.websiteB}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-medium hover:underline"
                  >
                    View {comp.itemB.name} pricing <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>
          {comp.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">Pricing last verified: {comp.lastUpdated}</p>
          )}
        </section>
      )}

      {/* Pros & Cons — only for SaaS/tool comparisons */}
      {comp.type === 'tool' && (comp.prosA || comp.prosB) && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Pros & Cons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">{comp.itemA.name}</h3>
              {comp.prosA && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2 text-green-600 dark:text-green-400">
                    <ThumbsUp className="h-3.5 w-3.5" /> Pros
                  </h4>
                  <ul className="space-y-1.5">
                    {comp.prosA.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-green-500 mt-0.5">+</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {comp.consA && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2 text-red-600 dark:text-red-400">
                    <ThumbsDown className="h-3.5 w-3.5" /> Cons
                  </h4>
                  <ul className="space-y-1.5">
                    {comp.consA.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-red-500 mt-0.5">−</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-3 text-emerald-600 dark:text-emerald-400">{comp.itemB.name}</h3>
              {comp.prosB && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2 text-green-600 dark:text-green-400">
                    <ThumbsUp className="h-3.5 w-3.5" /> Pros
                  </h4>
                  <ul className="space-y-1.5">
                    {comp.prosB.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-green-500 mt-0.5">+</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {comp.consB && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2 text-red-600 dark:text-red-400">
                    <ThumbsDown className="h-3.5 w-3.5" /> Cons
                  </h4>
                  <ul className="space-y-1.5">
                    {comp.consB.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-red-500 mt-0.5">−</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Best For recommendation — only for SaaS/tool comparisons */}
      {comp.type === 'tool' && comp.bestFor && (
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6 mb-8">
          <div className="flex items-start gap-3">
            <Scale className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-lg mb-1">Our Recommendation</h2>
              <p className="text-muted-foreground">{comp.bestFor}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                {comp.websiteA && (
                  <a
                    href={comp.affiliateUrlA || comp.websiteA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    Try {comp.itemA.name} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {comp.websiteB && (
                  <a
                    href={comp.affiliateUrlB || comp.websiteB}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors text-sm"
                  >
                    Try {comp.itemB.name} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-2">
              What is the difference between {comp.itemA.name} and {comp.itemB.name}?
            </h3>
            <p className="text-muted-foreground text-sm">
              {comp.itemA.name}: {comp.itemA.description}. {comp.itemB.name}: {comp.itemB.description}.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-2">
              Which is better: {comp.itemA.name} or {comp.itemB.name}?
            </h3>
            <p className="text-muted-foreground text-sm">{comp.verdict}</p>
          </div>
        </div>
      </section>

      {/* Related tool CTA */}
      <div className="rounded-xl border border-border bg-card p-6 text-center mb-8">
        <h2 className="text-lg font-semibold mb-2">Try Our Related Tool</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Convert between {comp.itemA.name} and {comp.itemB.name} with our free online tool.
        </p>
        <Link
          href={`/tools/${comp.relatedTool}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Open {comp.relatedTool.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Other comparisons */}
      {otherComps.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">More Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherComps.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="group flex flex-col p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
              >
                <span className="font-semibold group-hover:text-primary transition-colors">{c.title}</span>
                <span className="text-xs text-muted-foreground mt-1">{c.subtitle}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
