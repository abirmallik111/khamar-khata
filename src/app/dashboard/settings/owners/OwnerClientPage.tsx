'use client'

import { useState } from 'react'
import { addOwner, deleteOwner } from './actions'
import { Loader2, Trash2, ShieldAlert, ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'

type Owner = {
  id: string
  name: string
  share_percentage: number
}

export function OwnerClientPage({ owners }: { owners: Owner[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  
  const currentTotalShare = owners.reduce((sum, o) => sum + Number(o.share_percentage), 0)
  const remainingShare = 100 - currentTotalShare

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(form)
      await addOwner(formData)
      form.reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add owner')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirmingId !== id) {
      setConfirmingId(id)
      setTimeout(() => setConfirmingId(null), 3000)
      return
    }

    setError(null)
    try {
      await deleteOwner(id)
      setConfirmingId(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete owner')
      setConfirmingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-display mb-1">Owner Management</h1>
        <p className="text-(--color-on-surface-variant) text-sm">Manage farm partners and their ownership stakes.</p>
      </header>

      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-md text-sm font-medium flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Share Allocation Status */}
      <div className={`p-6 rounded-md border-l-4 shadow-sm flex flex-col gap-3 ${
        currentTotalShare === 100 
          ? 'bg-green-500/10 border-green-500 text-green-700' 
          : 'bg-yellow-500/10 border-yellow-500 text-yellow-700'
      }`}>
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />
            Ownership Integrity
          </h2>
          <span className="text-2xl font-display font-bold">{currentTotalShare}% Allocated</span>
        </div>
        {currentTotalShare < 100 && (
          <p className="text-sm font-medium">
            ⚠️ <strong>CRITICAL:</strong> Total share must be 100% before financial calculations and distributions are accurate. You have {remainingShare}% remaining.
          </p>
        )}
        {currentTotalShare > 100 && (
          <p className="text-sm font-medium">
            🚨 <strong>ERROR:</strong> Total share exceeds 100%! Please adjust the shares to ensure data integrity.
          </p>
        )}
      </div>

      {/* Current Owners List */}
      <section className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden">
        <div className="p-6 border-b border-(--color-surface-high) bg-(--color-surface-high)/30 font-bold uppercase tracking-widest text-xs text-(--color-on-surface-variant)">
          Partner List
        </div>
        
        {owners.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-4">
             <div className="w-16 h-16 bg-(--color-surface-high) rounded-full flex items-center justify-center">
               <ShieldAlert className="w-8 h-8 text-(--color-on-surface-variant)" />
             </div>
             <p className="text-(--color-on-surface-variant) max-w-xs">No partners added yet. Add yourself as a 100% owner to begin tracking distributions.</p>
          </div>
        ) : (
          <ul className="divide-y divide-(--color-surface-high)">
            {owners.map(owner => (
              <li key={owner.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-(--color-surface-low) transition-colors group">
                <div className="flex-1">
                  <Link href={`/dashboard/settings/owners/${owner.id}`} className="font-bold text-xl text-(--color-on-background) hover:text-[var(--color-primary)] flex items-center gap-2">
                    {owner.name}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <p className="text-xs text-(--color-on-surface-variant) mt-1">Allocation: <span className="font-bold">{owner.share_percentage}%</span></p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto border-t sm:border-none pt-4 sm:pt-0">
                  <Link 
                    href={`/dashboard/settings/owners/${owner.id}`}
                    className="flex-1 sm:flex-none text-center px-4 py-2 text-sm font-bold rounded-md bg-(--color-surface-high) text-(--color-on-surface-variant) hover:bg-[var(--color-primary)] hover:text-white transition-all"
                  >
                    View Ledger
                  </Link>
                  <div className="flex items-center gap-2">
                    {confirmingId === owner.id && (
                      <span className="text-[10px] font-bold text-red-500 animate-pulse uppercase">Are you sure?</span>
                    )}
                    <button 
                      onClick={() => handleDelete(owner.id)}
                      className={`p-3 rounded-full transition-all ${confirmingId === owner.id ? 'bg-red-500 text-white shadow-lg scale-110' : 'text-[var(--color-error)] hover:bg-[var(--color-error)]/10'}`}
                      title="Delete Partner"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add Owner Form (Always show if < 100, or allow multiple) */}
      <section className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-6 sm:p-8">
        <h2 className="font-bold text-xl mb-6">Add New Partner</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="name">
                Partner Name *
              </label>
              <input
                required
                id="name"
                name="name"
                className="rounded-md px-4 py-3 bg-[var(--color-surface-high)] border-b-2 border-transparent focus:border-[var(--color-primary)] outline-none transition-all"
                placeholder="e.g. Rahim Miah"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-(--color-on-surface-variant)" htmlFor="share_percentage">
                Share Percentage (%) *
              </label>
              <div className="relative">
                <input
                  required
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  id="share_percentage"
                  name="share_percentage"
                  defaultValue={remainingShare > 0 ? remainingShare : 0}
                  className="w-full rounded-md px-4 py-3 bg-[var(--color-surface-high)] border-b-2 border-transparent focus:border-[var(--color-primary)] outline-none transition-all font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-(--color-on-surface-variant) font-bold">%</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-primary text-(--color-on-primary) px-8 py-3 rounded-full font-bold shadow-ambient hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 self-end sm:self-start"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Adding...' : 'Register Partner'}
          </button>
        </form>
      </section>
    </div>
  )
}
