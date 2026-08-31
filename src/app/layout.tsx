import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/i18n/language-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CommandPalette } from '@/components/command-palette'
import { CookieConsent } from '@/components/cookie-consent'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'UtilsNow - 220+ Free Online Tools for Developers & Everyone',
    template: '%s | UtilsNow',
  },
  description: 'Free online developer tools, financial calculators, SEO tools, converters, and more. All processing happens in your browser. No login required. No data stored.',
  keywords: ['online tools', 'developer tools', 'json formatter', 'base64 encoder', 'calculator', 'converter', 'seo tools', 'css generator'],
  metadataBase: new URL('https://utilsnow.com'),
  openGraph: {
    title: 'UtilsNow - 220+ Free Online Tools',
    description: 'Free online developer tools, calculators, converters, and more. No login. No data stored.',
    url: 'https://utilsnow.com',
    siteName: 'UtilsNow',
    type: 'website',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'UtilsNow - 220+ Free Online Tools' }],
  },
  twitter: { card: 'summary_large_image', title: 'UtilsNow - 220+ Free Online Tools', description: 'Free online developer tools, calculators, converters, and more.', images: ['/opengraph-image.png'] },
  robots: { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-snippet': -1, 'max-video-preview': -1 },
  alternates: { canonical: 'https://utilsnow.com' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Pinterest domain verification */}
        <meta name="p:domain_verify" content="8544ca579aa676e78063f374e4d2fadf" />
        {/* Google Consent Mode v2 — MUST be the FIRST script to load */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'analytics_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500,
          });
        `}} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="alternate" type="application/rss+xml" title="UtilsNow Blog" href="/feed.xml" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <meta name="theme-color" content="#2563eb" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'UtilsNow',
              url: 'https://utilsnow.com',
              description: '220+ free browser-based utility tools for developers, designers, and everyone.',
              sameAs: [
                'https://github.com/Venkatabharath1969/megautils',
                'https://linkedin.com/company/techie-boy',
                'https://x.com/utilsnow',
              ],
              founder: { '@id': 'https://utilsnow.com/#creator' },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              '@id': 'https://utilsnow.com/#creator',
              name: 'Bharath S',
              jobTitle: 'Software Engineer',
              url: 'https://utilsnow.com/about',
              worksFor: {
                '@type': 'Organization',
                name: 'UtilsNow',
                url: 'https://utilsnow.com',
              },
              sameAs: [
                'https://github.com/Venkatabharath1969',
                'https://linkedin.com/company/techie-boy',
              ],
              knowsAbout: ['Web Development', 'JavaScript', 'TypeScript', 'AI Tools', 'Developer Tools'],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'UtilsNow',
              url: 'https://utilsnow.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://utilsnow.com/?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* Google AdSense verification */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3062425605979427" crossOrigin="anonymous" />
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}} />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md">
          Skip to main content
        </a>
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            <CommandPalette />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
          </LanguageProvider>
        </ThemeProvider>
        {/* Infolinks Ad Network — temporarily disabled for AdSense approval */}
        {/* <script dangerouslySetInnerHTML={{ __html: `var infolinks_pid = 3446872; var infolinks_wsid = 0;` }} />
        <script async src="//resources.infolinks.com/js/infolinks_main.js" /> */}
      </body>
    </html>
  )
}
