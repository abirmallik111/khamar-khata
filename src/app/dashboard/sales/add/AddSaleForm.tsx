'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { GoatIcon, CowIcon } from '@/components/icons/AnimalIcons'
import { useFormat } from '@/hooks/useFormat'
import Link from 'next/link'
import { addSale } from '../actions'
import { SubmitButton } from '@/components/SubmitButton'

type AnimalItem = { id: string; name_or_tag: string; purchase_price: number }

export function AddSaleForm({ goats = [], cows = [] }: { goats?: AnimalItem[]; cows?: AnimalItem[] }) {
  const { currencySymbol, formatCurrency } = useFormat()
  const [error, setError] = useState<string | null>(null)
  const [animalType, setAnimalType] = useState<'goat' | 'cow'>(goats.length === 0 && cows.length > 0 ? 'cow' : 'goat')
  const [selectedId, setSelectedId] = useState<string>('')
  const [salePrice, setSalePrice] = useState<string>('')

  const currentList = animalType === 'cow' ? cows : goats
  const selectedAnimal = currentList.find(a => a.id === selectedId)
  
  // Calculate projected profit based on current inputs
  let projectedProfit = 0
  let profitMargin = 0
  if (selectedAnimal && salePrice) {
    const price = parseFloat(salePrice)
    if (!isNaN(price)) {
      projectedProfit = price - selectedAnimal.purchase_price
      profitMargin = selectedAnimal.purchase_price > 0 ? (projectedProfit / selectedAnimal.purchase_price) * 100 : 0
    }
  }

  const handleAction = async (formData: FormData) => {
    setError(null)

    try {
      await addSale(formData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while recording the sale.')
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
          <p className="text-(--color-on-surface-variant) text-sm">Sell an animal (goat or cow) and record the profit.</p>
        </div>
      </header>

      <form action={handleAction} className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 sm:p-8 flex flex-col gap-6">
        
        {error && (
          <div className="p-4 bg-error/10 text-error rounded-md text-sm font-medium">
            {error}
          </div>
        )}

        {/* Animal Type Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)">
            Animal Type *
          </label>
          <div className="grid grid-cols-2 gap-3 p-1 bg-(--color-surface-high) rounded-xl">
            <button
              type="button"
              onClick={() => { setAnimalType('goat'); setSelectedId('') }}
              className={`py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                animalType === 'goat'
                  ? 'bg-(--color-surface-lowest) text-primary shadow-sm font-semibold'
                  : 'text-(--color-on-surface-variant) hover:text-(--color-on-surface)'
              }`}
            >
              <GoatIcon size={16} />
              <span>Goat ({goats.length})</span>
            </button>
            <button
              type="button"
              onClick={() => { setAnimalType('cow'); setSelectedId('') }}
              className={`py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                animalType === 'cow'
                  ? 'bg-(--color-surface-lowest) text-primary shadow-sm font-semibold'
                  : 'text-(--color-on-surface-variant) hover:text-(--color-on-surface)'
              }`}
            >
              <CowIcon size={16} />
              <span>Cow ({cows.length})</span>
            </button>
          </div>
          <input type="hidden" name="animal_type" value={animalType} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="animal_id">
            Select {animalType === 'cow' ? 'Cow' : 'Goat'} to Sell *
          </label>
          <select
            required
            id="animal_id"
            name={animalType === 'cow' ? 'cow_id' : 'goat_id'}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-md px-4 py-3 bg-(--color-surface-high) border-b-2 border-transparent focus:border-primary outline-none transition-all appearance-none"
          >
            <option value="" disabled>Choose a {animalType}...</option>
            {currentList.map(item => (
              <option key={item.id} value={item.id}>{item.name_or_tag} (Cost: {formatCurrency(item.purchase_price)})</option>
            ))}
          </select>
          {currentList.length === 0 && (
            <span className="text-xs text-error mt-1">No active {animalType}s available to sell.</span>
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
              className="rounded-md px-4 py-4 bg-(--color-surface-high) border-b-2 border-transparent focus:border-primary outline-none transition-all font-display text-2xl font-bold text-primary"
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
              className="rounded-md px-4 py-4 bg-(--color-surface-high) border-b-2 border-transparent focus:border-primary outline-none transition-all"
            />
          </div>
        </div>

        {selectedAnimal && salePrice && !isNaN(parseFloat(salePrice)) && (
          <div className={`p-4 rounded-md border ${projectedProfit >= 0 ? 'border-primary bg-primary/5' : 'border-error bg-error/5'}`}>
            <h4 className="text-sm font-medium text-(--color-on-surface-variant) mb-2">Expected Profit / Loss</h4>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-(--color-on-surface-variant)">Sale Price: {formatCurrency(parseFloat(salePrice))}</span>
                <span className="text-xs text-(--color-on-surface-variant)">Purchase Cost: {formatCurrency(selectedAnimal.purchase_price)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xl font-bold font-display ${projectedProfit >= 0 ? 'text-primary' : 'text-error'}`}>
                  {projectedProfit >= 0 ? '+' : ''}{formatCurrency(projectedProfit)}
                </span>
                <span className={`text-xs font-bold ${projectedProfit >= 0 ? 'text-primary' : 'text-error'}`}>
                  Margin: {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
            {projectedProfit < 0 && (
              <p className="text-xs text-error mt-2 italic">Warning: You are selling this {animalType} at a loss.</p>
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
            className="rounded-md px-4 py-3 bg-(--color-surface-high) border-b-2 border-transparent focus:border-primary outline-none transition-all"
            placeholder="e.g. Sold to local butcher"
          />
        </div>

        <div className="mt-4 pt-6 border-t border-(--color-surface-high) flex justify-end gap-4">
          <Link 
            href="/dashboard/sales"
            className="px-6 py-3 rounded-full font-semibold text-primary hover:bg-(--color-surface-high) transition-colors"
          >
            Cancel
          </Link>
          <SubmitButton
            loadingText="Recording..."
            disabled={currentList.length === 0 || !selectedId}
            className="bg-gradient-primary text-white px-8 py-3 rounded-full font-semibold shadow-ambient hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Record Sale
          </SubmitButton>
        </div>
      </form>
    </>
  )
}
