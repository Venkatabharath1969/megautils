'use client'

import Link from 'next/link'
import { Code2, Binary, Shield, Search, Type, Terminal, PenTool, FileText, Palette, Paintbrush, DollarSign, ArrowLeftRight, Calculator, ImageIcon, Clock, Globe, Sparkles } from 'lucide-react'
import { useLanguage } from '@/i18n/language-context'

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
  { id: 'financial', label: 'Financial Calculators', description: '23 tools -- Loans, interest, tax, ROI', icon: DollarSign, count: 23, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'converters', label: 'Unit Converters', description: '14 tools -- Length, weight, data, temp', icon: ArrowLeftRight, count: 14, color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
  { id: 'math', label: 'Math & Science', description: '4 tools -- Scientific, statistics, BMI', icon: Calculator, count: 4, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'image', label: 'Image Tools', description: '19 tools -- AI + Compress, resize, QR codes', icon: ImageIcon, count: 19, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { id: 'datetime', label: 'Date & Time', description: '5 tools -- Timestamps, timezones, cron', icon: Clock, count: 5, color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { id: 'network', label: 'Network & API', description: '4 tools -- DNS, IP, HTTP codes, cURL', icon: Globe, count: 4, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { id: 'generators', label: 'Generators', description: '10 tools -- UUID, passwords, fake data', icon: Sparkles, count: 10, color: 'bg-lime-500/10 text-lime-600 dark:text-lime-400' },
]

export default function HomePage() {
  const { t } = useLanguage()
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
    </div>
  )
}
