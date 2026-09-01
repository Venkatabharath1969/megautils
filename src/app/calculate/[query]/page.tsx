import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChevronRight, Calculator, ArrowRight, Info, HelpCircle } from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseQuery(query: string): { x: number; y: number } | null {
  const match = query.match(/^what-is-(\d+(?:\.\d+)?)-percent-of-(\d+(?:\.\d+)?)$/)
  if (!match) return null
  const x = parseFloat(match[1])
  const y = parseFloat(match[2])
  if (isNaN(x) || isNaN(y) || x < 0 || y < 0) return null
  return { x, y }
}

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 4 })
}

function pct(x: number, y: number): number {
  return y * (x / 100)
}

// Related percentages to show in table
const RELATED_PCTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90, 100]

// Pre-generation combos — expanded based on GSC data showing /calculate/ pages
// have the BEST avg position (21) vs tools (72) and convert (67).
// More combinations = more pages ranking near page 1.
const PERCENTAGES = [
  1, 2, 3, 5, 8, 10, 12, 15, 18, 20, 25, 30, 33, 35, 40, 45, 50, 60, 70, 75, 80, 85, 90, 95, 100,
]
const BASES = [
  10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100, 120, 125, 150, 175, 200, 250, 300, 350, 400, 450,
  500, 600, 700, 750, 800, 900, 1000, 1200, 1500, 2000, 2500, 3000, 5000, 10000,
]

// ---------------------------------------------------------------------------
// Static params (900 pages — expanded from 120 for SEO coverage)
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  const params: { query: string }[] = []
  for (const x of PERCENTAGES) {
    for (const y of BASES) {
      params.push({ query: `what-is-${x}-percent-of-${y}` })
    }
  }
  return params
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ query: string }> }): Promise<Metadata> {
  const { query } = await params
  const parsed = parseQuery(query)
  if (!parsed) return { title: 'Percentage Calculator' }

  const { x, y } = parsed
  const result = pct(x, y)
  const title = `What is ${fmt(x)}% of ${fmt(y)}? Answer: ${fmt(result)}`
  const description = `${fmt(x)}% of ${fmt(y)} is ${fmt(result)}. Learn how to calculate ${fmt(x)} percent of ${fmt(y)} with the formula, step-by-step explanation, and related percentage calculations.`

  return {
    title,
    description,
    keywords: [`what is ${x} percent of ${y}`, `${x}% of ${y}`, `${x} percent of ${y}`, 'percentage calculator', 'percent of number'],
    alternates: { canonical: `https://utilsnow.com/calculate/${query}` },
    openGraph: {
      title: `${title} | UtilsNow`,
      description,
      url: `https://utilsnow.com/calculate/${query}`,
      type: 'website',
    },
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PercentageCalcPage({ params }: { params: Promise<{ query: string }> }) {
  const { query } = await params
  const parsed = parseQuery(query)
  if (!parsed) notFound()

  const { x, y } = parsed
  const result = pct(x, y)
  const reversePercent = y !== 0 ? (x / y) * 100 : 0

  // Build related table – always include current x plus surrounding values
  const relatedSet = new Set(RELATED_PCTS)
  relatedSet.add(x)
  const relatedList = Array.from(relatedSet).sort((a, b) => a - b)

  // FAQ structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${fmt(x)}% of ${fmt(y)}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${fmt(x)}% of ${fmt(y)} is ${fmt(result)}. This is calculated using the formula: ${fmt(y)} × (${fmt(x)}/100) = ${fmt(result)}.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do you calculate ${fmt(x)} percent of ${fmt(y)}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `To calculate ${fmt(x)}% of ${fmt(y)}, multiply ${fmt(y)} by ${fmt(x)} and divide by 100. The formula is: ${fmt(y)} × ${fmt(x)} ÷ 100 = ${fmt(result)}.`,
        },
      },
      {
        '@type': 'Question',
        name: `${fmt(x)} is what percent of ${fmt(y)}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${fmt(x)} is ${fmt(reversePercent)}% of ${fmt(y)}. This is calculated by dividing ${fmt(x)} by ${fmt(y)} and multiplying by 100.`,
        },
      },
    ],
  }

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
        <Link href="/calculate" className="hover:text-foreground transition-colors">Percentage Calculator</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">
          {fmt(x)}% of {fmt(y)}
        </span>
      </nav>

      {/* Hero answer */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Calculator className="h-4 w-4" />
          Percentage Calculator
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">
          What is {fmt(x)}% of {fmt(y)}?
        </h1>
        <div className="text-4xl sm:text-6xl font-extrabold text-primary mb-4">
          {fmt(result)}
        </div>
        <p className="text-muted-foreground text-lg">
          {fmt(x)}% of {fmt(y)} = <strong className="text-foreground">{fmt(result)}</strong>
        </p>
      </div>

      {/* Formula breakdown */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          How to Calculate {fmt(x)}% of {fmt(y)}
        </h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Formula</p>
              <p className="font-mono text-lg bg-muted/50 rounded-lg p-3">
                Result = Value × (Percentage / 100)
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Step-by-step</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">1</span>
                  <span className="font-mono">
                    {fmt(x)} ÷ 100 = {fmt(x / 100)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">2</span>
                  <span className="font-mono">
                    {fmt(y)} × {fmt(x / 100)} = <strong className="text-primary">{fmt(result)}</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="font-mono text-lg text-center">
                {fmt(y)} × ({fmt(x)} / 100) = <strong className="text-primary">{fmt(result)}</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reverse calculation */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          Reverse: {fmt(x)} is What Percent of {fmt(y)}?
        </h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-lg mb-2">
            <strong>{fmt(x)}</strong> is <strong className="text-primary">{fmt(reversePercent)}%</strong> of <strong>{fmt(y)}</strong>
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            ({fmt(x)} ÷ {fmt(y)}) × 100 = {fmt(reversePercent)}%
          </p>
        </div>
      </section>

      {/* Related values table */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Percentage Table for {fmt(y)}
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold">Percentage</th>
                  <th className="text-left px-4 py-3 font-semibold">of {fmt(y)}</th>
                  <th className="text-left px-4 py-3 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {relatedList.map((p) => {
                  const val = pct(p, y)
                  const isActive = p === x
                  return (
                    <tr
                      key={p}
                      className={`border-b border-border last:border-0 ${isActive ? 'bg-primary/5 font-semibold' : 'hover:bg-muted/30'}`}
                    >
                      <td className="px-4 py-2.5">
                        {isActive ? (
                          <span className="text-primary">{fmt(p)}%</span>
                        ) : (
                          <Link
                            href={`/calculate/what-is-${p}-percent-of-${y}`}
                            className="text-primary hover:underline"
                          >
                            {fmt(p)}%
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">of {fmt(y)}</td>
                      <td className="px-4 py-2.5">
                        {isActive ? (
                          <span className="text-primary">{fmt(val)}</span>
                        ) : (
                          fmt(val)
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-2">What is {fmt(x)}% of {fmt(y)}?</h3>
            <p className="text-muted-foreground">
              {fmt(x)}% of {fmt(y)} is <strong className="text-foreground">{fmt(result)}</strong>. 
              To find this, multiply {fmt(y)} by {fmt(x)} and divide the result by 100.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-2">How do you calculate {fmt(x)} percent of {fmt(y)}?</h3>
            <p className="text-muted-foreground">
              Use the formula: {fmt(y)} × ({fmt(x)} / 100) = {fmt(result)}. 
              First divide {fmt(x)} by 100 to get {fmt(x / 100)}, then multiply by {fmt(y)}.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-2">{fmt(x)} is what percent of {fmt(y)}?</h3>
            <p className="text-muted-foreground">
              {fmt(x)} is <strong className="text-foreground">{fmt(reversePercent)}%</strong> of {fmt(y)}. 
              Calculate by dividing {fmt(x)} by {fmt(y)} and multiplying by 100.
            </p>
          </div>
        </div>
      </section>

      {/* CTA to main calculator */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Need a Custom Calculation?</h2>
        <p className="text-muted-foreground mb-4">
          Use our free percentage calculator to find any percentage of any number instantly.
        </p>
        <Link
          href="/tools/percentage-calculator"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Calculator className="h-4 w-4" />
          Open Percentage Calculator
        </Link>
      </div>
    </div>
  )
}
