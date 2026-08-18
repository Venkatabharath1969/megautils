import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'UtilsNow privacy policy. All tool processing happens in your browser. No data is stored or transmitted to any server.',
  alternates: { canonical: 'https://utilsnow.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Privacy Policy</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: August 1, 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h2>Overview</h2>
        <p>
          UtilsNow (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your information when you visit our
          website at utilsnow.com.
        </p>

        <h2>Browser-Based Processing</h2>
        <p>
          <strong>All tool processing happens entirely in your browser.</strong> When you use any tool on
          UtilsNow, your data is processed locally on your device using JavaScript. No data is uploaded,
          transmitted, or stored on our servers. Your files, text, and inputs never leave your browser.
        </p>

        <h2>Information We Collect</h2>
        <h3>Information You Provide</h3>
        <p>
          If you contact us via our contact form, we may collect your name, email address, and the content
          of your message solely to respond to your inquiry.
        </p>

        <h3>Automatically Collected Information</h3>
        <p>When you visit UtilsNow, we may automatically collect certain information, including:</p>
        <ul>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Referring website</li>
          <li>Pages visited and time spent</li>
          <li>Approximate geographic location (country/city level)</li>
        </ul>
        <p>This information is collected through analytics services and is used to improve our website.</p>

        <h2>Cookies and Advertising</h2>
        <p>
          For full details on how we use cookies, please see our{' '}
          <Link href="/cookies">Cookie Policy</Link>.
        </p>

        <h3>Essential Cookies</h3>
        <p>
          We use essential cookies to remember your preferences, such as your selected theme (light/dark mode).
        </p>

        <h3>Google AdSense</h3>
        <p>
          We use Google AdSense to display advertisements on our website. Google AdSense may use cookies and
          web beacons to serve ads based on your prior visits to our website or other websites. Google&apos;s
          use of advertising cookies enables it and its partners to serve ads based on your visit to our site
          and/or other sites on the Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>. You may also opt out of third-party vendor use of cookies for personalized advertising by visiting{' '}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
            www.aboutads.info/choices
          </a>{' '}
          or the{' '}
          <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer">
            Network Advertising Initiative opt-out page
          </a>.
        </p>

        <h3>Third-Party Ad Networks</h3>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based on your prior visits to
          this website or other websites. Google&apos;s use of advertising cookies enables it and its partners
          to serve ads to you based on your visit to our site and/or other sites on the Internet.
          Any data collected by third-party advertisers is subject to their respective privacy policies.
        </p>

        <h3>Analytics</h3>
        <p>
          We may use third-party analytics services (such as Google Analytics) to help us understand how
          visitors use our website. These services may collect information about your use of the website,
          including your IP address. This information is used to compile reports and help us improve the site.
        </p>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our website and tools</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>Display relevant advertisements</li>
        </ul>

        <h2>Data Sharing</h2>
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may share generic
          aggregated demographic information not linked to any personal identification information with our
          business partners, trusted affiliates, and advertisers.
        </p>

        <h2>Your Rights (GDPR)</h2>
        <p>If you are located in the European Economic Area (EEA), you have the following rights:</p>
        <ul>
          <li><strong>Right of access</strong> - You can request copies of your personal data.</li>
          <li><strong>Right to rectification</strong> - You can request that we correct inaccurate data.</li>
          <li><strong>Right to erasure</strong> - You can request that we erase your personal data under certain conditions.</li>
          <li><strong>Right to restrict processing</strong> - You can request that we restrict the processing of your personal data.</li>
          <li><strong>Right to data portability</strong> - You can request that we transfer the data we have collected to another organization.</li>
          <li><strong>Right to object</strong> - You can object to our processing of your personal data.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us through our{' '}
          <Link href="/contact">contact page</Link>.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          Our website is not intended for children under the age of 13. We do not knowingly collect personal
          information from children under 13.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting
          the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please <Link href="/contact">contact us</Link>.
        </p>
      </div>
    </div>
  )
}
