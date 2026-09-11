import { db } from '@/db'
import { expenses, expenseCategories, expenseGoatMap, profiles } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { auth } from '@/auth'
import Link from 'next/link'
import { PlusCircle, Edit3, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { markAsPaid } from './actions'

export default async function ExpensesPage() {
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [profile] = userId ? await db.select({ currency: profiles.currency }).from(profiles).where(eq(profiles.id, userId)).limit(1) : []
  const currencyCode = (profile?.currency || 'BDT') as any

  const expensesList = userId
    ? await db.select({
        id: expenses.id,
        amount: expenses.amount,
        paidAmount: expenses.paidAmount,
        dueAmount: expenses.dueAmount,
        paymentStatus: expenses.paymentStatus,
        expenseDate: expenses.expenseDate,
        note: expenses.note,
        categoryName: expenseCategories.name
      })
        .from(expenses)
        .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
        .where(eq(expenses.userId, userId))
        .orderBy(desc(expenses.expenseDate))
    : []

  const mappedExpenses = []
  for (const exp of expensesList) {
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(expenseGoatMap).where(eq(expenseGoatMap.expenseId, exp.id))
    mappedExpenses.push({
      ...exp,
      goatCount: Number(countRes[0]?.count || 0)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display mb-1">Expenses</h1>
          <p className="text-(--color-on-surface-variant) text-sm">Track your farm expenditures and allocate them to goats.</p>
        </div>
        <Link 
          href="/dashboard/expenses/add" 
          className="bg-error text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-ambient hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="w-5 h-5" />
          Add Expense
        </Link>
      </header>
      
      {mappedExpenses.length === 0 ? (
        <div className="bg-(--color-surface-lowest) rounded-md shadow-ambient p-12 text-center text-(--color-on-surface-variant) mt-4">
          No expenses recorded yet. Click &quot;Add Expense&quot; to start tracking.
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {mappedExpenses.map((expense) => {
            return (
              <div 
                key={expense.id} 
                className="bg-(--color-surface-lowest) rounded-md shadow-ambient overflow-hidden flex flex-col sm:flex-row border-l-4 border-l-error"
              >
                <div className="p-4 sm:p-6 flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-(--color-on-background)">
                      {expense.categoryName || 'Uncategorized'}
                    </span>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      expense.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 
                      expense.paymentStatus === 'partial' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' : 
                      'bg-red-500/10 text-red-600 border border-red-500/20'
                    }`}>
                      {expense.paymentStatus}
                    </div>
                  </div>
                  <div className="text-xs text-(--color-on-surface-variant) font-medium">
                    {new Date(expense.expenseDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </div>
                  {expense.note && (
                    <p className="text-(--color-on-surface-variant) text-sm mt-2 italic">{expense.note}</p>
                  )}
                  {expense.goatCount > 0 && (
                    <div className="text-xs text-primary font-bold mt-2 uppercase tracking-tight">
                      Applied to {expense.goatCount} goat(s)
                    </div>
                  )}
                </div>
                
                <div className="bg-(--color-surface-low)/50 sm:w-64 p-4 sm:p-6 flex flex-col justify-center items-end gap-3 sm:border-l border-(--color-surface-high)">
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-error">
                      {formatCurrency(Number(expense.amount), currencyCode)}
                    </p>
                    {Number(expense.dueAmount) > 0 && (
                      <p className="text-xs text-red-500 font-bold uppercase tracking-tight">
                        Due: {formatCurrency(Number(expense.dueAmount), currencyCode)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    {expense.paymentStatus !== 'paid' && (
                      <form action={async () => {
                        'use server'
                        await markAsPaid(expense.id, Number(expense.amount))
                      }}>
                        <button className="flex-1 sm:flex-none p-2 rounded-md bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-sm" title="Mark as Paid">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </form>
                    )}
                    <Link 
                      href={`/dashboard/expenses/${expense.id}/edit`}
                      className="flex-1 sm:flex-none p-2 rounded-md bg-(--color-surface-high) text-(--color-on-surface-variant) hover:bg-primary hover:text-white transition-all shadow-sm"
                      title="Edit Expense"
                    >
                      <Edit3 className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
