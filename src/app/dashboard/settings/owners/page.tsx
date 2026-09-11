import { db } from '@/db'
import { owners, profiles } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { auth } from '@/auth'
import { OwnerClientPage } from './OwnerClientPage'

export default async function OwnersPage() {
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const ownersList = userId
    ? await db.select().from(owners).where(eq(owners.userId, userId)).orderBy(asc(owners.createdAt))
    : []

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <OwnerClientPage owners={ownersList.map(o => ({ ...o, share_percentage: Number(o.sharePercentage) })) as any} />
    </div>
  )
}
