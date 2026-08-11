import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'
import { ContactForm } from '@/components/contact-form'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with UtilsNow. Report bugs, request features, or ask questions about our free online tools.',
  alternates: { canonical: 'https://utilsnow.com/contact' },
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Contact</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-8">
        Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-card rounded-xl border border-border p-6">
          <ContactForm />
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold text-base mb-2">Get in Touch</h2>
            <p className="text-sm text-muted-foreground">
              Whether you have a feature request, found a bug, or just want to say hello,
              we appreciate your feedback. It helps us build better tools for everyone.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-base mb-2">Response Time</h2>
            <p className="text-sm text-muted-foreground">
              We typically respond within 48 hours. For urgent issues, please include
              &quot;URGENT&quot; in your message.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-base mb-2">Common Topics</h2>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>- Bug reports and tool issues</li>
              <li>- Feature requests and suggestions</li>
              <li>- Partnership inquiries</li>
              <li>- General questions</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Privacy note:</strong> Information submitted through this form is used
              solely to respond to your inquiry. See our{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
