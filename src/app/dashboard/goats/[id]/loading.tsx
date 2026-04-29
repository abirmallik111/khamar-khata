import { Loader2 } from 'lucide-react'

export default function GoatProfileLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full animate-in fade-in duration-500">
      <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-bold font-display text-(--color-on-background)">Loading Profile...</h2>
      <p className="text-(--color-on-surface-variant) text-sm mt-2">Fetching goat details and history</p>
    </div>
  )
}
