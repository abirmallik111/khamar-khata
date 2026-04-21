import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wallet, Receipt } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

export default async function OwnerProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  // 1. Fetch Owner details
  const { data: owner } = await supabase
    .from('owners')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!owner) notFound()

  // 1b. Fetch User's Currency Preference
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user!.id)
    .single()
  
  const currencyCode = (profile?.currency || 'BDT') as any

  // 2. Fetch Total Farm Expenses + Total Goat Purchase Costs
  const { data: totalExpensesData } = await supabase.from('expenses').select('amount')
  const { data: totalGoatPurchases } = await supabase.from('goats').select('purchase_price')
  
  const totalExpenses = totalExpensesData?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const totalGoats = totalGoatPurchases?.reduce((sum, goat) => sum + Number(goat.purchase_price), 0) || 0
  const totalFarmExpense = totalExpenses + totalGoats

  // 3. Fetch Owner's contributions (from both expenses and goats)
  const { data: contributions } = await supabase
    .from('owner_contributions')
    .select(`
      amount,
      created_at,
      expenses (
        amount,
        expense_date,
        note,
        expense_categories (name)
      ),
      goats (
        name_or_tag,
        purchase_price,
        purchase_date
      )
    `)
    .eq('owner_id', owner.id)
    .order('created_at', { ascending: false })

  const totalPaid = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0
  const expectedShare = (totalFarmExpense * owner.share_percentage) / 100
  const balance = expectedShare - totalPaid
  
  const isOverpaid = balance < 0
  const isDue = balance > 0

  const paidPercentage = expectedShare > 0 ? (totalPaid / expectedShare) * 100 : 100

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <header className="flex items-center gap-4">
        <Link href="/dashboard/settings/owners" className="p-2 rounded-full hover:bg-(--color-surface-high) transition-colors text-(--color-on-surface-variant)">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display mb-1">{owner.name}</h1>
          <p className="text-(--color-on-surface-variant) text-sm uppercase tracking-wider font-bold">Partner Ledger</p>
        </div>
      </header>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient border-t-4 border-blue-500 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-(--color-on-surface-variant) tracking-widest">Expected Share ({owner.share_percentage}%)</span>
          <span className="text-2xl font-display font-bold">{formatCurrency(expectedShare, currencyCode)}</span>
        </div>
        
        <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient border-t-4 border-green-500 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-(--color-on-surface-variant) tracking-widest">Total Paid</span>
          <span className="text-2xl font-display font-bold text-green-600">{formatCurrency(totalPaid, currencyCode)}</span>
        </div>

        <div className={`bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient border-t-4 flex flex-col gap-1 ${
          isOverpaid ? 'border-purple-500' : isDue ? 'border-red-500' : 'border-green-500'
        }`}>
          <span className="text-[10px] uppercase font-bold text-(--color-on-surface-variant) tracking-widest">
            {isOverpaid ? 'Overpaid Balance' : isDue ? 'Remaining Due' : 'Balance'}
          </span>
          <span className={`text-2xl font-display font-bold ${
            isOverpaid ? 'text-purple-600' : isDue ? 'text-red-600' : 'text-green-600'
          }`}>
            {formatCurrency(Math.abs(balance), currencyCode)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Contribution Progress
          </h2>
          <span className="text-sm font-bold text-(--color-on-surface-variant)">{paidPercentage.toFixed(1)}% of goal</span>
        </div>
        <div className="w-full h-4 bg-(--color-surface-high) rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${isOverpaid ? 'bg-purple-500' : 'bg-primary'}`}
            style={{ width: `${Math.min(paidPercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-(--color-on-surface-variant) italic">
          * Goal is based on owner&apos;s {owner.share_percentage}% stake in the total farm capital (Expenses + Purchases) of {formatCurrency(totalFarmExpense, currencyCode)}.
        </p>
      </div>

      {/* Transaction History */}
      <section className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden">
        <div className="p-6 border-b border-(--color-surface-high) flex items-center gap-2 bg-(--color-surface-high)/30">
          <Receipt className="w-5 h-5 text-(--color-on-surface-variant)" />
          <h2 className="font-bold text-lg">Contribution History</h2>
        </div>
        
        {contributions?.length === 0 ? (
          <div className="p-12 text-center text-(--color-on-surface-variant) italic">
            No contributions recorded for this partner yet.
          </div>
        ) : (
          <div className="divide-y divide-(--color-surface-high)">
            {contributions?.map((c, idx) => {
              const exp = (c as any).expenses as { amount: number; expense_date: string; note: string | null; expense_categories: { name: string } | null } | null
              const goat = (c as any).goats as { name_or_tag: string; purchase_price: number; purchase_date: string } | null
              
              const title = exp ? (exp.expense_categories?.name || 'Expense') : (goat ? `Purchase: ${goat.name_or_tag}` : 'Contribution')
              const date = exp?.expense_date || goat?.purchase_date || c.created_at
              const totalAmount = exp?.amount || goat?.purchase_price || 0
              const note = exp?.note || (goat ? `Initial purchase of ${goat.name_or_tag}` : null)

              return (
                <div key={idx} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-(--color-surface-low) transition-colors">
                  <div>
                    <p className="font-bold text-(--color-on-background)">{title}</p>
                    <p className="text-xs text-(--color-on-surface-variant)">
                      {new Date(date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                    {note && <p className="text-sm text-(--color-on-surface-variant) mt-1 italic">&quot;{note}&quot;</p>}
                  </div>
                  <div className="text-right flex flex-col gap-1 items-end">
                    <span className="text-xl font-display font-bold text-green-600">+{formatCurrency(c.amount, currencyCode)}</span>
                    <span className="text-[10px] uppercase font-bold text-(--color-on-surface-variant) bg-(--color-surface-high) px-2 py-1 rounded">
                      Split of {formatCurrency(totalAmount, currencyCode)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
