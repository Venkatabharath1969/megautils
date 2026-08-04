import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'MegaUtils terms of service. Read our terms for using the free online tools.',
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Terms of Service</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: August 1, 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using MegaUtils (megautils.com), you accept and agree to be bound by these
          Terms of Service. If you do not agree to these terms, please do not use our website.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          MegaUtils provides free online utility tools including but not limited to code formatters,
          data converters, calculators, SEO tools, and generators. All tools process data entirely
          within your browser and do not transmit your data to our servers.
        </p>

        <h2>3. Use of Tools</h2>
        <p>You agree to use our tools responsibly and in compliance with all applicable laws. You may:</p>
        <ul>
          <li>Use the tools for personal and commercial purposes</li>
          <li>Access the tools without creating an account</li>
          <li>Share links to our tools with others</li>
        </ul>
        <p>You may not:</p>
        <ul>
          <li>Attempt to reverse engineer, decompile, or disassemble the tools</li>
          <li>Use automated systems (bots, scrapers) to access the site in a manner that degrades performance for others</li>
          <li>Reproduce, duplicate, or copy the website content without permission</li>
          <li>Use the tools for any unlawful purpose</li>
        </ul>

        <h2>4. Tools Provided &quot;As Is&quot;</h2>
        <p>
          All tools on MegaUtils are provided on an &quot;as is&quot; and &quot;as available&quot; basis.
          We make no warranties, expressed or implied, regarding the accuracy, reliability, or
          completeness of any tool&apos;s output. You use the tools at your own risk.
        </p>
        <p>
          While we strive for accuracy, we do not guarantee that the output of any tool is error-free.
          You should always verify critical calculations and conversions independently.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by applicable law, MegaUtils and its operators shall not be
          liable for any indirect, incidental, special, consequential, or punitive damages, including
          but not limited to:
        </p>
        <ul>
          <li>Loss of profits, data, or business opportunities</li>
          <li>Errors or inaccuracies in tool outputs</li>
          <li>Service interruptions or downtime</li>
          <li>Damages resulting from reliance on tool results for financial, legal, or medical decisions</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>
          The MegaUtils website, including its design, layout, graphics, and code, is protected by
          intellectual property laws. You may not reproduce, distribute, or create derivative works
          from our website content without our express written permission.
        </p>

        <h2>7. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We are not responsible for the content,
          privacy practices, or terms of any third-party sites. Visiting linked sites is at your own risk.
        </p>

        <h2>8. Advertising</h2>
        <p>
          MegaUtils displays advertisements through Google AdSense and possibly other advertising networks.
          These advertisements help us keep all tools free to use. Third-party advertisers may use cookies
          and tracking technologies as described in our <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>9. Modifications to Terms</h2>
        <p>
          We reserve the right to modify these Terms of Service at any time. Changes will be posted on
          this page with an updated effective date. Your continued use of the website after any modifications
          constitutes acceptance of the revised terms.
        </p>

        <h2>10. Termination</h2>
        <p>
          We reserve the right to terminate or restrict your access to our website at our sole discretion,
          without notice, for conduct that we believe violates these Terms or is harmful to other users
          or the website.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with applicable law, without
          regard to conflict of law principles.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have any questions about these Terms of Service, please <Link href="/contact">contact us</Link>.
        </p>
      </div>
    </div>
  )
}
