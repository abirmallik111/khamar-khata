'use client'

import { useState } from 'react'
import { Trash, Loader2 } from 'lucide-react'
import { deleteGoat } from '../actions'

export function DeleteGoatButton({ goatId, className = '' }: { goatId: string, className?: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm('Are you absolutely sure you want to delete this goat? This action cannot be undone and will also remove all associated sales, health records, and notes.')) {
      setIsDeleting(true)
      try {
        await deleteGoat(goatId)
      } catch (err) {
        console.error(err)
        alert('Failed to delete goat. Please try again.')
        setIsDeleting(false)
      }
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`bg-(--color-surface-lowest) border border-error text-error px-4 py-2 rounded-full text-sm font-semibold hover:bg-error hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 ${className}`}
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
