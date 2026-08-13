import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { UNIT_CATEGORIES, convert, getAllPairs, formatResult } from '@/lib/conversion-data'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return UNIT_CATEGORIES.map(cat => ({ category: cat.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: catId } = await params
  const cat = UNIT_CATEGORIES.find(c => c.id === catId)
  if (!cat) return {}

  return {
    title: `${cat.name} Converter \u2014 Convert Between All ${cat.name} Units | UtilsNow`,
    description: `Convert between ${cat.units.map(u => u.name.toLowerCase()).join(', ')}. Free online ${cat.name.toLowerCase()} converter with conversion tables and formulas.`,
    alternates: { canonical: `https://utilsnow.com/convert/${catId}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category: catId } = await params
  const cat = UNIT_CATEGORIES.find(c => c.id === catId)
  if (!cat) notFound()

  const pairs = getAllPairs(cat)

  // Map category IDs to existing converter tool slugs
  const converterSlugMap: Record<string, string> = {
    length: 'length-converter',
    weight: 'weight-converter',
    temperature: 'temperature-converter',
    volume: 'volume-converter',
    speed: 'speed-converter',
    data: 'data-storage-converter',
  }
  const converterSlug = converterSlugMap[catId] || `${catId}-converter`

  // Other categories for cross-linking
  const otherCategories = UNIT_CATEGORIES.filter(c => c.id !== catId)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/convert" className="hover:text-foreground transition-colors">Converters</Link>
        <span>/</span>
        <span className="text-foreground">{cat.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">{cat.name} Converter</h1>
        <p className="text-muted-foreground text-lg">
          Convert between all {cat.name.toLowerCase()} units: {cat.units.map(u => u.name).join(', ')}.
        </p>
        <div className="mt-4">
          <Link href={`/tools/${converterSlug}`} className="inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Open Interactive {cat.name} Converter &rarr;
          </Link>
        </div>
      </div>

      {/* Quick reference */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium">Unit</th>
                <th className="text-left py-2 px-3 font-medium">Symbol</th>
                <th className="text-left py-2 px-3 font-medium">= 1 {cat.units.find(u => u.id === (cat.baseUnit === 'celsius' ? 'c' : cat.units.find(un => un.toBase === 1)?.id))?.name || cat.baseUnit}</th>
              </tr>
            </thead>
            <tbody>
              {cat.units.map(unit => {
                const baseUnit = cat.units.find(u => u.toBase === 1) || cat.units[0]
                const val = convert(1, unit, baseUnit, catId)
                return (
                  <tr key={unit.id} className="border-b border-border/50">
                    <td className="py-2 px-3">{unit.name}</td>
                    <td className="py-2 px-3 font-mono text-xs">{unit.symbol}</td>
                    <td className="py-2 px-3">{formatResult(val)} {baseUnit.symbol}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* All conversion pairs grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">All {cat.name} Conversions ({pairs.length} pairs)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pairs.map(({ from, to }) => {
            const result = convert(1, from, to, catId)
            return (
              <Link
                key={`${from.id}-${to.id}`}
                href={`/convert/${catId}/${from.id}-to-${to.id}`}
                className="p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors group"
              >
                <div className="font-medium text-sm group-hover:text-primary transition-colors">
                  {from.name} to {to.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  1 {from.symbol} = {formatResult(result)} {to.symbol}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Other categories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Other Converters</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {otherCategories.map(c => (
            <Link
              key={c.id}
              href={`/convert/${c.id}`}
              className="p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm text-center"
            >
              {c.name} Converter
            </Link>
          ))}
        </div>
      </div>

      {/* Schema.org ItemList */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${cat.name} Unit Conversions`,
        numberOfItems: pairs.length,
        itemListElement: pairs.slice(0, 50).map(({ from, to }, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${from.name} to ${to.name}`,
          url: `https://utilsnow.com/convert/${catId}/${from.id}-to-${to.id}`,
        })),
      }) }} />
    </div>
  )
}
