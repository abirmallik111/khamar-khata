import { db } from '@/db'
import { expenses, expenseCategories, goats, owners, expenseGoatMap, ownerContributions, profiles } from '@/db/schema'
import { eq, and, inArray, asc } from 'drizzle-orm'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { EditExpenseForm } from './EditExpenseForm'

export default async function EditExpensePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [expense] = await db.select().from(expenses).where(eq(expenses.id, params.id)).limit(1)
  if (!expense) notFound()

  const [categoriesList, goatsList, ownersList, currentGoatIds, currentContributions] = userId ? await Promise.all([
    db.select().from(expenseCategories).where(eq(expenseCategories.userId, userId)).orderBy(asc(expenseCategories.name)),
    db.select({ id: goats.id, name_or_tag: goats.nameOrTag }).from(goats).where(and(eq(goats.userId, userId), inArray(goats.status, ['active', 'sick', 'archived']))).orderBy(asc(goats.nameOrTag)),
    db.select({ id: owners.id, name: owners.name, share_percentage: owners.sharePercentage }).from(owners).where(eq(owners.userId, userId)).orderBy(asc(owners.name)),
    db.select({ goat_id: expenseGoatMap.goatId }).from(expenseGoatMap).where(eq(expenseGoatMap.expenseId, expense.id)),
    db.select({ owner_id: ownerContributions.ownerId, amount: ownerContributions.amount }).from(ownerContributions).where(eq(ownerContributions.expenseId, expense.id))
  ]) : [[], [], [], [], []]

  const mappedExpense = {
    ...expense,
    category_id: expense.categoryId,
    expense_date: expense.expenseDate,
    paid_amount: Number(expense.paidAmount),
    due_amount: Number(expense.dueAmount),
    payment_status: expense.paymentStatus,
    amount: Number(expense.amount)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <EditExpenseForm 
        expense={mappedExpense as any}
        categories={categoriesList as any}
        goats={goatsList as any}
        owners={ownersList as any}
        initialGoatIds={currentGoatIds.map((m: { goat_id: string }) => m.goat_id)}
        initialContributions={currentContributions as any}
      />
    </div>
  )
}
