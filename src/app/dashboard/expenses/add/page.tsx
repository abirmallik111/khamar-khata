import { db } from '@/db'
import { expenseCategories, goats, owners, profiles } from '@/db/schema'
import { eq, and, inArray, asc } from 'drizzle-orm'
import { auth } from '@/auth'
import { AddExpenseForm } from './AddExpenseForm'

export default async function AddExpensePage() {
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [categoriesList, goatsList, ownersList] = userId ? await Promise.all([
    db.select().from(expenseCategories).where(eq(expenseCategories.userId, userId)).orderBy(asc(expenseCategories.name)),
    db.select({ id: goats.id, name_or_tag: goats.nameOrTag }).from(goats).where(and(eq(goats.userId, userId), inArray(goats.status, ['active', 'sick']))).orderBy(asc(goats.nameOrTag)),
    db.select({ id: owners.id, name: owners.name, share_percentage: owners.sharePercentage }).from(owners).where(eq(owners.userId, userId)).orderBy(asc(owners.name))
  ]) : [[], [], []]

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <AddExpenseForm 
        categories={categoriesList as any} 
        goats={goatsList as any} 
        owners={ownersList as any}
      />
    </div>
  )
}
