'use server'

import { db } from '@/db'
import { owners, profiles } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

async function getAuthUser(): Promise<{ id: string }> {
  const session = await auth()
  if (session?.user?.id) {
    return { id: session.user.id }
  }
  const [firstUser] = await db.select().from(profiles).limit(1)
  if (firstUser) return { id: firstUser.id }
  throw new Error('Not authenticated')
}

export async function addOwner(formData: FormData) {
  const user = await getAuthUser()

  const name = formData.get('name') as string
  const sharePercentage = parseFloat(formData.get('share_percentage') as string)

  if (sharePercentage <= 0 || sharePercentage > 100) {
    throw new Error('Share percentage must be between 0 and 100.')
  }

  const existingOwners = await db.select({ sharePercentage: owners.sharePercentage }).from(owners).where(eq(owners.userId, user.id))
  const currentTotal = existingOwners.reduce((sum, o) => sum + Number(o.sharePercentage), 0)

  if (currentTotal + sharePercentage > 100) {
    throw new Error(`Total share cannot exceed 100%. Current total is ${currentTotal}%, you can add at most ${100 - currentTotal}%.`)
  }

  await db.insert(owners).values({
    userId: user.id,
    name: name.trim(),
    sharePercentage: sharePercentage.toString()
  })

  revalidatePath('/dashboard/settings/owners')
}

export async function deleteOwner(id: string) {
  const user = await getAuthUser()

  try {
    await db.delete(owners).where(and(eq(owners.id, id), eq(owners.userId, user.id)))
  } catch (error: any) {
    console.error('Error deleting owner:', error)
    throw new Error('Cannot delete owner. They may have associated contributions.')
  }

  revalidatePath('/dashboard/settings/owners')
}
