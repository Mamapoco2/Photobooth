import { useCallback, useEffect, useState } from 'react'

const KEY = 'photobooth-theme'

export function useThemeMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem(KEY)
    if (saved === 'light') return false
    if (saved === 'dark') return true
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem(KEY, dark ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }, [dark])

  const toggle = useCallback(() => setDark((d) => !d), [])

  return { dark, setDark, toggle }
}
