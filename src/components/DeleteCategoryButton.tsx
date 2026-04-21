'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

export function DeleteCategoryButton() {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="text-xs text-error hover:underline px-2 py-1 flex items-center gap-1 disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Remove'}
    </button>
  )
}
