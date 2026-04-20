'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { formatCurrency as baseFormatCurrency, formatCompactNumber as baseFormatCompactNumber, getCurrencySymbol } from '@/utils/format'

export function useFormat() {
  const { currency } = useSettings()
  
  return {
    formatCurrency: (amount: number) => baseFormatCurrency(amount, currency),
    formatCompactNumber: (num: number) => baseFormatCompactNumber(num, currency),
    currencySymbol: getCurrencySymbol(currency),
    currency
  }
}
