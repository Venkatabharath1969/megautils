import { Metadata } from 'next'
import Link from 'next/link'
import { UNIT_CATEGORIES, getAllPairs } from '@/lib/conversion-data'

export const metadata: Metadata = {
  title: 'Unit Converters \u2014 Convert Length, Weight, Temperature & More | UtilsNow',
  description: 'Free online unit converters for length, weight, temperature, volume, speed, and data storage. Instant conversions with tables, formulas, and examples.',
  alternates: { canonical: 'https://utilsnow.com/convert' },
}

// Category icons/descriptions for the hub page
const categoryMeta: Record<string, { icon: string; description: string }> = {
  length: {
    icon: '\ud83d\udccf',
    description: 'Millimeters, centimeters, meters, kilometers, inches, feet, yards, miles',
  },
  weight: {
    icon: '\u2696\ufe0f',
    description: 'Milligrams, grams, kilograms, pounds, ounces, metric tons, stones',
  },
  temperature: {
    icon: '\ud83c\udf21\ufe0f',
    description: 'Celsius, Fahrenheit, Kelvin',
  },
  volume: {
    icon: '\ud83e\udea3',
    description: 'Milliliters, liters, gallons, quarts, pints, cups, fluid ounces, tablespoons',
  },
  speed: {
    icon: '\ud83d\udca8',
    description: 'Meters/second, kilometers/hour, miles/hour, knots',
  },
  data: {
    icon: '\ud83d\udcbe',
    description: 'Bytes, kilobytes, megabytes, gigabytes, terabytes',
  },
}

export default function ConvertHubPage() {
  const totalPairs = UNIT_CATEGORIES.reduce((sum, cat) => sum + getAllPairs(cat).length, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Converters</span>
      </nav>

      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Unit Converters</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Convert between {UNIT_CATEGORIES.reduce((sum, c) => sum + c.units.length, 0)} units across {UNIT_CATEGORIES.length} categories.{' '}
          {totalPairs} conversion pairs with instant results, conversion tables, and formulas.
        </p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {UNIT_CATEGORIES.map(cat => {
          const meta = categoryMeta[cat.id]
          const pairCount = getAllPairs(cat).length
          return (
            <Link
              key={cat.id}
              href={`/convert/${cat.id}`}
              className="group p-6 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 transition-all"
            >
              <div className="text-3xl mb-3">{meta?.icon || '\ud83d\udd04'}</div>
              <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                {cat.name} Converter
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                {meta?.description || cat.units.map(u => u.name).join(', ')}
              </p>
              <div className="text-xs text-muted-foreground">
                {cat.units.length} units &middot; {pairCount} conversions
              </div>
            </Link>
          )
        })}
      </div>

      {/* Popular conversions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Popular Conversions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: 'cm to inches', href: '/convert/length/cm-to-in' },
            { label: 'kg to pounds', href: '/convert/weight/kg-to-lb' },
            { label: 'Celsius to Fahrenheit', href: '/convert/temperature/c-to-f' },
            { label: 'miles to km', href: '/convert/length/mi-to-km' },
            { label: 'liters to gallons', href: '/convert/volume/l-to-gal' },
            { label: 'feet to meters', href: '/convert/length/ft-to-m' },
            { label: 'ounces to grams', href: '/convert/weight/oz-to-g' },
            { label: 'km/h to mph', href: '/convert/speed/kmh-to-mph' },
            { label: 'MB to GB', href: '/convert/data/mb-to-gb' },
            { label: 'cups to mL', href: '/convert/volume/cup-to-ml' },
            { label: 'inches to cm', href: '/convert/length/in-to-cm' },
            { label: 'Fahrenheit to Celsius', href: '/convert/temperature/f-to-c' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm text-center"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Schema.org CollectionPage */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Unit Converters',
        description: `Free online unit converters for ${UNIT_CATEGORIES.map(c => c.name.toLowerCase()).join(', ')}.`,
        url: 'https://utilsnow.com/convert',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: UNIT_CATEGORIES.length,
          itemListElement: UNIT_CATEGORIES.map((cat, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${cat.name} Converter`,
            url: `https://utilsnow.com/convert/${cat.id}`,
          })),
        },
      }) }} />
    </div>
  )
}
