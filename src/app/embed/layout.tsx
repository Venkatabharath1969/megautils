import '@/app/globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/i18n/language-context'

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
