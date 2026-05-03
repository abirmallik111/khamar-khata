'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    setIsOffline(!navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-xs">
      <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white/20 p-2 rounded-full shrink-0">
          <WifiOff className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-tight">Offline Mode</span>
          <span className="text-[10px] opacity-90 leading-tight">Viewing cached farm data</span>
        </div>
      </div>
    </div>
  )
}
