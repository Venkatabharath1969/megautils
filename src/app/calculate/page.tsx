import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, Calculator, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Percentage Calculator - What is X% of Y?',
  description: 'Find what any percentage of any number is. Browse popular percentage calculations or use our free percentage calculator tool.',
  keywords: ['percentage calculator', 'what is percent of', 'calculate percentage', 'percent of number'],
  alternates: { canonical: 'https://utilsnow.com/calculate' },
  openGraph: {
    title: 'Percentage Calculator - What is X% of Y? | UtilsNow',
    description: 'Find what any percentage of any number is. Browse popular percentage calculations.',
    url: 'https://utilsnow.com/calculate',
    type: 'website',
  },
}

const PERCENTAGES = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90]
const BASES = [50, 100, 150, 200, 250, 300, 400, 500, 750, 1000]

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

export default function CalculateHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Percentage Calculator</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <Calculator className="h-4 w-4" />
          120 Pre-Calculated Results
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Percentage Calculator
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Find what any percentage of any number is. Click any calculation below for the full
          breakdown with formula, step-by-step solution, and related values.
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="font-semibold mb-1">Need a custom calculation?</h2>
          <p className="text-sm text-muted-foreground">
            Our interactive tool lets you calculate any percentage of any number instantly.
          </p>
        </div>
        <Link
          href="/tools/percentage-calculator"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <Calculator className="h-4 w-4" />
          Open Calculator
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Grid by base number */}
      {BASES.map((base) => (
        <section key={base} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">
            Percentages of {fmt(base)}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {PERCENTAGES.map((pct) => {
              const result = base * (pct / 100)
              return (
                <Link
                  key={`${pct}-${base}`}
                  href={`/calculate/what-is-${pct}-percent-of-${base}`}
                  className="group flex flex-col p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
                >
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    {pct}% of {fmt(base)}
                  </span>
                  <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mt-0.5">
                    {fmt(result)}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      ))}

      {/* Quick reference */}
      <section className="mt-10 mb-8">
        <h2 className="text-xl font-semibold mb-4">How to Calculate Percentages</h2>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Finding X% of Y</h3>
            <p className="text-muted-foreground text-sm">
              Multiply Y by X and divide by 100. <span className="font-mono">Result = Y × (X / 100)</span>
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Example: What is 20% of 500?</h3>
            <p className="text-muted-foreground text-sm">
              <span className="font-mono">500 × (20 / 100) = 500 × 0.2 = <strong className="text-foreground">100</strong></span>
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Finding what percent X is of Y</h3>
            <p className="text-muted-foreground text-sm">
              Divide X by Y and multiply by 100. <span className="font-mono">Percentage = (X / Y) × 100</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
