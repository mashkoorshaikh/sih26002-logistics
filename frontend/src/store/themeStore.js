import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // Default is professional light mode
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: nextTheme })
        if (typeof document !== 'undefined') {
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
      setTheme: (theme) => {
        set({ theme })
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },
      initTheme: () => {
        const current = get().theme
        if (typeof document !== 'undefined') {
          if (current === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      }
    }),
    {
      name: 'ner-theme-storage'
    }
  )
)

export default useThemeStore
