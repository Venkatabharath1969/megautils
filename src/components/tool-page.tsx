'use client'

import { Shield, Download, Copy, Check, RotateCcw, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { AdSlot } from './ad-slot'
import { useLanguage } from '@/i18n/language-context'

interface FAQItem {
  question: string
  answer: string
}

interface ToolPageProps {
  title: string
  description: string
  category: string
  categoryLabel: string
  slug?: string
  children: ReactNode
  helpContent?: ReactNode
  faqs?: FAQItem[]
}

export function ToolPage({ title, description, category, categoryLabel, slug, children, helpContent, faqs }: ToolPageProps) {
  const { t } = useLanguage()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">{t('tool.home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/category/${category}`} className="hover:text-foreground transition-colors">{categoryLabel}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{title}</span>
      </nav>

      {/* Title & Privacy Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium whitespace-nowrap shrink-0">
          <Shield className="h-3.5 w-3.5" />
          {t('tool.privacy')}
        </div>
      </div>

      {/* Tool Content */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
        {children}
      </div>

      {/* Below Tool Ad */}
      <AdSlot slot="below-tool" className="mt-6" />

      {/* Help Content */}
      {helpContent && (
        <div className="mt-8 prose prose-sm dark:prose-invert max-w-none">
          {helpContent}
        </div>
      )}

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-card rounded-lg border border-border">
                <summary className="flex items-center justify-between cursor-pointer p-4 text-sm font-medium">
                  {faq.question}
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Schema */}
      {faqs && faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map(faq => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      )}

      {/* JSON-LD SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: title,
            url: `https://megautils.xyz/tools/${slug || category}`,
            description: description,
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
            browserRequirements: 'Requires JavaScript',
            permissions: 'none',
            isAccessibleForFree: true,
            creator: {
              '@type': 'Organization',
              name: 'MegaUtils',
              url: 'https://megautils.xyz',
            },
          }),
        }}
      />

      {/* JSON-LD BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://megautils.xyz' },
              { '@type': 'ListItem', position: 2, name: categoryLabel, item: `https://megautils.xyz/category/${category}` },
              { '@type': 'ListItem', position: 3, name: title },
            ],
          }),
        }}
      />
    </div>
  )
}

/* Reusable action buttons */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const { t } = useLanguage()
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
      {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> {t('btn.copied')}</> : <><Copy className="h-3.5 w-3.5" /> {t('btn.copy')}</>}
    </button>
  )
}

export function DownloadButton({ content, filename, mimeType = 'text/plain' }: { content: string; filename: string; mimeType?: string }) {
  const { t } = useLanguage()
  const handleDownload = () => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <button onClick={handleDownload} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
      <Download className="h-3.5 w-3.5" /> {t('btn.download')}
    </button>
  )
}

export function ClearButton({ onClear }: { onClear: () => void }) {
  const { t } = useLanguage()
  return (
    <button onClick={onClear} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card hover:bg-muted transition-colors">
      <RotateCcw className="h-3.5 w-3.5" /> {t('btn.clear')}
    </button>
  )
}

/* Standard text area for tool input/output */
export function ToolTextarea({ value, onChange, placeholder, readOnly = false, rows = 10, label }: {
  value: string; onChange?: (v: string) => void; placeholder?: string; readOnly?: boolean; rows?: number; label?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <textarea
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        className="tool-textarea w-full rounded-lg border border-input bg-tool-bg p-3 focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground disabled:opacity-50"
      />
    </div>
  )
}
