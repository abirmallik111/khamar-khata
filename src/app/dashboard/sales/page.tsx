import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PlusCircle, TrendingUp, Edit3 } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

export default async function SalesPage() {
  const supabase = await createClient()

  // Fetch sales with goat details
  const { data: sales, error } = await supabase
    .from('sales')
    .select(`
      *,
      goats (name_or_tag, purchase_price)
    `)
    .order('sale_date', { ascending: false })

  // Fetch User's Currency Preference
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user!.id)
    .single()
  
  const currencyCode = (profile?.currency || 'BDT') as any

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display mb-1">Sales Record</h1>
          <p className="text-(--color-on-surface-variant) text-sm">Track your goat sales and calculate individual profit margins.</p>
        </div>
        <Link 
          href="/dashboard/sales/add" 
          className="bg-gradient-primary text-(--color-on-primary) px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-ambient hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="w-5 h-5" />
          Record Sale
        </Link>
      </header>

      {error && <div className="text-[var(--color-error)] p-4 bg-[var(--color-error)]/10 rounded-md">Failed to load sales.</div>}
      
      {!error && sales?.length === 0 ? (
        <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-12 text-center text-(--color-on-surface-variant) mt-4">
          No sales recorded yet. Click &quot;Record Sale&quot; when you sell a goat.
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {sales?.map((sale) => {
            const goat = sale.goats as { name_or_tag: string; purchase_price: number } | null
            const profit = sale.sale_price - (goat?.purchase_price || 0)
            const profitMargin = goat?.purchase_price ? ((profit / goat.purchase_price) * 100).toFixed(1) : 0

            return (
              <div 
                key={sale.id} 
                className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden flex flex-col sm:flex-row border-l-4 border-l-blue-500"
              >
                <div className="p-4 sm:p-6 flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-(--color-on-background)">
                      Goat: {goat?.name_or_tag || 'Unknown'}
                    </span>
                    <span className="bg-(--color-surface-high) text-(--color-on-surface-variant) text-xs px-2 py-1 rounded-md font-medium">
                      {new Date(sale.sale_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                  </div>
                  {sale.note && (
                    <p className="text-(--color-on-surface-variant) text-sm mt-2 italic">{sale.note}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="text-xs text-(--color-on-surface-variant) font-bold uppercase tracking-wider">
                      Initial Cost: {formatCurrency(goat?.purchase_price || 0, currencyCode)}
                    </span>
                    <div className={`px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold uppercase tracking-tight ${profit >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {profit >= 0 ? <TrendingUp className="w-3 h-3" /> : null}
                      Net Margin: {profit >= 0 ? '+' : ''}{formatCurrency(profit, currencyCode)} ({profitMargin}%)
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-500/5 sm:w-64 p-4 sm:p-6 flex flex-col justify-center items-end gap-3 sm:border-l border-(--color-surface-high)">
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-blue-600">
                      +{formatCurrency(sale.sale_price, currencyCode)}
                    </p>
                  </div>
                  
                  <Link 
                    href={`/dashboard/sales/${sale.id}/edit`}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 p-2 rounded-md bg-(--color-surface-high) text-(--color-on-surface-variant) hover:bg-blue-600 hover:text-white transition-all shadow-sm font-semibold text-xs uppercase"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Record
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
