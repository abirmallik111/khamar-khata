'use server'

import { db } from '@/db'
import { sales, profiles } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getAuthUser(): Promise<{ id: string }> {
  const session = await auth()
  if (session?.user?.id) {
    return { id: session.user.id }
  }
  const [firstUser] = await db.select().from(profiles).limit(1)
  if (firstUser) return { id: firstUser.id }
  throw new Error('Not authenticated')
}

export async function addSale(formData: FormData) {
  const user = await getAuthUser()

  const goatId = formData.get('goat_id') as string
  const salePrice = parseFloat(formData.get('sale_price') as string)
  const saleDate = formData.get('sale_date') as string
  const note = (formData.get('note') as string) || ''

  try {
    await db.execute(sql`
      SELECT add_sale_and_update_goat(
        ${user.id}::uuid,
        ${goatId}::uuid,
        ${salePrice}::numeric,
        ${saleDate}::date,
        ${note}
      )
    `)
  } catch (error: any) {
    console.error('Error recording sale:', error)
    if (error?.code === '23505') {
      throw new Error('This goat has already been sold.')
    }
    throw new Error('Failed to record sale: ' + error.message)
  }

  revalidatePath('/dashboard/sales')
  revalidatePath('/dashboard/goats')
  revalidatePath(`/dashboard/goats/${goatId}`)
  revalidatePath('/dashboard')
  redirect('/dashboard/sales')
}

export async function updateSale(id: string, formData: FormData) {
  const user = await getAuthUser()

  const salePrice = parseFloat(formData.get('sale_price') as string)
  const saleDate = formData.get('sale_date') as string
  const note = (formData.get('note') as string) || null

  await db.update(sales).set({
    salePrice: salePrice.toString(),
    saleDate,
    note
  }).where(and(eq(sales.id, id), eq(sales.userId, user.id)))

  revalidatePath('/dashboard/sales')
  revalidatePath('/dashboard/goats')
  revalidatePath('/dashboard')
  redirect('/dashboard/sales')
}

export async function deleteSale(id: string) {
  const user = await getAuthUser()

  await db.execute(sql`
    SELECT delete_sale_and_revert_goat(${id}::uuid, ${user.id}::uuid)
  `)

  revalidatePath('/dashboard/sales')
  revalidatePath('/dashboard/goats')
  revalidatePath('/dashboard')
}
