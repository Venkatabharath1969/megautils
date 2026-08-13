import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { UNIT_CATEGORIES, convert, getAllConversionPairs, formatResult } from '@/lib/conversion-data'

interface Props {
  params: Promise<{ category: string; pair: string }>
}

export async function generateStaticParams() {
  const allPairs = getAllConversionPairs()
  return allPairs.slice(0, 200).map(({ category, from, to }) => ({
    category: category.id,
    pair: `${from.id}-to-${to.id}`,
  }))
}

export const dynamicParams = true
export const revalidate = 86400

function parsePair(pair: string) {
  const toIndex = pair.indexOf('-to-')
  if (toIndex === -1) return null
  return {
    fromId: pair.slice(0, toIndex),
    toId: pair.slice(toIndex + 4),
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: catId, pair } = await params
  const parsed = parsePair(pair)
  if (!parsed) return {}

  const cat = UNIT_CATEGORIES.find(c => c.id === catId)
  if (!cat) return {}
  const from = cat.units.find(u => u.id === parsed.fromId)
  const to = cat.units.find(u => u.id === parsed.toId)
  if (!from || !to) return {}

  const result = convert(1, from, to, catId)
  const resultStr = formatResult(result)
  const title = `${from.name} to ${to.name} | 1 ${from.symbol} = ${resultStr} ${to.symbol}`

  return {
    title: `${title} | UtilsNow`,
    description: `Convert ${from.name} to ${to.name} instantly. 1 ${from.symbol} = ${resultStr} ${to.symbol}. Free online converter with conversion table, formula, and examples.`,
    alternates: { canonical: `https://utilsnow.com/convert/${catId}/${pair}` },
  }
}

export default async function ConversionPage({ params }: Props) {
  const { category: catId, pair } = await params
  const parsed = parsePair(pair)
  if (!parsed) notFound()

  const { fromId, toId } = parsed
  const cat = UNIT_CATEGORIES.find(c => c.id === catId)
  if (!cat) notFound()
  const from = cat.units.find(u => u.id === fromId)
  const to = cat.units.find(u => u.id === toId)
  if (!from || !to) notFound()

  const result1 = convert(1, from, to, catId)
  const reverseResult = convert(1, to, from, catId)

  // Generate conversion table
  const tableValues = cat.popularValues
  const table = tableValues.map(v => ({
    from: v,
    to: convert(v, from, to, catId),
  }))

  // Related conversions (same category, different pairs)
  const relatedPairs = cat.units
    .filter(u => u.id !== fromId && u.id !== toId)
    .slice(0, 6)
    .map(u => ({
      label: `${from.name} to ${u.name}`,
      href: `/convert/${catId}/${fromId}-to-${u.id}`,
    }))

  // Determine formula text (temperature is special)
  const isTemp = catId === 'temperature'
  let formulaText: string
  let exampleText: string

  if (isTemp) {
    if (fromId === 'c' && toId === 'f') {
      formulaText = `${to.symbol} = (${from.symbol} \u00d7 9/5) + 32`
      exampleText = `10 ${from.symbol} = (10 \u00d7 9/5) + 32 = ${formatResult(convert(10, from, to, catId))} ${to.symbol}`
    } else if (fromId === 'f' && toId === 'c') {
      formulaText = `${to.symbol} = (${from.symbol} \u2212 32) \u00d7 5/9`
      exampleText = `100 ${from.symbol} = (100 \u2212 32) \u00d7 5/9 = ${formatResult(convert(100, from, to, catId))} ${to.symbol}`
    } else if (fromId === 'c' && toId === 'k') {
      formulaText = `${to.symbol} = ${from.symbol} + 273.15`
      exampleText = `10 ${from.symbol} = 10 + 273.15 = ${formatResult(convert(10, from, to, catId))} ${to.symbol}`
    } else if (fromId === 'k' && toId === 'c') {
      formulaText = `${to.symbol} = ${from.symbol} \u2212 273.15`
      exampleText = `300 ${from.symbol} = 300 \u2212 273.15 = ${formatResult(convert(300, from, to, catId))} ${to.symbol}`
    } else if (fromId === 'f' && toId === 'k') {
      formulaText = `${to.symbol} = (${from.symbol} \u2212 32) \u00d7 5/9 + 273.15`
      exampleText = `212 ${from.symbol} = (212 \u2212 32) \u00d7 5/9 + 273.15 = ${formatResult(convert(212, from, to, catId))} ${to.symbol}`
    } else {
      formulaText = `${to.symbol} = (${from.symbol} \u2212 273.15) \u00d7 9/5 + 32`
      exampleText = `300 ${from.symbol} = (300 \u2212 273.15) \u00d7 9/5 + 32 = ${formatResult(convert(300, from, to, catId))} ${to.symbol}`
    }
  } else {
    formulaText = `${to.symbol} = ${from.symbol} \u00d7 ${formatResult(result1)}`
    exampleText = `10 ${from.symbol} = 10 \u00d7 ${formatResult(result1)} = ${formatResult(convert(10, from, to, catId))} ${to.symbol}`
  }

  const multiplyText = isTemp
    ? `use the formula: ${formulaText}`
    : `multiply by ${formatResult(result1)}`

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/convert" className="hover:text-foreground transition-colors">Converters</Link>
        <span>/</span>
        <Link href={`/convert/${catId}`} className="hover:text-foreground transition-colors">{cat.name}</Link>
        <span>/</span>
        <span className="text-foreground">{from.name} to {to.name}</span>
      </nav>

      {/* Hero - instant answer */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">{from.name} to {to.name} Converter</h1>
        <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
          1 {from.symbol} = {formatResult(result1)} {to.symbol}
        </div>
        <p className="text-muted-foreground">
          To convert {from.name.toLowerCase()} to {to.name.toLowerCase()}, {multiplyText}.
        </p>
      </div>

      {/* Interactive converter link */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3">Interactive Converter</h2>
        <p className="text-muted-foreground mb-4">Use our full {cat.name.toLowerCase()} converter with all units:</p>
        <Link href={`/tools/${converterSlug}`} className="inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Open {cat.name} Converter &rarr;
        </Link>
      </div>

      {/* Conversion table */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{from.name} to {to.name} Conversion Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium">{from.name} ({from.symbol})</th>
                <th className="text-left py-2 px-3 font-medium">{to.name} ({to.symbol})</th>
              </tr>
            </thead>
            <tbody>
              {table.map(row => (
                <tr key={row.from} className="border-b border-border/50">
                  <td className="py-2 px-3">{row.from} {from.symbol}</td>
                  <td className="py-2 px-3 font-medium">{formatResult(row.to)} {to.symbol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3">How to Convert {from.name} to {to.name}</h2>
        <p className="text-muted-foreground mb-3">
          <strong>Formula:</strong> {formulaText}
        </p>
        <p className="text-muted-foreground mb-3">
          <strong>Example:</strong> {exampleText}
        </p>
        <p className="text-muted-foreground">
          <strong>Reverse:</strong> 1 {to.symbol} = {formatResult(reverseResult)} {from.symbol}.{' '}
          <Link href={`/convert/${catId}/${toId}-to-${fromId}`} className="text-primary hover:underline">
            Convert {to.name} to {from.name} &rarr;
          </Link>
        </p>
      </div>

      {/* Related conversions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Related {cat.name} Conversions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {relatedPairs.map(p => (
            <Link key={p.href} href={p.href} className="p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm text-center">
              {p.label}
            </Link>
          ))}
          <Link href={`/convert/${catId}/${toId}-to-${fromId}`} className="p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm text-center font-medium">
            {to.name} &rarr; {from.name}
          </Link>
        </div>
      </div>

      {/* FAQ Schema (JSON-LD) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How many ${to.name.toLowerCase()} is 1 ${from.name.toLowerCase().replace(/s$/, '')}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `1 ${from.symbol} equals ${formatResult(result1)} ${to.symbol}.`,
            },
          },
          {
            '@type': 'Question',
            name: `How do I convert ${from.name.toLowerCase()} to ${to.name.toLowerCase()}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: isTemp
                ? `Use the formula: ${formulaText}.`
                : `Multiply the ${from.name.toLowerCase()} value by ${formatResult(result1)} to get the value in ${to.name.toLowerCase()}.`,
            },
          },
          {
            '@type': 'Question',
            name: `What is the formula for ${from.name.toLowerCase()} to ${to.name.toLowerCase()}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: formulaText,
            },
          },
        ],
      }) }} />
    </div>
  )
}
