'use client'

import Link from 'next/link'
import { Suspense, useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Code2, Binary, Shield, Search, Type, Terminal, PenTool, FileText, Palette, Paintbrush, DollarSign, ArrowLeftRight, Calculator, ImageIcon, Clock, Globe, Sparkles, X, Star, Users, BookOpen, Monitor, ShieldCheck, FileOutput } from 'lucide-react'
import { useLanguage } from '@/i18n/language-context'
import { TOOLS, POPULAR_TOOLS, CATEGORIES, getCategoryById } from '@/lib/tool-registry'
import { TotalUsageCounter } from '@/components/usage-counter'

function getCategoryLabel(categoryId: string): string {
  return getCategoryById(categoryId)?.label || categoryId
}

const categories = [
  { id: 'developer', label: 'Developer Tools', description: '24 tools -- Formatters, converters, validators', icon: Code2, count: 24, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { id: 'encoders', label: 'Encoders & Decoders', description: '14 tools -- Base64, URL, JWT, Binary, Hex', icon: Binary, count: 14, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { id: 'crypto', label: 'Crypto & Hash', description: '3 tools -- MD5, SHA, AES, bcrypt, passwords', icon: Shield, count: 3, color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  { id: 'seo', label: 'SEO Tools', description: '18 tools -- Meta tags, schema, sitemaps', icon: Search, count: 18, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { id: 'text', label: 'Text Tools', description: '24 tools -- Counters, case converters, cleaning', icon: Type, count: 24, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  { id: 'string', label: 'String Utilities', description: '6 tools -- Escape, regex, Lorem Ipsum', icon: Terminal, count: 6, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { id: 'content', label: 'Content & Writing', description: '3 tools -- Headlines, readability, social', icon: PenTool, count: 3, color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { id: 'markdown', label: 'Markdown Tools', description: '4 tools -- Editor, converters, tables', icon: FileText, count: 4, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  { id: 'color', label: 'Color Tools', description: '8 tools -- Picker, palettes, contrast', icon: Palette, count: 8, color: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400' },
  { id: 'css', label: 'CSS Tools', description: '14 tools -- Gradients, shadows, flexbox, grid', icon: Paintbrush, count: 14, color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  { id: 'financial', label: 'Financial Calculators', description: '24 tools -- Loans, interest, tax, ROI', icon: DollarSign, count: 24, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'converters', label: 'Unit Converters', description: '14 tools -- Length, weight, data, temp', icon: ArrowLeftRight, count: 14, color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  { id: 'math', label: 'Math & Science', description: '5 tools -- Scientific, statistics, BMI, calories', icon: Calculator, count: 5, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'image', label: 'Image Tools', description: '25 tools -- AI + Compress, resize, QR, filters', icon: ImageIcon, count: 25, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { id: 'datetime', label: 'Date & Time', description: '6 tools -- Timestamps, timezones, pomodoro', icon: Clock, count: 6, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { id: 'network', label: 'Network & API', description: '4 tools -- DNS, IP, HTTP codes, cURL', icon: Globe, count: 4, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { id: 'generators', label: 'Generators', description: '11 tools -- UUID, passwords, fake data, policies', icon: Sparkles, count: 11, color: 'bg-lime-500/10 text-lime-600 dark:text-lime-400' },
  { id: 'pdf', label: 'PDF Tools', description: '8 tools -- Merge, split, compress, convert', icon: FileOutput, count: 8, color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
]

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const results = useMemo(() => {
    if (!query) return []
    const q = query.toLowerCase()
    return TOOLS.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
    )
  }, [query])

  if (!query) return null

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </h2>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Link>
      </div>
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="group p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
            >
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{tool.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
              <div className="mt-2 text-xs text-primary font-medium">{getCategoryLabel(tool.category)} &rarr;</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <p className="text-muted-foreground">No tools found. Try a different search term.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-primary hover:underline">Browse all categories</Link>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()

  const [recentToolIds, setRecentToolIds] = useState<string[]>([])
  const [favoriteToolIds, setFavoriteToolIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const storedRecent = JSON.parse(localStorage.getItem('utilsnow-recent-tools') || '[]')
      setRecentToolIds(storedRecent)
    } catch {}
    try {
      const storedFavs = JSON.parse(localStorage.getItem('utilsnow-favorites') || '[]')
      setFavoriteToolIds(storedFavs)
    } catch {}
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Search Results */}
      <Suspense>
        <SearchResults />
      </Suspense>

      {/* Hero */}
      <div className="text-center mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          <span className="text-primary">194+</span> {t('hero.title')}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('hero.subtitle')}
          <span className="block mt-1 text-sm font-medium text-green-600 dark:text-green-400">
            {t('hero.privacy')}
          </span>
        </p>
      </div>

      {/* Your Favorites */}
      {favoriteToolIds.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <h2 className="text-lg font-semibold">Your Favorites</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {favoriteToolIds.slice(0, 8).map(id => {
              const tool = TOOLS.find(t => t.id === id)
              if (!tool) return null
              return (
                <Link key={id} href={`/tools/${id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{tool.name}</span>
                    <span className="text-xs text-muted-foreground">{getCategoryLabel(tool.category)}</span>
                  </div>
                  {tool.isAI && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">AI</span>}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Recently Used */}
      {recentToolIds.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Recently Used</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentToolIds.slice(0, 4).map(id => {
              const tool = TOOLS.find(t => t.id === id)
              if (!tool) return null
              return (
                <Link key={id} href={`/tools/${id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                  <span className="text-sm font-medium truncate">{tool.name}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Popular Tools */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Popular Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_TOOLS.map(id => {
            const tool = TOOLS.find(t => t.id === id)
            if (!tool) return null
            return (
              <Link key={id} href={`/tools/${id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{tool.name}</span>
                  <span className="text-xs text-muted-foreground">{getCategoryLabel(tool.category)}</span>
                </div>
                {tool.isAI && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">AI</span>}
              </Link>
            )
          })}
        </div>
      </section>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${cat.color} mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-base group-hover:text-primary transition-colors">{t('cat.' + cat.id)}</h2>
              <p className="text-xs text-muted-foreground mt-1 flex-1">{cat.description}</p>
              <div className="mt-3 text-xs font-medium text-primary">{cat.count} tools &rarr;</div>
            </Link>
          )
        })}
      </div>

      {/* Product Hunt Badge */}
      <div className="mt-10 flex justify-center">
        <a href="https://www.producthunt.com/posts/utilsnow" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors text-sm">
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#DA552F"/><path d="M22.667 20H18v-6.667h4.667a3.333 3.333 0 010 6.667zM18 22.667v4h-2.667V11.333H22.667a6 6 0 110 12H18v-.666z" fill="#fff"/></svg>
          <span className="text-muted-foreground">Featured on <span className="font-semibold text-foreground">Product Hunt</span></span>
        </a>
      </div>

      {/* Trust Bar */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          { label: t('trust.free'), value: t('trust.free.value') },
          { label: t('trust.login'), value: t('trust.login.value') },
          { label: t('trust.data'), value: t('trust.data.value') },
          { label: t('trust.tools'), value: '194+' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-lg bg-card border border-border">
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Social Proof Section */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="text-center mb-6">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trusted by developers worldwide</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <TotalUsageCounter />
            <span className="text-xs text-muted-foreground">Total Tool Uses</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-primary">194</span>
            <span className="text-xs text-muted-foreground">Free Tools</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
              <Monitor className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-primary">100%</span>
            <span className="text-xs text-muted-foreground">Browser-Based</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10">
              <ShieldCheck className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-2xl font-bold text-primary">Zero</span>
            <span className="text-xs text-muted-foreground">Data Stored</span>
          </div>
        </div>
      </div>

      {/* CollectionPage + ItemList Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'UtilsNow - Free Online Tools',
        'description': '194+ free browser-based tools for developers, designers, and everyone. No signup required.',
        'url': 'https://utilsnow.com',
        'mainEntity': {
          '@type': 'ItemList',
          'numberOfItems': 17,
          'itemListElement': categories.map((cat, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'name': cat.label,
            'url': `https://utilsnow.com/category/${cat.id}`
          }))
        }
      }) }} />
    </div>
  )
}
