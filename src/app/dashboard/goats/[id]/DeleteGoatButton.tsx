'use client'

import { useState } from 'react'
import { Trash, Loader2 } from 'lucide-react'
import { deleteGoat } from '../actions'

export function DeleteGoatButton({ goatId, className = '' }: { goatId: string, className?: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteGoat(goatId)
    } catch (err) {
      console.error(err)
      alert('Failed to delete goat. Please try again.')
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className={`bg-(--color-surface-lowest) border border-error text-error px-4 py-2 rounded-full text-sm font-semibold hover:bg-error hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 ${className}`}
      >
        <Trash className="w-4 h-4" />
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-(--color-surface-lowest) rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-error">Delete Goat Profile?</h3>
              <p className="text-sm text-(--color-on-surface-variant) mb-6 leading-relaxed">
                Are you absolutely sure? This will permanently remove <span className="font-bold">all associated data</span>:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Sales records</li>
                  <li>Health history</li>
                  <li>Growth timeline photos</li>
                  <li>Notes & reminders</li>
                </ul>
              </p>
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-lg font-bold border border-(--color-surface-high) hover:bg-(--color-surface-low) transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-lg font-bold bg-error text-white hover:bg-red-600 shadow-lg shadow-error/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
