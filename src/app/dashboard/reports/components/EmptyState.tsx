import Link from 'next/link'
import { FileSearch, PlusCircle, TrendingUp } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-12 flex flex-col items-center text-center gap-6 border-2 border-dashed border-(--color-surface-high)">
      <div className="p-6 bg-(--color-surface-low) rounded-full text-(--color-on-surface-variant) opacity-50">
        <FileSearch className="w-16 h-16" />
      </div>
      <div>
        <h2 className="text-2xl font-bold font-display mb-2">No Reports Data Yet</h2>
        <p className="text-(--color-on-surface-variant) max-w-sm">
          Start recording your goats and expenses to see your farm&apos;s performance analytics here.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Link 
          href="/dashboard/goats/add" 
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold shadow-sm hover:brightness-110 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Add Your First Goat
        </Link>
        <Link 
          href="/dashboard/sales" 
          className="flex items-center gap-2 bg-(--color-surface-lowest) border border-primary text-primary px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <TrendingUp className="w-5 h-5" />
          Record a Sale
        </Link>
      </div>
    </div>
  )
}
