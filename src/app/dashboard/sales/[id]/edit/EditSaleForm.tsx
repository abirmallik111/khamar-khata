'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { useFormat } from '@/hooks/useFormat'
import Link from 'next/link'
import { updateSale, deleteSale } from '../../actions'
import { Sale, Goat } from '@/types'

interface EditSaleFormProps {
  sale: Sale & {
    goats: Pick<Goat, 'name_or_tag'> | null
  }
}

export function EditSaleForm({ sale }: EditSaleFormProps) {
  const { currencySymbol } = useFormat()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      await updateSale(sale.id, formData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the sale.')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
      return
    }

    try {
      await deleteSale(sale.id)
      window.location.href = '/dashboard/sales'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      alert('Error deleting sale: ' + msg)
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales" className="p-2 rounded-full hover:bg-(--color-surface-high) transition-colors text-(--color-on-surface-variant)">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-display mb-1">Edit Sale</h1>
            <p className="text-(--color-on-surface-variant) text-sm">Sale record for {sale.goats?.name_or_tag}.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showConfirm && (
            <span className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-tighter">Click again to delete</span>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
            className={`p-3 rounded-full transition-all ${showConfirm ? 'bg-red-500 text-white shadow-lg scale-110' : 'text-red-500 hover:bg-red-500/10'} disabled:opacity-50`}
            title={showConfirm ? "Confirm Delete" : "Delete Sale"}
          >
            {isDeleting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 sm:p-8 flex flex-col gap-6">
        
        {error && (
          <div className="p-4 bg-error/10 text-error rounded-md text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
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
            defaultValue={sale.sale_price}
            className="rounded-md px-4 py-4 bg-surface-high border-b-2 border-transparent focus:border-blue-500 outline-none transition-all font-display text-2xl font-bold text-blue-600"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="sale_date">
            Sale Date *
          </label>
          <input
            required
            type="date"
            id="sale_date"
            name="sale_date"
            defaultValue={sale.sale_date}
            className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="note">
            Note (Optional)
          </label>
          <textarea
            id="note"
            name="note"
            defaultValue={sale.note || ''}
            rows={3}
            className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all resize-none"
            placeholder="Details about the buyer or transaction..."
          />
        </div>

        <div className="mt-4 pt-6 border-t border-(--color-surface-high) flex justify-end gap-4">
          <Link href="/dashboard/sales" className="px-6 py-3 rounded-full font-semibold text-(--color-primary) hover:bg-(--color-surface-high) transition-colors">Cancel</Link>
          <button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-ambient hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Update Sale Record'}
          </button>
        </div>
      </form>
    </>
  )
}
