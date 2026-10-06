'use client'

import { useState } from 'react'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { useFormat } from '@/hooks/useFormat'
import Link from 'next/link'
import { updateExpense, deleteExpense } from '../../actions'
import { Category, Goat, Owner, Expense } from '@/types'
import { SubmitButton } from '@/components/SubmitButton'

export function EditExpenseForm({ 
  expense,
  categories, 
  goats, 
  owners,
  initialGoatIds,
  initialContributions
}: { 
  expense: Expense,
  categories: Category[], 
  goats: Pick<Goat, 'id' | 'name_or_tag'>[],
  owners: Pick<Owner, 'id' | 'name' | 'share_percentage'>[],
  initialGoatIds: string[],
  initialContributions: { owner_id: string, amount: number }[]
}) {
  const { currencySymbol } = useFormat()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedGoats, setSelectedGoats] = useState<Set<string>>(new Set(initialGoatIds))
  
  // Financial Split State
  const [totalAmount, setTotalAmount] = useState<string>(expense.amount.toString())
  
  const initialContribMap: Record<string, string> = {}
  initialContributions.forEach(c => {
    initialContribMap[c.owner_id] = c.amount.toString()
  })
  const [ownerContributions, setOwnerContributions] = useState<Record<string, string>>(initialContribMap)
  

  const toggleGoat = (id: string) => {
    const next = new Set(selectedGoats)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedGoats(next)
  }

  const handleContributionChange = (ownerId: string, value: string) => {
    setOwnerContributions(prev => ({
      ...prev,
      [ownerId]: value
    }))
  }

  const calculatePaidTotal = () => {
    return Object.values(ownerContributions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
  }

  const paidAmount = calculatePaidTotal()
  const dueAmount = Math.max(0, (parseFloat(totalAmount) || 0) - paidAmount)
  const paymentStatus = paidAmount === 0 ? 'due' : dueAmount === 0 ? 'paid' : 'partial'

  const handleAction = async (formData: FormData) => {
    setError(null)

    try {
      Array.from(selectedGoats).forEach(goatId => formData.append('goat_ids', goatId))
      formData.set('paid_amount', paidAmount.toString())
      formData.set('due_amount', dueAmount.toString())
      formData.set('payment_status', paymentStatus)

      const contributions = Object.entries(ownerContributions)
        .filter(([, val]) => parseFloat(val) > 0)
        .map(([id, val]) => ({ owner_id: id, amount: parseFloat(val) }))
      
      formData.set('owner_contributions', JSON.stringify(contributions))

      await updateExpense(expense.id, formData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the expense.')
    }
  }

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
      return
    }

    try {
      await deleteExpense(expense.id)
      window.location.href = '/dashboard/expenses'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      alert('Error deleting expense: ' + msg)
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/expenses" className="p-2 rounded-full hover:bg-(--color-surface-high) transition-colors text-(--color-on-surface-variant)">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-display mb-1">Edit Expense</h1>
            <p className="text-(--color-on-surface-variant) text-sm">Update expense details.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showConfirm && (
            <span className="text-xs font-bold text-red-500 animate-pulse uppercase tracking-tighter">Click again to delete</span>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-3 rounded-full transition-all ${showConfirm ? 'bg-red-500 text-white shadow-lg scale-110' : 'text-red-500 hover:bg-red-500/10'} disabled:opacity-50`}
            title={showConfirm ? "Confirm Delete" : "Delete Expense"}
          >
            {isDeleting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-error/10 text-error rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      <form action={handleAction} className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 sm:p-8 flex flex-col gap-6">
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="category_id">
                Category *
              </label>
            </div>
            <select 
              required 
              id="category_id" 
              name="category_id" 
              defaultValue={expense.category_id}
              className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all appearance-none"
            >
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="expense_date">
              Expense Date *
            </label>
            <input 
              required 
              type="date" 
              id="expense_date" 
              name="expense_date" 
              defaultValue={expense.expense_date} 
              className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="amount">
            Total Amount ({currencySymbol}) *
          </label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            id="amount"
            name="amount"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="rounded-md px-4 py-4 bg-surface-high border-b-2 border-transparent focus:border-error outline-none transition-all font-display text-2xl font-bold text-error"
          />
        </div>

        {/* Paid By (Split) Section */}
        <div className="flex flex-col gap-4 p-4 rounded-md border-2 border-dashed border-(--color-surface-high) bg-(--color-surface-low)/30">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-(--color-on-surface-variant)">Who Paid?</h3>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              paymentStatus === 'paid' ? 'bg-green-500 text-white' : 
              paymentStatus === 'partial' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {paymentStatus}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {owners.map(owner => (
              <div key={owner.id} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{owner.name}</span>
                  <span className="text-(--color-on-surface-variant)">{owner.share_percentage}%</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-(--color-on-surface-variant)">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={ownerContributions[owner.id] || ''}
                    onChange={(e) => handleContributionChange(owner.id, e.target.value)}
                    className="w-full pl-7 pr-4 py-2 bg-(--color-surface-lowest) border border-(--color-surface-high) rounded-md text-sm focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="note">
            Note (Optional)
          </label>
          <input 
            id="note" 
            name="note" 
            defaultValue={expense.note || ''}
            className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all" 
          />
        </div>

        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-(--color-surface-high)">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-(--color-on-surface-variant)">Apply to goats?</label>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">{selectedGoats.size} Selected</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
            {goats.map(goat => {
              const isSelected = selectedGoats.has(goat.id)
              return (
                <button type="button" key={goat.id} onClick={() => toggleGoat(goat.id)} className={`px-3 py-2 text-sm rounded-md border text-left transition-all ${isSelected ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-(--color-surface-high) hover:border-primary/50'}`}>
                  {goat.name_or_tag}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4 pt-6 border-t border-(--color-surface-high) flex justify-end gap-4">
          <Link href="/dashboard/expenses" className="px-6 py-3 rounded-full font-semibold text-primary hover:bg-(--color-surface-high) transition-colors">Cancel</Link>
          <SubmitButton 
            loadingText="Saving..."
            disabled={isDeleting} 
            className="bg-gradient-primary text-white px-8 py-3 rounded-full font-semibold shadow-ambient hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            Update Expense
          </SubmitButton>
        </div>
      </form>
    </>
  )
}
