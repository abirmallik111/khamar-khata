'use client'

import { useSettings, CURRENCIES, CurrencyCode } from '@/contexts/SettingsContext'
import { Globe } from 'lucide-react'

export function SettingsClientActions() {
  const { isSimpleMode, toggleSimpleMode, currency, updateCurrency } = useSettings()

  return (
    <div className="flex flex-col gap-8">
      {/* Currency Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary)">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-(--color-on-background)">Currency Setting</p>
            <p className="text-sm text-(--color-on-surface-variant)">
              Select your preferred currency for all financial displays.
            </p>
          </div>
        </div>
        <div className="relative min-w-[200px]">
          <select
            value={currency}
            onChange={(e) => updateCurrency(e.target.value as CurrencyCode)}
            className="w-full bg-(--color-surface-lowest) border border-(--color-surface-high) rounded-md px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-(--color-primary)/20 outline-none appearance-none"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol}) — {c.name}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-(--color-on-surface-variant)">
            ↓
          </div>
        </div>
      </div>

      <hr className="border-(--color-surface-high)" />

      {/* Simple Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-(--color-on-background)">Simple Mode</p>
          <p className="text-sm text-(--color-on-surface-variant) mt-1">
            Reduces visual effects for slower devices and low-bandwidth connections.
          </p>
        </div>
        <button
          onClick={toggleSimpleMode}
          aria-pressed={isSimpleMode}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
            isSimpleMode ? 'bg-[var(--color-primary)]' : 'bg-(--color-surface-high)'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              isSimpleMode ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isSimpleMode && (
        <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-md text-sm font-medium">
          ✓ Simple Mode is ON — animations and blur effects are reduced.
        </div>
      )}
    </div>
  )
}
