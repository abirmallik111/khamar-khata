'use client'

import { GoatStatus } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

type FilterStatus = GoatStatus | 'all'

const statuses: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Sold', value: 'sold' },
  { label: 'Sick', value: 'sick' },
  { label: 'Dead', value: 'dead' },
  { label: 'Archived', value: 'archived' },
]

export function GoatFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const currentStatus = (searchParams.get('status') as FilterStatus) || 'all'

  const handleStatusChange = (status: FilterStatus) => {
    const params = new URLSearchParams(searchParams)
    if (status !== 'all') {
      params.set('status', status)
    } else {
      params.delete('status')
    }

    startTransition(() => {
      router.push(`/dashboard/goats?${params.toString()}`)
    })
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
      {statuses.map((status) => {
        const isActive = currentStatus === status.value
        return (
          <button
            key={status.value}
            onClick={() => handleStatusChange(status.value)}
            disabled={isPending}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              isActive
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                : 'bg-(--color-surface-lowest) text-(--color-on-surface-variant) border-(--color-surface-high) hover:border-[var(--color-primary)]/50'
            } ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {status.label}
          </button>
        )
      })}
    </div>
  )
}
