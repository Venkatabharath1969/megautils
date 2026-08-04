'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useLanguage } from '@/i18n/language-context'
import { languages } from '@/i18n/translations'

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = languages.find(l => l.code === lang)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-border bg-card hover:bg-muted transition-colors text-sm"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current?.flag}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-card shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${lang === l.code ? 'bg-primary/10 text-primary font-medium' : ''}`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
              {lang === l.code && <span className="ml-auto text-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
