import { Metadata } from 'next'
import Link from 'next/link'
import { Check, Sparkles, Zap, Shield, Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'UtilsNow Pro — Unlimited Tools, No Ads | UtilsNow',
  description: 'Upgrade to UtilsNow Pro for unlimited tool usage, ad-free experience, batch processing, and priority support. Starting at $4.99/month.',
  alternates: { canonical: 'https://utilsnow.com/pro' },
}

const features = [
  { icon: Zap, title: 'Unlimited Usage', description: 'No daily limits on any tool' },
  { icon: Shield, title: 'Ad-Free Experience', description: 'Clean interface, zero distractions' },
  { icon: Download, title: 'Batch Processing', description: 'Process multiple files at once' },
  { icon: Sparkles, title: 'Priority Support', description: 'Get help when you need it' },
]

export default function ProPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-foreground">Pro</span>
      </nav>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" /> Coming Soon
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">UtilsNow Pro</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you love about UtilsNow, without limits. Unlimited usage, no ads, batch processing, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {features.map(f => (
          <div key={f.title} className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center p-8 rounded-xl border border-border bg-card">
        <div className="text-4xl font-bold mb-2">$4.99<span className="text-lg text-muted-foreground font-normal">/month</span></div>
        <p className="text-sm text-muted-foreground mb-1 line-through">$9.99/month</p>
        <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-6">50% OFF for early supporters</p>
        <p className="text-sm text-muted-foreground mb-4">Pro is launching soon. Join the waitlist to be the first to know.</p>
        <p className="text-xs text-muted-foreground">Subscribe to our newsletter below to get notified when Pro launches.</p>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-xl font-semibold mb-4">What&apos;s included in Free?</h2>
        <div className="inline-flex flex-col items-start gap-2 text-sm text-muted-foreground">
          {['All 230+ tools accessible', '10 uses per day', 'All AI tools included', '100% browser-based processing', 'No signup required'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
