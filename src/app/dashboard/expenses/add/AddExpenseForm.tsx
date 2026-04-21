'use client'

import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { useFormat } from '@/hooks/useFormat'
import Link from 'next/link'
import { addExpense, addCategory } from '../actions'
import { Category, Goat, Owner } from '@/types'
import { SubmitButton } from '@/components/SubmitButton'

export function AddExpenseForm({ 
  categories, 
  goats, 
  owners 
}: { 
  categories: Category[], 
  goats: Pick<Goat, 'id' | 'name_or_tag'>[],
  owners: Pick<Owner, 'id' | 'name' | 'share_percentage'>[]
}) {
  const { currencySymbol, formatCurrency } = useFormat()
  const [error, setError] = useState<string | null>(null)
  const [selectedGoats, setSelectedGoats] = useState<Set<string>>(new Set())
  
  // Financial Split State
  const [totalAmount, setTotalAmount] = useState<string>('')
  const [ownerContributions, setOwnerContributions] = useState<Record<string, string>>({})
  
  // Category management state
  const [showAddCategory, setShowAddCategory] = useState(categories.length === 0)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)

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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return
    setIsAddingCategory(true)
    try {
      const fd = new FormData()
      fd.append('name', newCategoryName)
      await addCategory(fd)
      setNewCategoryName('')
      setShowAddCategory(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add category')
    } finally {
      setIsAddingCategory(false)
    }
  }

  const handleAction = async (formData: FormData) => {
    setError(null)

    try {
      // Add selected goats
      Array.from(selectedGoats).forEach(goatId => {
        formData.append('goat_ids', goatId)
      })

      // Add financial summary
      formData.set('paid_amount', paidAmount.toString())
      formData.set('due_amount', dueAmount.toString())
      formData.set('payment_status', paymentStatus)

      // Add owner contributions as JSON
      const contributions = Object.entries(ownerContributions)
        .filter(([, val]) => parseFloat(val) > 0)
        .map(([id, val]) => ({ owner_id: id, amount: parseFloat(val) }))
      
      formData.set('owner_contributions', JSON.stringify(contributions))

      await addExpense(formData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the expense.')
    }
  }

  return (
    <>
      <header className="flex items-center gap-4">
        <Link href="/dashboard/expenses" className="p-2 rounded-full hover:bg-(--color-surface-high) transition-colors text-(--color-on-surface-variant)">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display mb-1">Record Expense</h1>
          <p className="text-(--color-on-surface-variant) text-sm">Log a new farm expense.</p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-error/10 text-error rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      {showAddCategory && (
        <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 flex flex-col gap-4 border border-primary/20">
          <h3 className="font-bold text-lg">Create New Category</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none"
              placeholder="e.g. Feed, Medicine"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={isAddingCategory}
              className="bg-primary text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
            >
              Add
            </button>
            <button type="button" onClick={() => setShowAddCategory(false)} className="px-4">Cancel</button>
          </div>
        </div>
      )}

      <form action={handleAction} className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 sm:p-8 flex flex-col gap-6">

        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="category_id">
                Category *
              </label>
              {!showAddCategory && (
                <button type="button" onClick={() => setShowAddCategory(true)} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> New Category
                </button>
              )}
            </div>
            <select required id="category_id" name="category_id" className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all appearance-none">
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="expense_date">
              Expense Date *
            </label>
            <input required type="date" id="expense_date" name="expense_date" defaultValue={new Date().toISOString().split('T')[0]} className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all" />
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
            placeholder="0.00"
          />
        </div>

        {/* Paid By (Split) Section */}
        <div className="flex flex-col gap-4 p-4 rounded-md border-2 border-dashed border-(--color-surface-high) bg-(--color-surface-low)/30">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-(--color-on-surface-variant)">Who Paid? (Splits)</h3>
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
                  <span className="text-(--color-on-surface-variant)">{owner.share_percentage}% share</span>
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

          <div className="mt-2 pt-4 border-t border-(--color-surface-high) grid grid-cols-2 gap-4 text-sm font-bold">
             <div className="flex flex-col">
               <span className="text-[10px] uppercase text-(--color-on-surface-variant)">Paid Amount</span>
               <span className="text-green-600 font-display">{formatCurrency(paidAmount)}</span>
             </div>
             <div className="flex flex-col text-right">
               <span className="text-[10px] uppercase text-(--color-on-surface-variant)">Due Amount</span>
               <span className={`${dueAmount > 0 ? 'text-red-500' : 'text-(--color-on-surface-variant)'} font-display`}>
                 {formatCurrency(dueAmount)}
               </span>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="note">
            Note (Optional)
          </label>
          <input id="note" name="note" className="rounded-md px-4 py-3 bg-surface-high border-b-2 border-transparent focus:border-primary outline-none transition-all" placeholder="e.g. Purchased 5 bags of feed" />
        </div>

        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-(--color-surface-high)">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-(--color-on-surface-variant)">Apply to specific goats? (Optional)</label>
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
            disabled={categories.length === 0} 
            className="bg-error text-white px-8 py-3 rounded-full font-semibold shadow-ambient hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Save Expense
          </SubmitButton>
        </div>
      </form>
    </>
  )
}
