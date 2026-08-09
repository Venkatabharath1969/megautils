import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/i18n/language-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'UtilsNow - 194+ Free Online Tools for Developers & Everyone',
    template: '%s | UtilsNow',
  },
  description: 'Free online developer tools, financial calculators, SEO tools, converters, and more. All processing happens in your browser. No login required. No data stored.',
  keywords: ['online tools', 'developer tools', 'json formatter', 'base64 encoder', 'calculator', 'converter', 'seo tools', 'css generator'],
  metadataBase: new URL('https://utilsnow.com'),
  openGraph: {
    title: 'UtilsNow - 194+ Free Online Tools',
    description: 'Free online developer tools, calculators, converters, and more. No login. No data stored.',
    url: 'https://utilsnow.com',
    siteName: 'UtilsNow',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'UtilsNow - 194+ Free Online Tools', description: 'Free online developer tools, calculators, converters, and more.' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-snippet': -1, 'max-video-preview': -1 },
  
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'UtilsNow',
              url: 'https://utilsnow.com',
              description: '194+ free browser-based utility tools for developers, designers, and everyone.',
              sameAs: ['https://github.com/Venkatabharath1969/megautils'],
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
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7044821956302907" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <LanguageProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
        {/* Infolinks Ad Network — temporarily disabled for AdSense approval */}
        {/* <script dangerouslySetInnerHTML={{ __html: `var infolinks_pid = 3446872; var infolinks_wsid = 0;` }} />
        <script async src="//resources.infolinks.com/js/infolinks_main.js" /> */}
      </body>
    </html>
  )
}
