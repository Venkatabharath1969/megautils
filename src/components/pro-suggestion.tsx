'use client'

import { ExternalLink } from 'lucide-react'

const SUGGESTIONS: Record<string, { text: string; cta: string; href: string }> = {
  image: { text: 'Need batch processing or advanced editing?', cta: 'Try Canva Pro', href: 'https://www.canva.com/pro/' },
  developer: { text: 'Need a full IDE with AI assistance?', cta: 'Try VS Code', href: 'https://code.visualstudio.com/' },
  seo: { text: 'Need keyword research and site audits?', cta: 'Try Semrush Free', href: 'https://www.semrush.com/' },
  financial: { text: 'Need full accounting and invoicing?', cta: 'Try QuickBooks', href: 'https://quickbooks.intuit.com/' },
  text: { text: 'Need AI-powered writing assistance?', cta: 'Try Grammarly', href: 'https://www.grammarly.com/' },
  crypto: { text: 'Need enterprise-grade encryption?', cta: 'Try NordVPN', href: 'https://nordvpn.com/' },
  color: { text: 'Need professional design tools?', cta: 'Try Figma', href: 'https://www.figma.com/' },
  css: { text: 'Need a visual CSS editor?', cta: 'Try Webflow', href: 'https://webflow.com/' },
}

export function ProSuggestion({ category }: { category: string }) {
  const suggestion = SUGGESTIONS[category]
  if (!suggestion) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-sm">
      <span className="text-muted-foreground">{suggestion.text}</span>
      <a href={suggestion.href} target="_blank" rel="noopener noreferrer nofollow"
        className="inline-flex items-center gap-1 text-primary hover:underline whitespace-nowrap">
        {suggestion.cta} <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}
