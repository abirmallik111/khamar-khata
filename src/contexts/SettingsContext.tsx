'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'

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
  const supabase = createClient()

  // Load initial settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 1. Try local storage for immediate UI
        const storedSimpleMode = localStorage.getItem('kk-simple-mode')
        const storedCurrency = localStorage.getItem('kk-currency') as CurrencyCode

        if (storedSimpleMode === 'true') setIsSimpleMode(true)
        if (storedCurrency && CURRENCIES.find(c => c.code === storedCurrency)) {
          setCurrency(storedCurrency)
        }

        // 2. Try Supabase if user is logged in
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('currency')
            .eq('id', user.id)
            .single()

          if (profile?.currency) {
            const remoteCurrency = profile.currency as CurrencyCode
            setCurrency(remoteCurrency)
            localStorage.setItem('kk-currency', remoteCurrency)
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadSettings()
  }, [supabase])

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
    localStorage.setItem('kk-currency', code)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ currency: code })
          .eq('id', user.id)
      }
    } catch (error) {
      console.error('Error updating currency in DB:', error)
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
