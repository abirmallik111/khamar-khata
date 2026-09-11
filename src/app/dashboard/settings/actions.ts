'use server'

import { db } from '@/db'
import {
  expenseCategories,
  owners,
  goats,
  expenses,
  expenseGoatMap,
  sales,
  ownerContributions,
  goatHealthRecords,
  goatNotes,
  goatImages,
  profiles
} from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

async function getAuthUser(): Promise<{ id: string }> {
  const session = await auth()
  if (session?.user?.id) {
    return { id: session.user.id }
  }
  const [firstUser] = await db.select().from(profiles).limit(1)
  if (firstUser) return { id: firstUser.id }
  throw new Error('Not authenticated')
}

export async function deleteCategory(id: string) {
  const user = await getAuthUser()
  await db.delete(expenseCategories).where(and(eq(expenseCategories.id, id), eq(expenseCategories.userId, user.id)))
  revalidatePath('/dashboard/settings')
}

export async function exportUserData() {
  const user = await getAuthUser()

  const [
    ownersData,
    goatsData,
    categoriesData,
    expensesData,
    expenseGoatMapData,
    salesData,
    ownerContributionsData,
    goatHealthRecordsData,
    goatNotesData,
    goatImagesData
  ] = await Promise.all([
    db.select().from(owners).where(eq(owners.userId, user.id)),
    db.select().from(goats).where(eq(goats.userId, user.id)),
    db.select().from(expenseCategories).where(eq(expenseCategories.userId, user.id)),
    db.select().from(expenses).where(eq(expenses.userId, user.id)),
    db.select().from(expenseGoatMap).where(eq(expenseGoatMap.userId, user.id)),
    db.select().from(sales).where(eq(sales.userId, user.id)),
    db.select().from(ownerContributions).where(eq(ownerContributions.userId, user.id)),
    db.select().from(goatHealthRecords).where(eq(goatHealthRecords.userId, user.id)),
    db.select().from(goatNotes).where(eq(goatNotes.userId, user.id)),
    db.select().from(goatImages).where(eq(goatImages.userId, user.id))
  ])

  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    data: {
      owners: ownersData,
      goats: goatsData,
      expense_categories: categoriesData,
      expenses: expensesData,
      expense_goat_map: expenseGoatMapData,
      sales: salesData,
      owner_contributions: ownerContributionsData,
      goat_health_records: goatHealthRecordsData,
      goat_notes: goatNotesData,
      goat_images: goatImagesData
    }
  }
}

export async function triggerRestore(backupData: { data: Record<string, unknown> }) {
  const user = await getAuthUser()

  await db.execute(sql`
    SELECT restore_user_data(${JSON.stringify(backupData.data)}::jsonb)
  `)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function changePassword(formData: FormData) {
  const user = await getAuthUser()
  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' }
  }

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1)
  if (!profile) {
    return { error: 'User not found' }
  }

  if (profile.passwordHash) {
    const isValid = await bcrypt.compare(currentPassword, profile.passwordHash)
    if (!isValid) {
      return { error: 'Invalid current password' }
    }
  }

  const newHash = await bcrypt.hash(newPassword, 10)
  await db.update(profiles).set({ passwordHash: newHash }).where(eq(profiles.id, user.id))

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function updateUserCurrency(currencyCode: string) {
  const user = await getAuthUser()
  await db.update(profiles).set({ currency: currencyCode }).where(eq(profiles.id, user.id))
  revalidatePath('/dashboard')
}
