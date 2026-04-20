'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useFormat } from '@/hooks/useFormat'
import Link from 'next/link'
import { addSale } from '../actions'

type Goat = { id: string; name_or_tag: string; purchase_price: number }

export function AddSaleForm({ goats }: { goats: Goat[] }) {
  const { currencySymbol, formatCurrency } = useFormat()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedGoatId, setSelectedGoatId] = useState<string>('')
  const [salePrice, setSalePrice] = useState<string>('')

  const selectedGoat = goats.find(g => g.id === selectedGoatId)
  
  // Calculate projected profit based on current inputs
  let projectedProfit = 0
  let profitMargin = 0
  if (selectedGoat && salePrice) {
    const price = parseFloat(salePrice)
    if (!isNaN(price)) {
      projectedProfit = price - selectedGoat.purchase_price
      profitMargin = selectedGoat.purchase_price > 0 ? (projectedProfit / selectedGoat.purchase_price) * 100 : 0
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      await addSale(formData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while recording the sale.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="flex items-center gap-4">
        <Link href="/dashboard/sales" className="p-2 rounded-full hover:bg-(--color-surface-high) transition-colors text-(--color-on-surface-variant)">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display mb-1">Record Sale</h1>
          <p className="text-(--color-on-surface-variant) text-sm">Sell a goat and record the profit.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 sm:p-8 flex flex-col gap-6">
        
        {error && (
          <div className="p-4 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-md text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="goat_id">
            Select Goat to Sell *
          </label>
          <select
            required
            id="goat_id"
            name="goat_id"
            value={selectedGoatId}
            onChange={(e) => setSelectedGoatId(e.target.value)}
            className="rounded-md px-4 py-3 bg-[var(--color-surface-high)] border-b-2 border-transparent focus:border-[var(--color-primary)] outline-none transition-all appearance-none"
          >
            <option value="" disabled>Choose a goat...</option>
            {goats.map(goat => (
              <option key={goat.id} value={goat.id}>{goat.name_or_tag} (Cost: {formatCurrency(goat.purchase_price)})</option>
            ))}
          </select>
          {goats.length === 0 && (
            <span className="text-xs text-[var(--color-error)] mt-1">No active goats available to sell.</span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="sale_price">
              Sale Price ({currencySymbol}) *
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              id="sale_price"
              name="sale_price"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="rounded-md px-4 py-4 bg-[var(--color-surface-high)] border-b-2 border-transparent focus:border-[var(--color-primary)] outline-none transition-all font-display text-2xl font-bold text-[var(--color-primary)]"
              placeholder="0.00"
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="sale_date">
              Sale Date *
            </label>
            <input
              required
              type="date"
              id="sale_date"
              name="sale_date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="rounded-md px-4 py-4 bg-[var(--color-surface-high)] border-b-2 border-transparent focus:border-[var(--color-primary)] outline-none transition-all"
            />
          </div>
        </div>

        {selectedGoat && salePrice && !isNaN(parseFloat(salePrice)) && (
          <div className={`p-4 rounded-md border ${projectedProfit >= 0 ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-error)] bg-[var(--color-error)]/5'}`}>
            <h4 className="text-sm font-medium text-(--color-on-surface-variant) mb-2">Projected Profit / Loss</h4>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-(--color-on-surface-variant)">Sale Price: {formatCurrency(parseFloat(salePrice))}</span>
                <span className="text-xs text-(--color-on-surface-variant)">Purchase Cost: {formatCurrency(selectedGoat.purchase_price)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xl font-bold font-display ${projectedProfit >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
                  {projectedProfit >= 0 ? '+' : ''}{formatCurrency(projectedProfit)}
                </span>
                <span className={`text-xs font-bold ${projectedProfit >= 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-error)]'}`}>
                  Margin: {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
            {projectedProfit < 0 && (
              <p className="text-xs text-[var(--color-error)] mt-2 italic">Warning: You are selling this goat at a loss.</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="note">
            Note (Optional)
          </label>
          <input
            id="note"
            name="note"
            className="rounded-md px-4 py-3 bg-[var(--color-surface-high)] border-b-2 border-transparent focus:border-[var(--color-primary)] outline-none transition-all"
            placeholder="e.g. Sold to local butcher"
          />
        </div>

        <div className="mt-4 pt-6 border-t border-(--color-surface-high) flex justify-end gap-4">
          <Link 
            href="/dashboard/sales"
            className="px-6 py-3 rounded-full font-semibold text-(--color-primary) hover:bg-(--color-surface-high) transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || goats.length === 0}
            className="bg-gradient-primary text-(--color-on-primary) px-8 py-3 rounded-full font-semibold shadow-ambient hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Recording...' : 'Record Sale'}
          </button>
        </div>
      </form>
    </>
  )
}
