'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type SimpleModeContextType = {
  isSimpleMode: boolean
  toggleSimpleMode: () => void
}

const SimpleModeContext = createContext<SimpleModeContextType>({
  isSimpleMode: false,
  toggleSimpleMode: () => {},
})

export function SimpleModeProvider({ children }: { children: ReactNode }) {
  const [isSimpleMode, setIsSimpleMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kk-simple-mode')
      if (stored === 'true') {
        requestAnimationFrame(() => setIsSimpleMode(true))
      }
    } catch {}
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const toggleSimpleMode = () => {
    setIsSimpleMode(prev => {
      const next = !prev
      try {
        localStorage.setItem('kk-simple-mode', String(next))
      } catch {}
      return next
    })
  }

  // Avoid hydration mismatch — render children unstyled until mounted
  if (!mounted) return <>{children}</>

  return (
    <SimpleModeContext.Provider value={{ isSimpleMode, toggleSimpleMode }}>
      <div data-simple-mode={isSimpleMode ? 'true' : 'false'}>
        {children}
      </div>
    </SimpleModeContext.Provider>
  )
}

export function useSimpleMode() {
  return useContext(SimpleModeContext)
}
