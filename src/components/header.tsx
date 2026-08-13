'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, Menu, X, Wrench } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { LanguageSwitcher } from './language-switcher'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const openCommandPalette = () => {
    window.dispatchEvent(new Event('open-command-palette'))
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">UtilsNow</span>
        </Link>

        {/* Search Trigger - Desktop (opens Command Palette) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={openCommandPalette}
            className="w-full h-9 flex items-center gap-2 px-3 rounded-md border border-input bg-card text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search tools...</span>
            <kbd className="hidden lg:inline-flex text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={openCommandPalette}
            aria-label="Search tools"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border hover:bg-muted transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">Blog</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">About</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">Contact</Link>
          <div className="border-t border-border my-2" />
          <Link href="/category/developer" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors">Developer Tools</Link>
          <Link href="/category/image" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors">Image & AI Tools</Link>
          <Link href="/category/financial" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors">Financial Calculators</Link>
          <Link href="/category/text" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors">Text Tools</Link>
          <Link href="/category/seo" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors">SEO Tools</Link>
        </nav>
      )}
    </header>
  )
}
