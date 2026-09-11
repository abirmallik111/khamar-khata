'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { updateUserCurrency } from '@/app/dashboard/settings/actions'

export type CurrencyCode = 'BDT' | 'INR' | 'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED' | 'PKR' | 'MYR' | 'SGD'

export interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  name: string
  locale: string
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'en-PK' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
]

type SettingsContextType = {
  isSimpleMode: boolean
  toggleSimpleMode: () => void
  currency: CurrencyCode
  updateCurrency: (code: CurrencyCode) => Promise<void>
  isLoaded: boolean
}

const SettingsContext = createContext<SettingsContextType>({
  isSimpleMode: false,
  toggleSimpleMode: () => {},
  currency: 'BDT',
  updateCurrency: async () => {},
  isLoaded: false,
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [isSimpleMode, setIsSimpleMode] = useState(false)
  const [currency, setCurrency] = useState<CurrencyCode>('BDT')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const storedSimpleMode = localStorage.getItem('kk-simple-mode')
      const storedCurrency = localStorage.getItem('kk-currency') as CurrencyCode

      if (storedSimpleMode === 'true') setIsSimpleMode(true)
      if (storedCurrency && CURRENCIES.find(c => c.code === storedCurrency)) {
        setCurrency(storedCurrency)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoaded(true)
    }
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

  const updateCurrency = async (code: CurrencyCode) => {
    setCurrency(code)
    try {
      localStorage.setItem('kk-currency', code)
      await updateUserCurrency(code)
    } catch (error) {
      console.error('Error updating currency:', error)
    }
  }

  return (
    <SettingsContext.Provider value={{ isSimpleMode, toggleSimpleMode, currency, updateCurrency, isLoaded }}>
      <div data-simple-mode={isSimpleMode ? 'true' : 'false'}>
        {children}
      </div>
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
