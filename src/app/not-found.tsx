import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found | UtilsNow',
}

const popularCategories = [
  { id: 'developer', label: 'Developer Tools', description: 'JSON formatters, code converters, validators' },
  { id: 'text', label: 'Text Tools', description: 'Word counter, case converter, text manipulation' },
  { id: 'css', label: 'CSS Tools', description: 'Gradients, shadows, flexbox, grid generators' },
  { id: 'image', label: 'Image Tools', description: 'AI tools, QR codes, image resizer, converters' },
  { id: 'financial', label: 'Financial Calculators', description: 'Loans, interest, tax, ROI calculators' },
  { id: 'converters', label: 'Unit Converters', description: 'Length, weight, temperature, data converters' },
]

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <p className="text-7xl sm:text-9xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        Page Not Found
      </h1>
      <p className="mt-3 text-base text-muted-foreground max-w-md mx-auto">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or
        no longer exists.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
      >
        &larr; Back to Homepage
      </Link>

      <div className="mt-16">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Popular Tool Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {popularCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
            >
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {cat.label}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
