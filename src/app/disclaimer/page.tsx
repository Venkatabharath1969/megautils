import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'UtilsNow disclaimer. All tools are provided as-is without warranties. Results should be verified independently.',
  alternates: { canonical: 'https://utilsnow.com/disclaimer' },
}

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Disclaimer</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Disclaimer</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: August 18, 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h2>General Disclaimer</h2>
        <p>
          The information and tools provided on UtilsNow (utilsnow.com) are for general informational and
          utility purposes only. All tools, content, and services are provided on an &quot;as is&quot; and
          &quot;as available&quot; basis without any warranties of any kind, either express or implied,
          including but not limited to warranties of merchantability, fitness for a particular purpose,
          or non-infringement.
        </p>

        <h2>No Professional Advice</h2>
        <p>
          The tools and content on UtilsNow do not constitute professional advice of any kind. This includes,
          but is not limited to, financial, legal, medical, tax, or technical advice. Always consult a
          qualified professional before making decisions based on the output of any tool on this website.
        </p>
        <ul>
          <li><strong>Financial calculators</strong> (EMI, mortgage, compound interest, SIP, tax) provide
            estimates only and should not be used as the sole basis for financial decisions.</li>
          <li><strong>Code formatters and validators</strong> are provided as development aids and may not
            catch all errors or conform to every specification.</li>
          <li><strong>SEO tools</strong> provide general guidance and do not guarantee search engine rankings.</li>
          <li><strong>AI-powered tools</strong> use machine learning models that may produce inaccurate results
            and should be reviewed by a human before use.</li>
        </ul>

        <h2>Accuracy of Results</h2>
        <p>
          While we strive for accuracy in all our tools, UtilsNow makes no guarantees regarding the accuracy,
          completeness, or reliability of any tool output. Results may vary based on input data, browser
          environment, and other factors. You are responsible for verifying all results independently
          before using them in any critical application.
        </p>

        <h2>Browser-Based Processing</h2>
        <p>
          All tools on UtilsNow process data entirely within your browser using client-side JavaScript.
          While this means your data never leaves your device, it also means that results depend on your
          browser&apos;s JavaScript engine and may differ slightly across browsers or devices.
        </p>

        <h2>Third-Party Links and Services</h2>
        <p>
          UtilsNow may contain links to external websites and services. We are not responsible for the
          content, accuracy, privacy practices, or availability of any third-party websites. The inclusion
          of any link does not imply endorsement by UtilsNow.
        </p>

        <h2>Advertising</h2>
        <p>
          UtilsNow displays advertisements provided by third-party advertising networks, including Google
          AdSense. These advertisements are clearly distinguishable from our content. We are not responsible
          for the content, claims, or offers made in any advertisement. Any interaction with advertisements
          is at your own risk and subject to the advertiser&apos;s terms and privacy policies.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          In no event shall UtilsNow, its operators, or its contributors be liable for any direct, indirect,
          incidental, special, consequential, or punitive damages arising out of or in connection with
          your use of, or inability to use, the website or any of its tools. This limitation applies
          regardless of the theory of liability, whether based in contract, tort, negligence, strict
          liability, or otherwise.
        </p>

        <h2>Changes to This Disclaimer</h2>
        <p>
          We reserve the right to modify this Disclaimer at any time without prior notice. Changes will be
          posted on this page with an updated effective date. Your continued use of the website following
          any changes constitutes acceptance of the revised Disclaimer.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Disclaimer, please visit our{' '}
          <Link href="/contact">contact page</Link>.
        </p>
      </div>
    </div>
  )
}
