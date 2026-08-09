import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight, Shield, Zap, Heart, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About UtilsNow',
  description: 'About UtilsNow - Free online utility tools for developers, designers, and everyone. 100+ tools, all processing in your browser.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">About</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">About UtilsNow</h1>

      <div className="prose prose-sm dark:prose-invert max-w-none mb-12">
        <p className="text-lg text-muted-foreground">
          UtilsNow is a free collection of 100+ online utility tools built for developers, designers,
          content creators, and anyone who needs quick, reliable tools without the hassle of signing up
          or installing software.
        </p>

        <h2>Our Mission</h2>
        <p>
          We believe essential utility tools should be free, fast, and private. Too many online tools
          require accounts, bombard you with pop-ups, or send your data to remote servers. UtilsNow
          is different:
        </p>
        <ul>
          <li>Every tool is completely free with no hidden paywalls</li>
          <li>No account or sign-up required</li>
          <li>All data processing happens in your browser - nothing is ever uploaded to our servers</li>
          <li>Clean, fast interface with no distracting pop-ups</li>
        </ul>

        <h2>What We Offer</h2>
        <p>Our growing collection includes tools across 17 categories:</p>
        <ul>
          <li><strong>Developer Tools</strong> - JSON/XML/HTML/CSS/SQL formatters, data converters</li>
          <li><strong>Encoders & Decoders</strong> - Base64, URL, JWT, binary, hex, Morse code</li>
          <li><strong>SEO Tools</strong> - Meta tags, sitemaps, SERP preview, keyword analysis</li>
          <li><strong>Financial Calculators</strong> - Compound interest, EMI, mortgage, SIP, ROI</li>
          <li><strong>Text Tools</strong> - Word counter, case converter, sorter, find & replace</li>
          <li><strong>Color Tools</strong> - Color picker, palette generator, contrast checker</li>
          <li><strong>CSS Generators</strong> - Gradients, shadows, flexbox, grid layouts</li>
          <li><strong>Markdown Tools</strong> - Editor, HTML converter, table generator</li>
          <li><strong>Unit Converters</strong> - Length, weight, temperature, data storage</li>
          <li>And many more...</li>
        </ul>

        <h2>Privacy First</h2>
        <p>
          Privacy is at the core of UtilsNow. Every tool runs entirely in your browser using
          browser-based JavaScript. Your data - whether it&apos;s JSON, passwords, or financial
          information - never leaves your device. We don&apos;t have access to it, and we don&apos;t
          want it.
        </p>
        <p>
          Read our full <Link href="/privacy">Privacy Policy</Link> for more details.
        </p>

        <h2>Built with Modern Technology</h2>
        <p>
          UtilsNow is built with Next.js, React, and Tailwind CSS, ensuring fast page loads,
          responsive design, and a great experience on any device.
        </p>
      </div>

      {/* Values Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {[
          { icon: Shield, title: '100% Private', description: 'All processing happens in your browser. No data uploaded or stored.' },
          { icon: Zap, title: 'Instant & Fast', description: 'No loading spinners or server round-trips. Tools work instantly.' },
          { icon: Heart, title: 'Free Forever', description: 'No premium tiers, no feature limits, no sign-up walls.' },
          { icon: Globe, title: 'Works Everywhere', description: 'Responsive design works on desktop, tablet, and mobile.' },
        ].map((value) => (
          <div key={value.title} className="p-5 rounded-xl border border-border bg-card">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-3">
              <value.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-1">{value.title}</h3>
            <p className="text-sm text-muted-foreground">{value.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Have questions or suggestions?{' '}
          <Link href="/contact" className="text-primary hover:underline">Get in touch</Link>.
        </p>
      </div>
    </div>
  )
}
