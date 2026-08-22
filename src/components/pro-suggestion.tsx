'use client'

import { ExternalLink } from 'lucide-react'

// Affiliate suggestions — replace hrefs with tracking URLs after signing up for each program
// Sign-up guide: /opt/automation/AFFILIATE-SETUP.md
const SUGGESTIONS: Record<string, { text: string; cta: string; href: string }> = {
  image:      { text: 'Need batch processing or advanced editing?',  cta: 'Try Canva Pro',    href: 'https://www.canva.com/pro/' },
  developer:  { text: 'Need a full IDE with AI assistance?',         cta: 'Try Cursor AI',    href: 'https://cursor.com/' },
  seo:        { text: 'Need keyword research and site audits?',      cta: 'Try Semrush Free', href: 'https://www.semrush.com/' },
  financial:  { text: 'Need full accounting and invoicing?',         cta: 'Try QuickBooks',   href: 'https://quickbooks.intuit.com/' },
  text:       { text: 'Need AI-powered writing assistance?',         cta: 'Try Grammarly',    href: 'https://www.grammarly.com/' },
  crypto:     { text: 'Need enterprise-grade encryption?',           cta: 'Try NordVPN',      href: 'https://nordvpn.com/' },
  color:      { text: 'Need professional design tools?',             cta: 'Try Webflow',      href: 'https://webflow.com/' },
  css:        { text: 'Need a visual CSS editor?',                   cta: 'Try Webflow',      href: 'https://webflow.com/' },
  converters: { text: 'Need fast, reliable web hosting?',            cta: 'Try Hostinger',    href: 'https://www.hostinger.com/' },
  encoders:   { text: 'Need enterprise-grade encryption?',           cta: 'Try NordVPN',      href: 'https://nordvpn.com/' },
  generators: { text: 'Need a domain for your project?',             cta: 'Try Namecheap',    href: 'https://www.namecheap.com/' },
  string:     { text: 'Need AI-powered writing assistance?',         cta: 'Try Grammarly',    href: 'https://www.grammarly.com/' },
  markdown:   { text: 'Need a connected workspace?',                 cta: 'Try Notion',       href: 'https://www.notion.so/' },
  math:       { text: 'Need full accounting and invoicing?',         cta: 'Try QuickBooks',   href: 'https://quickbooks.intuit.com/' },
  network:    { text: 'Need enterprise-grade VPN?',                  cta: 'Try NordVPN',      href: 'https://nordvpn.com/' },
  content:    { text: 'Need AI-powered writing assistance?',         cta: 'Try Grammarly',    href: 'https://www.grammarly.com/' },
  datetime:   { text: 'Need a connected workspace?',                 cta: 'Try Notion',       href: 'https://www.notion.so/' },
}

export function ProSuggestion({ category }: { category: string }) {
  const suggestion = SUGGESTIONS[category]
  if (!suggestion) return null

  const trackClick = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        affiliate_partner: suggestion.cta,
        affiliate_category: category,
      })
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-sm">
      <span className="text-muted-foreground">{suggestion.text}</span>
      <a href={suggestion.href} target="_blank" rel="noopener noreferrer sponsored nofollow"
        onClick={trackClick}
        className="inline-flex items-center gap-1 text-primary hover:underline whitespace-nowrap">
        {suggestion.cta} <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}
