import { useState, useEffect } from 'react'
import type { Lang } from './i18n'

export function useLang(): [Lang, () => void] {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null
    if (stored === 'fr' || stored === 'en') {
      setLang(stored)
    } else {
      localStorage.setItem('lang', 'en')
    }
  }, [])

  const toggle = () => {
    setLang(prev => {
      const next = prev === 'fr' ? 'en' : 'fr'
      localStorage.setItem('lang', next)
      return next
    })
  }

  return [lang, toggle]
}
