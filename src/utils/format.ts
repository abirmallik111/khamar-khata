/**
 * Centralized formatting utility for Khamar Khata
 */

import { CurrencyCode, CURRENCIES } from '@/contexts/SettingsContext'

/**
 * Maps currency codes to their specific locales for correct formatting
 * (Decimals, symbol position, digit grouping)
 */
const currencyLocaleMap: Record<CurrencyCode, string> = {
  BDT: 'bn-BD',
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  SAR: 'ar-SA',
  AED: 'ar-AE',
  PKR: 'en-PK',
  MYR: 'ms-MY',
  SGD: 'en-SG',
}

/**
 * Formats a number as currency using Intl API
 * @param amount The numerical value
 * @param currencyCode The currency code (default: BDT)
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'BDT'): string {
  const locale = currencyLocaleMap[currencyCode] || 'en-US'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formats a number with 2 decimal places for precise transaction details
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

/**
 * Formats large numbers into compact strings (K for thousands, L for lakhs, M for millions)
 * Automatically adapts based on the currency's locale.
 */
export function formatCompactNumber(num: number, currencyCode: CurrencyCode = 'BDT'): string {
  const locale = currencyLocaleMap[currencyCode] || 'en-US'

  // Special handling for BDT to use 'K' instead of Bengali suffixes
  if (currencyCode === 'BDT') {
    const absNum = Math.abs(num)
    const sign = num < 0 ? '-' : ''
    let value = ''
    let suffix = ''

    if (absNum >= 1000000) {
      value = (absNum / 1000000).toFixed(1)
      suffix = 'M'
    } else if (absNum >= 1000) {
      value = (absNum / 1000).toFixed(1)
      suffix = 'K'
    } else {
      value = absNum.toString()
    }

    // Remove .0 if it exists
    if (value.endsWith('.0')) value = value.slice(0, -2)
    
    return `${sign}${value}${suffix}৳`
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

/**
 * Simple compact format without currency symbol
 */
export function formatNumberOnly(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Formats a date string into a readable local format
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Helper to get the symbol for a specific currency
 */
export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find(c => c.code === code)?.symbol || '৳'
}
