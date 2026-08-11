import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'UtilsNow cookie policy. Learn about the cookies we use, including essential preferences stored in localStorage and third-party advertising cookies.',
  alternates: { canonical: 'https://utilsnow.com/cookies' },
}

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Cookie Policy</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Cookie Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: August 1, 2026</p>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h2>What Are Cookies</h2>
        <p>
          Cookies are small text files that websites place on your device to store information about your
          preferences and activity. They help websites remember your settings and improve your browsing
          experience. Some data may also be stored using similar browser technologies such as localStorage.
        </p>

        <h2>Essential Cookies &amp; Local Storage</h2>
        <p>
          UtilsNow uses your browser&apos;s localStorage to remember a small number of preferences.
          These are essential for the site to function as expected and cannot be disabled without
          affecting your experience.
        </p>
        <ul>
          <li>
            <strong>Theme preference</strong> &mdash; Stores whether you have selected light or dark
            mode so your choice persists between visits. Saved in localStorage.
          </li>
          <li>
            <strong>Language preference</strong> &mdash; Stores your selected language so the site
            displays content in your preferred language on return visits. Saved in localStorage.
          </li>
        </ul>
        <p>
          These values are stored entirely on your device. They are never transmitted to our servers or
          shared with any third party.
        </p>

        <h2>Third-Party Cookies</h2>
        <h3>Google AdSense</h3>
        <p>
          When approved, we plan to display advertisements through Google AdSense. Google AdSense may
          set cookies on your device to serve ads based on your prior visits to our website or other
          websites across the Internet. These cookies allow Google and its advertising partners to
          deliver relevant advertisements to you.
        </p>
        <p>
          You can opt out of personalised advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>{' '}
          or by visiting{' '}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
            www.aboutads.info/choices
          </a>.
        </p>

        <h2>How to Disable Cookies</h2>
        <p>
          Most web browsers allow you to control cookies through their settings. You can typically find
          cookie settings under &quot;Privacy&quot; or &quot;Security&quot; in your browser&apos;s
          preferences. Here are links to cookie management instructions for common browsers:
        </p>
        <ul>
          <li>
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
              Google Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer">
              Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
              Microsoft Edge
            </a>
          </li>
        </ul>
        <p>
          Please note that disabling cookies may affect the functionality of some features on our site,
          such as remembering your theme and language preferences.
        </p>

        <h2>More Information</h2>
        <p>
          For more details on how we handle your data, please read our{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about our use of cookies, please{' '}
          <Link href="/contact">contact us</Link>.
        </p>
      </div>
    </div>
  )
}
