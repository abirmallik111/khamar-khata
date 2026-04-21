'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export function GoatSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }

    startTransition(() => {
      router.push(`/dashboard/goats?${params.toString()}`)
    })
  }

  return (
    <div className="flex-1 flex items-center gap-2 px-3 bg-(--color-surface-high) rounded-md transition-all focus-within:ring-2 focus-within:ring-primary/20">
      <Search className={`w-5 h-5 ${isPending ? 'text-primary animate-pulse' : 'text-(--color-on-surface-variant)'}`} />
      <input 
        type="text" 
        placeholder="Search by tag or name..." 
        defaultValue={searchParams.get('q')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="bg-transparent border-none outline-none py-3 w-full"
      />
    </div>
  )
}
