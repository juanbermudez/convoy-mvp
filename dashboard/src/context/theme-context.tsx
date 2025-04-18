// theme-context.tsx
// Provides theming by applying CSS custom properties based on extracted color palettes

import React, {
  createContext,
  ReactNode,
  useEffect,
  useState,
  useContext,
} from 'react'
import { lightColors, darkColors } from '@/config/colors'

export type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
})

interface ThemeProviderProps {
  defaultTheme: Theme
  storageKey: string
  children: ReactNode
}

export function ThemeProvider({
  defaultTheme,
  storageKey,
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored === 'dark' || stored === 'light') {
        return stored as Theme
      }
    }
    return defaultTheme
  })

  // Apply CSS variables and html.dark class on theme change
  useEffect(() => {
    const palette = theme === 'dark' ? darkColors : lightColors
    // For each key, strip "hsl(" and ")" to set the raw numbers
    Object.entries(palette).forEach(([key, value]) => {
      const raw = value.startsWith('hsl(') && value.endsWith(')')
        ? value.slice(4, -1)
        : value
      document.documentElement.style.setProperty(`--${key}`, raw)
    })

    // Toggle .dark class for Tailwind dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Persist selection
    try {
      localStorage.setItem(storageKey, theme)
    } catch {
      // ignore if storage unavailable
    }
  }, [theme, storageKey])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Custom hook to access theme context
 */
export function useTheme() {
  return useContext(ThemeContext)
}
