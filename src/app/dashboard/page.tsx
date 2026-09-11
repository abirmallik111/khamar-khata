import { db } from '@/db'
import { goats, expenses, sales, expenseCategories, owners, ownerContributions, profiles } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/auth'
import Link from 'next/link'
import { PlusCircle, List, Users } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'
import { ExpensePieChart } from '@/components/ExpensePieChart'

export default async function DashboardPage() {
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [profile] = userId ? await db.select({ currency: profiles.currency }).from(profiles).where(eq(profiles.id, userId)).limit(1) : []
  const currencyCode = (profile?.currency || 'BDT') as any

  const capitalData = userId ? await db.select({ purchasePrice: goats.purchasePrice }).from(goats).where(eq(goats.userId, userId)) : []
  const expenseData = userId ? await db.select({ amount: expenses.amount }).from(expenses).where(eq(expenses.userId, userId)) : []
  const salesData = userId ? await db.select({ salePrice: sales.salePrice }).from(sales).where(eq(sales.userId, userId)) : []

  const recentGoats = userId
    ? await db.select({ id: goats.id, name_or_tag: goats.nameOrTag, created_at: goats.createdAt, purchase_price: goats.purchasePrice })
        .from(goats)
        .where(eq(goats.userId, userId))
        .orderBy(desc(goats.createdAt))
        .limit(3)
    : []

  const recentExpensesRaw = userId
    ? await db.select({
        id: expenses.id,
        amount: expenses.amount,
        created_at: expenses.createdAt,
        categoryName: expenseCategories.name
      })
        .from(expenses)
        .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
        .where(eq(expenses.userId, userId))
        .orderBy(desc(expenses.createdAt))
        .limit(3)
    : []

  const allOwners = userId
    ? await db.select({ id: owners.id, name: owners.name }).from(owners).where(eq(owners.userId, userId))
    : []

  const contributionsData = userId
    ? await db.select({ ownerId: ownerContributions.ownerId, amount: ownerContributions.amount }).from(ownerContributions).where(eq(ownerContributions.userId, userId))
    : []

  const categoryExpensesRaw = userId
    ? await db.select({ amount: expenses.amount, categoryName: expenseCategories.name })
        .from(expenses)
        .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
        .where(eq(expenses.userId, userId))
    : []

  const totalCapital = capitalData.reduce((sum, g) => sum + Number(g.purchasePrice), 0)
  const totalExpense = expenseData.reduce((sum, e) => sum + Number(e.amount), 0)
  const totalSales = salesData.reduce((sum, s) => sum + Number(s.salePrice), 0)
  const profit = totalSales - (totalCapital + totalExpense)

  const categoryMap: Record<string, number> = {}
  categoryExpensesRaw.forEach(exp => {
    const catName = exp.categoryName || 'Uncategorized'
    categoryMap[catName] = (categoryMap[catName] || 0) + Number(exp.amount)
  })
  const chartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  const ownersWithTotals = allOwners.map(owner => {
    const totalContribution = contributionsData
      .filter(c => c.ownerId === owner.id)
      .reduce((sum, c) => sum + Number(c.amount), 0)
    return { ...owner, totalContribution }
  })

  const activity = [
    ...recentGoats.map(g => ({ type: 'goat' as const, date: new Date(g.created_at).getTime(), data: g })),
    ...recentExpensesRaw.map(e => ({ type: 'expense' as const, date: new Date(e.created_at).getTime(), data: { ...e, expense_categories: { name: e.categoryName } } }))
  ].sort((a, b) => b.date - a.date).slice(0, 4)

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display mb-1">Overview</h1>
          <p className="text-(--color-on-surface-variant) text-sm">Your farm&apos;s financial health at a glance.</p>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
        <Link href="/dashboard/goats/add" className="flex-shrink-0 bg-(--color-surface-lowest) border border-primary text-primary px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-primary hover:text-white transition-colors">
          <PlusCircle className="w-5 h-5" />
          Add Goat
        </Link>
        <Link href="/dashboard/expenses/add" className="flex-shrink-0 bg-(--color-surface-lowest) border border-error text-error px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-error hover:text-white transition-colors">
          <PlusCircle className="w-5 h-5" />
          Log Expense
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient flex flex-col gap-2 border-l-4 border-primary">
          <span className="text-sm font-medium text-(--color-on-surface-variant)">Total Capital (Goat Cost)</span>
          <span className="text-3xl font-display font-bold">{formatCurrency(totalCapital, currencyCode)}</span>
        </div>
        
        <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient flex flex-col gap-2 border-l-4 border-error">
          <span className="text-sm font-medium text-(--color-on-surface-variant)">Total Expenses</span>
          <span className="text-3xl font-display font-bold">{formatCurrency(totalExpense, currencyCode)}</span>
        </div>

        <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient flex flex-col gap-2 border-l-4 border-blue-500">
          <span className="text-sm font-medium text-(--color-on-surface-variant)">Total Sales</span>
          <span className="text-3xl font-display font-bold">{formatCurrency(totalSales, currencyCode)}</span>
        </div>
      </div>

      <div className="bg-(--color-surface-lowest) p-6 rounded-md shadow-ambient flex flex-col gap-2">
        <span className="text-sm font-medium text-(--color-on-surface-variant)">Net Profit / Loss</span>
        <span className={`text-4xl font-display font-bold ${profit >= 0 ? 'text-primary' : 'text-error'}`}>
          {profit >= 0 && totalSales > 0 ? '+' : ''}{formatCurrency(profit, currencyCode)}
        </span>
        {profit < 0 && totalSales === 0 && (
          <span className="text-xs text-(--color-on-surface-variant) mt-1">Note: No sales recorded yet. Your profit is currently tracking as an investment deficit.</span>
        )}
      </div>

      {/* Bottom Section: Activity and Owners */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Recent Activity */}
        <section className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
          </div>
          <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden h-[350px] flex flex-col border border-(--color-surface-high)">
            {activity.length === 0 ? (
              <div className="p-8 text-center text-(--color-on-surface-variant) flex-1 flex items-center justify-center">
                No recent activity found.
              </div>
            ) : (
              <div className="flex flex-col overflow-y-auto">
                {activity.map((item, idx) => (
                  <div key={`${item.type}-${idx}`} className={`p-4 flex justify-between items-center hover:bg-(--color-surface-low) transition-colors ${idx !== activity.length - 1 ? 'border-b border-(--color-surface-high)' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${item.type === 'goat' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                        {item.type === 'goat' ? <PlusCircle className="w-5 h-5" /> : <List className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-(--color-on-background) text-sm line-clamp-1">
                          {item.type === 'goat' 
                            ? `Added Goat: ${item.data.name_or_tag}` 
                            : `Expense: ${(item.data as any).expense_categories?.name || 'Uncategorized'}`
                          }
                        </p>
                        <p className="text-[10px] text-(--color-on-surface-variant)">{formatDate(new Date(item.date).toISOString())}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${item.type === 'goat' ? 'text-(--color-on-background)' : 'text-error'}`}>
                      {item.type === 'expense' ? '-' : ''}{formatCurrency(item.type === 'goat' ? (item.data as any).purchase_price : (item.data as any).amount, currencyCode)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Expense Breakdown Chart */}
        <section className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-tight">Expense Breakdown</h2>
          </div>
          <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-4 h-[350px] border border-(--color-surface-high) flex flex-col items-stretch">
            <ExpensePieChart data={chartData} currency={currencyCode} />
          </div>
        </section>

        {/* Farm Owners Widget */}
        <section className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-tight">Farm Partners / Owners</h2>
          </div>
          <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden h-[300px] flex flex-col border-l-4 border-purple-500">
            {ownersWithTotals.length === 0 ? (
              <div className="p-8 text-center text-(--color-on-surface-variant) flex-1 flex items-center justify-center">
                No owners defined. Go to Settings to add partners.
              </div>
            ) : (
              <div className="flex flex-col overflow-y-auto">
                {ownersWithTotals.map((owner, idx) => (
                  <Link 
                    key={owner.id} 
                    href={`/dashboard/settings/owners/${owner.id}`}
                    className={`p-4 flex justify-between items-center hover:bg-(--color-surface-low) transition-colors ${idx !== ownersWithTotals.length - 1 ? 'border-b border-(--color-surface-high)' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-(--color-on-background) text-sm">{owner.name}</p>
                        <p className="text-[10px] text-(--color-on-surface-variant) uppercase tracking-wider font-semibold">Total Investment</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-purple-600">
                        {formatCurrency(owner.totalContribution, currencyCode)}
                      </span>
                      <p className="text-[10px] text-(--color-on-surface-variant) font-medium">View Profile</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
