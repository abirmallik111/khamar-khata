import { db } from '@/db'
import { cows, owners, ownerContributions, profiles } from '@/db/schema'
import { eq, ne, inArray, asc, and } from 'drizzle-orm'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { EditCowForm } from './EditCowForm'

export default async function EditCowPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [cow] = await db.select().from(cows).where(eq(cows.id, params.id)).limit(1)

  if (!cow) {
    notFound()
  }

  const [ownersList, contribList, otherCows] = userId ? await Promise.all([
    db.select({ id: owners.id, name: owners.name, share_percentage: owners.sharePercentage }).from(owners).where(eq(owners.userId, userId)).orderBy(asc(owners.name)),
    db.select({ owner_id: ownerContributions.ownerId, amount: ownerContributions.amount }).from(ownerContributions).where(eq(ownerContributions.cowId, params.id)),
    db.select({ id: cows.id, name_or_tag: cows.nameOrTag, gender: cows.gender }).from(cows).where(and(eq(cows.userId, userId), inArray(cows.status, ['active', 'sick']), ne(cows.id, params.id))).orderBy(asc(cows.nameOrTag))
  ]) : [[], [], []]

  const mappedCow = {
    ...cow,
    name_or_tag: cow.nameOrTag,
    purchase_price: Number(cow.purchasePrice),
    purchase_date: cow.purchaseDate,
    image_url: cow.imageUrl,
    mother_id: cow.motherId,
    father_id: cow.fatherId
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <EditCowForm 
        cow={mappedCow as any} 
        owners={ownersList as any} 
        initialContributions={contribList as any}
        cows={otherCows as any}
      />
    </div>
  )
}
