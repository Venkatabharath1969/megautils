'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type LangCode } from './translations'

interface LanguageContextType {
  lang: LangCode
  setLang: (lang: LangCode) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('utilsnow-lang') as LangCode
    if (saved && translations[saved]) {
      setLangState(saved)
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language.split('-')[0] as LangCode
      if (translations[browserLang]) {
        setLangState(browserLang)
      }
    }
    setMounted(true)
  }, [])

  const setLang = (newLang: LangCode) => {
    setLangState(newLang)
    localStorage.setItem('utilsnow-lang', newLang)
    document.documentElement.lang = newLang
  }

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en'][key] || key
  }

  if (!mounted) {
    // During SSR/hydration, return English defaults
    return (
      <LanguageContext.Provider value={{ lang: 'en', setLang, t: (key) => translations['en'][key] || key }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
