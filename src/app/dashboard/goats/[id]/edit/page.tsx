import { db } from '@/db'
import { goats, owners, ownerContributions, profiles } from '@/db/schema'
import { eq, ne, inArray, asc, and } from 'drizzle-orm'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { EditGoatForm } from './EditGoatForm'

export default async function EditGoatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await auth()
  let userId = session?.user?.id

  if (!userId) {
    const [firstUser] = await db.select().from(profiles).limit(1)
    if (firstUser) userId = firstUser.id
  }

  const [goat] = await db.select().from(goats).where(eq(goats.id, params.id)).limit(1)

  if (!goat) {
    notFound()
  }

  const [ownersList, contribList, otherGoats] = userId ? await Promise.all([
    db.select({ id: owners.id, name: owners.name, share_percentage: owners.sharePercentage }).from(owners).where(eq(owners.userId, userId)).orderBy(asc(owners.name)),
    db.select({ owner_id: ownerContributions.ownerId, amount: ownerContributions.amount }).from(ownerContributions).where(eq(ownerContributions.goatId, params.id)),
    db.select({ id: goats.id, name_or_tag: goats.nameOrTag, gender: goats.gender }).from(goats).where(and(eq(goats.userId, userId), inArray(goats.status, ['active', 'sick']), ne(goats.id, params.id))).orderBy(asc(goats.nameOrTag))
  ]) : [[], [], []]

  const mappedGoat = {
    ...goat,
    name_or_tag: goat.nameOrTag,
    purchase_price: Number(goat.purchasePrice),
    purchase_date: goat.purchaseDate,
    image_url: goat.imageUrl,
    mother_id: goat.motherId,
    father_id: goat.fatherId
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <EditGoatForm 
        goat={mappedGoat as any} 
        owners={ownersList as any} 
        initialContributions={contribList as any}
        goats={otherGoats as any}
      />
    </div>
  )
}
