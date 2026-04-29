import { Loader2 } from 'lucide-react'

export default function GoatListLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full animate-in fade-in duration-500">
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-bold font-display text-(--color-on-background)">Loading Goats...</h2>
      <p className="text-(--color-on-surface-variant) text-sm mt-2">Fetching your roster</p>
    </div>
  )
}
