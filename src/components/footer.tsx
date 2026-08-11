'use client'

import { Wrench, Shield } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/i18n/language-context'

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <Wrench className="h-4 w-4 text-primary-foreground" />
              </div>
              UtilsNow
            </Link>
            <p className="text-sm text-muted-foreground">{t('footer.description')}</p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              <span>{t('footer.privacy.badge')}</span>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.popular')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tools/json-formatter" className="hover:text-foreground transition-colors">JSON Formatter</Link></li>
              <li><Link href="/tools/base64-encoder" className="hover:text-foreground transition-colors">Base64 Encoder</Link></li>
              <li><Link href="/tools/color-picker" className="hover:text-foreground transition-colors">Color Picker</Link></li>
              <li><Link href="/tools/mortgage-calculator" className="hover:text-foreground transition-colors">Mortgage Calculator</Link></li>
              <li><Link href="/tools/regex-tester" className="hover:text-foreground transition-colors">Regex Tester</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.categories')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/developer" className="hover:text-foreground transition-colors">Developer Tools</Link></li>
              <li><Link href="/category/financial" className="hover:text-foreground transition-colors">Financial Calculators</Link></li>
              <li><Link href="/category/seo" className="hover:text-foreground transition-colors">SEO Tools</Link></li>
              <li><Link href="/category/css" className="hover:text-foreground transition-colors">CSS Generators</Link></li>
              <li><Link href="/category/converters" className="hover:text-foreground transition-colors">Unit Converters</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} UtilsNow. {t('footer.copyright')}
          <span className="mx-1">·</span>
          Built by <Link href="/about" className="hover:text-foreground transition-colors">Bharath S</Link>
        </div>
      </div>
    </footer>
  )
}
