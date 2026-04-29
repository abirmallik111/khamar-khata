'use client'

import { useState } from 'react'
import { Calendar, MoreVertical, Pencil, Trash, Loader2 } from 'lucide-react'
import { deleteHealthRecord } from './actions' // wait, actions are in ../actions
import { HealthRecordModal } from './HealthRecordModal'
import { formatDate } from '@/utils/format'

export function HealthRecordItem({ record, goatId }: { record: any, goatId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showMobileActions, setShowMobileActions] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this record?')) {
      setIsDeleting(true)
      try {
        const { deleteHealthRecord } = await import('../actions')
        await deleteHealthRecord(record.id, goatId)
      } catch (err) {
        console.error(err)
        alert('Failed to delete record')
        setIsDeleting(false)
      }
    }
  }

  return (
    <>
      <div 
        className="bg-(--color-surface-high) p-5 rounded-lg flex flex-col gap-3 border border-transparent hover:border-primary/20 transition-all shadow-sm relative group overflow-hidden cursor-pointer sm:cursor-default"
        onClick={() => setShowMobileActions(!showMobileActions)}
      >
        {/* Subtle background decoration depending on type */}
        <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 pointer-events-none ${
            record.record_type === 'medicine' ? 'bg-indigo-500' : 
            record.record_type === 'vaccine' ? 'bg-emerald-500' :
            'bg-sky-500'
        }`} />

        <div className={`absolute top-2 right-2 flex items-center gap-1 transition-opacity z-10 bg-(--color-surface-high)/80 backdrop-blur-sm rounded-md p-1 ${showMobileActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
            className="p-1.5 hover:bg-(--color-surface-lowest) rounded-md text-(--color-on-surface-variant) hover:text-primary transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleDelete} 
            disabled={isDeleting} 
            className="p-1.5 hover:bg-(--color-surface-lowest) rounded-md text-(--color-on-surface-variant) hover:text-error transition-colors"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="pr-14">
          <span className={`inline-block mb-1.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
            record.record_type === 'medicine' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 
            record.record_type === 'vaccine' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
            'bg-sky-500/10 text-sky-600 dark:text-sky-400'
          }`}>
            {record.record_type === 'checkup' ? 'Checkup' : record.record_type}
          </span>
          <h3 className="font-bold text-base leading-snug break-words">
            {record.record_type === 'checkup' ? 'Health Checkup' : record.name}
          </h3>
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center gap-2 text-xs font-medium text-(--color-on-surface-variant)">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <span>{formatDate(record.record_date)}</span>
          </div>
          {record.next_date && (
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </div>
              <span>Next Due: {formatDate(record.next_date)}</span>
            </div>
          )}
        </div>

        {record.notes && (
          <div className="mt-2 pt-3 border-t border-(--color-surface-lowest)/60">
            <p className="text-sm text-(--color-on-surface-variant) leading-relaxed whitespace-pre-wrap">
              {record.notes}
            </p>
          </div>
        )}
      </div>

      {isEditing && (
        <HealthRecordModal 
          goatId={goatId} 
          initialData={record} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </>
  )
}
