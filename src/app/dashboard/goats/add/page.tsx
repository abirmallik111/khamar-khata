import { db } from '@/db'
import { owners, goats, profiles } from '@/db/schema'
import { eq, and, inArray, asc } from 'drizzle-orm'
import { auth } from '@/auth'
import { AddGoatForm } from './AddGoatForm'

export default async function AddGoatPage() {
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [ownersList, goatsList] = userId ? await Promise.all([
    db.select({ id: owners.id, name: owners.name, share_percentage: owners.sharePercentage }).from(owners).where(eq(owners.userId, userId)).orderBy(asc(owners.name)),
    db.select({ id: goats.id, name_or_tag: goats.nameOrTag, gender: goats.gender }).from(goats).where(and(eq(goats.userId, userId), inArray(goats.status, ['active', 'sick']))).orderBy(asc(goats.nameOrTag))
  ]) : [[], []]

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <AddGoatForm owners={ownersList as any} goats={goatsList as any} />
    </div>
  )
}
