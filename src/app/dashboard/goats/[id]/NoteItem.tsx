'use client'

import { useState } from 'react'
import { Pencil, Trash, Loader2 } from 'lucide-react'
import { NoteModal } from './NoteModal'

export function NoteItem({ note, goatId }: { note: any, goatId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showMobileActions, setShowMobileActions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { deleteGoatNote } = await import('../actions')
      await deleteGoatNote(note.id, goatId)
    } catch (err) {
      console.error(err)
      alert('Failed to delete note')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div 
        className="bg-(--color-surface-high) p-5 rounded-lg border border-transparent hover:border-primary/20 flex flex-col gap-4 relative group hover:shadow-sm transition-all overflow-hidden cursor-pointer sm:cursor-default"
        onClick={() => setShowMobileActions(!showMobileActions)}
      >
        {/* Subtle decorative elements matching theme */}
        <div className="absolute top-0 right-8 w-8 h-1.5 bg-primary/20 rounded-b-md" />
        <div className="absolute top-2.5 right-11 w-1.5 h-1.5 rounded-full bg-primary/40 shadow-sm" />

        <div className={`absolute top-2 right-2 flex items-center gap-1 transition-opacity bg-(--color-surface-high)/80 backdrop-blur-sm rounded-md p-1 z-10 ${showMobileActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
            className="p-1.5 hover:bg-(--color-surface-lowest) rounded-md text-(--color-on-surface-variant) hover:text-primary transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }} 
            disabled={isDeleting} 
            className="p-1.5 hover:bg-(--color-surface-lowest) rounded-md text-(--color-on-surface-variant) hover:text-error transition-colors"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-[15px] leading-relaxed flex-1 whitespace-pre-wrap pr-4 mt-1 font-medium">
          {note.note}
        </p>
        
        <div className="flex items-center justify-between border-t border-(--color-surface-lowest)/60 pt-3 mt-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-(--color-on-surface-variant)/70">
            Note
          </span>
          <p className="text-xs text-(--color-on-surface-variant) font-semibold flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            {new Date(note.note_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="bg-(--color-surface-lowest) rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Note?</h3>
              <p className="text-sm text-(--color-on-surface-variant) mb-6">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
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
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <NoteModal 
          goatId={goatId} 
          initialData={note} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </>
  )
}
