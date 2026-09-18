import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getTelegramWebApp } from './telegram'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'dibo-theme'

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* ignore */
  }
  return getTelegramWebApp()?.colorScheme === 'dark' ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.setAttribute('data-theme', theme)
}

interface ThemeCtx {
  theme: Theme
  toggleTheme: () => void
}

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggleTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
  }

  return <Ctx.Provider value={{ theme, toggleTheme }}>{children}</Ctx.Provider>
}

export function useTheme() {
  return useContext(Ctx)
}
