'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { addGoatNote, editGoatNote } from '../actions'
import { SubmitButton } from '@/components/SubmitButton'

export function NoteModal({ goatId, initialData, onClose }: { goatId: string, initialData?: any, onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(!!initialData)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  const handleAction = async (formData: FormData) => {
    setError(null)
    try {
      if (initialData) {
        await editGoatNote(initialData.id, goatId, formData)
      } else {
        await addGoatNote(goatId, formData)
      }
      close()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  if (!isOpen && !initialData) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full h-full min-h-[140px] bg-(--color-surface-lowest) border-2 border-dashed border-(--color-surface-high) text-(--color-on-surface-variant) hover:border-primary hover:text-primary hover:bg-primary/5 transition-all p-6 rounded-lg flex flex-col items-center justify-center gap-3"
      >
        <div className="w-10 h-10 rounded-full bg-(--color-surface-high) flex items-center justify-center">
          <Plus className="w-5 h-5 text-current" />
        </div>
        <span className="font-semibold text-sm">Add Note / Reminder</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-(--color-surface-lowest) rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-(--color-surface-high) flex justify-between items-center">
          <h2 className="font-bold text-lg">{initialData ? 'Edit Note' : 'Add Note'}</h2>
          <button onClick={close} className="p-1 hover:bg-(--color-surface-high) rounded-full transition-colors">
            <X className="w-5 h-5 text-(--color-on-surface-variant)" />
          </button>
        </div>
        
        <form action={handleAction} className="p-6 flex flex-col gap-4">
          {error && <div className="text-error bg-error/10 p-3 rounded-md text-sm">{error}</div>}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--color-on-surface-variant)">Date *</label>
            <input 
              type="date" 
              name="note_date" 
              required
              defaultValue={initialData?.note_date || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-(--color-surface-high) border-b-2 border-transparent focus:border-primary outline-none rounded-md"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-(--color-on-surface-variant)">Note Content *</label>
            <textarea 
              name="note"
              required
              autoFocus
              defaultValue={initialData?.note || ''}
              className="w-full px-4 py-3 bg-(--color-surface-high) border-b-2 border-transparent focus:border-primary outline-none rounded-md min-h-[150px] resize-y text-base"
              placeholder="Type your note or reminder here..."
            ></textarea>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={close}
              className="px-4 py-2 rounded-md font-medium text-(--color-on-surface-variant) hover:bg-(--color-surface-high) transition-colors"
            >
              Cancel
            </button>
            <SubmitButton 
              className="bg-primary text-white px-6 py-2 rounded-md font-semibold hover:opacity-90 transition-opacity"
              loadingText="Saving..."
            >
              {initialData ? 'Update Note' : 'Save Note'}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}
