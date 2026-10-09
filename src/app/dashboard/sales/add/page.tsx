import { db } from '@/db'
import { goats, cows, profiles } from '@/db/schema'
import { eq, and, inArray, asc } from 'drizzle-orm'
import { auth } from '@/auth'
import { AddSaleForm } from './AddSaleForm'

export default async function AddSalePage() {
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [goatsList, cowsList] = userId
    ? await Promise.all([
        db.select({ id: goats.id, name_or_tag: goats.nameOrTag, purchase_price: goats.purchasePrice })
          .from(goats)
          .where(and(eq(goats.userId, userId), inArray(goats.status, ['active', 'sick'])))
          .orderBy(asc(goats.nameOrTag)),
        db.select({ id: cows.id, name_or_tag: cows.nameOrTag, purchase_price: cows.purchasePrice })
          .from(cows)
          .where(and(eq(cows.userId, userId), inArray(cows.status, ['active', 'sick'])))
          .orderBy(asc(cows.nameOrTag)),
      ])
    : [[], []]

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <AddSaleForm goats={goatsList as any} cows={cowsList as any} />
    </div>
  )
}
