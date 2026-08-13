import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, Scale, ArrowRight } from 'lucide-react'
import { COMPARISONS } from '@/lib/comparison-data'

export const metadata: Metadata = {
  title: 'Comparisons - Format & Unit Comparisons',
  description: 'Side-by-side comparisons of popular formats, units, and tools. JPG vs PNG, PDF vs DOCX, RGB vs HEX, and more.',
  keywords: ['comparison', 'vs', 'jpg vs png', 'pdf vs docx', 'rgb vs hex', 'format comparison'],
  alternates: { canonical: 'https://utilsnow.com/compare' },
  openGraph: {
    title: 'Comparisons - Format & Unit Comparisons | UtilsNow',
    description: 'Side-by-side comparisons of popular formats, units, and tools.',
    url: 'https://utilsnow.com/compare',
    type: 'website',
  },
}

export default function CompareHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Comparisons</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <Scale className="h-4 w-4" />
          {COMPARISONS.length} Comparisons
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Format & Unit Comparisons
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Side-by-side comparisons to help you choose the right format, unit, or tool for your needs.
          Each comparison includes a feature table, use cases, and our recommendation.
        </p>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMPARISONS.map((comp) => (
          <Link
            key={comp.slug}
            href={`/compare/${comp.slug}`}
            className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Scale className="h-3 w-3" />
                Comparison
              </span>
            </div>
            <h2 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">
              {comp.title}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">{comp.subtitle}</p>
            <div className="flex items-center gap-3 mb-3 text-xs">
              <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                {comp.itemA.name}
              </span>
              <span className="text-muted-foreground">vs</span>
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                {comp.itemB.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex-1 line-clamp-2">{comp.verdict}</p>
            <div className="flex items-center gap-1 mt-3 text-sm text-primary font-medium">
              Read comparison
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
