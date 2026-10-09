import { db } from '@/db'
import { owners, cows, profiles } from '@/db/schema'
import { eq, and, inArray, asc } from 'drizzle-orm'
import { auth } from '@/auth'
import { AddCowForm } from './AddCowForm'

export default async function AddCowPage() {
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [ownersList, cowsList] = userId ? await Promise.all([
    db.select({ id: owners.id, name: owners.name, share_percentage: owners.sharePercentage }).from(owners).where(eq(owners.userId, userId)).orderBy(asc(owners.name)),
    db.select({ id: cows.id, name_or_tag: cows.nameOrTag, gender: cows.gender }).from(cows).where(and(eq(cows.userId, userId), inArray(cows.status, ['active', 'sick']))).orderBy(asc(cows.nameOrTag))
  ]) : [[], []]

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <AddCowForm owners={ownersList as any} cows={cowsList as any} />
    </div>
  )
}
