'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Menu, X, Wrench } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { LanguageSwitcher } from './language-switcher'

import { useLanguage } from '@/i18n/language-context'

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">MegaUtils</span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border hover:bg-muted transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              autoFocus
              className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

    </header>
  )
}
